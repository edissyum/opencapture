/** This file is part of Open-Capture for Invoices.

Open-Capture for Invoices is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Open-Capture is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../../services/user.service";
import {AuthService} from "../../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {LastUrlService} from "../../../../../services/last-url.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {LocalStorageService} from "../../../../../services/local-storage.service";
import {Sort} from "@angular/material/sort";
import {ConfirmDialogComponent} from "../../../../../services/confirm-dialog/confirm-dialog.component";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HistoryService} from "../../../../../services/history.service";

@Component({
    selector: 'inputs-list',
    templateUrl: './inputs-list.component.html',
    styleUrls: ['./inputs-list.component.scss']
})
export class InputsListComponent implements OnInit {
    headers         : HttpHeaders   = this.authService.headers;
    columnsToDisplay: string[]      = ['id', 'input_id', 'input_label', 'input_folder', 'actions'];
    loading         : boolean       = true;
    inputs          : any           = [];
    allInputs       : any           = [];
    pageSize        : number        = 10;
    pageIndex       : number        = 0;
    total           : number        = 0;
    offset          : number        = 0;

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        private historyService: HistoryService,
        public serviceSettings: SettingsService,
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localeStorageService: LocalStorageService,
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('settings/verifier/inputs') || lastUrl === '/') {
            if (this.localeStorageService.get('inputsPageIndex'))
                this.pageIndex = parseInt(this.localeStorageService.get('inputsPageIndex') as string);
            this.offset = this.pageSize * (this.pageIndex);
        } else
            this.localeStorageService.remove('inputsPageIndex');

        this.http.get(API_URL + '/ws/inputs/list?module=verifier', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allInputs = data.inputs;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        this.loadInputs();
    }

    loadInputs() {
        this.http.get(API_URL + '/ws/inputs/list?module=verifier&limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.inputs[0]) this.total = data.inputs[0].total;
                else if (this.pageIndex !== 0) {
                    this.pageIndex = this.pageIndex - 1;
                    this.offset = this.pageSize * (this.pageIndex);
                    this.loadInputs();
                }
                this.inputs = data.inputs;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.pageIndex = event.pageIndex;
        this.localeStorageService.save('inputsPageIndex', event.pageIndex);
        this.loadInputs();
    }

    deleteConfirmDialog(inputId: number, input: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('INPUT.confirm_delete', {"input": input}),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteInput(inputId);
                this.historyService.addHistory('verifier', 'delete_input', this.translate.instant('HISTORY-DESC.delete-input', {input: input}));
            }
        });
    }

    deleteInput(inputId: number) {
        if (inputId !== undefined) {
            this.http.delete(API_URL + '/ws/inputs/delete/' + inputId, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadInputs();
                    this.notify.success(this.translate.instant('INPUT.input_deleted'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    duplicateConfirmDialog(inputId: number, input: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('INPUT.confirm_duplicate', {"input": input}),
                confirmButton       : this.translate.instant('GLOBAL.duplicate'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.duplicateInput(inputId);
                this.historyService.addHistory('verifier', 'duplicate_input', this.translate.instant('HISTORY-DESC.duplicate-input', {input: input}));
            }
        });
    }

    duplicateInput(inputId: number) {
        if (inputId !== undefined) {
            this.http.post(API_URL + '/ws/inputs/duplicate/' + inputId, {}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadInputs();
                    this.notify.success(this.translate.instant('INPUT.input_duplicated'));
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
        const data = this.allInputs.slice();
        if (!sort.active || sort.direction === '') {
            this.inputs = data.splice(0, this.pageSize);
            return;
        }

        this.inputs = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'label_short': return this.compare(a.label_short, b.label_short, isAsc);
                case 'label': return this.compare(a.label, b.label, isAsc);
                default:
                    return 0;
            }
        });
        this.inputs = this.inputs.splice(0, this.pageSize);
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

}
