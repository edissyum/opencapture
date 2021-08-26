import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../services/user.service";
import {FormBuilder, FormControl} from "@angular/forms";
import {AuthService} from "../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../services/settings.service";
import {PrivilegesService} from "../../../../services/privileges.service";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
import {API_URL} from "../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";

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
            required: true,
        },
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
            id: 'typology',
            label: marker('ACCOUNTS.typology'),
            type: 'text',
            control: new FormControl(),
            required: false
        },
        {
            id: 'form_id',
            label: marker('ACCOUNTS.form'),
            type: 'select',
            control: new FormControl(),
            required: false,
            values:[]
        }
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
        this.supplierId = this.route.snapshot.params['id'];
        this.http.get(API_URL + '/ws/forms/list', {headers: this.authService.headers}).pipe(
            tap((forms: any) => {
                this.http.get(API_URL + '/ws/accounts/suppliers/getById/' + this.supplierId, {headers: this.authService.headers}).pipe(
                    tap((supplier: any) => {
                        this.supplier = supplier;
                        for (let field in this.supplier) {
                            if (supplier.hasOwnProperty(field)) {
                                this.supplierForm.forEach(element => {
                                    if (element.id == field) {
                                        if (element.id == 'get_only_raw_footer') {
                                            element.control.setValue(!this.supplier[field])
                                        }else {
                                            element.control.setValue(this.supplier[field]);
                                        }
                                        if (element.id == 'form_id') {
                                            element.values = forms.forms
                                        }
                                    }else if (field == 'address_id') {
                                        this.addressId = this.supplier[field];
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
                                            ).subscribe();
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
                                                    this.addressId = data.id;
                                                    this.http.put(API_URL + '/ws/accounts/suppliers/update/' + this.supplierId, {'args': {'address_id' : this.addressId}}, {headers: this.authService.headers},
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
                                })
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
                if (element.id == 'get_only_raw_footer') {
                    supplier[element.id] = !element.control.value;
                }
            });
            this.addressForm.forEach(element => {
                address[element.id] = element.control.value;
            });

            this.http.put(API_URL + '/ws/accounts/suppliers/update/' + this.supplierId, {'args': supplier}, {headers: this.authService.headers},
            ).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/accounts/suppliers/list');
                    return of(false);
                })
            ).subscribe();

            this.http.put(API_URL + '/ws/accounts/addresses/update/' + this.addressId, {'args': address}, {headers: this.authService.headers},
            ).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('ACCOUNTS.supplier_updated'));
                    this.router.navigate(['/accounts/suppliers/list']);
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
        let error = undefined;
        this.supplierForm.forEach(element => {
            if (element.id == field) {
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }

    getErrorMessageAddress(field: any) {
        let error = undefined;
        this.addressForm.forEach(element => {
            if (element.id == field) {
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }
}
