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
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "../../../../services/user.service";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { AuthService } from "../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../services/settings.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import { environment } from  "../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { Country } from "@angular-material-extensions/select-country";
import { LocaleService } from "../../../../services/locale.service";

@Component({
    selector: 'app-update',
    templateUrl: './update-supplier.component.html',
    styleUrls: ['./update-supplier.component.scss']
})
export class UpdateSupplierComponent implements OnInit {
    headers: HttpHeaders = this.authService.headers;
    loading: boolean = true;
    supplierId: any;
    addressId: any;
    supplier: any;
    supplierForm: any[] = [
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
            control: new FormControl(),
            required: true
        },
        {
            id: 'siret',
            label: marker('ACCOUNTS.siret'),
            type: 'text',
            control: new FormControl(''),
            required: false
        },
        {
            id: 'siren',
            label: marker('ACCOUNTS.siren'),
            type: 'text',
            control: new FormControl(''),
            required: false
        },
        {
            id: 'iban',
            label: marker('ACCOUNTS.iban'),
            type: 'text',
            control: new FormControl(''),
            required: false
        },
        {
            id: 'duns',
            label: marker('ACCOUNTS.duns'),
            type: 'text',
            control: new FormControl(''),
            required: false
        },
        {
            id: 'bic',
            label: marker('ACCOUNTS.bic'),
            type: 'text',
            control: new FormControl(''),
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
        }
    ];
    addressForm: any [] = [
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
        private localeService: LocaleService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    ngOnInit(): void {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        this.supplierId = this.route.snapshot.params['id'];
        this.supplierForm.forEach((element: any) => {
            if (element.id === 'vat_number' || element.id === 'siret' || element.id === 'siren' || element.id === 'iban' || element.id === 'duns' || element.id === 'bic') {
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
        });
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
                                        } else {
                                            element.control.setValue(this.supplier[field]);
                                        }
                                        if (element.id === 'form_id') {
                                            element.values = forms.forms;
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
                                                                        this.defaultValue.name = address[adr_field];
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
                                                            this.notify.handleErrors(err, '/accounts/suppliers/list');
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

            this.http.put(environment['url'] + '/ws/accounts/suppliers/update/' + this.supplierId, {'args': supplier}, {headers: this.authService.headers},
            ).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/accounts/suppliers/list');
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
                    this.notify.handleErrors(err, '/accounts/suppliers/list');
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
                if (element.control.errors && element.control.errors.email) {
                    error = this.translate.instant('ACCOUNTS.email_format_error');
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
