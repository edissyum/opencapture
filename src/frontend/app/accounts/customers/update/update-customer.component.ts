import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
import {FormBuilder, FormControl} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../services/user.service";
import {AuthService} from "../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../services/settings.service";
import {PrivilegesService} from "../../../../services/privileges.service";
import {API_URL} from "../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";

@Component({
    selector: 'app-update',
    templateUrl: './update-customer.component.html',
    styleUrls: ['./update-customer.component.scss']
})
export class UpdateCustomerComponent implements OnInit {

    headers: HttpHeaders = this.authService.headers;
    loading: boolean = true;
    customerId: any;
    addressId: any;
    customer: any;
    customerForm: any[] = [
        {
            id: 'name',
            label: marker('ACCOUNTS.supplier_name'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'vat_number',
            label: marker('ACCOUNTS.vat_number'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'siret',
            label: marker('ACCOUNTS.siret'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'siren',
            label: marker('ACCOUNTS.siren'),
            type: 'text',
            control: new FormControl(),
            required: false
        },
        {
            id: 'company_number',
            label: marker('ACCOUNTS.company_number'),
            type: 'text',
            control: new FormControl(),
            required: false
        },
    ];
    addressForm: any [] = [
        {
            id: 'address1',
            label: marker('ADDRESSES.address_1'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'address2',
            label: marker('ADDRESSES.address_2'),
            type: 'text',
            control: new FormControl(),
            required: false,
        },
        {
            id: 'postal_code',
            label: marker('ADDRESSES.postal_code'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'city',
            label: marker('ADDRESSES.city'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'country',
            label: marker('ADDRESSES.country'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
    ]

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
    ) { }

    ngOnInit(): void {
        this.customerId = this.route.snapshot.params['id'];
        this.http.get(API_URL + '/ws/accounts/customers/getById/' + this.customerId, {headers: this.authService.headers}).pipe(
            tap((customer: any) => {
                console.log(customer)
                this.customer = customer;
                for (let field in this.customer) {
                    if (customer.hasOwnProperty(field)) {
                        this.customerForm.forEach(element => {
                            if (element.id == field) {
                                element.control.setValue(this.customer[field]);
                            }else if (field == 'address_id'){
                                this.addressId = this.customer[field]
                                if (this.addressId) {
                                    this.http.get(API_URL + '/ws/accounts/getAdressById/' + this.addressId, {headers: this.authService.headers}).pipe(
                                        tap((address: any) => {
                                            for (let field in address) {
                                                if (address.hasOwnProperty(field)) {
                                                    this.addressForm.forEach(element => {
                                                        if (element.id == field) {
                                                            element.control.setValue(address[field]);
                                                        }
                                                    })
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
                                }else{
                                    this.http.post(API_URL + '/ws/accounts/addresses/create',
                                        {'args': {
                                                'address1': '',
                                                'address2': '',
                                                'postal_code': '',
                                                'city': '',
                                                'country': ''
                                            }
                                        }, {headers: this.authService.headers},
                                    ).pipe(
                                        tap((data: any) => {
                                            this.addressId = data.id
                                            this.http.put(API_URL + '/ws/accounts/customers/update/' + this.customerId, {'args': {'address_id' : this.addressId}}, {headers: this.authService.headers},
                                            ).pipe(
                                                finalize(() => this.loading = false),
                                                catchError((err: any) => {
                                                    console.debug(err)
                                                    this.notify.handleErrors(err, '/accounts/customers/list');
                                                    return of(false);
                                                })
                                            ).subscribe();
                                        }),
                                        catchError((err: any) => {
                                            console.debug(err)
                                            this.notify.handleErrors(err, '/accounts/customers/list');
                                            return of(false);
                                        })
                                    ).subscribe();
                                }
                            }
                        })
                    }
                }
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

        this.customerForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });

        return state;
    }

    onSubmit() {
        if (this.isValidForm()) {
            const customer: any = {};
            const address: any = {};
            this.customerForm.forEach(element => {
                customer[element.id] = element.control.value;
            });
            this.addressForm.forEach(element => {
                address[element.id] = element.control.value;
            });

            this.http.put(API_URL + '/ws/accounts/customers/update/' + this.customerId, {'args': customer}, {headers: this.authService.headers},
            ).pipe(
                catchError((err: any) => {
                    console.debug(err)
                    this.notify.handleErrors(err, '/accounts/customers/list');
                    return of(false);
                })
            ).subscribe();

            this.http.put(API_URL + '/ws/accounts/addresses/update/' + this.addressId, {'args': address}, {headers: this.authService.headers},
            ).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('ACCOUNTS.customer_updated'))
                    this.router.navigate(['/accounts/customers/list'])
                }),
                catchError((err: any) => {
                    console.debug(err)
                    this.notify.handleErrors(err, '/accounts/customers/list');
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessageSupplier(field: any) {
        let error = undefined;
        this.customerForm.forEach(element => {
            if (element.id == field) {
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        })
        return error
    }

    getErrorMessageAddress(field: any) {
        let error = undefined;
        this.addressForm.forEach(element => {
            if (element.id == field) {
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        })
        return error
    }

}
