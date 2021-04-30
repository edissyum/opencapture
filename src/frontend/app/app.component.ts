import {Component, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import {ActivatedRoute, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
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
        public location: Location,
        private http: HttpClient,
        private titleService: Title,
        private notify:NotificationService,
        private translate: TranslateService,
        private activatedRoute: ActivatedRoute,
        private localeService: LocaleService,
        private localeStorageService: LocalStorageService
    ) {

    }

    ngOnInit() {
        const appTitle = this.titleService.getTitle();
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => {
                let child = this.activatedRoute.firstChild;
                let child_image = 'assets/imgs/logo_opencapture.png'
                if (child) {
                    while (child.firstChild) {
                        child = child.firstChild;
                    }
                    if (this.router.url != '/home' && !this.router.url.includes('settings')) {
                        let splitter_or_verifier = this.localeStorageService.get('splitter_or_verifier')
                        if (splitter_or_verifier != undefined){
                            if (splitter_or_verifier == 'splitter'){
                                child_image = 'assets/imgs/logo_splitter.png'
                            }else{
                                child_image = 'assets/imgs/logo_verifier.png'
                            }
                        }
                    }

                    if (child.snapshot.data['title']) {
                        return [child.snapshot.data['title'], child_image];
                    }
                }
                return [appTitle, child_image]
            })
        ).subscribe((data: any) => {
            let ttl = data[0]
            this.image = data[1]
            if (this.translate.currentLang == undefined){
                this.http.get(API_URL + '/ws/i18n/getCurrentLang').pipe(
                    tap((data: any) => {
                        this.translate.use(data.lang)
                        this.translate.get(ttl).subscribe((data:any)=> {
                            this.titleService.setTitle(data + ' - ' + this.title);
                        });
                        this.loading = false
                    }),
                    catchError((err: any) => {
                        console.debug(err)
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe()
            }else{
                this.translate.get(ttl).subscribe((data:any)=> {
                    this.titleService.setTitle(data + ' - ' + this.title);
                });
                this.loading = false
            }
        });
    }
}
