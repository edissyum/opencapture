import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {AuthService} from "../../../../services/auth.service";
import {UserService} from "../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../services/settings.service";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
import {API_URL} from "../../../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";

@Component({
    selector: 'app-create-user',
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
    headers     : HttpHeaders = this.authService.headers;
    roles       : any[] = [];
    userForm    : any[] = [
        {
            id: 'username',
            label: marker('USER.username'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'firstname',
            label: marker('USER.firstname'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'lastname',
            label: marker('USER.lastname'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'password',
            label: marker('USER.password'),
            type: 'password',
            control: new FormControl(),
            required: true
        },
        {
            id: 'password_check',
            label: marker('USER.password_check'),
            type: 'password',
            control: new FormControl(),
            required: true
        },
        {
            id: 'role',
            label: marker('USER.role'),
            type: 'select',
            values: [],
            control: new FormControl(),
            required: true
        }
    ];

    constructor(
        private http: HttpClient,
        public router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        private translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
    ) {
    }

    ngOnInit(): void {
        this.http.get(API_URL + '/ws/roles/list', {headers: this.headers}).pipe(
            tap((data: any) => {
                data.roles.forEach((element: any) => {
                    if (element.editable){
                        this.roles.push(element)
                    }
                });
                this.userForm.forEach(element => {
                    if (element.id == 'role'){
                        element.values = this.roles
                    }
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    isValidForm() {
        let state = true;

        this.userForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });

        return state;
    }

    // @ts-ignore
    onSubmit() {
        if (this.isValidForm()) {
            const user : any = {};
            this.userForm.forEach(element => {
                user[element.id] = element.control.value;
            });

            if (user['password'] !== user['password_check']){
                this.notify.handleErrors('USER.password_mismatch');
                return of(false);
            }

            this.http.post(API_URL + '/ws/users/new', user, {headers: this.headers},
            ).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('USER.created'))
                    this.router.navigate(['/settings/general/users/'])
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
        let error = undefined;
        this.userForm.forEach(element => {
            if(element.id == field)
                if (element.required){
                    error = this.translate.instant('AUTH.field_required');
                }
        })
        return error
    }
}
