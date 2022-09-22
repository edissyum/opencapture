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

import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from "../local-storage.service";
import { environment } from "../../app/env";
import { catchError, finalize, tap } from "rxjs/operators";
import { interval, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../auth.service";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { NotificationService } from "../notifications/notifications.service";

@Component({
    selector: 'app-tasks-watcher',
    templateUrl: './tasks-watcher.component.html',
    styleUrls: ['./tasks-watcher.component.scss']
})

export class TasksWatcherComponent implements OnInit {
    minimizeDisplay     : boolean = false;
    getTaskRunning      : boolean = false;
    loading             : boolean = true;
    tasks               : any[]   = [];
    displayedTasksData  : any[]   = [];
    authorizedUrl       : any[]   = ['/verifier/list', '/splitter/list', '/upload'];

    constructor(
        public router: Router,
        private http: HttpClient,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        private localStorageService: LocalStorageService
    ) {
        this.getLastTasks();
    }

    ngOnInit(): void {
        this.minimizeDisplay = this.localStorageService.get('task_watcher_minimize_display') === 'true';
        interval(4000).subscribe(() => {
            if (this.authorizedUrl.includes(this.router.url) && !this.getTaskRunning && !this.minimizeDisplay) {
                this.getLastTasks();
            }
        });
    }

    changeDisplayMode(minimizeDisplay: boolean) {
        this.minimizeDisplay = minimizeDisplay;
        if (!this.minimizeDisplay) {
            this.getLastTasks();
        }
        this.localStorageService.save('task_watcher_minimize_display', minimizeDisplay ? 'true': 'false');
    }

    getLastTasks() {
        this.getTaskRunning = true;
        const splitterOrVerifier = this.localStorageService.get('splitter_or_verifier');
        if (splitterOrVerifier) {
            this.http.get(environment['url'] + '/ws/tasks/progress?module=' + splitterOrVerifier,
                {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    if(this.displayedTasksData !== data.tasks) {
                        this.loading = true;
                        this.tasks = [];
                        let cpt = 1;
                        for(const task of data.tasks) {
                            this.tasks.push({
                                'id'            : cpt,
                                'type'          : task.type,
                                'fileName'      : task.title,
                                'module'        : task.module,
                                'beginTime'     : task.begin_time,
                                'endTime'       : task.end_time,
                                'error'         : task.error_description ? task.error_description : false,
                                'status'        : task.status ? task.status : 'in_progress',
                                'age'           : task.age !== 0 ?
                                    this.translate.instant("GLOBAL.n_minutes_ago", {'minutes': task.age}):
                                    this.translate.instant("GLOBAL.few_seconds_ago")
                            });
                            cpt++;
                        }
                    }
                    this.displayedTasksData = data.tasks;
                    this.loading            = false;
                }),
                finalize(() => this.getTaskRunning = false),
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
                    message : error
                }
            });
        }
    }
}
