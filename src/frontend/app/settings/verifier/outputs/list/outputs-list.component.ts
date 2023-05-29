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
import { Router } from "@angular/router";
import { UserService } from "../../../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "../../../../../services/auth.service";
import { LastUrlService } from "../../../../../services/last-url.service";
import { LocalStorageService } from "../../../../../services/local-storage.service";
import { environment } from  "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { Sort } from "@angular/material/sort";
import { ConfirmDialogComponent } from "../../../../../services/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: 'app-output-list',
    templateUrl: './outputs-list.component.html',
    styleUrls: ['./outputs-list.component.scss']
})
export class OutputsListComponent implements OnInit {
    headers         : HttpHeaders   = this.authService.headers;
    columnsToDisplay: string[]      = ['id', 'output_label', 'output_type_id', 'actions'];
    loading         : boolean       = true;
    outputs         : any           = [];
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
        public serviceSettings: SettingsService,
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localStorageService: LocalStorageService
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('settings/verifier/outputs') || lastUrl === '/') {
            if (this.localStorageService.get('outputsPageIndex')) {
                this.pageIndex = parseInt(this.localStorageService.get('outputsPageIndex') as string);
            }
            this.offset = this.pageSize * (this.pageIndex);
        } else {
            this.localStorageService.remove('outputsPageIndex');
        }
        this.loadOutputs();
    }

    loadOutputs(): void {
        this.http.get(environment['url'] + '/ws/outputs/verifier/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.outputs[0]) this.total = data.outputs[0].total;
                else if (this.pageIndex !== 0) {
                    this.pageIndex = this.pageIndex - 1;
                    this.offset = this.pageSize * (this.pageIndex);
                    this.loadOutputs();
                }
                this.outputs = data.outputs;
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
        this.localStorageService.save('outputsPageIndex', event.pageIndex);
        this.loadOutputs();
    }

    deleteConfirmDialog(outputId: number, output: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('OUTPUT.confirm_delete', {"output": output}),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel')
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteOutput(outputId);
            }
        });
    }

    deleteOutput(outputId: number) {
        if (outputId !== undefined) {
            this.http.delete(environment['url'] + '/ws/outputs/verifier/delete/' + outputId, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadOutputs();
                    this.notify.success(this.translate.instant('OUTPUT.output_deleted'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    duplicateConfirmDialog(outputId: number, output: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('OUTPUT.confirm_duplicate', {"output": output}),
                confirmButton       : this.translate.instant('GLOBAL.duplicate'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.duplicateOutput(outputId);
            }
        });
    }

    duplicateOutput(outputId: number) {
        if (outputId !== undefined) {
            this.http.post(environment['url'] + '/ws/outputs/verifier/duplicate/' + outputId, {}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadOutputs();
                    this.notify.success(this.translate.instant('OUTPUT.output_duplicated'));
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
        const data = this.outputs.slice();
        if (!sort.active || sort.direction === '') {
            this.outputs = data;
            return;
        }

        this.outputs = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'label_short': return this.compare(a.label_short, b.label_short, isAsc);
                case 'label': return this.compare(a.label, b.label, isAsc);
                default:
                    return 0;
            }
        });
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
