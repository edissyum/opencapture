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
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { AuthService } from "../../../services/auth.service";
import { NotificationService } from "../../../services/notifications/notifications.service";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import {SettingsService} from "../../../services/settings.service";
import {Sort} from "@angular/material/sort";
import * as moment from "moment";

@Component({
    selector: 'app-monitoring-details',
    templateUrl: './monitoring-details.component.html',
    styleUrls: ['./monitoring-details.component.scss']
})

export class MonitoringDetailsComponent implements OnInit {
    columnsToDisplay    : string[]              = ['step', 'event_date', 'event_message', 'status'];
    loading             : boolean               = true;
    processData         : any                   = [];
    pageSize            : number                = 10;
    pageIndex           : number                = 0;
    total               : number                = 0;
    offset              : number                = 0;
    processId           : number | undefined;
    steps               : any;

    constructor(
        private router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService
    ) {}

    ngOnInit(): void {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        this.processId = this.route.snapshot.params['id'];
        this.http.get(environment['url'] + '/ws/monitoring/getProcessById/' + this.processId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.process && Object.keys(data.process).length > 0) {
                    this.processData = data.process[0];
                    const listOfSteps: any = [];
                    if (Object.keys(this.processData.steps).length > 0) {
                        this.total = Object.keys(this.processData.steps).length;
                        Object.keys(this.processData.steps).forEach((step: any) => {
                            this.processData.steps[step].step = parseInt(step);
                            this.processData.steps[step].date = moment(this.processData.steps[step].date).format('LLL');
                            listOfSteps.push(this.processData.steps[step]);
                        });
                    }
                    this.steps = listOfSteps;
                } else {
                    this.notify.error(this.translate.instant('MONITORING.process_doesnt_exist', {id: this.processId}));
                    this.router.navigate(['/monitoring']);
                }
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
    }

    sortData(sort: Sort) {
        const data = this.processData.steps.slice();
        if (!sort.active || sort.direction === '') {
            this.processData.steps = data;
            return;
        }

        this.processData.steps = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'steps': return this.compare(a.steps, b.steps, isAsc);
                case 'date': return this.compare(a.date, b.date, isAsc);
                case 'message': return this.compare(a.message, b.message, isAsc);
                case 'status': return this.compare(a.status, b.status, isAsc);
                default: return 0;
            }
        });
        this.processData.steps = this.processData.steps.splice(0, this.pageSize);
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
