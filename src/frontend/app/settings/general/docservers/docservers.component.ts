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

 @dev : Nathan Cheval <nathan.cheval@outlook.fr>
 @dev : Oussama Brich <oussama.brich@edissyum.com> */

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { SettingsService } from "../../../../services/settings.service";
import { AuthService } from "../../../../services/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { PrivilegesService } from "../../../../services/privileges.service";
import { LocalStorageService } from "../../../../services/local-storage.service";
import { LastUrlService } from "../../../../services/last-url.service";
import { Sort } from "@angular/material/sort";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { environment } from  "../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: 'app-docservers',
    templateUrl: './docservers.component.html',
    styleUrls: ['./docservers.component.scss'],
    providers: [
        {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' }},
    ]
})
export class DocserversComponent implements OnInit {
    columnsToDisplay    : string[]      = ['id', 'docserver_id', 'description', 'content', 'actions'];
    headers             : HttpHeaders   = this.authService.headers;
    loading             : boolean       = true;
    updateLoading       : boolean       = false;
    docservers          : any           = [];
    allDocservers       : any           = [];
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
        private translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localStorageService: LocalStorageService
    ) { }

    ngOnInit(): void {
        this.serviceSettings.init();

        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('settings/general/docservers') || lastUrl === '/') {
            if (this.localStorageService.get('docserversPageIndex')) {
                this.pageIndex = parseInt(this.localStorageService.get('docserversPageIndex') as string);
            }
            this.offset = this.pageSize * (this.pageIndex);
        } else {
            this.localStorageService.remove('docserversPageIndex');
        }

        this.http.get(environment['url'] + '/ws/config/getDocservers', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allDocservers = data.docservers;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        this.loadDocservers();
    }

    loadDocservers() {
        this.http.get(environment['url'] + '/ws/config/getDocservers?limit=' + this.pageSize + '&offset=' + this.offset + "&search=" + this.search, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.docservers[0]) this.total = data.docservers[0].total;
                else if (this.pageIndex !== 0) {
                    this.pageIndex = this.pageIndex - 1;
                    this.offset = this.pageSize * (this.pageIndex);
                    this.loadDocservers();
                }
                this.docservers = data.docservers;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    updateValue(event: any, id: number, docserver: string) {
        this.updateLoading = true;
        const value = event.target.value;
        this.docservers.forEach((element: any) => {
            if (element.id === id) {
                element.path = value;
                this.http.put(environment['url'] + '/ws/config/updateDocserver/' + element.id, {'args': element}, {headers: this.authService.headers}).pipe(
                    tap(() => {
                        element.updateMode = false;
                        this.updateLoading = false;
                        this.notify.success(this.translate.instant('DOCSERVERS.docserver_updated'));
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

    searchDocservers(event: any) {
        this.search = event.target.value;
        this.loadDocservers();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.pageIndex = event.pageIndex;
        this.localStorageService.save('docserversPageIndex', event.pageIndex);
        this.loadDocservers();
    }

    sortData(sort: Sort) {
        const data = this.allDocservers.slice();
        if (!sort.active || sort.direction === '') {
            this.docservers = data.splice(0, this.pageSize);
            return;
        }

        this.docservers = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'docserver_id': return this.compare(a.docserver_id, b.docserver_id, isAsc);
                case 'description': return this.compare(a.description, b.description, isAsc);
                default: return 0;
            }
        });
        this.docservers = this.docservers.splice(0, this.pageSize);
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
