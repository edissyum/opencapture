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
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { UserService } from "../../../../services/user.service";
import { FormControl, Validators } from "@angular/forms";
import { AuthService } from "../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../services/settings.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import { environment } from  "../../../env";
import {catchError, finalize, map, startWith, tap} from "rxjs/operators";
import { of } from "rxjs";
import { COUNTRIES_DB_FR, Country } from "@angular-material-extensions/select-country";
import { LocaleService } from "../../../../services/locale.service";

@Component({
    selector: 'app-update',
    templateUrl: './update-supplier.component.html'
})
export class UpdateSupplierComponent implements OnInit {
    headers                 : HttpHeaders = this.authService.headers;
    loading                 : boolean = true;
    toHighlightAccounting   : string  = '';
    supplierId              : any;
    addressId               : any;
    supplier                : any;
    accountingPlan          : any   = {};
    supplierForm            : any[] = [
        {
            id: 'get_only_raw_footer',
            label: marker('ACCOUNTS.get_only_raw_footer'),
            type: 'mat-slide-toggle',
            control: new FormControl(),
            required: true
        },
        {
            id: 'name',
            label: marker('ACCOUNTS.supplier_name'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'vat_number',
            label: marker('ACCOUNTS.vat_number'),
            type: 'text',
            control: new FormControl('', Validators.pattern('^(EU|SI|HU|D(K|E)|PL|CHE|(F|H)R|B(E|G)(0)?)[0-9A-Za-z]{2}[0-9]{6,9}$')),
            required: true
        },
        {
            id: 'siret',
            label: marker('ACCOUNTS.siret'),
            type: 'text',
            control: new FormControl('', Validators.pattern('^[0-9]{14}$')),
            required: false
        },
        {
            id: 'siren',
            label: marker('ACCOUNTS.siren'),
            type: 'text',
            control: new FormControl('', Validators.pattern('^[0-9]{9}$')),
            required: false
        },
        {
            id: 'duns',
            label: marker('ACCOUNTS.duns'),
            type: 'text',
            control: new FormControl('', Validators.pattern('^([0-9]{9})|([0-9]{2}-[0-9]{3}-[0-9]{4})$')),
            required: true
        },
        {
            id: 'iban',
            label: marker('ACCOUNTS.iban'),
            type: 'text',
            control: new FormControl('', Validators.pattern('^[A-Za-z]{2}(?:[ ]?[0-9]){18,25}$')),
            required: false
        },
        {
            id: 'bic',
            label: marker('ACCOUNTS.bic'),
            type: 'text',
            control: new FormControl('', Validators.pattern('^[a-zA-Z0-9]{4}[A-Z]{2}[a-zA-Z0-9]{2}(?:[a-zA-Z0-9]{3})?$')),
            required: false
        },
        {
            id: 'rccm',
            label: marker('ACCOUNTS.rccm'),
            type: 'text',
            control: new FormControl('', Validators.pattern('^[aA-zZ]{2}-[aA-zZ]{3}-[0-9]{2}-[0-9]{4}-[aA-zZ]{1}[0-9]{2}-[0-9]{5}$')),
            required: false
        },
        {
            id: 'email',
            label: marker('FORMATS.email'),
            type: 'text',
            control: new FormControl('', Validators.email),
            required: false
        },
        {
            id: 'form_id',
            label: marker('ACCOUNTS.form'),
            type: 'select',
            control: new FormControl(),
            required: false,
            values:[]
        },
        {
            id: 'document_lang',
            label: marker('ADDRESSES.document_lang'),
            type: 'select',
            control: new FormControl(),
            required: true,
            values: []
        },
        {
            id: 'default_accounting_plan',
            label: marker('FACTURATION.default_accounting_plan'),
            type: 'select',
            control: new FormControl(),
            required: false,
            values: []
        },
        {
            id: 'default_currency',
            label: marker('FACTURATION.default_currency'),
            type: 'select',
            control: new FormControl(),
            required: false,
            values: [
                {'id': 'EUR', 'label': 'EUR'},
                {'id': 'USD', 'label': 'USD'},
                {'id': 'CNY', 'label': 'CNY'},
                {'id': 'AUD', 'label': 'AUD'},
                {'id': 'BRL', 'label': 'BRL'},
                {'id': 'CHF', 'label': 'CHF'},
                {'id': 'CAD', 'label': 'CAD'}
            ]
        }
    ];
    addressForm             : any[] = [
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
            control: new FormControl('France'),
            required: true
        }
    ];

