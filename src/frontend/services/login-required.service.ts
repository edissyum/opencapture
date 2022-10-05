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

import { Injectable } from '@angular/core';
import { AuthService } from "./auth.service";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { NotificationService } from "./notifications/notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { UserService } from "./user.service";
import { environment } from "../app/env";
import { catchError, tap } from "rxjs/operators";
import { of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { LocaleService } from "./locale.service";
import { ConfigService } from "./config.service";
import { HistoryService } from "./history.service";
import {LastUrlService} from "./last-url.service";

@Injectable({
    providedIn: 'root'
})
export class LoginRequiredService implements CanActivate {

    constructor(
        private http:HttpClient,
        private authService: AuthService,
        private userService: UserService,
        private notify: NotificationService,
        private translate: TranslateService,
        private configService: ConfigService,
        private localeService: LocaleService,
        private historyService: HistoryService,
        private routerExtService: LastUrlService,
    ) {}

    canActivate(): boolean {
        const token = this.authService.getToken();
        if (!token) {
            this.translate.get('AUTH.not_connected').subscribe((translated: string) => {
                const currentUrl = this.routerExtService.getCurrentUrl();
                if (currentUrl !== '/logout' && currentUrl !== '/login' && currentUrl !== '/500') {
                    this.authService.setCachedUrl(currentUrl.replace(/^\//g, ''));
                }
                this.notify.error(translated);
                this.authService.logout();
            });
            return false;
        }
        if (this.userService.getUser() === undefined && this.userService.getUserFromLocal() === undefined) {
            this.http.post(
                environment['url'] + '/ws/auth/login',
                {
                    'token': token,
                    'lang': this.localeService.currentBabelLang
                },
                {
                    observe: 'response'
                },
            ).pipe(
                tap((data: any) => {
                    this.userService.setUser(data.body.user);
                    this.authService.setTokens(data.body.auth_token, btoa(JSON.stringify(this.userService.getUser())), data.body.minutes_before_exp);
                    if (!this.authService.headersExists) {
                        this.authService.generateHeaders();
                    }
                    this.notify.success(this.translate.instant('AUTH.authenticated'));
                    this.configService.readConfig().then(() => {
                        this.historyService.addHistory('general', 'login', this.translate.instant('HISTORY-DESC.login_with_token'));
                    });
                }),
                catchError((err: any) => {
                    if (err.status !== 402) { // Specific case for simple SSO
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    }
                    return of(true);
                })
            ).subscribe();
        }
        return true;
    }
}
