import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {API_URL} from "../app/env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {AuthService} from "./auth.service";
import {NotificationService} from "./notifications/notifications.service";
import {TranslateService} from "@ngx-translate/core";
import {DateAdapter} from "@angular/material/core";
import 'moment/locale/en-gb';
import 'moment/locale/fr';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class LocaleService {
    currentLang         : string = 'fra'
    dateAdaptaterLocale : string = 'fr-FR'
    langs               : [] = []

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        private _adapter: DateAdapter<any>
    ) {
        this._adapter.setLocale('fr-FR')
    }

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
        this.changeMatLocale()
    }

    changeMatLocale(){
        if (this.currentLang != 'fra'){
            moment.updateLocale('en-GB', {
                longDateFormat : {
                    LT: "h:mm A",
                    LTS: "h:mm:ss A",
                    L: "MM/DD/YYYY",
                    l: "MM/DD/YYYY",
                    LL: "MMMM Do YYYY",
                    LLL: "MMMM Do YYYY LT",
                    LLLL: "dddd, MMMM Do YYYY LT",
                    llll: "ddd, MMM D YYYY LT"
                },
                week : {
                    dow : 0, // Sunday is the first day of the week.
                }
            })
            this._adapter.setLocale('en-GB');
            this.dateAdaptaterLocale = 'en-GB'
        }else{
            moment.updateLocale('fr-FR', {
                monthsShort : 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
                weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
                longDateFormat : {
                    LT : 'HH:mm',
                    LTS : 'HH:mm:ss',
                    L : 'DD/MM/YYYY',
                    l : 'DD/MM/YYYY',
                    LL : 'D MMMM YYYY',
                    LLL : 'D MMMM YYYY HH:mm',
                    LLLL : 'dddd D MMMM YYYY HH:mm'
                },
                week : {
                    dow : 1, // Monday is the first day of the week.
                }
            })
            this._adapter.setLocale('fr-FR');
            this.dateAdaptaterLocale = 'fr-FR'
        }
    }

    getCurrentLocale() {
        this.http.get(API_URL + '/ws/i18n/getCurrentLang').pipe(
            tap((data: any) => {
                this.currentLang = data.lang
                this.changeMatLocale()
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
