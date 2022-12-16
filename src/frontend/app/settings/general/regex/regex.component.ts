/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../services/settings.service";
import { LastUrlService } from "../../../../services/last-url.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { LocalStorageService } from "../../../../services/local-storage.service";
import { environment } from  "../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { Sort } from "@angular/material/sort";
import { HistoryService } from "../../../../services/history.service";

@Component({
    selector: 'app-regex',
    templateUrl: './regex.component.html',
    styleUrls: ['./regex.component.scss']
})
export class RegexComponent implements OnInit {
    columnsToDisplay    : string[]      = ['regex_id', 'label', 'content', 'actions'];
    headers             : HttpHeaders   = this.authService.headers;
    loading             : boolean       = true;
    updateLoading       : boolean       = false;
    regex               : any           = [];
    allRegex            : any           = [];
    pageSize            : number        = 10;
    pageIndex           : number        = 0;
    total               : number        = 0;
    offset              : number        = 0;
    search              : string        = '';

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        private historyService: HistoryService,
        public serviceSettings: SettingsService,
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localStorageService: LocalStorageService,
    ) { }

    ngOnInit(): void {
        this.serviceSettings.init();

        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('settings/general/regex') || lastUrl === '/') {
            if (this.localStorageService.get('regexPageIndex'))
                this.pageIndex = parseInt(this.localStorageService.get('regexPageIndex') as string);
            this.offset = this.pageSize * (this.pageIndex);
        } else
            this.localStorageService.remove('regexPageIndex');

        this.http.get(environment['url'] + '/ws/config/getRegex', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allRegex = data.regex;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.loadRegex();
    }

    loadRegex() {
        this.http.get(environment['url'] + '/ws/config/getRegex?limit=' + this.pageSize + '&offset=' + this.offset + "&search=" + this.search, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.regex[0]) this.total = data.regex[0].total;
                else if (this.pageIndex !== 0) {
                    this.pageIndex = this.pageIndex - 1;
                    this.offset = this.pageSize * (this.pageIndex);
                    this.loadRegex();
                }
                this.regex = data.regex;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    updateValue(event: any, id: number, regex_id: string) {
        this.updateLoading = true;
        const value = event.target.value;
        this.regex.forEach((element: any) => {
            if (element.id === id) {
                element.content = value;
                this.http.put(environment['url'] + '/ws/config/updateRegex/' + element.id, {'data': element}, {headers: this.authService.headers}).pipe(
                    tap(() => {
                        element.updateMode = false;
                        this.updateLoading = false;
                        this.notify.success(this.translate.instant('REGEX.regex_updated'));
                        this.historyService.addHistory('general', 'update_regex', this.translate.instant('HISTORY-DESC.update_regex', {regex: regex_id}));

                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }
        });
    }

    searchRegex(event: any) {
        this.search = event.target.value;
        this.loadRegex();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.pageIndex = event.pageIndex;
        this.localStorageService.save('regexPageIndex', event.pageIndex);
        this.loadRegex();
    }

    sortData(sort: Sort) {
        const data = this.allRegex.slice();
        if (!sort.active || sort.direction === '') {
            this.regex = data.splice(0, this.pageSize);
            return;
        }

        this.regex = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'regex_id': return this.compare(a.regex_id, b.regex_id, isAsc);
                case 'label': return this.compare(a.label, b.label, isAsc);
                default: return 0;
            }
        });
        this.regex = this.regex.splice(0, this.pageSize);
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

}
