import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {PrivilegesService} from "../../../../../services/privileges.service";

@Component({
    selector: 'app-update',
    templateUrl: './update-user.component.html',
    styleUrls: ['./update-user.component.scss']
})

export class UpdateUserComponent implements OnInit {
    headers: HttpHeaders = this.authService.headers;
    loading: boolean = true;
    userId: any;
    user: any;
    roles: any[] = [];
    userForm: any[] = [
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
    customers: any[] = [];
    usersCustomers: any[] = [];

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {
    }

    ngOnInit(): void {
        this.serviceSettings.init()
        this.userId = this.route.snapshot.params['id'];

        this.http.get(API_URL + '/ws/accounts/customers/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.customers = data.customers;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()

        this.http.get(API_URL + '/ws/users/getCustomersByUserId/' + this.userId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                console.log(data)
                this.usersCustomers = data
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()

        this.http.get(API_URL + '/ws/roles/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.roles.forEach((element: any) => {
                    if (element.editable) {
                        this.roles.push(element)
                    } else {
                        if ((this.userService.getUser().privileges == '*')) {
                            this.roles.push(element)
                        }
                    }
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()

        this.http.get(API_URL + '/ws/users/getById/' + this.userId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.user = data;
                for (let field in data) {
                    if (data.hasOwnProperty(field)) {
                        this.userForm.forEach(element => {
                            if (element.id == field) {
                                element.control.setValue(data[field]);
                                if (element.id == 'role') {
                                    element.values = this.roles
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

    onSubmit() {
        if (this.isValidForm()) {
            const user: any = {};
            this.userForm.forEach(element => {
                user[element.id] = element.control.value;
            });

            this.http.put(API_URL + '/ws/users/update/' + this.userId, {'args': user}, {headers: this.authService.headers},
            ).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('USER.updated'))
                    this.router.navigate(['/settings/general/users/'])
                }),
                catchError((err: any) => {
                    console.debug(err)
                    this.notify.handleErrors(err, '/settings/general/users/');
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessage(field: any) {
        let error = undefined;
        this.userForm.forEach(element => {
            if (element.id == field) {
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        })
        return error
    }

    hasCustomer(customerId: any){
        for (let customer_id of this.usersCustomers){
            if(customer_id == customerId){
                return true;
            }
        }
        return false
    }

    updateUsersCustomers(customerId: any){
        let found = false
        let cpt = 0;
        for (let customer_id of this.usersCustomers) {
            if(customer_id == customerId){
                found = true;
                break
            }
            cpt = cpt + 1
        }
        if (!found){
            this.usersCustomers.push(customerId)
        }else{
            this.usersCustomers.splice(cpt, 1)
        }

        this.http.put(API_URL + '/ws/users/customers/update/' + this.userId, {'customers': this.usersCustomers}, {headers: this.authService.headers},
        ).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('USER.customers_updated'))
            }),
            catchError((err: any) => {
                console.debug(err)
                this.notify.handleErrors(err, '/settings/general/users/');
                return of(false);
            })
        ).subscribe();
    }
}
