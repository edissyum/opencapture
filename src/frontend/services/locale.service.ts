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

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { of } from "rxjs";
import * as moment from 'moment';
import { environment } from  "../app/env";
import { Injectable } from '@angular/core';
import { AuthService } from "./auth.service";
import { catchError, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { HistoryService } from "./history.service";
import { DateAdapter } from "@angular/material/core";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "./notifications/notifications.service";

@Injectable({
    providedIn: 'root'
})
export class LocaleService {
    currentLang         : string = 'fra';
    currentBabelLang    : string = 'fr';
    dateAdaptaterLocale : string = 'fr-FR';
    langs               : [] = [];

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private dateAdapter: DateAdapter<any>,
        private translate: TranslateService,
        private notify: NotificationService,
        private historyService: HistoryService
    ) {
        this.dateAdapter.setLocale('fr-FR');
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
        });
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
        });
        moment.locale(this.dateAdaptaterLocale);
    }

    changeLocale(data: any) {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        this.http.get(environment['url'] + '/ws/i18n/changeLanguage/' + data.value, {headers: this.authService.headers}).pipe(
            tap(() => {
                const label = data.source._elementRef.nativeElement.textContent;
                this.historyService.addHistory('general', 'language_changed', this.translate.instant('HISTORY-DESC.language_changed', {lang: label}));
                this.getCurrentLocale();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    getCurrentLocale() {
        this.http.get(environment['url'] + '/ws/i18n/getCurrentLang').pipe(
            tap((data: any) => {
                this.currentLang = data.lang;
                this.currentBabelLang = data.babel_lang;
                if (data.moment_lang) {
                    this.dateAdaptaterLocale = data.moment_lang;
                }
                this.dateAdapter.setLocale(this.dateAdaptaterLocale);
                this.translate.use(this.currentLang);
                moment.locale(this.dateAdaptaterLocale);
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    getLocales(){
        this.http.get(environment['url'] + '/ws/i18n/getAllLang').pipe(
            tap((data: any) => {
                this.langs = data.langs;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }
}
