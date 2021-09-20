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

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

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

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import {Component, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {catchError, filter, map, tap} from 'rxjs/operators';
import { TranslateService } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";

import { NotificationService } from "../services/notifications/notifications.service";
import {LocaleService} from "../services/locale.service";
import {LocalStorageService} from "../services/local-storage.service";
import {API_URL} from "./env";
import {of} from "rxjs";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {
    title   : string = 'Open-Capture For Invoices';
    image   : string = '';
    loading : boolean = true;

    constructor(
        private router: Router,
        private http: HttpClient,
        public location: Location,
        private titleService: Title,
        private notify:NotificationService,
        private translate: TranslateService,
        private localeService: LocaleService,
        private activatedRoute: ActivatedRoute,
        private localeStorageService: LocalStorageService
    ) {}

    ngOnInit() {
        const appTitle = this.titleService.getTitle();
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => {
                let child = this.activatedRoute.firstChild;
                let childImage = 'assets/imgs/logo_opencapture.png';
                if (child) {
                    while (child.firstChild) {
                        child = child.firstChild;
                    }
                    if (this.router.url !== '/home' && !this.router.url.includes('settings')) {
                        const splitterOrVerifier = this.localeStorageService.get('splitter_or_verifier');
                        if (splitterOrVerifier !== undefined) {
                            if (splitterOrVerifier === 'splitter') {
                                childImage = 'assets/imgs/logo_splitter.png';
                            }else {
                                childImage = 'assets/imgs/logo_verifier.png';
                            }
                        }
                    }

                    if (child.snapshot.data['title']) {
                        return [child.snapshot.data['title'], childImage];
                    }
                }
                return [appTitle, childImage];
            })
        ).subscribe((data: any) => {
            const ttl = data[0];
            this.image = data[1];
            if (this.localeService.currentLang === undefined) {
                this.http.get(API_URL + '/ws/i18n/getCurrentLang').pipe(
                    tap((data: any) => {
                        this.translate.use(data.lang);
                        this.translate.get(ttl).subscribe((data:any)=> {
                            this.titleService.setTitle(data + ' - ' + this.title);
                        });
                        this.loading = false;
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }else{
                this.translate.get(ttl).subscribe((data:any)=> {
                    this.titleService.setTitle(data + ' - ' + this.title);
                });
                this.loading = false;
            }
        });
    }
}
