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
            id: 'username',
            label: 'AUTH.username',
            type: 'string',
            control: new FormControl(),
            required: true
        },
        {
            id: 'firstname',
            label: 'AUTH.firstname',
            type: 'string',
            control: new FormControl(),
            required: true
        },
        {
            id: 'lastname',
            label: 'AUTH.lastname',
            type: 'string',
            control: new FormControl(),
            required: true
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
        private notify: NotificationService
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

    onSubmit(){

    }

    getErrorMessage(field: any) {
        // if(this.profileForm.get(field).hasError('required')){
        //     return this.translate.instant('AUTH.field_required')
        // }
        // return this.translate.instant('GLOBAL.unknow_error')
    }
}
