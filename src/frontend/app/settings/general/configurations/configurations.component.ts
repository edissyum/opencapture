/** This file is part of Open-Capture for Invoices.

 Open-Capture for Invoices is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

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
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Component({
    selector: 'app-configurations',
    templateUrl: './configurations.component.html',
    styleUrls: ['./configurations.component.scss'],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
    ]
})
export class ConfigurationsComponent implements OnInit {
    columnsToDisplay    : string[]      = ['id', 'label', 'description', 'type', 'value', 'actions'];
    headers             : HttpHeaders   = this.authService.headers;
    loading             : boolean       = true;
    updateLoading       : boolean       = false;
    configurations      : any           = [];
    allConfigurations   : any           = [];
    pageSize            : number        = 10;
    pageIndex           : number        = 0;
    total               : number        = 0;
    offset              : number        = 0;
    search              : string        = '';
    loginImage          : SafeUrl       = '';

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localeStorageService: LocalStorageService,
    ) { }

    ngOnInit(): void {
        this.serviceSettings.init();

        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('settings/general/configurations') || lastUrl === '/') {
            if (this.localeStorageService.get('configurationsPageIndex'))
                this.pageIndex = parseInt(this.localeStorageService.get('configurationsPageIndex') as string);
            this.offset = this.pageSize * (this.pageIndex);
        }else
            this.localeStorageService.remove('configurationsPageIndex');

        this.http.get(environment['url'] + '/ws/config/getConfigurations', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allConfigurations = data.configurations;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/config/getLoginImage', {headers: this.authService.headers}).pipe(
            tap((b64Content: any) => {
                this.loginImage = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64, ' + b64Content);
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.loadConfigurations();
    }

    onClick(logo: any) {
        logo.click();
    }

    upload(fileInput: any) {
        if (fileInput.target.files && fileInput.target.files[0]) {
            this.loading = true;
            const reader = new FileReader();
            reader.readAsDataURL(fileInput.target.files[0]);
            reader.onload = (value: any) => {
                const args = {
                    'image_content': value.target.result
                };
                this.http.put(environment['url'] + '/ws/config/updateLoginimage',{'args': args},
                    {headers: this.authService.headers},
                ).pipe(
                    tap(() => {
                        this.loginImage = this.sanitizer.bypassSecurityTrustUrl(args['image_content']);
                        this.notify.success(this.translate.instant('CONFIGURATIONS.login_image_changed'));
                    }),
                    finalize(() => this.loading = false),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            };
        }
    }

    loadConfigurations() {
        this.http.get(environment['url'] + '/ws/config/getConfigurations?limit=' + this.pageSize + '&offset=' + this.offset + "&search=" + this.search, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.configurations[0]) this.total = data.configurations[0].total;
                else if (this.pageIndex !== 0) {
                    this.pageIndex = this.pageIndex - 1;
                    this.offset = this.pageSize * (this.pageIndex);
                    this.loadConfigurations();
                }
                this.configurations = data.configurations;
                this.configurations.forEach((element: any) => {
                    switch (element.data.type) {
                        case 'int':
                            element.data.label_type = marker('CONFIGURATIONS.int');
                            break;
                        case 'float':
                            element.data.label_type = marker('CONFIGURATIONS.float');
                            break;
                        case 'string':
                            element.data.label_type = marker('CONFIGURATIONS.string');
                            break;
                        case 'bool':
                            element.data.label_type = marker('CONFIGURATIONS.bool');
                            break;
                        default:
                            break;
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

    updateValue(event: any, id: number) {
        this.updateLoading = true;
        const value = event.target ? event.target.value : event.value;
        this.configurations.forEach((element: any) => {
            if (element.id === id) {
                element.data.value = value;
                this.http.put(environment['url'] + '/ws/config/updateConfiguration/' + element.id, element, {headers: this.authService.headers}).pipe(
                    tap(() => {
                        this.notify.success(this.translate.instant('CONFIGURATIONS.configuration_updated'));
                        element.updateMode = false;
                        this.updateLoading = false;
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

    searchConfiguration(event: any) {
        this.search = event.target.value;
        this.loadConfigurations();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.pageIndex = event.pageIndex;
        this.localeStorageService.save('configurationsPageIndex', event.pageIndex);
        this.loadConfigurations();
    }

    sortData(sort: Sort) {
        const data = this.allConfigurations.slice();
        if (!sort.active || sort.direction === '') {
            this.configurations = data.splice(0, this.pageSize);
            return;
        }

        this.configurations = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'label': return this.compare(a.label, b.label, isAsc);
                case 'description': return this.compare(a.data.description, b.data.description, isAsc);
                default: return 0;
            }
        });
        this.configurations = this.configurations.splice(0, this.pageSize);
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