    defaultValue: Country = {
        name: 'France',
        alpha2Code: 'FR',
        alpha3Code: '',
        numericCode: '',
        callingCode: ''
    };

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        private localeService: LocaleService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    async ngOnInit(): Promise<any> {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        this.supplierId = this.route.snapshot.params['id'];
        let tmpAccountingPlan: any = {};
        tmpAccountingPlan = await this.retrieveDefaultAccountingPlan();
        tmpAccountingPlan = this.sortArray(tmpAccountingPlan);
        for (const element of this.supplierForm) {
            if (element.id === 'vat_number' || element.id === 'duns') {
                element.control.valueChanges.subscribe((value: any) => {
                    if (value && value.includes(' ')) {
                        element.control.setValue(value.replace(' ', ''));
                    }
                    if (value) {
                        this.supplierForm.forEach((elem: any) => {
                            if (element.id == 'vat_number' && elem.id == 'duns') {
                                elem.required = false;
                                element.required = true;
                            }
                            if (element.id == 'duns' && elem.id == 'vat_number') {
                                elem.required = false;
                                element.required = true;
                            }
                        });
                    }
                });
            }
            if (element.id === 'siret' || element.id === 'siren' || element.id === 'iban' || element.id === 'bic') {
                element.control.valueChanges.subscribe((value: any) => {
                    if (value && value.includes(' ')) {
                        element.control.setValue(value.replace(' ', ''));
                    }
                });
            }
            if (element.id === 'document_lang') {
                if (this.localeService.langs.length === 0) {
                    this.http.get(environment['url'] + '/ws/i18n/getAllLang', {headers: this.authService.headers}).pipe(
                        tap((data: any) => {
                            data.langs.forEach((lang: any) => {
                                element.control.setValue('fra');
                                element.values.push({
                                    'id': lang[0],
                                    'label': lang[1]
                                });
                            });
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                } else {
                    this.localeService.langs.forEach((lang: any) => {
                        element.control.setValue('fra');
                        element.values.push({
                            'id': lang[0],
                            'label': lang[1]
                        });
                    });
                }
            }
            if (element.id === 'default_accounting_plan') {
                this.accountingPlan = element.control.valueChanges
                    .pipe(
                        startWith(''),
                        map(option => option ? this._filter_accounting(tmpAccountingPlan, option) : tmpAccountingPlan)
                    );
            }
        }

        this.http.get(environment['url'] + '/ws/forms/verifier/list', {headers: this.authService.headers}).pipe(
            tap((forms: any) => {
                this.http.get(environment['url'] + '/ws/accounts/suppliers/getById/' + this.supplierId, {headers: this.authService.headers}).pipe(
                    tap((supplier: any) => {
                        this.supplier = supplier;
                        for (const field in this.supplier) {
                            if (supplier.hasOwnProperty(field)) {
                                this.supplierForm.forEach(element => {
                                    if (element.id === field) {
                                        if (element.id === 'get_only_raw_footer') {
                                            element.control.setValue(!this.supplier[field]);
                                        } else if (element.id === 'form_id') {
                                            element.values = forms.forms;
                                        } else if (element.id === 'default_accounting_plan') {
                                            tmpAccountingPlan.forEach((account: any) => {
                                                if (account.id === parseInt(this.supplier[field])) {
                                                    element.control.setValue(account);
                                                }
                                            });
                                        } else {
                                            element.control.setValue(this.supplier[field]);
                                        }
                                    } else if (field === 'address_id') {
                                        this.addressId = this.supplier[field];
                                        if (this.addressId) {
                                            this.http.get(environment['url'] + '/ws/accounts/getAdressById/' + this.addressId, {headers: this.authService.headers}).pipe(
                                                tap((address: any) => {
                                                    for (const adr_field in address) {
                                                        if (address.hasOwnProperty(adr_field)) {
                                                            this.addressForm.forEach(adr_element => {
                                                                if (adr_element.id === adr_field) {
                                                                    if (adr_field === 'country') {
                                                                        COUNTRIES_DB_FR.forEach((country: Country) => {
                                                                            if (country.name === address[adr_field]) {
                                                                                this.defaultValue = country;
                                                                            }
                                                                        });
                                                                    }
                                                                    adr_element.control.setValue(address[adr_field]);
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
                                                        'country': ''
                                                    }
                                                }, {headers: this.authService.headers},
                                            ).pipe(
                                                tap((data: any) => {
                                                    this.addressId = data.id;
                                                    this.http.put(environment['url'] + '/ws/accounts/suppliers/update/' + this.supplierId, {'args': {'address_id' : this.addressId}}, {headers: this.authService.headers},
                                                    ).pipe(
                                                        finalize(() => this.loading = false),
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
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    onCountrySelected(country: Country) {
        this.addressForm.forEach((element: any) => {
            if (element.id === 'country' && country) {
                element.control.setValue(country['name']);
            }
        });
    }

    isValidForm() {
        let state = true;
        this.supplierForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });

        this.addressForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });

        return state;
    }

    onSubmit() {
        if (this.isValidForm()) {
            const supplier: any = {};
            const address: any = {};
            this.supplierForm.forEach(element => {
                supplier[element.id] = element.control.value;
                if (element.id === 'get_only_raw_footer') {
                    supplier[element.id] = !element.control.value;
                }
                if (element.id === 'default_accounting_plan') {
                    supplier[element.id] = element.control.value.id;
                }
            });
            this.addressForm.forEach(element => {
                address[element.id] = element.control.value;
            });
            this.http.put(environment['url'] + '/ws/accounts/suppliers/update/' + this.supplierId, {'args': supplier}, {headers: this.authService.headers},
            ).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();

            this.http.put(environment['url'] + '/ws/accounts/addresses/update/' + this.addressId, {'args': address}, {headers: this.authService.headers},
            ).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('ACCOUNTS.supplier_updated'));
                    this.router.navigate(['/accounts/suppliers/list']).then();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessageSupplier(field: any) {
        let error: any;
        this.supplierForm.forEach(element => {
            if (element.id === field) {
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
                if (element.control.errors) {
                     if (element.control.errors.email) {
                         error = this.translate.instant('ACCOUNTS.email_format_error');
                     }
                     else if (element.control.errors.pattern) {
                         error = this.translate.instant('ACCOUNTS.pattern_error');
                     }
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

    async retrieveDefaultAccountingPlan() {
        return await this.http.get(environment['url'] + '/ws/accounts/customers/getDefaultAccountingPlan', {headers: this.authService.headers}).toPromise();
    }

    sortArray(array: any) {
        return array.sort((a: any, b: any) => {
            const x = a.compte_num, y = b.compte_num;
            return x === y ? 0 : x > y ? 1 : -1;
        });
    }

    private _filter_accounting(array: any, value: any): string[] {
        this.toHighlightAccounting = value;
        if (typeof value === 'object') {
            value = value.compte_num + ' - ' + value.compte_lib ;
        }
        const filterValue = value.toLowerCase();
        return array.filter((option: any) => option.compte_lib.toLowerCase().indexOf(filterValue) !== -1 || option.compte_num.toLowerCase().indexOf(filterValue) !== -1);
    }

    displayFn_accounting(option: any): string {
        return option ? option.compte_num + ' - ' + option.compte_lib : '';
    }
}
