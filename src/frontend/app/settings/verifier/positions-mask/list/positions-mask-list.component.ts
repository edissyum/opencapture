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
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
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
import {environment} from  "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HistoryService} from "../../../../../services/history.service";

@Component({
    selector: 'positions-mask-list',
    templateUrl: './positions-mask-list.component.html',
    styleUrls: ['./positions-mask-list.component.scss']
})
export class PositionsMaskListComponent implements OnInit {
    loading         : boolean       = true;
    columnsToDisplay: string[]      = ['id', 'label', 'supplier_name', 'enabled', 'actions'];
    pageSize        : number        = 10;
    pageIndex       : number        = 0;
    total           : number        = 0;
    offset          : number        = 0;
    positionsMasks : any           = [];

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
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
        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('settings/verifier/positions-mask') || lastUrl === '/') {
            if (this.localeStorageService.get('positionMaskPageIndex'))
                this.pageIndex = parseInt(this.localeStorageService.get('positionMaskPageIndex') as string);
            this.offset = this.pageSize * (this.pageIndex);
        }else
            this.localeStorageService.remove('positionMaskPageIndex');
        this.loadPositionMask().then();
    }

    async loadPositionMask() {
        this.loading = true;
        const suppliers = await this.retrieveSuppliers();
        this.http.get(environment['url'] + '/ws/positions_masks/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.total) this.total = data.total;
                else if (this.pageIndex !== 0) {
                    this.pageIndex = this.pageIndex - 1;
                    this.offset = this.pageSize * (this.pageIndex);
                    this.loadPositionMask();
                }
                this.positionsMasks = data.positions_masks;
                suppliers.suppliers.forEach((element: any) => {
                    this.positionsMasks.forEach((mask: any) => {
                        if (element.id === mask.supplier_id) {
                            mask.supplier_name = element.name;
                        }
                    });
                });

            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    async retrieveSuppliers(): Promise<any> {
        return await this.http.get(environment['url'] + '/ws/accounts/suppliers/list?order=name ASC', {headers: this.authService.headers}).toPromise();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.pageIndex = event.pageIndex;
        this.localeStorageService.save('positionMaskPageIndex', event.pageIndex);
        this.loadPositionMask().then();
    }

    deleteConfirmDialog(positionMaskId: number, positionsMask: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('POSITIONS-MASKS.confirm_delete', {"positions_mask": positionsMask}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deletePositionMask(positionMaskId);
                this.historyService.addHistory('verifier', 'delete_positions_masks', this.translate.instant('HISTORY-DESC.delete-positions-masks', {positions_masks: positionsMask}));
            }
        });
    }

    duplicateConfirmDialog(positionMaskId: number, positionsMask: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('POSITIONS-MASKS.confirm_duplicate', {"positions_mask": positionsMask}),
                confirmButton       : this.translate.instant('GLOBAL.duplicate'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.duplicatePositionMask(positionMaskId);
                this.historyService.addHistory('verifier', 'duplicate_positions_masks', this.translate.instant('HISTORY-DESC.duplicate-positions-masks', {positions_masks: positionsMask}));
            }
        });
    }

    disableConfirmDialog(positionsMaskId: number, positionsMask: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('POSITIONS-MASKS.confirm_disable', {"positions_mask": positionsMask}),
                confirmButton       : this.translate.instant('GLOBAL.disable'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.disablePositionMask(positionsMaskId);
            }
        });
    }

    enableConfirmDialog(positionsMaskId: number, positionsMask: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('POSITIONS-MASKS.confirm_enable', {"positions_mask": positionsMask}),
                confirmButton       : this.translate.instant('GLOBAL.enable'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.enablePositionMask(positionsMaskId);
            }
        });
    }

    deletePositionMask(positionsMaskId: number) {
        if (positionsMaskId !== undefined) {
            this.http.delete(environment['url'] + '/ws/positions_masks/delete/' + positionsMaskId, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadPositionMask().then();
                    this.notify.success(this.translate.instant('POSITIONS-MASKS.positions_mask_deleted'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    duplicatePositionMask(positionsMaskId: number) {
        if (positionsMaskId !== undefined) {
            this.http.post(environment['url'] + '/ws/positions_masks/duplicate/' + positionsMaskId, {}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadPositionMask().then();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    disablePositionMask(positionsMaskId: number) {
        if (positionsMaskId !== undefined) {
            this.http.put(environment['url'] + '/ws/positions_masks/disable/' + positionsMaskId, null, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadPositionMask().then();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    enablePositionMask(positionsMaskId: number) {
        if (positionsMaskId !== undefined) {
            this.http.put(environment['url'] + '/ws/positions_masks/enable/' + positionsMaskId, null, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadPositionMask().then();
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
        const data = this.positionsMasks.slice();
        if (!sort.active || sort.direction === '') {
            this.positionsMasks = data;
            return;
        }

        this.positionsMasks = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'label': return this.compare(a.label, b.label, isAsc);
                case 'default': return this.compare(a.default, b.default, isAsc);
                case 'enabled': return this.compare(a.enabled, b.enabled, isAsc);
                default: return 0;
            }
        });

    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
