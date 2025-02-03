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
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "../../../../services/user.service";
import { AuthService } from "../../../../services/auth.service";
import { _, TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../services/settings.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { SessionStorageService } from "../../../../services/session-storage.service";
import { Sort } from "@angular/material/sort";
import { environment } from  "../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { ConfirmDialogComponent } from "../../../../services/confirm-dialog/confirm-dialog.component";
import { ImportDialogComponent } from "../../../../services/import-dialog/import-dialog.component";

@Component({
    selector: 'suppliers-list',
    templateUrl: './suppliers-list.component.html',
    styleUrls: ['./suppliers-list.component.scss'],
    standalone: false
})
export class SuppliersListComponent implements OnInit {
    columnsToDisplay : string[]    = ['id', 'name', 'email', 'vat_number', 'siret', 'siren', 'iban', 'form_label', 'actions'];
    headers          : HttpHeaders = this.authService.headers;
    loading          : boolean     = true;
    allSuppliers     : any         = [];
    suppliers        : any         = [];
    pageSize         : number      = 10;
    search           : string      = '';
    pageIndex        : number      = 0;
    total            : number      = 0;
    offset           : number      = 0;

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        public userService: UserService,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
        private sessionStorageService: SessionStorageService
    ) { }

    ngOnInit(): void {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }

        if (this.sessionStorageService.get('suppliersPageIndex')) {
            this.pageIndex = parseInt(this.sessionStorageService.get('suppliersPageIndex') as string);
        }
        this.offset = this.pageSize * (this.pageIndex);

        this.http.get(environment['url'] + '/ws/accounts/suppliers/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allSuppliers = data.suppliers;
                this.loadSuppliers();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadSuppliers(resetOffset: boolean = false) {
        if (resetOffset) {
            this.offset = 0;
            this.pageIndex = 0;
        }

        this.http.get(environment['url'] + '/ws/accounts/suppliers/list?order=name&limit=' + this.pageSize + '&offset=' + this.offset + "&search=" + this.search, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.suppliers = data.suppliers;
                if (this.suppliers.length !== 0) {
                    this.total = data.suppliers[0].total;
                }
                this.http.get(environment['url'] + '/ws/forms/verifier/list', {headers: this.authService.headers}).pipe(
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
        this.loadSuppliers(true);
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.sessionStorageService.save('suppliersPageIndex', event.pageIndex);
        this.loadSuppliers();
    }

    deleteConfirmDialog(supplierId: number, supplier: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('ACCOUNTS.confirm_delete_supplier', {"supplier": supplier}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteSupplier(supplierId);
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
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteSupplierPositions(supplierId);
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
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.skipAutoValidate(supplierId);
            }
        });
    }

    deleteSupplier(supplierId: number) {
        if (supplierId !== undefined) {
            this.loading = true;
            this.http.delete(environment['url'] + '/ws/accounts/suppliers/delete/' + supplierId, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loading = false;
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
            this.loading = true;
            this.http.put(environment['url'] + '/ws/accounts/suppliers/skipAutoValidate/' + supplierId, {}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loading = false;
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
            this.loading = true;
            this.http.delete(environment['url'] + '/ws/accounts/suppliers/deletePositions/' + supplierId, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loading = false;
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
        this.loading = true;
        this.http.get(environment['url'] + '/ws/accounts/supplier/fillReferenceFile', {headers: this.authService.headers}).pipe(
            tap(() => {
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
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    importSuppliers() {
        const columns = ['name', 'vat_number', 'siret', 'siren', 'duns', 'bic', 'rccm', 'iban', 'email', 'address1',
            'address2', 'postal_code', 'city', 'country', 'footer_coherence', 'document_lang', 'default_currency'];
        const dialogRef = this.dialog.open(ImportDialogComponent, {
            data: {
                rows: [],
                extension: 'CSV',
                skipHeader: true,
                allowColumnsSelection : true,
                title : this.translate.instant('ACCOUNTS.import_suppliers'),
                availableColumns : columns,
                selectedColumns : columns
            },
            width: "1200px"
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const formData: FormData = new FormData();
                for (const file of result.fileControl.value) {
                    if (result.fileControl.status === 'VALID') {
                        formData.append(file['name'], file);
                    } else {
                        this.notify.handleErrors(this.translate.instant('DATA-IMPORT.extension_unauthorized', {"extension": 'CSV'}));
                        return;
                    }
                }

                formData.set('selectedColumns', result.selectedColumns);
                formData.set('skipHeader', result.skipHeader);

                this.http.post(environment['url'] + '/ws/accounts/supplier/importSuppliers', formData, {headers: this.authService.headers},
                ).pipe(
                    tap(() => {
                        this.notify.success(this.translate.instant('ACCOUNTS.suppliers_referencial_loaded'));
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }
        });
    }
}
