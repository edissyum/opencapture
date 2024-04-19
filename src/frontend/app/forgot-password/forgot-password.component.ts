import {Component, OnInit, SecurityContext} from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { FormControl, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../services/notifications/notifications.service";
import { LocaleService } from "../../services/locale.service";
import { SessionStorageService } from "../../services/session-storage.service";
import { environment } from "../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
    emailControl            : FormControl = new FormControl('', [Validators.required, Validators.email, Validators.minLength(5)]);
    image                   : any         = '';
    loading                 : boolean     = true;
    sending                 : boolean     = false;
    smtpStatus              : boolean     = false;

    constructor(
        private http: HttpClient,
        private sanitizer: DomSanitizer,
        private translate: TranslateService,
        private notify: NotificationService,
        private localeService: LocaleService,
        private sessionStorageService: SessionStorageService
    ) {}

    ngOnInit(): void {
        if (this.localeService.currentLang === undefined) {
            this.localeService.getCurrentLocale();
        }

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

        this.http.get(environment['url'] + '/ws/smtp/isServerUp').pipe(
            tap((data: any) => {
                this.smtpStatus = data.status;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    onSubmit() {
        if (this.emailControl.valid) {
            this.sending = true;
            const email = this.emailControl.value;
            const currentUrl = window.location.href.replace('/forgotPassword', '');
            this.http.post(environment['url'] + '/ws/users/getByMail', {email: email}).pipe(
                tap((data: any) => {
                    this.http.post(environment['url'] + '/ws/users/sendEmailForgotPassword', {userId: data.id, currentUrl: currentUrl}).pipe(
                        tap(() => {
                            this.notify.success(this.translate.instant('USER.forgot_password_email_sent'));
                        }),
                        finalize(() => this.sending = false),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                }),
                catchError((err: any) => {
                    this.sending = false;
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }
}
