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
import { HttpClient, HttpHeaders } from "@angular/common/http";
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

@Component({
    selector: 'app-update',
    templateUrl: './update-user.component.html',
    styleUrls: ['./update-user.component.scss']
})

export class UpdateUserComponent implements OnInit {
    headers                     : HttpHeaders   = this.authService.headers;
    loading                     : boolean       = true;
    loadingCustomers            : boolean       = true;
    userId                      : any;
    user                        : any;
    errorMessage                : string        = '';
    roles                       : any[]         = [];
    userFields                  : any[]         = [
        {
            id: 'username',
            label: this.translate.instant('USER.username'),
            type: 'text',
            control: new FormControl(),
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
            required: false
        },
        {
            id: 'password_check',
            label: this.translate.instant('USER.password_check'),
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
            required: true
        }
    ];
    forms                       : any[]         = [];
    userForms                   : any[]         = [];
    customers                   : any[]         = [];
    userCustomers               : any[]         = [];
    disablePasswordModification : boolean       = false;
    passwordCurrentlyModified   : boolean       = false;
    passwordRules               : any           = {
        minLength: 0,
        uppercaseMandatory: false,
        specialCharMandatory: false,
        numberMandatory: false
    };

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        private historyService: HistoryService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {
    }

    ngOnInit(): void {
        this.serviceSettings.init();
        this.userId = this.route.snapshot.params['id'];

        this.http.get(environment['url'] + '/ws/auth/retrieveLoginMethodName').pipe(
            tap((data: any) => {
                data.login_methods.forEach((method: any) => {
                    if (method.enabled) {
                        if (method.method_name !== 'default') {
                            this.disablePasswordModification = true;
                        }
                    }
                });
            }),
            catchError ((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of (false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/accounts/customers/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.customers = data.customers;
                this.http.get(environment['url'] + '/ws/users/getCustomersByUserId/' + this.userId, {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        this.userCustomers = data;
                        this.loadingCustomers = false;
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
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
                this.http.get(environment['url'] + '/ws/users/getFormsByUserId/' + this.userId, {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        this.userForms = data;
                        this.loadingCustomers = false;
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/roles/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.roles.forEach((element: any) => {
                    if (element.editable) {
                        this.roles.push(element);
                    } else {
                        if ((this.userService.getUser().privileges === '*')) {
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

        this.http.get(environment['url'] + '/ws/config/getConfiguration/passwordRules', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.configuration[0] && data.configuration[0].data.value) {
                    this.passwordRules = data.configuration[0].data.value;
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/users/getById/' + this.userId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.user = data;
                for (const field in data) {
                    if (data.hasOwnProperty(field)) {
                        this.userFields.forEach(element => {
                            if (element.id === field) {
                                element.control.setValue(data[field]);
                                if (element.id === 'role') {
                                    element.values = this.roles;
                                }
                            }
                        });
                    }
                }
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
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

    checkPasswordValidity(input: any) {
        if (input.id === 'password_check' || input.id === 'password') {
            let required : boolean;
            if (input.control.value) {
                required = true;
                if (!input.control.value.match(/[A-Z]/g) && this.passwordRules.uppercaseMandatory) {
                    this.errorMessage = this.translate.instant('AUTH.password_uppercase_mandatory');
                } else if (!input.control.value.match(/[0-9]/g) && this.passwordRules.numberMandatory) {
                    this.errorMessage = this.translate.instant('AUTH.password_number_mandatory');
                } else if (!input.control.value.match(/[^A-Za-z0-9]/g) && this.passwordRules.specialCharMandatory) {
                    this.errorMessage = this.translate.instant('AUTH.password_special_char_mandatory');
                } else if (input.control.value.length < this.passwordRules.minLength && this.passwordRules.minLength !== 0) {
                    this.errorMessage = this.translate.instant('AUTH.password_min_length', {"min": this.passwordRules.minLength});
                } else {
                    this.errorMessage = '';
                    this.userFields.forEach(element => {
                        if (element.id === 'password' && element.control.value !== input.control.value) {
                            this.errorMessage = this.translate.instant('USER.password_mismatch');
                        }
                    });
                    if (this.errorMessage === '') {
                        input.control.setErrors(null);
                    }
                }
            } else {
                required = false;
                this.errorMessage = '';
                input.control.setErrors(null);
            }
            this.userFields.forEach(element => {
                if (element.id === 'password_check' || element.id === 'password') {
                    this.passwordCurrentlyModified = required;
                    element.required = required;
                }
            });
        }
    }

    onSubmit() {
        if (this.isValidForm()) {
            const user: any = {};
            this.userFields.forEach(element => {
                user[element.id] = element.control.value;
            });

            this.http.put(environment['url'] + '/ws/users/update/' + this.userId, {'args': user}, {headers: this.authService.headers},
            ).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('USER.updated'));
                    const _user = user['lastname'] + ' ' + user['firstname'];
                    this.historyService.addHistory('general', 'update_user', this.translate.instant('HISTORY-DESC.update-user', {user: _user}));
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
                if (this.errorMessage !== '' && field === 'password_check') {
                    element.control.setErrors({});
                    error = this.errorMessage;
                }
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }

    hasCustomer(customerId: any) {
        for (const _customerId of this.userCustomers) {
            if (_customerId === customerId) {
                return true;
            }
        }
        return false;
    }

    hasForm(formId: any) {
        for (const _formId of this.userForms) {
            if (_formId === formId) {
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

        if (!found)
            this.userCustomers.push(customerId);
        else
            this.userCustomers.splice(cpt, 1);

        this.http.put(environment['url'] + '/ws/users/customers/update/' + this.userId, {'customers': this.userCustomers}, {headers: this.authService.headers},
        ).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('USER.customers_updated'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err, '/settings/general/users/');
                return of(false);
            })
        ).subscribe();
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

        this.http.put(environment['url'] + '/ws/users/forms/update/' + this.userId, {'forms': this.userForms}, {headers: this.authService.headers},
        ).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('USER.form_updated'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err, '/settings/general/users/');
                return of(false);
            })
        ).subscribe();
    }
}
