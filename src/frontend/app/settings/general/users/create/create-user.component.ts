/** This file is part of Open-Capture for Invoices.

 Open-Capture for Invoices is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormControl } from "@angular/forms";
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
    selector: 'app-create-user',
    templateUrl: './create-user.component.html',
    styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
    loading         : boolean   = true;
    loadingCustomers: boolean   = true;
    roles           : any[]     = [];
    userForm        : any[]     = [
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
    customers       : any[]     = [];
    usersCustomers  : any[]     = [];

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
        public privilegesService: PrivilegesService
    ) {
    }

    ngOnInit(): void {
        this.serviceSettings.init();

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

        this.http.get(environment['url'] + '/ws/roles/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.roles.forEach((element: any) => {
                    if (element.editable) {
                        this.roles.push(element);
                    }
                });
                this.userForm.forEach(element => {
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
    }

    hasCustomer(customerId: any) {
        for (const _customerId of this.usersCustomers) {
            if (_customerId === customerId) {
                return true;
            }
        }
        return false;
    }

    updateUsersCustomers(customerId: any) {
        let found = false;
        let cpt = 0;
        for (const _customerId of this.usersCustomers) {
            if (_customerId === customerId) {
                found = true;
                break;
            }
            cpt = cpt + 1;
        }
        if (!found) {
            this.usersCustomers.push(customerId);
        } else {
            this.usersCustomers.splice(cpt, 1);
        }
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

            if (user['password'] !== user['password_check']) {
                this.notify.handleErrors('USER.password_mismatch');
                return of(false);
            }
            user['customers'] = this.usersCustomers;
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
        this.userForm.forEach(element => {
            if (element.id === field)
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
        });
        return error;
    }
}
