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
import { FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "../../../../services/user.service";
import { AuthService } from "../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../services/settings.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { environment } from  "../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { Country } from '@angular-material-extensions/select-country';
import { LocaleService } from "../../../../services/locale.service";

@Component({
    selector: 'app-create',
    templateUrl: './create-supplier.component.html',
    styleUrls: ['./create-supplier.component.scss']
})
export class CreateSupplierComponent implements OnInit {
    headers         : HttpHeaders = this.authService.headers;
    loading         : boolean   = true;
    createLoading   : boolean   = false;
    supplierForm    : any[]     = [
        {
            id: 'get_only_raw_footer',
            label: marker('ACCOUNTS.get_only_raw_footer'),
            type: 'mat-slide-toggle',
            control: new FormControl(true),
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
            required: false
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
            hint: marker('ACCOUNTS.only_one_email'),
            control: new FormControl('', Validators.email),
            required: false
        },
        {
            id: 'form_id',
            label: marker('ACCOUNTS.form'),
            type: 'select',
            control: new FormControl(),
            required: false,
            values: []
        },
        {
            id: 'document_lang',
            label: marker('ADDRESSES.document_lang'),
            type: 'select',
            control: new FormControl(),
            required: true,
            values: []
        }
    ];
    addressForm     : any[]     = [
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
    defaultValue    : Country   = {
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
        private notify: NotificationService,
        private localeService: LocaleService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {
    }

    ngOnInit(): void {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
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
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.supplierForm.forEach((element: any) => {
            if (element.id === 'vat_number' || element.id === 'siret' || element.id === 'siren' || element.id === 'iban') {
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
                        finalize(() => this.loading = false),
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
                    this.loading = false;
                }
            }
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
                        tap(() => {
                            this.notify.success(this.translate.instant('ACCOUNTS.supplier_created'));
                            this.router.navigate(['/accounts/suppliers/list']).then();
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
}
