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

import { Component, OnInit, SecurityContext } from '@angular/core';
import { SessionStorageService } from "../../../services/session-storage.service";
import { environment } from  "../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { AuthService } from "../../../services/auth.service";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../../../services/user.service";
import { _, TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../services/notifications/notifications.service";
import { DomSanitizer } from '@angular/platform-browser';
import { PageEvent } from "@angular/material/paginator";
import { ConfirmDialogComponent } from "../../../services/confirm-dialog/confirm-dialog.component";
import { MatDialog } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";

@Component({
    selector: 'app-list',
    templateUrl: './splitter-list.component.html',
    styleUrls: ['./splitter-list.component.scss'],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } }
    ],
    standalone: false
})

export class SplitterListComponent implements OnInit {
    batches          : any     = [];
    loading          : boolean = true;
    displayMode      : string  = 'grid';
    documentListThumb: string  = '';
    currentFilter    : string  = 'splitter_batches.id';
    customersList    : any     = {};
    currentOrder     : string  = 'desc';
    status           : any[]   = [];
    page             : number  = 1;
    selectedTab      : number  = 0;
    searchText       : string  = "";
    pageSize         : number  = 15;
    pageIndex        : number  = 1;
    offset           : number  = 0;
    pageSizeOptions  : any []  = [5, 10, 15, 20, 30, 60];
    total            : number  = 0;
    totals           : any     = {};
    batchList        : any[]   = [
        {
            'id': 'today',
            'label': _('BATCH.today')
        },
        {
            'id': 'yesterday',
            'label': _('BATCH.yesterday')
        },
        {
            'id': 'older',
            'label': _('BATCH.older')
        }
    ];
    totalChecked     : number  = 0;
    batchesSelected  : boolean = false;
    enableAttachments: boolean = false;
    currentStatus    : string  = 'NEW';
    currentTime      : string  = 'today';
    filtersLists     : any     = [
        {'id': 'splitter_batches.id', 'label': 'HEADER.technical_id'},
        {'id': 'splitter_batches.creation_date', 'label': _('FACTURATION.register_date_short')}
    ];

    constructor(
        public dialog: MatDialog,
        private http: HttpClient,
        public userService: UserService,
        private authService: AuthService,
        private _sanitizer: DomSanitizer,
        public translate: TranslateService,
        private notify: NotificationService,
        private sessionStorageService: SessionStorageService
    ) {}

    async ngOnInit() {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        if (!this.userService.user.id) {
            this.userService.user = this.userService.getUserFromLocal();
        }

        if (localStorage.getItem('splitterListDisplayMode')) {
            this.displayMode = localStorage.getItem('splitterListDisplayMode') as string;
        }
        if (localStorage.getItem('splitterFilter')) {
            this.currentFilter = localStorage.getItem('splitterFilter') as string;
        }
        if (localStorage.getItem('splitterOrder')) {
            this.currentOrder = localStorage.getItem('splitterOrder') as string;
        }
        if (this.sessionStorageService.get('splitterPageIndex')) {
            this.pageIndex = parseInt(this.sessionStorageService.get('splitterPageIndex') as string);
        }
        if (this.sessionStorageService.get('splitterTimeIndex')) {
            this.selectedTab = parseInt(this.sessionStorageService.get('splitterTimeIndex') as string);
            this.currentTime = this.batchList[this.selectedTab].id;
        }
        this.offset = this.pageSize * (this.pageIndex);

        this.http.get(environment['url'] + '/ws/config/getConfigurationNoAuth/enableAttachments').pipe(
            tap((data: any) => {
                if (data.configuration.length === 1) {
                    this.enableAttachments = data.configuration[0].data.value;
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.sessionStorageService.save('splitter_or_verifier', 'splitter');
        this.removeLockByUserId(this.userService.user.username);

        this.http.get(environment['url'] + '/ws/status/splitter/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.status = data.status;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        this.loadCustomers();
        this.loadBatches();
    }

    loadCustomers() {
        this.http.get(environment['url'] + '/ws/accounts/customers/list/splitter', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.customersList = data.customers;
                this.customersList.unshift({
                    "id": 0,
                    "name": this.translate.instant('ACCOUNTS.customer_not_specified')
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
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
        this.batches = [];
        this.loading = true;
        this.totalChecked = 0;
        this.batchesSelected = false;
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

        this.http.post(environment['url'] + '/ws/splitter/batches/list', {
            'size'   : this.pageSize,
            'search' : this.searchText,
            'time'   : this.currentTime,
            'page'   : this.pageIndex,
            'status' : this.currentStatus,
            'order'  : this.currentOrder,
            'filter' : this.currentFilter,
            'userId' : this.userService.user.id
        }, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.batches.forEach((batch: any) =>
                    this.batches.push({
                        id              : batch['id'],
                        locked          : batch['locked'],
                        inputId         : batch['input_id'],
                        lockedBy        : batch['locked_by'],
                        formLabel       : batch['form_label'],
                        date            : batch['batch_date'],
                        customerId      : batch['customer_id'],
                        customerName    : batch['customer_name'],
                        documentsCount  : batch['documents_count'],
                        attachmentsCount: batch['attachments_count'],
                        thumbnail       : this.sanitize(batch['thumbnail']),
                        fileName        : batch['subject'] ? batch['subject'] : batch['file_name']
                    }),
                );
                this.total = data.count;
            }),
            finalize(() => this.loading = false),
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
            width: "600px"
        });
    }

    sanitize(url: string) {
        return this._sanitizer.sanitize(SecurityContext.URL, 'data:image/jpg;base64,' + url);
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
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
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
                if (batchId !== parentId.toString()) {
                    listOfBatchToMerge.push(batchId);
                }
            }
        });

        this.batches.forEach((batch: any) => {
            listOfBatchToMerge.forEach((batchId: any) => {
                if (parseInt(batch.id) === parseInt(batchId)) {
                    listOfBatchFormId.push(batch.form_id);
                }
            });
            if (parentId === batch.id) {
                listOfBatchFormId.push(batch.form_id);
            }
        });
        const uniqueFormId = listOfBatchFormId.filter((item, i, ar) => ar.indexOf(item) === i);

        if (uniqueFormId.length === 1) {
            this.loading = true;
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
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteAllBatches();
            }
        });
    }

