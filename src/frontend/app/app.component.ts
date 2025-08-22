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

import { of } from "rxjs";
import { environment } from  "./env";
import { HttpClient } from "@angular/common/http";
import { _, TranslateService } from "@ngx-translate/core";
import { LocaleService } from "../services/locale.service";
import { catchError, filter, map, tap } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SessionStorageService } from "../services/session-storage.service";
import { DomSanitizer, Title } from '@angular/platform-browser';
import { NotificationService } from "../services/notifications/notifications.service";
import {AfterContentChecked, ChangeDetectorRef, Component, OnInit, SecurityContext} from '@angular/core';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    standalone: false
})

export class AppComponent implements OnInit, AfterContentChecked {
    imageMobile : string  = '';
    image       : any     = '';
    loading     : boolean = true;
    showMenu    : boolean = true;
    title       : string  = 'Open-Capture';

    constructor(
        private router: Router,
        private http: HttpClient,
        private titleService: Title,
        private sanitizer: DomSanitizer,
        private notify:NotificationService,
        private translate: TranslateService,
        private localeService: LocaleService,
        private activatedRoute: ActivatedRoute,
        private changeDetector: ChangeDetectorRef,
        private sessionStorageService: SessionStorageService
    ) {}

    ngOnInit() {
        const appTitle = this.titleService.getTitle();
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => {
                this.showMenu = true;
                let child = this.activatedRoute.firstChild;
                let childImage = 'assets/imgs/login_image.png';
                let childImageMobile = 'assets/imgs/Open-Capture_Verifier.svg';
                let splitterOrVerifier;
                if (child) {
                    while (child.firstChild) {
                        child = child.firstChild;
                    }
                    if (this.router.url !== '/home' && !this.router.url.includes('settings')) {
                        splitterOrVerifier = this.sessionStorageService.get('splitter_or_verifier');
                        if (splitterOrVerifier !== undefined) {
                            if (splitterOrVerifier === 'splitter') {
                                childImage = 'assets/imgs/logo_splitter.png';
                                childImageMobile = 'assets/imgs/Open-Capture_Splitter.svg';
                            } else {
                                childImage = 'assets/imgs/logo_verifier.png';
                            }
                        }
                    }
                    if (child.snapshot.data['showMenu'] === false) {
                        this.showMenu = false;
                    }
                    if (child.snapshot.data['title']) {
                        return [child.snapshot.data['title'], childImage, childImageMobile, splitterOrVerifier];
                    }
                }
                return [appTitle, childImage, childImageMobile, splitterOrVerifier];
            })
        ).subscribe((data: any) => {
            const ttl = data[0];
            this.image = data[1];
            this.imageMobile = data[2];
            const splitterOrVerifier = data[3];
            if (!splitterOrVerifier) {
                const b64Content = this.sessionStorageService.get('loginImageB64');
                if (!b64Content) {
                    this.http.get(environment['url'] + '/ws/config/getLoginImage').pipe(
                        tap((data: any) => {
                            this.sessionStorageService.save('loginImageB64', data);
                            this.image = this.sanitizer.sanitize(SecurityContext.URL, 'data:image/png;base64, ' + data);
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                } else {
                    this.image = this.sanitizer.sanitize(SecurityContext.URL, 'data:image/png;base64, ' + b64Content);
                }
            }
            if (!this.localeService.currentLang) {
                this.http.get(environment['url'] + '/ws/i18n/getCurrentLang').pipe(
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
            } else {
                this.translate.get(ttl).subscribe((data:any)=> {
                    this.titleService.setTitle(data + ' - ' + this.title);
                });
                this.loading = false;
            }
        });
    }

    ngAfterContentChecked(): void {
        this.changeDetector.detectChanges();
    }
}
