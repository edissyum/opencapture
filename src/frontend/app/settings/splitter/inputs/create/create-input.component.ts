import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {FormControl} from "@angular/forms";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../../services/user.service";
import {AuthService} from "../../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";

@Component({
  selector: 'app-splitter-create-input',
  templateUrl: './create-input.component.html',
  styleUrls: ['./create-input.component.scss']
})
export class SplitterCreateInputComponent implements OnInit {
    headers         : HttpHeaders   = this.authService.headers;
    loading         : boolean       = true;
    inputId         : any;
    input           : any;
    inputForm       : any[]         = [
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
    ];

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.http.get(API_URL + '/ws/accounts/customers/list', {headers: this.authService.headers}).pipe(
            tap((customers: any) => {
                this.inputForm.forEach((element: any) => {
                    if (element.id === 'customer_id') {
                        element.values = customers.customers;
                        if (customers.customers.length === 1) {
                            element.control.setValue(customers.customers[0].id);
                        }
                    }
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        this.http.get(API_URL + '/ws/forms/list?module=splitter', {headers: this.authService.headers}).pipe(
            tap((forms: any) => {
                this.inputForm.forEach((element: any) => {
                    if (element.id === 'default_form_id') {
                        element.values = forms.forms;
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
    }

    isValidForm() {
        let state = true;
        this.inputForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }

    onSubmit() {
        if (this.isValidForm()) {
            const input : any = {
                'module': 'splitter'
            };
            this.inputForm.forEach(element => {
                input[element.id] = element.control.value;
            });

            this.http.post(API_URL + '/ws/inputs/create', {'args': input}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.createScriptAndIncron();
                    this.notify.success(this.translate.instant('INPUT.created'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    createScriptAndIncron() {
        if (this.isValidForm()) {
            const input : any = {
                'module': 'splitter'
            };

            this.inputForm.forEach(element => {
                input[element.id] = element.control.value;
            });

            this.http.post(API_URL + '/ws/inputs/createScriptAndIncron', {'args': input}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.router.navigate(['/settings/splitter/inputs']).then();
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
