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

 @dev : Oussama Brich <oussama.brich@edissyum.com> */

import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from "../local-storage.service";
import { environment } from "../../app/env";
import { catchError, tap } from "rxjs/operators";
import { interval, of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../auth.service";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";

@Component({
    selector: 'app-tasks-watcher',
    templateUrl: './tasks-watcher.component.html',
    styleUrls: ['./tasks-watcher.component.scss']
})
export class TasksWatcherComponent implements OnInit {
    minimizeDisplay     : boolean = false;
    loading             : boolean = true;
    tasks               : any[]   = [];
    displayedTasksData  : any[]   = [];

    constructor(
        private router: Router,
        private http: HttpClient,
        private authService: AuthService,
        public translate: TranslateService,
        private localStorageService: LocalStorageService
    ) {}

    ngOnInit(): void {
        this.minimizeDisplay = this.localStorageService.get('task_watcher_minimize_display') == 'true';
        this.getLastTasks();
        const authorizedUrl = ['/verifier/list', '/splitter/list', '/upload']
        interval(3000).subscribe(() => {
            if (authorizedUrl.includes(this.router.url)) {
                this.getLastTasks();
            }
        });
    }

    changeDisplayMode(minimizeDisplay: boolean) {
        this.minimizeDisplay = minimizeDisplay;
        this.localStorageService.save('task_watcher_minimize_display', minimizeDisplay ? 'true': 'false');
    }

    getLastTasks() {
        const splitterOrVerifier = this.localStorageService.get('splitter_or_verifier');
        this.http.get(environment['url'] + '/ws/tasks/progress?module=' + splitterOrVerifier,
            {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if(this.displayedTasksData !== data.tasks) {
                    this.loading = true;
                    this.tasks   = [];
                    let cpt      = 1;
                    for(const task of data.tasks) {
                        this.tasks.push({
                            'id'            : cpt,
                            'type'          : task.type,
                            'fileName'      : task.title,
                            'module'        : task.module,
                            'beginTime'     : task.begin_time,
                            'endTime'       : task.end_time,
                            'status'        : task.status ? task.status: 'in_progress',
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
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }
}
