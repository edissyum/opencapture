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

 @dev : Oussama BRICH <oussama.brich@edissyum.com> */

import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from "../../../services/local-storage.service";
import { environment } from  "../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { AuthService } from "../../../services/auth.service";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder } from "@angular/forms";
import { UserService } from "../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../services/notifications/notifications.service";
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from "@angular/material/paginator";
import { ConfirmDialogComponent } from "../../../services/confirm-dialog/confirm-dialog.component";
import { MatDialog } from '@angular/material/dialog';
import { HistoryService } from "../../../services/history.service";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import { LastUrlService } from "../../../services/last-url.service";

@Component({
    selector: 'app-list',
    templateUrl: './splitter-list.component.html',
    styleUrls: ['./splitter-list.component.scss'],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
    ]
})

export class SplitterListComponent implements OnInit {
    batches          : any     = [];
    isLoading        : boolean = true;
    status           : any[]   = [];
    page             : number  = 1;
    selectedTab      : number  = 0;
    searchText       : string  = "";
    pageSize         : number  = 16;
    pageIndex        : number  = 1;
    offset           : number  = 0;
    pageSizeOptions  : any []  = [4, 8, 12, 16, 24, 48];
    total            : number  = 0;
    totals           : any     = {};
    batchList        : any[]   = [
        {
            'id': 'today',
            'label': marker('BATCH.today'),
        },
        {
            'id': 'yesterday',
            'label': marker('BATCH.yesterday'),
        },
        {
            'id': 'older',
            'label': marker('BATCH.older'),
        }
    ];
    totalChecked        : number  = 0;
    batchesSelected     : boolean = false;
    currentStatus       : string  = 'NEW';
    currentTime         : string  = 'today';

    constructor(
        private router: Router,
        public dialog: MatDialog,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private _sanitizer: DomSanitizer,
        public translate: TranslateService,
        private notify: NotificationService,
        private historyService: HistoryService,
        private routerExtService: LastUrlService,
        private localStorageService: LocalStorageService,
    ) {}

    async ngOnInit() {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        if (!this.userService.user.id) {
            this.userService.user = this.userService.getUserFromLocal();
        }

        this.localStorageService.save('splitter_or_verifier', 'splitter');
        this.removeLockByUserId(this.userService.user.username);
        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('splitter/') && !lastUrl.includes('settings') || lastUrl === '/' || lastUrl === '/upload') {
            if (this.localStorageService.get('splitterPageIndex'))
                this.pageIndex = parseInt(this.localStorageService.get('splitterPageIndex') as string);
            if (this.localStorageService.get('splitterTimeIndex')) {
                this.selectedTab = parseInt(this.localStorageService.get('splitterTimeIndex') as string);
                this.currentTime = this.batchList[this.selectedTab].id;
            }
            this.offset = this.pageSize * (this.pageIndex);
        } else {
            this.localStorageService.remove('splitterPageIndex');
            this.localStorageService.remove('splitterTimeIndex');
        }

        this.http.get(environment['url'] + '/ws/status/list?module=splitter', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.status = data.status;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        this.loadBatches();
    }

