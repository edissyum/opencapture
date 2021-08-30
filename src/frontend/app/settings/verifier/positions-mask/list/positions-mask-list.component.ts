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
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";

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
    positions_masks : any           = [];

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localeStorageService: LocalStorageService,
    ) {
    }

    ngOnInit(): void {
        this.serviceSettings.init();
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('settings/verifier/positions-mask') || lastUrl == '/') {
            if (this.localeStorageService.get('positionMaskPageIndex'))
                this.pageIndex = parseInt(<string>this.localeStorageService.get('positionMaskPageIndex'));
            this.offset = this.pageSize * (this.pageIndex);
        }else
            this.localeStorageService.remove('positionMaskPageIndex');
        this.loadPositionMask();
    }

    loadPositionMask() {
        this.loading = true
        this.http.get(API_URL + '/ws/positions_masks/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                console.log(data)
                // if (data.forms[0]) this.total = data.forms[0].total;
                // this.forms = data.forms;
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
        this.localeStorageService.save('positionMaskPageIndex', event.pageIndex);
        this.loadPositionMask();
    }

    deleteConfirmDialog(position_mask_id: number, positions_mask: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('FORMS.confirm_delete', {"positions_mask": positions_mask}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this.deletePositionMask(position_mask_id)
            }
        });
    }

    duplicateConfirmDialog(position_mask_id: number, positions_mask: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('FORMS.confirm_duplicate', {"positions_mask": positions_mask}),
                confirmButton       : this.translate.instant('GLOBAL.duplicate'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this.duplicatePositionMask(position_mask_id)
            }
        });
    }

    disableConfirmDialog(position_mask_id: number, positions_mask: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('FORMS.confirm_disable', {"positions_mask": positions_mask}),
                confirmButton       : this.translate.instant('GLOBAL.disable'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this.disablePositionMask(position_mask_id)
            }
        });
    }

    enableConfirmDialog(position_mask_id: number, positions_mask: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('FORMS.confirm_enable', {"positions_mask": positions_mask}),
                confirmButton       : this.translate.instant('GLOBAL.enable'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this.enablePositionMask(position_mask_id)
            }
        });
    }

    deletePositionMask(position_mask_id: number) {
        if (position_mask_id !== undefined) {
            this.http.delete(API_URL + '/ws/positions_masks/delete/' + position_mask_id, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadPositionMask();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    duplicatePositionMask(position_mask_id: number) {
        if (position_mask_id !== undefined) {
            // this.http.delete(API_URL + '/ws/positions_masks/duplicate/' + position_mask_id, {headers: this.authService.headers}).pipe(
            //     tap(() => {
            //         this.loadPositionMask()
            //     }),
            //     catchError((err: any) => {
            //         console.debug(err);
            //         this.notify.handleErrors(err);
            //         return of(false);
            //     })
            // ).subscribe();
        }
    }

    disablePositionMask(position_mask_id: number) {
        if (position_mask_id !== undefined) {
            this.http.put(API_URL + '/ws/positions_masks/disable/' + position_mask_id, null, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadPositionMask();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    enablePositionMask(forms_id: number) {
        if (forms_id !== undefined) {
            this.http.put(API_URL + '/ws/positions_masks/enable/' + forms_id, null, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadPositionMask();
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
        let data = this.positions_masks.slice();
        if(!sort.active || sort.direction === '') {
            this.positions_masks = data;
            return;
        }

        this.positions_masks = data.sort((a: any, b: any) => {
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
