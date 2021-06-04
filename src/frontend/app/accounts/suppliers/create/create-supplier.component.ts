import {Component, OnInit} from '@angular/core';
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
    selector: 'app-create',
    templateUrl: './create-supplier.component.html',
    styleUrls: ['./create-supplier.component.scss']
})
export class CreateSupplierComponent implements OnInit {
    headers: HttpHeaders = this.authService.headers;
    loading: boolean = true;
    supplier: any;
    supplierForm: any[] = [
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
            values: []
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
    ) {
    }

    ngOnInit(): void {
        this.http.get(API_URL + '/ws/forms/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                let forms = data.forms
                for (let cpt in forms) {
                    if (forms.hasOwnProperty(cpt)) {
                        this.supplierForm.forEach(element => {
                            if (element.id == 'form_id') {
                                element.values = forms
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
    }

    isValidForm() {
        let state = true;

        this.supplierForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });

        return state;
    }

    onSubmit(){
        if (this.isValidForm()) {
            const supplier: any = {};
            const address: any = {};
            this.supplierForm.forEach(element => {
                supplier[element.id] = element.control.value;
            });
            this.addressForm.forEach(element => {
                address[element.id] = element.control.value;
            });

            this.http.post(API_URL + '/ws/accounts/addresses/create', {'args': address}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    supplier['address_id'] = data.id
                    this.http.post(API_URL + '/ws/accounts/suppliers/create', {'args': supplier}, {headers: this.authService.headers},
                    ).pipe(
                        tap(() => {
                            this.notify.success(this.translate.instant('ACCOUNTS.supplier_created'))
                            this.router.navigate(['/accounts/suppliers/list'])
                        }),
                        catchError((err: any) => {
                            console.debug(err)
                            this.notify.handleErrors(err, '/accounts/suppliers/list');
                            return of(false);
                        })
                    ).subscribe();
                }),
                catchError((err: any) => {
                    console.debug(err)
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
