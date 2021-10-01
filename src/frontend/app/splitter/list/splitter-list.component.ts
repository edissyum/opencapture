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
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {AuthService} from "../../../services/auth.service";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {UserService} from "../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../services/notifications/notifications.service";
import { DomSanitizer } from '@angular/platform-browser';
import {PageEvent} from "@angular/material/paginator";
import {ConfirmDialogComponent} from "../../../services/confirm-dialog/confirm-dialog.component";
import {MatDialog} from '@angular/material/dialog';
import { NgxUiLoaderService } from "ngx-ui-loader";

@Component({
    selector: 'app-list',
    templateUrl: './splitter-list.component.html',
    styleUrls: ['./splitter-list.component.scss']
})

export class SplitterListComponent implements OnInit {
    isLoading           = true;
    batches             = [] as  any;
    gridColumns         = 4;
    page                = 1;
    searchText: string  = "";
    paginationInfos     = {
        length: 0,
        pageSize: 10,
        pageIndex: 1,
    }

    constructor(
        private localeStorageService: LocalStorageService,
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        private translate: TranslateService,
        private notify: NotificationService,
        private _sanitizer: DomSanitizer,
        public dialog: MatDialog,
        private ngxService: NgxUiLoaderService,
        ) { }

    ngOnInit(): void {
        this.localeStorageService.save('splitter_or_verifier', 'splitter');
        this.loadBatches();
    }

    toggleGridColumns() {
        this.gridColumns = this.gridColumns === 3 ? 4 : 3;
    }

    loadBatches(): void{
        this.ngxService.startBackground("load-batch");
        setTimeout(() => {
          this.ngxService.stopBackground("load-batch");
        }, 10000);
        let headers = this.authService.headers;
        this.http.get(API_URL + '/ws/splitter/batches/' +
            (this.paginationInfos['pageIndex'] - 1)  + "/" +
            this.paginationInfos['pageSize'],
            {headers}).pipe(
            tap((data: any) => {
                this.batches                = data.batches;
                this.paginationInfos.length = data.count;
                this.ngxService.stopBackground("load-batch");
                this.isLoading = false;
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe()
    }

    sanitize(url:string){
        return this._sanitizer.bypassSecurityTrustUrl('data:image/jpg;base64,' + url);
    }

    onPageChange($event: PageEvent) {
        this.batches = [];
        this.paginationInfos.pageIndex  = $event.pageIndex + 1;
        this.paginationInfos.pageSize   = $event.pageSize;
        this.loadBatches();
    }

    openConfirmDialog(id: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('SPLITTER.confirm_batch_delete'),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "400px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.deleteBatch(id);
            }
        });
    }

    deleteBatch(id: number): void{
        let headers = this.authService.headers;
        this.http.put(API_URL + '/ws/splitter/status', {
            'id'    : id,
            'status': 'DEL',
        } ,{headers}).pipe(
            tap((data: any) => {
                this.batches.forEach( (batch: any, index: number) => {
                 if(batch.id === id) this.batches.splice(index,1);
                });
                this.notify.success(this.translate.instant('SPLITTER.batch_deleted'));
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe()
    }
}
