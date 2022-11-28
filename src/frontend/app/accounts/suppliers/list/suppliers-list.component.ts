/** This file is part of Open-Capture.

Open-Capture is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Open-Capture is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "../../../../services/user.service";
import { FormBuilder } from "@angular/forms";
import { AuthService } from "../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../services/settings.service";
import { LastUrlService } from "../../../../services/last-url.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { LocalStorageService } from "../../../../services/local-storage.service";
import { Sort } from "@angular/material/sort";
import { environment } from  "../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { ConfirmDialogComponent } from "../../../../services/confirm-dialog/confirm-dialog.component";
import { HistoryService } from "../../../../services/history.service";

@Component({
    selector: 'suppliers-list',
    templateUrl: './suppliers-list.component.html',
    styleUrls: ['./suppliers-list.component.scss']
})
export class SuppliersListComponent implements OnInit {
    columnsToDisplay : string[]    = ['id', 'name', 'email', 'vat_number', 'siret', 'siren', 'iban', 'form_label', 'actions'];
    headers          : HttpHeaders = this.authService.headers;
    loading          : boolean     = true;
    allSuppliers     : any         = [];
    suppliers        : any         = [];
    pageSize         : number      = 10;
    pageIndex        : number      = 0;
    total            : number      = 0;
    offset           : number      = 0;
    search           : string      = '';

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
        private historyService: HistoryService,
        public serviceSettings: SettingsService,
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localStorageService: LocalStorageService,
    ) { }

    ngOnInit(): void {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('accounts/suppliers') || lastUrl === '/') {
            if (this.localStorageService.get('suppliersPageIndex'))
                this.pageIndex = parseInt(this.localStorageService.get('suppliersPageIndex') as string);
            this.offset = this.pageSize * (this.pageIndex);
        } else
            this.localStorageService.remove('suppliersPageIndex');

        this.http.get(environment['url'] + '/ws/accounts/suppliers/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allSuppliers = data.suppliers;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        this.loadSuppliers();
    }

    loadSuppliers() {
        this.http.get(environment['url'] + '/ws/accounts/suppliers/list?order=name&limit=' + this.pageSize + '&offset=' + this.offset + "&search=" + this.search, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.suppliers = data.suppliers;
                if (this.suppliers.length !== 0) {
                    this.total = data.suppliers[0].total;
                }
                this.http.get(environment['url'] + '/ws/forms/list?module=verifier', {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        for (const cpt in this.suppliers) {
                            for (const form of data.forms) {
                                if (form.id === this.suppliers[cpt].form_id) {
                                    this.suppliers[cpt].form_label = form.label;
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

    searchSupplier(event: any) {
        this.search = event.target.value;
        this.loadSuppliers();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.localStorageService.save('suppliersPageIndex', event.pageIndex);
        this.loadSuppliers();
    }

    deleteConfirmDialog(supplierId: number, supplier: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('ACCOUNTS.confirm_delete_supplier', {"supplier": supplier}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteSupplier(supplierId);
                this.historyService.addHistory('accounts', 'delete_supplier', this.translate.instant('HISTORY-DESC.delete-supplier', {supplier: supplier}));
            }
        });
    }

    deletePositionsConfirmDialog(supplierId: number, supplier: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('ACCOUNTS.confirm_delete_supplier_positions', {"supplier": supplier}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteSupplierPositions(supplierId);
                this.historyService.addHistory('accounts', 'delete_supplier_positions', this.translate.instant('HISTORY-DESC.delete-supplier-positions', {supplier: supplier}));
            }
        });
    }

    skipAutoValidateConfirmDialog(supplierId: number, supplier: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('ACCOUNTS.confirm_skip_auto_validate', {"supplier": supplier}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.skipAutoValidate(supplierId);
                this.historyService.addHistory('accounts', 'skip_auto_validate', this.translate.instant('HISTORY-DESC.skip-auto-validate', {supplier: supplier}));
            }
        });
    }

    deleteSupplier(supplierId: number) {
        if (supplierId !== undefined) {
            this.http.delete(environment['url'] + '/ws/accounts/suppliers/delete/' + supplierId, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadSuppliers();
                    this.notify.success(this.translate.instant('ACCOUNTS.supplier_deleted'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    skipAutoValidate(supplierId: number) {
        if (supplierId !== undefined) {
            this.http.put(environment['url'] + '/ws/accounts/suppliers/skipAutoValidate/' + supplierId, {}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('ACCOUNTS.skip_validated_success'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    deleteSupplierPositions(supplierId: number) {
        if (supplierId !== undefined) {
            this.http.delete(environment['url'] + '/ws/accounts/suppliers/deletePositions/' + supplierId, {headers: this.authService.headers}).pipe(
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
        const data = this.allSuppliers.slice();
        if (!sort.active || sort.direction === '') {
            this.suppliers = data.splice(0, this.pageSize);
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
                case 'iban': return this.compare(a.iban, b.iban, isAsc);
                default: return 0;
            }
        });
        this.suppliers = this.suppliers.splice(0, this.pageSize);
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    getReferenceFile() {
        this.http.get(environment['url'] + '/ws/accounts/supplier/getReferenceFile', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                const mimeType = data.mimetype;
                const referenceFile = 'data:' + mimeType + ';base64, ' + data.file;
                const link = document.createElement("a");
                link.href = referenceFile;
                link.download = data.filename;
                link.click();
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    importSuppliers(event: any) {
        const file:File = event.target.files[0];
        if (file) {
            this.loading = true;
            const formData: FormData = new FormData();
            formData.append(file.name, file);
            this.http.post(environment['url'] + '/ws/accounts/supplier/importSuppliers', formData, {headers: this.authService.headers},
            ).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('ACCOUNTS.suppliers_referencial_loaded'));
                    this.loadSuppliers();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/accounts/suppliers/list');
                    return of(false);
                })
            ).subscribe();
        }
    }
}
