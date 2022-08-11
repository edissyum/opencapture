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
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../../../../services/user.service";
import { AuthService } from "../../../../../services/auth.service";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { catchError, finalize, tap } from "rxjs/operators";
import { environment } from  "../../../../env";
import { of } from "rxjs";
import { ConfirmDialogComponent } from "../../../../../services/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { LocalStorageService } from "../../../../../services/local-storage.service";
import { LastUrlService } from "../../../../../services/last-url.service";
import { Sort } from "@angular/material/sort";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { HistoryService } from "../../../../../services/history.service";

@Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss'],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
    ]
})

export class UsersListComponent implements OnInit {
    columnsToDisplay: string[]    = ['id', 'username', 'firstname', 'lastname', 'role','status', 'actions'];
    headers         : HttpHeaders = this.authService.headers;
    loading         : boolean     = true;
    users           : any         = [];
    allUsers        : any         = [];
    roles           : any         = [];
    pageSize        : number      = 10;
    pageIndex       : number      = 0;
    total           : number      = 0;
    offset          : number      = 0;
    search          : string      = '';

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
    ) {}


    ngOnInit(): void {
        this.serviceSettings.init();
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('settings/general/users') || lastUrl === '/') {
            if (this.localStorageService.get('usersPageIndex'))
                this.pageIndex = parseInt(this.localStorageService.get('usersPageIndex') as string);
            this.offset = this.pageSize * (this.pageIndex);
        } else
            this.localStorageService.remove('usersPageIndex');

        this.http.get(environment['url'] + '/ws/users/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allUsers = data.users;
                this.http.get(environment['url'] + '/ws/roles/list', {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        this.roles = data.roles;
                        this.loadUsers();
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

    searchUser(event: any) {
        this.search = event.target.value;
        this.loadUsers();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.pageIndex = event.pageIndex;
        this.localStorageService.save('usersPageIndex', event.pageIndex);
        this.loadUsers();
    }

    loadUsers(): void {
        this.http.get(environment['url'] + '/ws/users/list?limit=' + this.pageSize + '&offset=' + this.offset + "&search=" + this.search, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.users[0]) this.total = data.users[0].total;
                else if (this.pageIndex !== 0) {
                    this.pageIndex = this.pageIndex - 1;
                    this.offset = this.pageSize * (this.pageIndex);
                    this.loadUsers();
                }
                this.users = data.users;
                if (this.roles) {
                    this.users.forEach((user: any) => {
                        this.roles.forEach((element: any) => {
                            if (user.role === element.id) {
                                user.role_label = element.label;
                            }
                        });
                    });
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    deleteConfirmDialog(userId: number, user: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('USER.confirm_delete', {"user": user}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteUser(userId);
                this.historyService.addHistory('general', 'delete_user', this.translate.instant('HISTORY-DESC.delete-user', {user: user}));
            }
        });
    }

    disableConfirmDialog(userId: number, user: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('USER.confirm_disable', {"user": user}),
                confirmButton       : this.translate.instant('GLOBAL.disable'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.disableUser(userId);
                this.historyService.addHistory('general', 'disable_user', this.translate.instant('HISTORY-DESC.disable-user', {user: user}));
            }
        });
    }

    enableConfirmDialog(userId: number, user: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('USER.confirm_enable', {"user": user}),
                confirmButton       : this.translate.instant('GLOBAL.enable'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.enableUser(userId);
                this.historyService.addHistory('general', 'enable_user', this.translate.instant('HISTORY-DESC.enable-user', {user: user}));
            }
        });
    }

    deleteUser(userId: number) {
        if (userId !== undefined) {
            this.http.delete(environment['url'] + '/ws/users/delete/' + userId, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadUsers();
                    this.notify.success(this.translate.instant('USER.user_deleted'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    disableUser(userId: number) {
        if (userId !== undefined) {
            this.http.put(environment['url'] + '/ws/users/disable/' + userId, null, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadUsers();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    enableUser(userId: number) {
        if (userId !== undefined) {
            this.http.put(environment['url'] + '/ws/users/enable/' + userId, null, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadUsers();
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
        const data = this.allUsers.slice();
        if (!sort.active || sort.direction === '') {
            this.users = data.splice(0, this.pageSize);
            return;
        }

        this.users = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'username': return this.compare(a.username, b.username, isAsc);
                case 'firstname': return this.compare(a.firstname, b.firstname, isAsc);
                case 'lastname': return this.compare(a.lastname, b.lastname, isAsc);
                case 'role': return this.compare(a.role_label, b.role_label, isAsc);
                case 'status': return this.compare(a.enabled, b.enabled, isAsc);
                default: return 0;
            }
        });
        this.users = this.users.splice(0, this.pageSize);
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
