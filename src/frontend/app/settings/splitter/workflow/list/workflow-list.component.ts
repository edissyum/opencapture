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
import { SettingsService } from "../../../../../services/settings.service";
import {LastUrlService} from "../../../../../services/last-url.service";
import {LocalStorageService} from "../../../../../services/local-storage.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../../../../../services/auth.service";
import {environment} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {ConfirmDialogComponent} from "../../../../../services/confirm-dialog/confirm-dialog.component";
import {Sort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";
import {HistoryService} from "../../../../../services/history.service";

@Component({
    selector: 'app-workflow-list-splitter',
    templateUrl: './workflow-list.component.html',
    styleUrls: ['./workflow-list.component.scss']
})
export class WorkflowListSplitterComponent implements OnInit {
    headers          : HttpHeaders   = this.authService.headers;
    columnsToDisplay : string[]      = ['id', 'workflow_id', 'label', 'input_folder', 'actions'];
    loading          : boolean       = false;
    pageSize         : number        = 10;
    pageIndex        : number        = 0;
    total            : number        = 0;
    offset           : number        = 0;
    workflows        : any           = [];
    allWorkflows     : any           = [];

    constructor(
        private http: HttpClient,
        private dialog: MatDialog,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        private historyService: HistoryService,
        public serviceSettings: SettingsService,
        private routerExtService: LastUrlService,
        private localStorageService: LocalStorageService
    ) {}

    ngOnInit() {
        this.serviceSettings.init();

        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('settings/splitter/workflows') || lastUrl === '/') {
            if (this.localStorageService.get('workflowsPageIndex'))
                this.pageIndex = parseInt(this.localStorageService.get('workflowsPageIndex') as string);
            this.offset = this.pageSize * (this.pageIndex);
        } else
            this.localStorageService.remove('workflowsPageIndex');

        this.http.get(environment['url'] + '/ws/workflows/splitter/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allWorkflows = data.workflows;
                this.loadWorkflows();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadWorkflows() {
        this.loading = true;
        this.http.get(environment['url'] + '/ws/workflows/splitter/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.workflows[0]) this.total = data.workflows[0].total;
                else if (this.pageIndex !== 0) {
                    this.pageIndex = this.pageIndex - 1;
                    this.offset = this.pageSize * (this.pageIndex);
                    this.loadWorkflows();
                }
                this.workflows = data.workflows;
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
        this.localStorageService.save('workflowsPageIndex', event.pageIndex);
        this.loadWorkflows();
    }

    deleteConfirmDialog(workflowId: number, workflow: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('WORKFLOW.confirm_delete', {"workflow": workflow}),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel')
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteWorkflow(workflowId);
                this.historyService.addHistory('splitter', 'delete_workflow', this.translate.instant('HISTORY-DESC.delete-workflow', {workflow: workflow}));
            }
        });
    }

    deleteWorkflow(workflowId: number) {
        if (workflowId !== undefined) {
            this.http.delete(environment['url'] + '/ws/workflows/splitter/delete/' + workflowId, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadWorkflows();
                    this.notify.success(this.translate.instant('WORKFLOW.workflow_deleted'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    duplicateConfirmDialog(workflowId: number, workflow: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('WORKFLOW.confirm_duplicate', {"workflow": workflow}),
                confirmButton       : this.translate.instant('GLOBAL.duplicate'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.duplicateWorkflow(workflowId);
                this.historyService.addHistory('splitter', 'duplicate_workflow', this.translate.instant('HISTORY-DESC.duplicate-workflow', {workflow: workflow}));
            }
        });
    }

    duplicateWorkflow(workflowId: number) {
        if (workflowId !== undefined) {
            this.http.post(environment['url'] + '/ws/workflows/splitter/duplicate/' + workflowId, {}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadWorkflows();
                    this.notify.success(this.translate.instant('WORKFLOW.workflow_duplicated'));
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
        const data = this.allWorkflows.slice();
        if (!sort.active || sort.direction === '') {
            this.workflows = data.splice(0, this.pageSize);
            return;
        }

        this.workflows = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'label': return this.compare(a.label, b.label, isAsc);
                default:
                    return 0;
            }
        });
        this.workflows = this.workflows.splice(0, this.pageSize);
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
