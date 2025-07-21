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

import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "../../../../services/user.service";
import { AuthService } from "../../../../services/auth.service";
import { _, TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../services/settings.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { environment } from  "../../../env";
import { catchError, finalize, map, startWith, tap } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { Country } from '@angular-material-extensions/select-country';
import { LocaleService } from "../../../../services/locale.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'app-create-supplier-modale',
    templateUrl: './create-supplier.component.html',
    standalone: false
})
export class CreateSupplierModaleComponent implements OnInit {
    headers                 : HttpHeaders       = this.authService.headers;
    loading                 : boolean           = true;
    createLoading           : boolean           = false;
    toHighlightAccounting   : string            = '';
    accountingPlan          : Observable<any[]> = new Observable<any[]>();
    fromModal               : boolean           = true;
    supplierForm            : any[]             = [
        {
            id: 'get_only_raw_footer',
            label: _('ACCOUNTS.get_only_raw_footer'),
            type: 'mat-slide-toggle',
            control: new FormControl(true),
            required: true
        },
        {
            id: 'informal_contact',
            label: _('ACCOUNTS.informal_contact'),
            type: 'mat-slide-toggle',
            control: new FormControl(false),
            required: true
        },
        {
            id: 'name',
            label: _('ACCOUNTS.supplier_name'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'lastname',
            label: _('ACCOUNTS.lastname'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'firstname',
            label: _('ACCOUNTS.firstname'),
            type: 'text',
            control: new FormControl(),
            required: false
        },
        {
            id: 'civility',
            label: _('ACCOUNTS.civility'),
            type: 'select',
            control: new FormControl(),
            required: false,
            values: []
        },
        {
            id: 'function',
            label: _('ACCOUNTS.function'),
            type: 'text',
            control: new FormControl(),
            required: false
        },
        {
            id: 'vat_number',
            label: _('ACCOUNTS.vat_number'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'siret',
            label: _('ACCOUNTS.siret'),
            type: 'text',
            control: new FormControl('', Validators.pattern('^[0-9]{14}$')),
            required: false
        },
        {
            id: 'siren',
            label: _('ACCOUNTS.siren'),
            type: 'text',
            control: new FormControl('', Validators.pattern('^[0-9]{9}$')),
            required: false
        },
        {
            id: 'duns',
            label: _('ACCOUNTS.duns'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'iban',
            label: _('ACCOUNTS.iban'),
            type: 'text',
            control: new FormControl('', Validators.pattern('^[A-Za-z]{2}(?:[ ]?[0-9]){18,25}$')),
            required: false
        },
        {
            id: 'bic',
            label: _('ACCOUNTS.bic'),
            type: 'text',
            control: new FormControl('', Validators.pattern('^[a-zA-Z0-9]{4}[A-Z]{2}[a-zA-Z0-9]{2}(?:[a-zA-Z0-9]{3})?$')),
            required: false
        },
        {
            id: 'rccm',
            label: _('ACCOUNTS.rccm'),
            type: 'text',
            control: new FormControl('', Validators.pattern('^[aA-zZ]{2}-[aA-zZ]{3}-[0-9]{2}-[0-9]{4}-[aA-zZ]{1}[0-9]{2}-[0-9]{5}$')),
            required: false
        },
        {
            id: 'email',
            label: _('FORMATS.email'),
            type: 'text',
            hint: _('ACCOUNTS.only_one_email'),
            control: new FormControl('', Validators.email),
            required: false
        },
        {
            id: 'phone',
            label: _('FORMATS.phone'),
            type: 'text',
            control: new FormControl(),
            required: false
        },
        {
            id: 'form_id',
            label: _('ACCOUNTS.form'),
            type: 'select',
            control: new FormControl(),
            required: false,
            values: []
        },
        {
            id: 'document_lang',
            label: _('ADDRESSES.document_lang'),
            type: 'select',
            control: new FormControl(),
            required: true,
            values: []
        },
        {
            id: 'default_currency',
            label: _('FACTURATION.default_currency'),
            type: 'select',
            control: new FormControl(),
            required: false,
            values: []
        },
        {
            id: 'default_accounting_plan',
            label: _('FACTURATION.default_accounting_plan'),
            type: 'select',
            control: new FormControl(),
            required: false,
            values: []
        }
    ];
    addressForm             : any[]       = [
        {
            id: 'address1',
            label: _('ADDRESSES.address_1'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'address2',
            label: _('ADDRESSES.address_2'),
            type: 'text',
            control: new FormControl(),
            required: false
        },
        {
            id: 'postal_code',
            label: _('ADDRESSES.postal_code'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'city',
            label: _('ADDRESSES.city'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'country',
            label: _('ADDRESSES.country'),
            type: 'country',
            control: new FormControl('France'),
            required: true
        }
    ];
    defaultValue            : Country     = {
        name: 'France',
        alpha2Code: 'FR',
        alpha3Code: 'FRA',
        numericCode: '250',
        callingCode: '+33'
    };
    supplier: any;

    constructor(
        public router: Router,
        private http: HttpClient,
        public userService: UserService,
        private authService: AuthService,
        private translate: TranslateService,
        public dialogRef: MatDialogRef<any>,
        private notify: NotificationService,
        private localeService: LocaleService,
        public serviceSettings: SettingsService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public privilegesService: PrivilegesService
    ) {
    }

    async ngOnInit(): Promise<void> {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }

        const currencies: any = await this.retrieveCurrency();

        let tmpAccountingPlan: any = {};
        tmpAccountingPlan = await this.retrieveDefaultAccountingPlan();
        tmpAccountingPlan = this.sortArray(tmpAccountingPlan);

        this.supplierForm.forEach((element: any) => {
            if (element.id === 'vat_number' || element.id === 'duns') {
                element.control.valueChanges.subscribe((value: any) => {
                    if (value && value.includes(' ')) {
                        element.control.setValue(value.replace(' ', {emitEvent: false}));
                    }
                    this.supplierForm.forEach((elem: any) => {
                        if ((element.id == 'vat_number' && elem.id == 'duns')
                            || (element.id == 'duns' && elem.id == 'vat_number')) {
                            if (!value) {
                                if (elem.control.value) {
                                    elem.required = true;
                                    element.required = false;
                                }
                            } else {
                                elem.required = false;
                                element.required = true;
                            }
                        }
                    });
                    let otherId = element.id === "vat_number" ? "duns" : "vat_number";
                    let otherElem = this.supplierForm.find((form:any) => form.id === otherId);
                    let whoRequired:any = element.required ? element : otherElem
                    let whoNotRequired:any = !element.required ? element : otherElem
                    this.http.get(environment['url'] + '/ws/config/getRegexById/' + whoRequired.id, {headers: this.authService.headers}).pipe(
                        tap((data: any) => {
                            const regex = new RegExp(data.regex[0].content)
                            whoRequired.control.setValidators([
                                Validators.required,
                                Validators.pattern(regex)
                            ]);
                            whoRequired.control.updateValueAndValidity({emitEvent:false});
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                    whoNotRequired.control.clearValidators();
                    whoNotRequired.control.updateValueAndValidity({emitEvent:false});
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
            if (element.id == 'default_currency') {
                Object.keys(currencies).forEach((currency: any) => {
                    element.values.push({
                        'id': currencies[currency],
                        'label': currencies[currency]
                    });
                });
            }
            if (element.id === 'informal_contact') {
                element.control.valueChanges.subscribe((value: any) => {
                    this.supplierForm.forEach((elt: any) => {
                        if (elt.id === 'vat_number' || elt.id === 'duns') {
                            elt.required = !value;
                        }
                    })
                });
            }
            if (element.id === 'name' || element.id === 'lastname') {
                element.control.valueChanges.subscribe((value: any) => {
                    if (value) {
                        this.supplierForm.forEach((elem: any) => {
                            if (element.id == 'name' && elem.id == 'lastname') {
                                elem.required = false;
                                element.required = true;
                            }
                            if (element.id == 'lastname' && elem.id == 'name') {
                                elem.required = false;
                                element.required = true;
                            }
                        });
                    }
                });
            }
            if (element.id === 'civility') {
                this.http.get(environment['url'] + '/ws/accounts/civilities/list', {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        element.values = data.civilities;
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }
            if (this.data[element.id]) {
                element.control.setValue(this.data[element.id]);
            }
        });

        this.addressForm.forEach((element: any) => {
            if (this.data[element.id]) {
                element.control.setValue(this.data[element.id]);
            }
        });

        this.http.get(environment['url'] + '/ws/forms/verifier/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                const forms = data.forms;
                for (const cpt in forms) {
                    if (forms.hasOwnProperty(cpt)) {
                        this.supplierForm.forEach(element => {
                            if (element.id === 'form_id') {
                                element.values = forms;
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

    onCountrySelected(country: Country) {
        this.addressForm.forEach((element: any) => {
            if (element.id === 'country') {
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
            const address: any = {};
            const supplier: any = {};
            this.supplierForm.forEach(element => {
                supplier[element.id] = element.control.value;
                if (element.id === 'get_only_raw_footer') {
                    supplier[element.id] = !element.control.value;
                }
                if (element.id === 'default_accounting_plan' && element.control.value) {
                    supplier[element.id] = element.control.value.id;
                }
            });
            this.addressForm.forEach(element => {
                address[element.id] = element.control.value;
            });

            this.createLoading = true;

            this.http.post(environment['url'] + '/ws/accounts/addresses/create', {'args': address}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    supplier['address_id'] = data.id;
                    this.http.post(environment['url'] + '/ws/accounts/suppliers/create', {'args': supplier}, {headers: this.authService.headers},
                    ).pipe(
                        tap((data: any) => {
                            this.notify.success(this.translate.instant('ACCOUNTS.supplier_created'));
                            this.dialogRef.close(data.id);
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.createLoading = false;
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.createLoading = false;
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
            }
            if (element.control.errors) {
                if (element.control.errors.email) {
                    error = this.translate.instant('ACCOUNTS.email_format_error');
                } else if (element.control.errors.pattern) {
                    error = this.translate.instant('ACCOUNTS.pattern_error');
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

    async retrieveCurrency() {
        return await this.http.get(environment['url'] + '/ws/accounts/customers/getCurrencyCode', {headers: this.authService.headers}).toPromise();
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
