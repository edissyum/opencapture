/** This file is part of Open-Capture for Invoices.

Open-Capture for Invoices is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Open-Capture is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

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
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {NotificationService} from "../../services/notifications/notifications.service";
import {PrivilegesService} from "../../services/privileges.service";
import {HistoryService} from "../../services/history.service";

@Component({
    selector: 'app-user-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    headers     : HttpHeaders = this.authService.headers;
    userId      : any;
    profile     : any;
    roles       : any[] = [];
    profileForm : any[] = [
        {
            id: 'firstname',
            label: this.translate.instant('USER.firstname'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'lastname',
            label: this.translate.instant('USER.lastname'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'old_password',
            label: this.translate.instant('USER.old_password'),
            type: 'password',
            control: new FormControl(),
            required: false
        },
        {
            id: 'new_password',
            label: this.translate.instant('USER.new_password'),
            type: 'password',
            control: new FormControl(),
            required: false
        },
        {
            id: 'role',
            label: this.translate.instant('HEADER.role'),
            type: 'select',
            values: [],
            control: new FormControl(),
            required: false
        }
    ];
    public loading: boolean = true;

    constructor(
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        private translate: TranslateService,
        private notify: NotificationService,
        private localeService: LocaleService,
        private historyService: HistoryService,
        private privilegeService: PrivilegesService
    ) {
    }

    ngOnInit() {
        this.userId = this.route.snapshot.params['id'];

        if (this.userId !== this.userService.user.id) {
            if (!this.privilegeService.hasPrivilege('update_user')) {
                this.notify.error('ERROR.unauthorized');
                this.router.navigateByUrl('/home').then();
            }
        }

        this.http.get(API_URL + '/ws/roles/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.roles.forEach((element: any) => {
                    if (element.editable) {
                        this.roles.push(element);
                    }else{
                        if((this.userService.getUser().privileges === '*')) {
                            this.roles.push(element);
                        }
                    }
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(API_URL + '/ws/users/getById/' + this.userId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.profile = data;
                for (const field in this.profile) {
                    if (this.profile.hasOwnProperty(field)) {
                        this.profileForm.forEach(element => {
                            if (element.id === field) {
                                element.control.value = this.profile[field];
                                if (element.id === 'role') {
                                    element.values = this.roles;
                                }
                            }
                        });
                    }
                }
            }),
            finalize(() => this.loading = false ),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
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

    onSubmit() {
        if(this.isValidForm()) {
            const user : any = {};
            this.profileForm.forEach(element => {
                user[element.id] = element.control.value;
            });

            this.http.put(
                API_URL + '/ws/users/update/' + this.userId,{'args': user}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    this.historyService.addHistory('general', 'profile_updated', this.translate.instant('HISTORY-DESC.profile-updated', {user: user['lastname'] + ' ' + user['firstname']}));
                    this.notify.success(this.translate.instant('USER.profile_updated'));
                    if (this.userId === this.userService.user.id) {
                        this.userService.setUser(data.user);
                        this.authService.setTokenAuth(btoa(JSON.stringify(this.userService.getUser())), data.days_before_exp);
                    }
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessage(field: any) {
        let error: any;
        this.profileForm.forEach(element => {
            if(element.id === field) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }
}
