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

 @dev : Nathan Cheval <nathan.cheval@outlook.fr>
 */

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { UserService } from "../../../../../services/user.service";
import { AuthService } from "../../../../../services/auth.service";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { _, TranslateService } from "@ngx-translate/core";
import { catchError, finalize, tap } from "rxjs/operators";
import { environment } from  "../../../../env";
import { of } from "rxjs";
import { ConfirmDialogComponent } from "../../../../../services/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { SessionStorageService } from "../../../../../services/session-storage.service";
import { Sort } from "@angular/material/sort";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import {ExportDialogComponent} from "../../../../../services/export-dialog/export-dialog.component";
import {ImportDialogComponent} from "../../../../../services/import-dialog/import-dialog.component";

@Component({
    selector: 'app-users-list',
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.scss'],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } }
    ],
    standalone: false
})

export class UsersListComponent implements OnInit {
    columnsToDisplay: string[]    = ['id', 'username', 'firstname', 'lastname', 'role', 'status', 'actions'];
    headers         : HttpHeaders = this.authService.headers;
    loading         : boolean     = true;
    users           : any         = [];
    allUsers        : any         = [];
    roles           : any         = [];
    pageSize        : number      = 10;
    pageIndex       : number      = 0;
    activeUser      : number      = 0;
    total           : number      = 0;
    offset          : number      = 0;
    search          : string      = '';
    userQuotaConfig : any         = {};

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
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.userService.user   = this.userService.getUserFromLocal();

        if (this.sessionStorageService.get('usersPageIndex')) {
            this.pageIndex = parseInt(this.sessionStorageService.get('usersPageIndex') as string);
        }
        this.offset = this.pageSize * (this.pageIndex);

        this.http.get(environment['url'] + '/ws/users/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allUsers = data.users;
                this.http.get(environment['url'] + '/ws/roles/list/user/' + this.userService.user.id, {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        this.roles = data.roles;
                        if (this.roles) {
                            this.allUsers.forEach((user: any) => {
                                this.roles.forEach((element: any) => {
                                    if (user.role === element.id) {
                                        user.role_label = element.label;
                                    }
                                });
                            });
                        }
                        this.loadUsers();
                    }),
                    finalize(() => this.loading = false),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();

                this.http.get(environment['url'] + '/ws/config/getConfigurationNoAuth/userQuota', {headers: this.authService.headers}).pipe(
                    tap((config: any) => {
                        this.userQuotaConfig = config.configuration[0].data.value;
                        this.activeUser = this.allUsers.length;
                        this.getUserQuotaFiltered();
                    }),
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

    getUserQuotaFiltered() {
        this.allUsers.forEach((user: any) => {
            if (this.userQuotaConfig.users_filtered.includes(user['username'])) {
                this.activeUser -= 1;
            }
        });
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.pageIndex = event.pageIndex;
        this.sessionStorageService.save('usersPageIndex', event.pageIndex);
        this.loadUsers();
    }

    loadUsers(): void {
        this.http.get(environment['url'] + '/ws/users/list?limit=' + this.pageSize + '&offset=' + this.offset + "&search=" + this.search, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.users[0]) {
                    this.total = data.users[0].total;
                } else if (this.pageIndex !== 0) {
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
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('USER.confirm_delete', {"user": user}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteUser(userId);
            }
        });
    }

    disableConfirmDialog(userId: number, user: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('USER.confirm_disable', {"user": user}),
                confirmButton       : this.translate.instant('GLOBAL.disable'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.disableUser(userId);
            }
        });
    }

    enableConfirmDialog(userId: number, user: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('USER.confirm_enable', {"user": user}),
                confirmButton       : this.translate.instant('GLOBAL.enable'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.enableUser(userId);
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

    exportUsers() {
        const selectedColumns: any [] = [
            {
                id: 'username',
                label: this.translate.instant('USER.username')
            },
            {
                id: 'lastname',
                label: this.translate.instant('USER.lastname')
            },
            {
                id: 'firstname',
                label: this.translate.instant('USER.firstname')
            },
            {
                id: 'email',
                label: this.translate.instant('FORMATS.email')
            },
            {
                id: 'role',
                label: this.translate.instant('HEADER.role')
            }
        ];
        const availableColumns: any [] = [];

        const dialogRef = this.dialog.open(ExportDialogComponent, {
            data: {
                selectedColumns: selectedColumns,
                availableColumns: availableColumns,
                title : this.translate.instant('USER.export')
            },
            width: "900px"
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const args = {
                    'columns': result.selectedColumns,
                    'delimiter': result.delimiter,
                    'extension': result.extension
                };
                this.http.post(environment['url'] + '/ws/users/export', {'args': args}, {headers: this.authService.headers},
                ).pipe(
                    tap((data: any) => {
                        const csvContent = atob(data.encoded_file);
                        const blob = new Blob([csvContent], {type: "data:application/octet-stream;base64"});
                        const url  = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `users.${result.extension}`;
                        link.click();
                        this.notify.success(this.translate.instant('USER.users_export_success'));
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

    importUsers() {
        const columns = ['username', 'lastname', 'firstname', 'mail', 'role', 'customer_name'];
        const dialogRef = this.dialog.open(ImportDialogComponent, {
            data: {
                rows: [],
                extension: 'CSV',
                skipHeader: false,
                allowColumnsSelection : false,
                title: this.translate.instant('USER.import'),
                availableColumns : columns,
                selectedColumns : columns
            },
            width: "900px"
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const formData: FormData = new FormData();
                for (let i = 0; i < result.fileControl.value!.length; i++) {
                    if (result.fileControl.status === 'VALID') {
                        formData.append(result.fileControl.value![i]['name'], result.fileControl.value![i]);
                    } else {
                        this.notify.handleErrors(this.translate.instant('DATA-IMPORT.extension_unauthorized', {"extension": 'CSV'}));
                        return;
                    }
                }

                formData.set('selectedColumns', result.selectedColumns);
                formData.set('skipHeader', result.skipHeader);

                this.http.post(environment['url'] + '/ws/users/csv/import', formData, {headers: this.authService.headers},
                ).pipe(
                    tap(() => {
                        this.notify.success(this.translate.instant('DOCTYPE.users_import_success'));
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