    onPageChange(event: PageEvent) {
        this.batches = [];
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.sessionStorageService.save('splitterPageIndex', this.pageIndex);
        this.loadBatches();
    }

    openConfirmDeleteDialog(id: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('SPLITTER.confirm_batch_delete'),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel')
            },
            width: "400px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteBatches([id]);
            }
        });
    }

    selectOrUnselectAllBatches(event: any, forceUnselect: boolean = false) {
        const label = event.srcElement.textContent;
        this.batchesSelected = !this.batchesSelected;
        if (forceUnselect) {
            this.batchesSelected = false;
        }
        const checkboxList = document.getElementsByClassName('checkBox_list');
        Array.from(checkboxList).forEach((element: any) => {
            element.checked = (label === this.translate.instant('VERIFIER.select_all'));
        });
        this.totalChecked = document.querySelectorAll('.checkBox_list:checked').length;
    }

    deleteAllBatches() {
        this.loading = true;
        const deleteIds : number[] = [];
        const checkboxList = document.querySelectorAll('.checkBox_list:checked');
        Array.from(checkboxList).forEach((element: any) => {
            const batchId = element.id.split('_')[0];
            deleteIds.push(Number(batchId));
        });
        this.deleteBatches(deleteIds);
    }

    deleteBatches(ids: number[]): void {
        this.http.put(environment['url'] + '/ws/splitter/deleteBatches', {'ids': ids}, {headers: this.authService.headers}).pipe(
            tap(() => {
                if (ids.length === 1) {
                    this.notify.success(this.translate.instant('SPLITTER.batch_deleted'));
                } else {
                    this.notify.success(this.translate.instant('SPLITTER.all_batches_checked_deleted'));
                }
                this.loading = false;
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
        this.pageIndex = 0;
        this.sessionStorageService.save('splitterPageIndex', this.pageIndex);
    }

    onTabChange(event: any) {
        this.selectedTab = event.index;
        this.sessionStorageService.save('splitterTimeIndex', this.selectedTab);
        this.currentTime = this.batchList[this.selectedTab].id;
        this.resetPaginator();
        this.loadBatches();
    }

    changeStatus(event: any) {
        this.currentStatus = event.value;
        this.resetPaginator();
        this.loadBatches();
    }

    switchDisplayMode() {
        if (this.displayMode === 'grid') {
            this.displayMode = 'list';
        } else {
            this.displayMode = 'grid';
        }
        this.selectOrUnselectAllBatches({srcElement: {textContent: this.translate.instant('VERIFIER.unselect_all')}}, true);
        localStorage.setItem('splitterListDisplayMode', this.displayMode);
    }

    showThumbnail(thumb_b64: any) {
        this.documentListThumb = thumb_b64;
    }

    resetThumbnail() {
        this.documentListThumb = '';
    }

    changeFilter(filter: string) {
        this.currentFilter = filter;
        localStorage.setItem('splitterFilter', filter);
        this.loadBatches();
    }

    changeOrder(order: string) {
        this.currentOrder = order;
        localStorage.setItem('splitterOrder', order);
        this.loadBatches();
    }

    changeCustomer(customerId: number, batchId: number) {
        this.loading = true;
        this.http.put(environment['url'] + '/ws/splitter/' + batchId + '/updateCustomer', {"customer_id": customerId},
            {headers: this.authService.headers}).pipe(
            finalize(() => {
                this.loadBatches();
                this.notify.success(this.translate.instant('VERIFIER.customer_changed_successfully'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }
}
