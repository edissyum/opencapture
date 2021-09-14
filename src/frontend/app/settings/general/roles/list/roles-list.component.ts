/** This file is part of Open-Capture for Invoices.

Open-Capture for Invoices is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Open-Capture is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {MatDialog} from "@angular/material/dialog";
import {LastUrlService} from "../../../../../services/last-url.service";
import {LocalStorageService} from "../../../../../services/local-storage.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {Sort} from "@angular/material/sort";
import {ConfirmDialogComponent} from "../../../../../services/confirm-dialog/confirm-dialog.component";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from "@angular/material/form-field";
import {HistoryService} from "../../../../../services/history.service";

@Component({
    selector: 'app-roles-list',
    templateUrl: './roles-list.component.html',
    styleUrls: ['./roles-list.component.scss'],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
    ]
})

export class RolesListComponent implements OnInit {
    headers: HttpHeaders = this.authService.headers;
    columnsToDisplay: string[] = ['id', 'label_short', 'label', 'status', 'actions'];
    loading: boolean = true;
    roles: any = [];
    pageSize: number = 10;
    pageIndex: number = 0;
    total: number = 0;
    offset: number = 0;

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
        private localeStorageService: LocalStorageService,
    ) {
    }

    ngOnInit(): void {
        this.serviceSettings.init();
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('roles/') || lastUrl === '/') {
            if (this.localeStorageService.get('rolesPageIndex'))
                this.pageIndex = parseInt(this.localeStorageService.get('rolesPageIndex') as string);
            this.offset = this.pageSize * (this.pageIndex);
        } else
            this.localeStorageService.remove('rolesPageIndex');
        this.loadRoles();
    }

    loadRoles(): void {
        this.http.get(API_URL + '/ws/roles/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.roles[0]) this.total = data.roles[0].total;
                this.roles = data.roles;
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
        this.localeStorageService.save('rolesPageIndex', event.pageIndex);
        this.loadRoles();
    }

    deleteConfirmDialog(roleId: number, role: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('ROLE.confirm_delete', {"role": role}),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteRole(roleId);
                this.historyService.addHistory('verifier', 'delete_role', this.translate.instant('HISTORY-DESC.delete-role', {role: role}));
            }
        });
    }


    disableConfirmDialog(roleId: number, role: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('ROLE.confirm_disable', {"role": role}),
                confirmButton: this.translate.instant('GLOBAL.disable'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.disableRole(roleId);
            }
        });
    }

    enableConfirmDialog(roleId: number, role: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('ROLE.confirm_enable', {"role": role}),
                confirmButton: this.translate.instant('GLOBAL.enable'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.enableRole(roleId);
            }
        });
    }

    deleteRole(roleId: number) {
        if (roleId !== undefined) {
            this.http.delete(API_URL + '/ws/roles/delete/' + roleId, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadRoles();
                    this.notify.success(this.translate.instant('ROLE.role_deleted'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    disableRole(roleId: number) {
        if (roleId !== undefined) {
            this.http.put(API_URL + '/ws/roles/disable/' + roleId, null, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadRoles();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    enableRole(roleId: number) {
        if (roleId !== undefined) {
            this.http.put(API_URL + '/ws/roles/enable/' + roleId, null, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadRoles();
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
        const data = this.roles.slice();
        if (!sort.active || sort.direction === '') {
            this.roles = data;
            return;
        }

        this.roles = data.sort((a: any, b: any) => {
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
