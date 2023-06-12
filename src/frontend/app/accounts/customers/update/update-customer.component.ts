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
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import { FormBuilder, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "../../../../services/user.service";
import { AuthService } from "../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../services/settings.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { Country } from "@angular-material-extensions/select-country";
import { catchError, finalize, tap } from "rxjs/operators";
import { environment } from  "../../../env";
import { of } from "rxjs";

@Component({
    selector: 'app-update',
    templateUrl: './update-customer.component.html',
    styleUrls: ['./update-customer.component.scss']
})
export class UpdateCustomerComponent implements OnInit {
    headers         : HttpHeaders   = this.authService.headers;
    loading         : boolean       = true;
    customerId      : any;
    addressId       : any;
    customer        : any;
    currentModule   : string        = '';
    customerForm    : any[]         = [
        {
            id: 'name',
            label: marker('ACCOUNTS.customer_name'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'vat_number',
            label: marker('ACCOUNTS.vat_number'),
            type: 'text',
            control: new FormControl(),
            required: true
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
        {
            id: 'module',
            label: marker('CUSTOM-FIELDS.module'),
            type: 'select',
            control: new FormControl(),
            required: true,
            values: [
                {id: 'verifier', label: this.translate.instant('HOME.verifier')},
                {id: 'splitter', label: this.translate.instant('HOME.splitter')}
            ]
        }
    ];
    addressForm     : any []        = [
        {
            id: 'address1',
            label: marker('ADDRESSES.address_1'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'address2',
            label: marker('ADDRESSES.address_2'),
            type: 'text',
            control: new FormControl(),
            required: false
        },
        {
            id: 'postal_code',
            label: marker('ADDRESSES.postal_code'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'city',
            label: marker('ADDRESSES.city'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'country',
            label: marker('ADDRESSES.country'),
            type: 'country',
            control: new FormControl(),
            required: true
        }
    ];
    defaultValue    : Country       = {
        name: 'France',
        alpha2Code: '',
        alpha3Code: '',
        numericCode: '',
        callingCode: ''
    };

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
        public privilegesService: PrivilegesService
    ) { }

    ngOnInit(): void {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        this.customerId = this.route.snapshot.params['id'];
        this.http.get(environment['url'] + '/ws/accounts/customers/getById/' + this.customerId, {headers: this.authService.headers}).pipe(
            tap((customer: any) => {
                this.customer = customer;
                for (const field in this.customer) {
                    if (field === 'module') {
                        this.currentModule = this.customer[field];
                        this.updateRequired({control: {value: this.currentModule}});
                    }
                }
                for (const field in this.customer) {
                    if (customer.hasOwnProperty(field)) {
                        this.customerForm.forEach(element => {
                            if (element.id === field) {
                                element.control.setValue(this.customer[field]);
                            } else if (field === 'address_id') {
                                this.addressId = this.customer[field];
                                if (this.addressId) {
                                    this.http.get(environment['url'] + '/ws/accounts/getAdressById/' + this.addressId, {headers: this.authService.headers}).pipe(
                                        tap((address: any) => {
                                            for (const field in address) {
                                                if (address.hasOwnProperty(field)) {
                                                    this.addressForm.forEach(element => {
                                                        if (element.id === field) {
                                                            if (field === 'country') {
                                                                this.defaultValue.name = address[field];
                                                            }
                                                            element.control.setValue(address[field]);
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
                                } else {
                                    this.http.post(environment['url'] + '/ws/accounts/addresses/create',
                                        {'args': {
                                                'address1': '',
                                                'address2': '',
                                                'postal_code': '',
                                                'city': '',
                                                'country': '',
                                                'module': this.currentModule
                                            }
                                        }, {headers: this.authService.headers},
                                    ).pipe(
                                        tap((data: any) => {
                                            this.addressId = data.id;
                                            this.http.put(environment['url'] + '/ws/accounts/customers/update/' + this.customerId, {'args': {'address_id' : this.addressId}}, {headers: this.authService.headers},
                                            ).pipe(
                                                finalize(() => this.loading = false),
                                                catchError((err: any) => {
                                                    console.debug(err);
                                                    this.notify.handleErrors(err, '/accounts/customers/list');
                                                    return of(false);
                                                })
                                            ).subscribe();
                                        }),
                                        catchError((err: any) => {
                                            console.debug(err);
                                            this.notify.handleErrors(err, '/accounts/customers/list');
                                            return of(false);
                                        })
                                    ).subscribe();
                                }
                            }
                        });
                    }
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    updateRequired(field: any) {
        let requiredFields: any = [];
        this.currentModule = field.control.value;
        if (field.control.value === 'splitter') {
            requiredFields = ['name', 'module'];
        } else {
            requiredFields = ['name', 'vat_number', 'siret', 'siren', 'module', 'address1', 'postal_code', 'city'];
        }

        this.customerForm.forEach((element: any) => {
            element.required = requiredFields.includes(element.id);
        });
        this.addressForm.forEach((element: any) => {
            element.required = requiredFields.includes(element.id);
        });
    }

    onCountrySelected(country: Country) {
        this.addressForm.forEach((element: any) => {
            if (element.id === 'country') {
                element.control.setValue(country['name']);
            }
        });
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

            this.http.put(environment['url'] + '/ws/accounts/customers/update/' + this.customerId, {'args': customer}, {headers: this.authService.headers},
            ).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/accounts/customers/list');
                    return of(false);
                })
            ).subscribe();

            this.http.put(environment['url'] + '/ws/accounts/addresses/update/' + this.addressId, {'args': address}, {headers: this.authService.headers},
            ).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('ACCOUNTS.customer_updated'));
                    this.router.navigate(['/accounts/customers/list']).then();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/accounts/customers/list');
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessageCustomer(field: any) {
        let error: any;
        this.customerForm.forEach(element => {
            if (element.id === field) {
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }

    getErrorMessageAddress(field: any) {
        let error: any;
        this.addressForm.forEach(element => {
            if (element.id === field) {
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }
}