    removeLockByUserId(userId: any) {
        this.http.put(environment['url'] + '/ws/splitter/removeLockByUserId/' + userId, {}, {headers: this.authService.headers}).pipe(
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadBatches(): void {
        this.isLoading = true;
        this.batches   = [];
        this.http.get(environment['url'] + '/ws/splitter/batches/user/' + this.userService.user.id + '/totals/'
            + this.currentStatus, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.totals = data.totals;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        this.http.get(environment['url'] + '/ws/splitter/batches/user/' + this.userService.user.id +  '/paging/' +
            (this.pageIndex - 1) + '/' + this.pageSize + '/' + this.currentTime + '/' + this.currentStatus,
            {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                console.log(data);
                data.batches.forEach((batch: any) =>
                    this.batches.push({
                        id             : batch['id'],
                        locked         : batch['locked'],
                        inputId        : batch['input_id'],
                        fileName       : batch['file_name'],
                        lockedBy       : batch['locked_by'],
                        formLabel      : batch['form_label'],
                        date           : batch['batch_date'],
                        customerName   : batch['customer_name'],
                        documentsCount : batch['documents_count'],
                        thumbnail      : this.sanitize(batch['thumbnail']),
                    })
                );
                this.total = data.count;
            }),
            finalize(() => this.isLoading = false),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    displayBatchLocked(lockedBy: any) {
        this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('SPLITTER.batch_locked'),
                confirmText         : this.translate.instant('SPLITTER.batch_locked_by', {'locked_by': lockedBy}),
                confirmButton       : this.translate.instant('GLOBAL.confirm'),
                confirmButtonColor  : "warn"
            },
            width: "600px",
        });
    }

    sanitize(url: string) {
        return this._sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
    }

    checkSelectedBatch() {
        this.totalChecked = document.querySelectorAll('.checkBox_list:checked').length;
        this.batchesSelected = this.totalChecked !== 0;
    }

    mergeAllConfirmDialog(parentId: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('SPLITTER.confirm_merge_all_checked_batches'),
                confirmButton       : this.translate.instant('SPLITTER.merge'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.mergeAllBatches(parentId);
            }
        });
    }

    isCheckboxChecked(batchId: number) {
        let checked = false;
        const checkboxList = document.getElementsByClassName('checkBox_list');
        Array.from(checkboxList).forEach((element: any) => {
            const checkboxId = element.id.split('_')[0];
            if (parseInt(checkboxId) === batchId) {
                checked = true;
            }
        });
        return checked;
    }

    mergeAllBatches(parentId: number) {
        const checkboxList = document.getElementsByClassName('checkBox_list');
        const listOfBatchToMerge: any[] = [];
        const listOfBatchFormId: any[] = [];
        Array.from(checkboxList).forEach((element: any) => {
            if (element.checked) {
                const batchId = element.id.split('_')[0];
                if (batchId !== parentId.toString())
                    listOfBatchToMerge.push(batchId);
            }
        });

        this.batches.forEach((batch: any) => {
            listOfBatchToMerge.forEach((batchId: any) => {
                if (parseInt(batch.id) === parseInt(batchId)) {
                    listOfBatchFormId.push(batch.form_id);
                }
            });
            if (parentId === batch.id) listOfBatchFormId.push(batch.form_id);
        });
        const uniqueFormId = listOfBatchFormId.filter((item, i, ar) => ar.indexOf(item) === i);

        if (uniqueFormId.length === 1) {
            this.isLoading = true;
            this.http.post(environment['url'] + '/ws/splitter/merge/' + parentId, {'batches': listOfBatchToMerge}, {headers: this.authService.headers},
            ).pipe(
                tap(() => {
                    this.loadBatches();
                    this.notify.success(this.translate.instant('SPLITTER.merge_success'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            this.notify.error(this.translate.instant('SPLITTER.merge_error_form_not_match'));
        }
    }

    deleteAllConfirmDialog() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('SPLITTER.confirm_delete_all_batches'),
                confirmButton       : this.translate.instant('GLOBAL.delete_all_checked'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteAllBatches();
            }
        });
    }

    onPageChange($event: PageEvent) {
        this.batches = [];
        this.pageIndex = $event.pageIndex + 1;
        this.pageSize = $event.pageSize;
        this.localStorageService.save('splitterPageIndex', $event.pageIndex);
        this.loadBatches();
    }

    openConfirmDialog(id: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('SPLITTER.confirm_batch_delete'),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "400px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteBatch(id);
                this.historyService.addHistory('splitter', 'delete_batch', this.translate.instant('HISTORY-DESC.delete_batch', {batch_id: id}));
            }
        });
    }

    selectOrUnselectAllBatches(event: any) {
        const label = event.srcElement.textContent;
        this.batchesSelected = !this.batchesSelected;
        const checkboxList = document.getElementsByClassName('checkBox_list');
        Array.from(checkboxList).forEach((element: any) => {
            element.checked = (label === this.translate.instant('VERIFIER.select_all'));
        });
        this.totalChecked = document.querySelectorAll('.checkBox_list:checked').length;
    }

    deleteAllBatches() {
        this.isLoading = true;
        let lastBatch = false;
        const checkboxList = document.querySelectorAll('.checkBox_list:checked');
        Array.from(checkboxList).forEach((element: any, cpt: number) => {
            if (cpt === checkboxList.length - 1)
                lastBatch = true;
            const batchId = element.id.split('_')[0];
            this.deleteBatch(batchId, true, lastBatch);
        });
        this.notify.success(this.translate.instant('SPLITTER.all_batches_checked_deleted'));
    }

    deleteBatch(id: number, batchDelete = false, lastBatch = true): void {
        this.http.put(environment['url'] + '/ws/splitter/status', {'id': id, 'status': 'DEL', }, {headers: this.authService.headers}).pipe(
            tap(() => {
                if (!batchDelete) {
                    this.notify.success(this.translate.instant('SPLITTER.batch_deleted'));
                    this.isLoading = false;
                }
                if (lastBatch)
                    this.loadBatches();
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    resetPaginator() {
        this.total = 0;
        this.offset = 0;
        this.pageIndex = 1;
        this.localStorageService.save('splitterPageIndex', this.pageIndex);
    }

    onTabChange(event: any) {
        this.selectedTab = event.index;
        this.localStorageService.save('splitterTimeIndex', this.selectedTab);
        this.currentTime = this.batchList[this.selectedTab].id;
        this.resetPaginator();
        this.loadBatches();
    }

    changeStatus(event: any) {
        this.currentStatus = event.value;
        this.resetPaginator();
        this.loadBatches();
    }
}
