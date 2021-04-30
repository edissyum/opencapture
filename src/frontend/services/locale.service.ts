import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {API_URL} from "../app/env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {AuthService} from "./auth.service";
import {NotificationService} from "./notifications/notifications.service";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
    providedIn: 'root'
})
export class LocaleService {
    currentLang: string = ''
    langs: [] = []

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService
    ) {}

    changeLocale(data: any) {
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.authService.getToken())
        this.http.get(API_URL + '/ws/i18n/changeLanguage/' + data.value, {headers}).pipe(
            catchError((err: any) => {
                console.debug(err)
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
        this.currentLang = data.value
        this.translate.use(data.value)
    }

    getCurrentLocale() {
        this.http.get(API_URL + '/ws/i18n/getCurrentLang').pipe(
            tap((data: any) => {
                this.currentLang = data.lang
                this.translate.use(this.currentLang)
            }),
            catchError((err: any) => {
                console.debug(err)
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    getLocales() {
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.authService.getToken())
        this.http.get(API_URL + '/ws/i18n/getAllLang', {headers}).pipe(
            tap((data: any) => {
                this.langs = data.langs
            }),
            catchError((err: any) => {
                console.debug(err)
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }
}
