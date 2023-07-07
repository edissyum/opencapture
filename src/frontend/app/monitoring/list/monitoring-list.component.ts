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

import {Component, OnDestroy, OnInit} from '@angular/core';
import { SettingsService } from "../../../services/settings.service";
import { FormControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { Sort } from "@angular/material/sort";
import { environment } from "../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import {interval, of} from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../../services/auth.service";
import { NotificationService } from "../../../services/notifications/notifications.service";
import * as moment from "moment/moment";

@Component({
    selector: 'app-monitoring-list',
    templateUrl: './monitoring-list.component.html',
    styleUrls: ['./monitoring-list.component.scss']
})
export class MonitoringListComponent implements OnInit, OnDestroy {
    columnsToDisplay    : string[] = ['module', 'creation_date', 'end_date', 'filename', 'last_message', 'status'];
    loading             : boolean  = true;
    pageSize            : number   = 10;
    pageIndex           : number   = 0;
    total               : number   = 0;
    offset              : number   = 0;
    allProcessData      : any      = [];
    moduleSelected      : string   = '';
    statusSelected      : string   = '';
    processData         : any;
    form                : any[]    = [
        {
            'id': 'module',
            'label': this.translate.instant('CUSTOM-FIELDS.module'),
            'type': 'select',
            'control': new FormControl(),
            'values': [
                {
                    'id': 'verifier',
                    'label': this.translate.instant('HOME.verifier')
                },
                {
                    'id': 'splitter',
                    'label': this.translate.instant('HOME.splitter')
                }
            ]
        },
        {
            'id': 'status',
            'type': 'select',
            'label': this.translate.instant('HEADER.status'),
            'control': new FormControl(),
            'values': [
                {
                    'id': 'running',
                    'label': this.translate.instant('MONITORING.running')
                },
                {
                    'id': 'done',
                    'label': this.translate.instant('MONITORING.done')
                },
                {
                    'id': 'error',
                    'label': this.translate.instant('MONITORING.error')
                }
            ]
        }
    ];
    timer               : any;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private notify: NotificationService,
        private translate: TranslateService,
        public serviceSettings: SettingsService
    ) { }

    ngOnInit() {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        this.http.get(environment['url'] + '/ws/monitoring/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allProcessData = data.processss;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.loadMonitoring();
        this.timer = setInterval(()=>{
            this.loadMonitoring();
        }, 4000);
    }

    ngOnDestroy() {
        clearInterval(this.timer);
    }

    loadMonitoring() {
        this.http.get(
            environment['url'] + '/ws/monitoring/list?limit=' + this.pageSize + '&offset=' + this.offset + '&module=' + this.moduleSelected + '&status=' + this.statusSelected,
            {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.processData = data.processses;
                if (data.processses[0]) this.total = data.processses[0].total;
                this.processData.forEach((element: any) => {
                    const numberOfSteps = Object.keys(element.steps).length;
                    if (element.steps[numberOfSteps]) {
                        element.last_message = element.steps[numberOfSteps].message;
                    }
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

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.loadMonitoring();
    }

    resetFilter() {
        this.moduleSelected = '';
        this.statusSelected = '';
        this.form.forEach((element: any) => {
            element.control.setValue('');
        });
        this.loadMonitoring();
    }

    updateData(id: string, value: string) {
        if (id === 'module') {
            this.moduleSelected = value;
        } else if (id === 'status') {
            this.statusSelected = value;
        }
        this.loadMonitoring();
    }

    sortData(sort: Sort) {
        const data = this.allProcessData.slice();
        if (!sort.active || sort.direction === '') {
            this.processData = data;
            return;
        }

        this.processData = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'module': return this.compare(a.module, b.module, isAsc);
                case 'creation_date': return this.compare(a.creation_date, b.creation_date, isAsc);
                case 'end_date': return this.compare(a.end_date, b.end_date, isAsc);
                case 'last_message': return this.compare(a.last_message, b.last_message, isAsc);
                case 'status': return this.compare(a.status, b.status, isAsc);
                default: return 0;
            }
        });
        this.processData = this.processData.splice(0, this.pageSize);
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
