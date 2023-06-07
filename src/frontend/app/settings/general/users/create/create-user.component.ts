/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { AuthService } from "../../../../../services/auth.service";
import { UserService } from "../../../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { environment } from  "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { HistoryService } from "../../../../../services/history.service";
import {PasswordVerificationService} from "../../../../../services/password-verification.service";

@Component({
    selector: 'app-create-user',
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
    loading          : boolean   = true;
    loadingCustomers : boolean   = true;
    showPassword     : boolean   = false;
    roles            : any[]     = [];
    userFields       : any[]     = [
        {
            id: 'username',
            label: this.translate.instant('USER.username'),
            type: 'text',
            control: new FormControl('', Validators.maxLength(50)),
            required: true,
        },
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
            id: 'email',
            label: this.translate.instant('USER.email'),
            type: 'text',
            control: new FormControl('', Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")),
            required: false
        },
        {
            id: 'password',
            label: this.translate.instant('USER.password'),
            type: 'password',
            control: new FormControl(),
            required: true
        },
        {
            id: 'password_check',
            label: this.translate.instant('USER.password_check'),
            type: 'password',
            control: new FormControl(),
            required: true
        },
        {
            id: 'role',
            label: this.translate.instant('HEADER.role'),
            type: 'select',
            values: [],
            control: new FormControl(),
            required: true
        }
    ];
    forms            : any[]     = [];
    userForms        : any[]     = [];
    customers        : any[]     = [];
    userCustomers    : any[]     = [];
    errorMessage     : string    = '';

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private notify: NotificationService,
        private translate: TranslateService,
        private historyService: HistoryService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
        private passwordVerification: PasswordVerificationService
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.userService.user   = this.userService.getUserFromLocal();

        this.http.get(environment['url'] + '/ws/accounts/customers/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.customers = data.customers;
                this.loadingCustomers = false;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/forms/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.forms = data.forms;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/roles/list/user/' + this.userService.user.id, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.roles.forEach((element: any) => {
                    if (element.editable) {
                        this.roles.push(element);
                    }
                });
                this.userFields.forEach(element => {
                    if (element.id === 'role') {
                        element.values = this.roles;
                    }
                });
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.userFields.forEach((element: any) => {
            if (element.id === 'password_check' || element.id === 'password') {
                element.control.valueChanges.subscribe((value: any) => {
                    if (value) {
                        this.passwordVerification.checkPasswordValidity(this.userFields);
                    }
                });
            }
        });
    }

    hasCustomer(customerId: any) {
        for (const _customerId of this.userCustomers) {
            if (_customerId === customerId) {
                return true;
            }
        }
        return false;
    }

    updateUserCustomers(customerId: any) {
        let found = false;
        let cpt = 0;
        for (const _customerId of this.userCustomers) {
            if (_customerId === customerId) {
                found = true;
                break;
            }
            cpt = cpt + 1;
        }
        if (!found) {
            this.userCustomers.push(customerId);
        } else {
            this.userCustomers.splice(cpt, 1);
        }
    }

    hasForm(formId: any) {
        for (const _formId of this.userForms) {
            if (_formId === formId) {
                return true;
            }
        }
        return false;
    }

    updateUserForms(formId: any) {
        let found = false;
        let cpt = 0;
        for (const _formId of this.userForms) {
            if (_formId === formId) {
                found = true;
                break;
            }
            cpt = cpt + 1;
        }
        if (!found)
            this.userForms.push(formId);
        else
            this.userForms.splice(cpt, 1);
    }

    isValidForm() {
        let state = true;
        this.userFields.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }

    onSubmit() {
        if (this.isValidForm()) {
            const user : any = {};
            this.userFields.forEach(element => {
                user[element.id] = element.control.value;
            });

            user['customers'] = this.userCustomers;
            user['forms']     = this.userForms;
            this.http.post(environment['url'] + '/ws/users/new', user, {headers: this.authService.headers},
            ).pipe(
                tap(() => {
                    const _user = user['lastname'] + ' ' + user['firstname'];
                    this.historyService.addHistory('general', 'create_user', this.translate.instant('HISTORY-DESC.create-user', {user: _user}));
                    this.notify.success(this.translate.instant('USER.created'));
                    this.router.navigate(['/settings/general/users/']).then();
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
        this.userFields.forEach(element => {
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
