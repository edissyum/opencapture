import { Component, OnInit } from '@angular/core';
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../services/notifications/notifications.service";
import {ConfigService} from "../../services/config.service";
import {LocaleService} from "../../services/locale.service";
import {HistoryService} from "../../services/history.service";
import {LocalStorageService} from "../../services/local-storage.service";
import {environment} from "../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
    emailControl            : FormControl = new FormControl('', [Validators.required, Validators.email, Validators.minLength(5)]);
    loginImage              : SafeUrl = '';
    loading                 : boolean = true;
    processLogin            : boolean = false;
    showPassword            : boolean = false;
    smtpStatus              : boolean = false;
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
        if (this.localeService.currentLang === undefined) {
            this.localeService.getCurrentLocale();
        }

        this.http.get(environment['url'] + '/ws/config/getLoginImage').pipe(
            tap((data: any) => {
                this.localStorageService.save('login_image_b64', data);
                this.loginImage = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64, ' + data);
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/smtp/isServerUp').pipe(
            tap((data: any) => {
                this.smtpStatus = data.status;
            }),
            finalize(() => {this.loading = false}),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    onSubmit() {
    }
}
