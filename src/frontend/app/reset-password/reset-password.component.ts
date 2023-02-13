import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
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
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    passwordControl         : FormControl = new FormControl('', [Validators.minLength(7)]);
    passwordConfirmControl  : FormControl = new FormControl('', [Validators.minLength(7)]);
    image                   : SafeUrl = '';
    resetToken              : string  = '';
    loading                 : boolean = true;
    minLengthValid          : boolean = true;
    mismatch                : boolean = false;
    showPassword            : boolean = false;
    showPasswordConfirm     : boolean = false;

    constructor(
        private router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
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
        this.resetToken = this.route.snapshot.queryParams['reset_token'];
        if (!this.resetToken) {
            this.translate.get('AUTH.token_not_provided').subscribe((translated: string) => {
                this.notify.error(this.translate.instant(translated));
            });
        }
        const b64Content = this.localStorageService.get('login_image_b64');
        if (!b64Content) {
            this.http.get(environment['url'] + '/ws/config/getLoginImage').pipe(
                tap((data: any) => {
                    this.localStorageService.save('login_image_b64', data);
                    this.image = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64, ' + data);
                }),
                finalize(() => this.loading = false),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            this.image = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64, ' + b64Content);
            this.loading = false;
        }
        this.passwordConfirmControl.valueChanges.subscribe((value: any) => {
            if (value) {
                this.mismatch = (value !== this.passwordControl.value);
                this.minLengthValid = (value.length >= 7);
            }
        });
    }

    onSubmit() {
        const passwordConfirm = this.passwordConfirmControl.value;
        this.http.put(environment['url'] + '/ws/users/resetPassword', {resetToken: this.resetToken, newPassword: passwordConfirm}).pipe(
            tap((data: any) => {
                this.notify.success(this.translate.instant('USER.password_reset_success'));
                this.historyService.addHistory('general', 'user_reset_password', this.translate.instant('HISTORY-DESC.user_reset_password_success', {user: data.username}), data);
                this.authService.logout();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }
}
