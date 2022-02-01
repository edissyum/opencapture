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

 @dev : Oussama BRICH <oussama.brich@edissyum.com> */

import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from "../../../services/local-storage.service";
import {API_URL} from "../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {AuthService} from "../../../services/auth.service";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {UserService} from "../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../services/notifications/notifications.service";
import {DomSanitizer} from '@angular/platform-browser';
import {PageEvent} from "@angular/material/paginator";
import {ConfirmDialogComponent} from "../../../services/confirm-dialog/confirm-dialog.component";
import {MatDialog} from '@angular/material/dialog';
import {HistoryService} from "../../../services/history.service";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from "@angular/material/form-field";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
declare var $: any;

@Component({
    selector: 'app-list',
    templateUrl: './splitter-list.component.html',
    styleUrls: ['./splitter-list.component.scss'],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
    ]
})

export class SplitterListComponent implements OnInit {
    batches         : any     = [];
    isLoading       : boolean = true;
    status          : any[]   = [];
    gridColumns     : number  = 4;
    page            : number  = 1;
    selectedTab     : number  = 0;
    searchText      : string  = "";
    paginationInfos : any     = {
        length: 0,
        pageSize: 16,
        pageIndex: 1,
    };
    batchList       : any[]   = [
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
    currentTime     : string  = 'today';
    currentStatus   : string  = 'NEW';
    batchesSelected : boolean = false;
    totalChecked    : number = 0;

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
        private localeStorageService: LocalStorageService,
    ) {}

    ngOnInit(): void {
        this.localeStorageService.save('splitter_or_verifier', 'splitter');
        this.http.get(API_URL + '/ws/status/list?module=splitter', {headers: this.authService.headers}).pipe(
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

    toggleGridColumns() {
        this.gridColumns = this.gridColumns === 3 ? 4 : 3;
    }

    loadBatches(): void {
        this.isLoading = true;
        this.http.get(API_URL + '/ws/splitter/batches/' +
            (this.paginationInfos['pageIndex'] - 1) + '/' +
            this.paginationInfos['pageSize'] + '/' +
            this.currentTime + '/' + this.currentStatus
            , {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.batches = data.batches;
                this.paginationInfos.length = data.count;
            }),
            finalize(() => this.isLoading = false),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    sanitize(url: string) {
        return this._sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
    }

    checkSelectedBatch() {
        this.totalChecked = $('input.checkBox_list:checked').length;
        this.batchesSelected = this.totalChecked !== 0;
    }

    mergeAllConfirmDialog(parentId: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
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

    mergeAllBatches(parentId: number) {
        const checkboxList = $(".checkBox_list");
        checkboxList.each((cpt: any) => {
            console.log(checkboxList[cpt].checked);
        });
    }

    deleteAllConfirmDialog() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('SPLITTER.confirm_delete_all_batches'),
                confirmButton       : this.translate.instant('SPLITTER.delete_all_checked'),
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
        this.paginationInfos.pageIndex = $event.pageIndex + 1;
        this.paginationInfos.pageSize = $event.pageSize;
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
        const checkboxList = $(".checkBox_list");
        checkboxList.each((cpt: any) => {
            checkboxList[cpt].checked = label === this.translate.instant('VERIFIER.select_all');
        });
        this.totalChecked = $('input.checkBox_list:checked').length;
    }

    deleteAllBatches() {
        this.isLoading = true;
        const checkboxList = $(".checkBox_list");
        checkboxList.each((cpt: any) => {
            if (checkboxList[cpt].checked) {
                const batchId = checkboxList[cpt].id.split('_')[0];
                this.deleteBatch(batchId, true);
            }
        });
        this.notify.success(this.translate.instant('SPLITTER.all_batches_checked_deleted'));
    }

    deleteBatch(id: number, batchDelete = false): void {
        this.http.put(API_URL + '/ws/splitter/status', {'id': id, 'status': 'DEL', }, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.batches.forEach((batch: any, index: number) => {
                    if (batch.id === id) this.batches.splice(index, 1);
                });
                if (!batchDelete) this.notify.success(this.translate.instant('SPLITTER.batch_deleted'));
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    resetPaginator() {
        this.paginationInfos.length = 0;
        this.paginationInfos.offset = 0;
        this.paginationInfos.pageIndex = 1;
    }

    onTabChange(event: any) {
        // this.search = '';
        this.selectedTab = event.index;
        // this.localeStorageService.save('invoicesTimeIndex', this.selectedTab);
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
