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
import { environment } from  "../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { ConfirmDialogComponent } from "../../../../services/confirm-dialog/confirm-dialog.component";
import { Sort } from "@angular/material/sort";

@Component({
    selector: 'app-list',
    templateUrl: './customers-list.component.html',
    styleUrls: ['./customers-list.component.scss'],
    standalone: false
})
export class CustomersListComponent implements OnInit {
    columnsToDisplay: string[]    = ['id', 'name', 'company_number', 'vat_number', 'siret', 'siren', 'module', 'actions'];
    headers         : HttpHeaders = this.authService.headers;
    loading         : boolean     = true;
    allCustomers    : any         = [];
    customers       : any         = [];
    pageSize        : number      = 10;
    pageIndex       : number      = 0;
    total           : number      = 0;
    offset          : number      = 0;
    search          : string      = '';

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

        if (this.sessionStorageService.get('customersPageIndex')) {
            this.pageIndex = parseInt(this.sessionStorageService.get('customersPageIndex') as string);
        }
        this.offset = this.pageSize * (this.pageIndex);

        this.http.get(environment['url'] + '/ws/accounts/customers/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allCustomers = data.customers;
                this.loadCustomers();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadCustomers() {
        this.http.get(environment['url'] + '/ws/accounts/customers/list?limit=' + this.pageSize + '&offset=' + this.offset + "&search=" + this.search, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.customers = data.customers;
                if (this.customers.length !== 0) {
                    this.total = data.customers[0].total;
                }
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    searchCustomer(event: any) {
        this.search = event.target.value;
        this.loadCustomers();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.sessionStorageService.save('customersPageIndex', event.pageIndex);
        this.loadCustomers();
    }

    deleteConfirmDialog(customerId: number, customer: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('ACCOUNTS.confirm_delete_customer', {"customer": customer}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteCustomer(customerId);
            }
        });
    }

    deleteCustomer(customerId: number) {
        if (customerId !== undefined) {
            this.http.delete(environment['url'] + '/ws/accounts/customers/delete/' + customerId, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadCustomers();
                    this.notify.success(this.translate.instant('ACCOUNTS.customer_deleted'));
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
        const data = this.allCustomers.slice();
        if (!sort.active || sort.direction === '') {
            this.customers = data.splice(0, this.pageSize);
            return;
        }

        this.customers = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'name': return this.compare(a.name, b.name, isAsc);
                case 'company_number': return this.compare(a.company_number, b.company_number, isAsc);
                case 'vat_number': return this.compare(a.vat_number, b.vat_number, isAsc);
                case 'siret': return this.compare(a.siret, b.siret, isAsc);
                case 'siren': return this.compare(a.siren, b.siren, isAsc);
                default: return 0;
            }
        });
        this.customers = this.customers.splice(0, this.pageSize);
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
