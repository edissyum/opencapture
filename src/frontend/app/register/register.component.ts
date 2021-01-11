import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {LocaleService} from "../../services/locale.service";
import {TranslateService} from "@ngx-translate/core";
import {API_URL} from "../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../services/auth.service";
import {NotificationService} from "../../services/notifications/notifications.service";
import {ConfigService} from "../../services/config.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    registerForm: any;

    constructor(
        private router: Router,
        private http: HttpClient,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private notify: NotificationService,
        private translate: TranslateService,
        private configService: ConfigService,
        private localeService: LocaleService,
    ) {
    }

    ngOnInit(): void {
        this.registerForm = this.formBuilder.group({
            username: [null, Validators.required],
            password: [null, Validators.required],
            firstname: [null, Validators.required],
            lastname: [null, Validators.required]
        });
        this.localeService.getCurrentLocale()
    }

    onSubmit() {
        let password = this.registerForm.get('password').value
        let username = this.registerForm.get('username').value
        let firstname = this.registerForm.get('firstname').value
        let lastname = this.registerForm.get('lastname').value
        if (password && username){
            this.http.post(
                API_URL + '/ws/register',
                {
                    'username': username,
                    'password': password,
                    'firstname': firstname,
                    'lastname': lastname,
                    'lang': this.localeService.currentLang
                },
                {
                    observe: 'response'
                },
            ).pipe(
                tap((data: any) => {
                    this.notify.success(this.translate.instant('AUTH.registered'))
                    this.router.navigate(['/login'])
                }),
                catchError((err: any) => {
                    console.debug(err)
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessage(field: any) {
        if (this.registerForm.get(field).hasError('required')) {
            return this.translate.instant('AUTH.field_required')
        }
        return this.translate.instant('GLOBAL.unknow_error')
    }

}
