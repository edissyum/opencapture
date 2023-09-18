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

 @dev : Oussama Brich <oussama.brich@edissyum.com> */

import {Component, OnDestroy, OnInit} from '@angular/core';
import { LocalStorageService } from "../local-storage.service";
import { environment } from "../../app/env";
import { catchError, finalize, tap } from "rxjs/operators";
import { interval, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../auth.service";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { NotificationService } from "../notifications/notifications.service";
import { PrivilegesService } from "../privileges.service";

@Component({
    selector: 'app-process-watcher',
    templateUrl: './process-watcher.component.html',
    styleUrls: ['./process-watcher.component.scss']
})

export class ProcessWatcherComponent implements OnInit {
    minimizeDisplay     : boolean = true;
    isFirstCallDone     : boolean = false;
    getProcessRunning   : boolean = false;
    processes           : any[]   = [];
    displayedProcessData: any[]   = [];
    authorizedUrl       : any[]   = ['/verifier/list', '/splitter/list', '/upload'];

    constructor(
        public router: Router,
        private http: HttpClient,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public privilegesService: PrivilegesService,
        private localStorageService: LocalStorageService
    ) {
    }

    ngOnInit(): void {
        setInterval(() => {
            this.minimizeDisplay = this.authService.getToken('minimizeDisplay') === 'true';
        }, 500);

        interval(5000).subscribe(() => {
            if (this.authorizedUrl.includes(this.router.url) && !this.getProcessRunning) {
                this.getLastProcesses();
            }
        });
    }

    changeDisplayMode(minimizeDisplay: boolean) {
        this.minimizeDisplay = minimizeDisplay;
        if (!this.minimizeDisplay) {
            this.getLastProcesses();
        }
        this.authService.setToken('minimizeDisplay', minimizeDisplay ? 'true' : 'false');
    }

    getLastProcesses() {
        this.isFirstCallDone = true;
        this.getProcessRunning  = true;
        const splitterOrVerifier = this.localStorageService.get('splitter_or_verifier');
        if (splitterOrVerifier && this.privilegesService.hasPrivilege('monitoring')) {
            this.http.get(environment['url'] + '/ws/monitoring/' + splitterOrVerifier + '/lasts',
                {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    if (this.displayedProcessData !== data['processses']) {
                        this.processes = [];
                        let cpt = 1;
                        for (const process of data['processses']) {
                            process.error_message = '';
                            if (process.error) {
                                Object.keys(process.steps).forEach((step: any) => {
                                    if (process.steps[step].status == 'error') {
                                        process.error_message = process.steps[step].message;
                                    }
                                });
                            }
                            this.processes.push({
                                'id'            : cpt,
                                'type'          : process.type,
                                'fileName'      : process.filename,
                                'module'        : process.module,
                                'beginTime'     : process['creation_date_formated'],
                                'endTime'       : process['end_date_formated'],
                                'error'         : process.error,
                                'errorMessage'  : process.error_message,
                                'status'        : process.status ? process.status : 'in_progress',
                                'age'           : process.age !== 0 ?
                                    this.translate.instant("GLOBAL.n_minutes_ago", {'minutes': process.age}) :
                                    this.translate.instant("GLOBAL.few_seconds_ago")
                            });
                            cpt++;
                        }
                    }
                    this.displayedProcessData = data.process;
                }),
                finalize(() => this.getProcessRunning = false),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    showError(error: any) {
        if (error) {
            this.notify.handleErrors({
                error: {
                    errors : this.translate.instant('GLOBAL.task_error_informations'),
                    message : '<br>' + error.replaceAll('\n', '<br>')
                }
            });
        }
    }

    countCurrentProcess() {
        let count = 0;
        for (const process of this.processes) {
            if (process.status === 'wait' || process.status === 'running') {
                count++;
            }
        }
        return count;
    }
}
