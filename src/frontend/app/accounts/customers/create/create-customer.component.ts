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
import { environment } from  "../../../env";
import { catchError, tap } from "rxjs/operators";
import { of } from "rxjs";
import { HistoryService } from "../../../../services/history.service";
import { Country } from "@angular-material-extensions/select-country";

@Component({
    selector: 'app-create',
    templateUrl: './create-customer.component.html',
    styleUrls: ['./create-customer.component.scss']
})
export class CreateCustomerComponent implements OnInit {
    headers     : HttpHeaders   = this.authService.headers;
    loading     : boolean       = true;
    customer    : any;
    customerForm: any[]         = [
        {
            id: 'name',
            label: marker('ACCOUNTS.customer_name'),
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
    addressForm : any []        = [
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
            type: 'country',
            control: new FormControl(),
            required: true,
        },
    ];

    defaultValue: Country = {
        name: 'France',
        alpha2Code: 'FR',
        alpha3Code: 'FRA',
        numericCode: '250',
        callingCode: '+33'
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
        private historyService: HistoryService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
    ) { }

    ngOnInit(): void {
        this.authService.generateHeaders();
        this.loading = false;
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

            this.http.post(environment['url'] + '/ws/accounts/addresses/create', {'args': address}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    customer['address_id'] = data.id;
                    this.http.post(environment['url'] + '/ws/accounts/customers/create', {'args': customer}, {headers: this.authService.headers},
                    ).pipe(
                        tap(() => {
                            this.historyService.addHistory('accounts', 'create_customer', this.translate.instant('HISTORY-DESC.create-customer', {customer: customer['name']}));
                            this.notify.success(this.translate.instant('ACCOUNTS.customer_created'));
                            this.router.navigate(['/accounts/customers/list']).then();
                        }),
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
