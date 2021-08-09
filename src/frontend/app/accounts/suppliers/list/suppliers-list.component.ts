import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../services/user.service";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../services/settings.service";
import {LastUrlService} from "../../../../services/last-url.service";
import {PrivilegesService} from "../../../../services/privileges.service";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {Sort} from "@angular/material/sort";
import {API_URL} from "../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {ConfirmDialogComponent} from "../../../../services/confirm-dialog/confirm-dialog.component";

@Component({
    selector: 'app-list',
    templateUrl: './suppliers-list.component.html',
    styleUrls: ['./suppliers-list.component.scss']
})
export class SuppliersListComponent implements OnInit {
    headers         : HttpHeaders = this.authService.headers;
    loading         : boolean     = true;
    columnsToDisplay: string[]    = ['id', 'name', 'vat_number', 'siret', 'siren','form_label', 'actions'];
    suppliers       : any         = [];
    pageSize        : number      = 10;
    pageIndex       : number      = 0;
    total           : number      = 0;
    offset          : number      = 0;
    deletePositionSrc: string     = 'assets/imgs/map-marker-alt-solid-del.svg';

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localeStorageService: LocalStorageService,
    ) { }

    ngOnInit(): void {
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        let lastUrl = this.routerExtService.getPreviousUrl()
        if (lastUrl.includes('accounts/suppliers') || lastUrl == '/') {
            if (this.localeStorageService.get('suppliersPageIndex'))
                this.pageIndex = parseInt(<string>this.localeStorageService.get('suppliersPageIndex'))
            this.offset = this.pageSize * (this.pageIndex)
        }else
            this.localeStorageService.remove('suppliersPageIndex')

        this.loadSuppliers()
    }

    loadSuppliers() {
        this.http.get(API_URL + '/ws/accounts/suppliers/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.suppliers = data.suppliers;
                if (this.suppliers.length !== 0) {
                    this.total = data.suppliers[0].total
                }
                this.http.get(API_URL + '/ws/forms/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        for (let cpt in this.suppliers) {
                            for (let form of data.forms) {
                                if (form.id == this.suppliers[cpt].form_id) {
                                    this.suppliers[cpt].form_label = form.label
                                }
                            }
                        }
                    }),
                    finalize(() => this.loading = false),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize
        this.offset = this.pageSize * (event.pageIndex)
        this.localeStorageService.save('suppliersPageIndex', event.pageIndex)
        this.loadSuppliers()
    }

    deleteConfirmDialog(supplier_id: number, supplier: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('ACCOUNTS.confirm_delete_supplier', {"supplier": supplier}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this.deleteSupplier(supplier_id)
            }
        });
    }

    deletePositionsConfirmDialog(supplier_id: number, supplier: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('ACCOUNTS.confirm_delete_supplier_positions', {"supplier": supplier}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this.deleteSupplierPositions(supplier_id);
            }
        });
    }

    deleteSupplier(supplier_id: number) {
        if (supplier_id !== undefined) {
            this.http.delete(API_URL + '/ws/accounts/suppliers/delete/' + supplier_id, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadSuppliers();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    deleteSupplierPositions(supplier_id: number) {
        if (supplier_id !== undefined) {
            this.http.delete(API_URL + '/ws/accounts/suppliers/deletePositions/' + supplier_id, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('ACCOUNTS.positions_deleted'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    sortData(sort: Sort) {
        let data = this.suppliers.slice();
        if(!sort.active || sort.direction === '') {
            this.suppliers = data;
            return;
        }

        this.suppliers = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'name': return this.compare(a.name, b.name, isAsc);
                case 'vat_number': return this.compare(a.vat_number, b.vat_number, isAsc);
                case 'siret': return this.compare(a.siret, b.siret, isAsc);
                case 'siren': return this.compare(a.siren, b.siren, isAsc);
                case 'typology': return this.compare(a.typology, b.typology, isAsc);
                default: return 0;
            }
        });

    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

}
