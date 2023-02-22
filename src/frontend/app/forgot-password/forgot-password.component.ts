import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../services/notifications/notifications.service";
import { ConfigService } from "../../services/config.service";
import { LocaleService } from "../../services/locale.service";
import { HistoryService } from "../../services/history.service";
import { LocalStorageService } from "../../services/local-storage.service";
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
    image                   : SafeUrl = '';
    loading                 : boolean = true;
    sending                 : boolean = false;
    smtpStatus              : boolean = false;

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
        if (this.localeService.currentLang === undefined) {
            this.localeService.getCurrentLocale();
        }

        const b64Content = this.localStorageService.get('login_image_b64');
        if (!b64Content) {
            this.http.get(environment['url'] + '/ws/config/getLoginImage').pipe(
                tap((data: any) => {
                    this.localStorageService.save('login_image_b64', data);
                    this.image = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64, ' + data);
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            this.image = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64, ' + b64Content);
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
                        tap((data: any) => {
                            this.notify.success(this.translate.instant('USER.forgot_password_email_sent'));
                            this.historyService.addHistory('general', 'user_forgot_password', this.translate.instant('HISTORY-DESC.user_forgot_success', {user: data.username}), data);
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
