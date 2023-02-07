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
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "../../../../../services/user.service";
import { AuthService } from "../../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { FormControl } from "@angular/forms";
import { environment } from  "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { HistoryService } from "../../../../../services/history.service";

@Component({
    selector: 'create-input',
    templateUrl: './create-input.component.html',
    styleUrls: ['./create-input.component.scss']
})
export class CreateInputComponent implements OnInit {
    loading                 : boolean       = true;
    loadingCustomFields     : boolean       = true;
    headers                 : HttpHeaders   = this.authService.headers;
    inputId                 : any;
    input                   : any;
    inputForm               : any[]         = [
        {
            id: 'input_id',
            label: this.translate.instant('HEADER.label_short'),
            type: 'text',
            control: new FormControl(),
            placeholder: "default_input",
            required: true,
        },
        {
            id: 'input_label',
            label: this.translate.instant('HEADER.label'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'input_folder',
            label: this.translate.instant('INPUT.input_folder'),
            type: 'text',
            control: new FormControl(),
            placeholder: "/var/share/sortant",
            required: true,
        },
        {
            id: 'default_form_id',
            label: this.translate.instant('INPUT.default_form_id'),
            type: 'select',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'customer_id',
            label: this.translate.instant('INPUT.associated_customer'),
            type: 'select',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'purchase_or_sale',
            label: this.translate.instant('INPUT.purchase_or_sale'),
            type: 'select',
            control: new FormControl(),
            values: [
                {
                    'id': 'purchase',
                    'label': 'UPLOAD.purchase_invoice'
                },
                {
                    'id': 'sale',
                    'label': 'UPLOAD.sale_invoice'
                }
            ],
            required: true,
        },
        {
            id: 'splitter_method_id',
            label: this.translate.instant('INPUT.splitter_method'),
            type: 'select',
            control: new FormControl(),
            required: false,
            values: [
                {
                    'id': 'no_sep',
                    'label': this.translate.instant('INPUT.no_separation')
                },
                {
                    'id': 'qr_code_OC',
                    'label': this.translate.instant('INPUT.qr_code_separation')
                },
                {
                    'id': 'separate_by_document',
                    'label': this.translate.instant('INPUT.separate_by_document')
                }
            ],
        },
        {
            id: 'ai_model_id',
            label: this.translate.instant('INPUT.ai_model_id'),
            type: 'select',
            control: new FormControl(),
            required: true,
            hint: this.translate.instant('INPUT.ai_model_id_hint')
        },
        {
            id: 'override_supplier_form',
            label: this.translate.instant('INPUT.override_supplier_form'),
            type: 'boolean',
            control: new FormControl()
        },
        {
            id: 'remove_blank_pages',
            label: this.translate.instant('INPUT.remove_blank_pages'),
            type: 'boolean',
            control: new FormControl()
        }
    ];

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        private historyService: HistoryService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();

        this.http.get(environment['url'] + '/ws/accounts/customers/list/verifier', {headers: this.authService.headers}).pipe(
            tap((customers: any) => {
                this.inputForm.forEach((element: any) => {
                    if (element.id === 'customer_id') {
                        element.values = customers.customers;
                        if (customers.customers.length === 1) {
                            element.control.setValue(customers.customers[0].id);
                        }
                    }
                    if (element.id === 'splitter_method_id') {
                        element.control.setValue('no_sep');
                    }
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/forms/list?module=verifier', {headers: this.authService.headers}).pipe(
            tap((forms: any) => {
                this.inputForm.forEach((element: any) => {
                    if (element.id === 'default_form_id') {
                        element.values = forms.forms;
                        element.values = [{'id': 0, 'label': this.translate.instant('INPUT.no_form_associated')}].concat(element.values);
                        if (forms.forms.length === 1) {
                            element.control.setValue(forms.forms[0].id);
                        }
                    }
                });
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/ai/list?module=verifier', {headers: this.authService.headers}).pipe(
            tap((aiModel: any) => {
                this.inputForm.forEach((element: any) => {
                    if (element.id === 'ai_model_id') {
                        element.values = aiModel.models;
                        element.values.forEach((elem: any) => {
                            elem.label = elem.model_label;
                        });
                        element.values = [{'id': 0, 'label': this.translate.instant('INPUT.no_ai_model_associated')}].concat(element.values);
                        if (aiModel.models.length === 1) {
                            element.control.setValue(aiModel.models[0].id);
                        }
                    }
                });
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.inputForm.forEach((element: any) => {
            if (element.id === 'default_form_id') {
                element.control.valueChanges.subscribe((value: any) => {
                    const required = !value;
                    this.inputForm.forEach((elem: any) => {
                        if (elem.id === 'ai_model_id') {
                            elem.required = required;
                        }
                    });
                });
            } else if (element.id === 'ai_model_id') {
                element.control.valueChanges.subscribe((value: any) => {
                    const required = !value;
                    this.inputForm.forEach((elem: any) => {
                        if (elem.id === 'default_form_id') {
                            elem.required = required;
                        }
                    });
                });
            }
        });
    }

    isValidForm() {
        let state = true;
        let aiEmpty = false;
        let defaultFormEmpty = false;
        this.inputForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            if (element.id === 'ai_model_id' && element.control.value === 0) {
                aiEmpty = true;
            }
            if (element.id === 'default_form_id' && element.control.value === 0) {
                defaultFormEmpty = true;
            }
            if (aiEmpty && defaultFormEmpty) {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }

    onSubmit() {
        if (this.isValidForm()) {
            const input : any = {
                'module': 'verifier'
            };
            this.inputForm.forEach(element => {
                if (element.control.value !== 'no_form' && element.control.value !== 'no_ai_model') {
                    input[element.id] = element.control.value;
                }
            });

            this.createInputAndScriptAndIncron();
        }
    }

    createInputAndScriptAndIncron() {
        if (this.isValidForm()) {
            const input : any = {
                'module': 'verifier'
            };

            this.inputForm.forEach(element => {
                input[element.id] = element.control.value;
            });

            input['module'] = 'verifier';

            this.http.post(environment['url'] + '/ws/inputs/createScriptAndIncron', {'args': input}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.http.post(environment['url'] + '/ws/inputs/create', {'args': input}, {headers: this.authService.headers}).pipe(
                        tap(() => {
                            this.historyService.addHistory('verifier', 'create_input', this.translate.instant('HISTORY-DESC.create-input', {input: input['input_label']}));
                            this.router.navigate(['/settings/verifier/inputs']).then();
                            this.notify.success(this.translate.instant('INPUT.created'));
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
    }

    getErrorMessage(field: any) {
        let error: any;
        this.inputForm.forEach(element => {
            if (element.id === field) {
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }

}
