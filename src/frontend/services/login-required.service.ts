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
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import { NotificationService } from "./notifications/notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { UserService } from "./user.service";
import { environment } from "../app/env";
import {catchError, finalize, tap} from "rxjs/operators";
import { of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { LocaleService } from "./locale.service";
import { ConfigService } from "./config.service";
import { HistoryService } from "./history.service";
import {LastUrlService} from "./last-url.service";
import {LocalStorageService} from "./local-storage.service";

@Injectable({
    providedIn: 'root'
})
export class LoginRequiredService implements CanActivate {

    constructor(
        public router: Router,
        private http:HttpClient,
        private authService: AuthService,
        private userService: UserService,
        private notify: NotificationService,
        private translate: TranslateService,
        private configService: ConfigService,
        private localeService: LocaleService,
        private historyService: HistoryService,
        private routerExtService: LastUrlService,
        private localStorage: LocalStorageService
    ) {}

    login(token: string, route: any) {
        if ((this.userService.getUser() === undefined || Object.keys(this.userService.getUser()).length === 0) && this.userService.getUserFromLocal() === undefined) {
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
                    this.authService.setTokens(data.body.auth_token, btoa(JSON.stringify(this.userService.getUser())));
                    if (!this.authService.headersExists) {
                        this.authService.generateHeaders();
                    }
                    this.notify.success(this.translate.instant('AUTH.authenticated'));
                    this.configService.readConfig().then(() => {
                        this.historyService.addHistory('general', 'login', this.translate.instant('HISTORY-DESC.login_with_token'));
                        if (route) {
                            this.localStorage.save('task_watcher_minimize_display', 'true');
                            this.router.navigate([route]).then();
                        }
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
    }

    canActivate(): boolean {
        const token = this.authService.getToken();
        let route = '';
        if (!token) {
            const params = new URLSearchParams(window.location.href);
            let token_param = '';
            for (const [key, value] of params.entries()) {
                if (key === 'token') {
                    token_param = value;
                    route = window.location.hash.replace('#', '').replace(/\?.*/,'')
                    this.login(token_param, route);
                }
            }
        }
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
        this.login(token, null);
        return true;
    }
}
