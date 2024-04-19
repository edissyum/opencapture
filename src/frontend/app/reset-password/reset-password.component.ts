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

import {Component, OnInit, SecurityContext} from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../services/notifications/notifications.service";
import { LocaleService } from "../../services/locale.service";
import { SessionStorageService } from "../../services/session-storage.service";
import { environment } from "../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { PasswordVerificationService } from "../../services/password-verification.service";

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    loading                 : boolean = true;
    showPassword            : boolean = false;
    image                   : any     = '';
    resetToken              : string  = '';
    passwordForm            : any[]   = [
        {
            id: 'password',
            label: this.translate.instant('USER.password'),
            type: 'password',
            control: new FormControl()
        },
        {
            id: 'password_check',
            label: this.translate.instant('USER.password_check'),
            type: 'password',
            control: new FormControl()
        }
    ];

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        private localeService: LocaleService,
        private sessionStorageService: SessionStorageService,
        public passwordVerification: PasswordVerificationService
    ) {}

    ngOnInit(): void {
        if (this.localeService.currentLang === undefined) {
            this.localeService.getCurrentLocale();
        }
        this.resetToken = this.route.snapshot.queryParams['reset_token'];
        if (!this.resetToken) {
            this.translate.get('AUTH.token_not_provided').subscribe((translated: string) => {
                this.notify.error(this.translate.instant(translated));
                this.authService.logout();
            });
        }
        const b64Content = this.sessionStorageService.get('loginImageB64');
        if (!b64Content) {
            this.http.get(environment['url'] + '/ws/config/getLoginImage').pipe(
                tap((data: any) => {
                    this.sessionStorageService.save('loginImageB64', data);
                    this.image = this.sanitizer.sanitize(SecurityContext.URL, 'data:image/png;base64, ' + data);
                }),
                finalize(() => { this.loading = false; }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            this.image = this.sanitizer.sanitize(SecurityContext.URL, 'data:image/png;base64, ' + b64Content);
            this.loading = false;
        }

        this.passwordForm.forEach((element: any) => {
            element.control.valueChanges.subscribe((value: any) => {
                if (value) {
                    this.passwordVerification.checkPasswordValidity(this.passwordForm);
                }
            });
        });
    }

    onSubmit() {
        const passwordConfirm = this.passwordForm.filter((element: any) => element.id === 'password_check')[0].control.value;
        this.http.put(environment['url'] + '/ws/users/resetPassword', {resetToken: this.resetToken, newPassword: passwordConfirm}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('USER.password_reset_success'));
                this.authService.logout();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    getErrorMessage(field: any) {
        let error: any;
        this.passwordForm.forEach(element => {
            if (element.id === field) {
                if (element.control.errors && element.control.errors.message) {
                    error = element.control.errors.message;
                }
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }
}
