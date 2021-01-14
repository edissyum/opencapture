import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {FormBuilder, FormControl} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {LocaleService} from "../../services/locale.service";
import {API_URL} from "../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {NotificationService} from "../../services/notifications/notifications.service";
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    userId      : any;
    user        : any;
    currentUser : any;

    profileForm : any[] = [
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
            id: 'old_password',
            label: marker('USER.old_password'),
            type: 'password',
            control: new FormControl(),
            required: false
        },
        {
            id: 'new_password',
            label: marker('USER.new_password'),
            type: 'password',
            control: new FormControl(),
            required: false
        }
    ]
    public loading: boolean = true;

    constructor(
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private userService: UserService,
        private translate: TranslateService,
        private notify: NotificationService,
        private localeService: LocaleService
    ) {
    }

    ngOnInit(){
        this.userId = this.route.snapshot.params['id']
        this.currentUser = this.userService.getUserFromLocal()

        let headers = this.authService.headers
        this.user = this.http.get(API_URL + '/ws/getUserById/' + this.userId, {headers}).pipe(
            tap((data: any) => {
                this.user = data
                for (let field in this.user){
                    if (this.user.hasOwnProperty(field)){
                        this.profileForm.forEach(element => {
                            if (element.id == field){
                                element.control.value = this.user[field]
                            }
                        });
                    }
                }
            }),
            finalize(() => this.loading = false ),
            catchError((err: any) => {
                console.debug(err)
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    isValidForm() {
        let state = true;

        this.profileForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });

        return state;
    }


    onSubmit(){
        if(this.isValidForm()){
            const user : any = {}
            let headers = this.authService.headers

            this.profileForm.forEach(element => {
                user[element.id] = element.control.value
            });
            this.http.put(
                API_URL + '/ws/updateUser/' + this.userId,
                {
                    'args': user,
                    'lang': this.localeService.currentLang
                },
                {
                    headers
                },
            ).pipe(
                tap((data: any) => {
                    this.notify.success(this.translate.instant('USER.profile_updated'))
                    if (this.userId == this.currentUser.id){
                        this.authService.setUser(data.user)
                        this.authService.setTokenAuth(btoa(JSON.stringify(this.authService.getUser())), data.days_before_exp);
                    }
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
        let error = ''
        this.profileForm.forEach(element => {
            if(element.id == field)
                if (element.required){
                    error = this.translate.instant('AUTH.field_required')
                }
        })
        return error
    }
}
