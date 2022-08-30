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

import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { TranslateService } from "@ngx-translate/core";
import { environment } from "../env";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "../../services/notifications/notifications.service";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { ConfigService } from "../../services/config.service";
import { LocaleService } from "../../services/locale.service";
import { UserService } from "../../services/user.service";
import { HistoryService } from "../../services/history.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import {LocalStorageService} from "../../services/local-storage.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm               : any;
    enableLoginMethodName   : any;
    loginImage              : SafeUrl = '';
    loading                 : boolean = true;
    processLogin            : boolean = false;
    showPassword            : boolean = false;
    isConnectionBtnDisabled : boolean = true;
    subtitle                : string  = '';

    constructor(
        private router: Router,
        private http: HttpClient,
        private sanitizer: DomSanitizer,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private userService: UserService,
        private translate: TranslateService,
        private notify: NotificationService,
        private configService: ConfigService,
        private localeService: LocaleService,
        private historyService: HistoryService,
        private localStorageService: LocalStorageService
    ) {}

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            username: [null, Validators.required],
            password: [null, Validators.required]
        });

        if (this.localeService.currentLang === undefined) {
            this.localeService.getCurrentLocale();
        }

        this.http.get(environment['url'] + '/ws/config/getLoginImage').pipe(
            tap((data: any) => {
                this.localStorageService.save('login_image_b64', data);
                this.loginImage = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64, ' + data);
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/config/getConfiguration/loginMessage', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.configuration.length === 1) {
                    this.subtitle = data.configuration[0].data.value;
                }
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/auth/getEnabledLoginMethod', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                const login_method_name = data['login_method_name'][0];
                this.enableLoginMethodName = login_method_name['method_name'];
                this.isConnectionBtnDisabled = false;
            }),
            catchError((err: any) => {
                this.isConnectionBtnDisabled = true;
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    onSubmit() {
        const password = this.loginForm.get('password').value;
        const username = this.loginForm.get('username').value;
        if (password && username) {
            this.processLogin = true;
            this.http.post(
                environment['url'] + '/ws/auth/login',
                {
                    'username': username,
                    'password': password,
                    'lang': this.localeService.currentBabelLang
                },
                {
                    observe: 'response'
                },
            ).pipe(
                tap((data: any) => {
                    this.userService.setUser(data.body.user);
                    this.authService.setTokens(data.body.auth_token, btoa(JSON.stringify(this.userService.getUser())), data.body.minutes_before_exp);
                    this.localStorageService.save('task_watcher_minimize_display', 'true');
                    this.authService.generateHeaders();
                    this.notify.success(this.translate.instant('AUTH.authenticated'));
                    this.configService.readConfig().then(() => {
                        this.historyService.addHistory('general', 'login', this.translate.instant('HISTORY-DESC.login'));
                        if (this.authService.getCachedUrl()) {
                            this.router.navigate([this.authService.getCachedUrl()]).then();
                            this.authService.cleanCachedUrl();
                        } else {
                            this.router.navigate(['/home']).then();
                        }
                    });
                }),
                catchError((err: any) => {
                    this.processLogin = false;
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessage(field: any) {
        if (this.loginForm.get(field).hasError('required'))
            return this.translate.instant('AUTH.field_required');
        return this.translate.instant('ERROR.unknow_error');
    }
}
