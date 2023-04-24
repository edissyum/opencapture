import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "../../../../../services/user.service";
import { AuthService } from "../../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { environment } from  "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { HistoryService } from "../../../../../services/history.service";

@Component({
    selector: 'app-splitter-create-input',
    templateUrl: './create-input.component.html',
    styleUrls: ['./create-input.component.scss']
})
export class SplitterCreateInputComponent implements OnInit {
    headers         : HttpHeaders   = this.authService.headers;
    loading         : boolean       = true;
    allowedPath     : string        = '';
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
            placeholder: "/var/share/input",
            hint: this.translate.instant('GLOBAL.no_restriction'),
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
            id: 'splitter_method_id',
            label: this.translate.instant('INPUT.splitter_method'),
            type: 'select',
            control: new FormControl(),
            required: true,
            values: [],
        },
        {
            id: 'remove_blank_pages',
            label: this.translate.instant('INPUT.remove_blank_pages'),
            type: 'boolean',
            control: new FormControl()
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
        private historyService: HistoryService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.http.get(environment['url'] + '/ws/accounts/customers/list/splitter', {headers: this.authService.headers}).pipe(
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
        this.http.get(environment['url'] + '/ws/forms/splitter/list', {headers: this.authService.headers}).pipe(
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
        this.inputForm.forEach(element => {
            if (element.id === 'splitter_method_id') {
                this.http.get(environment['url'] + '/ws/splitter/splitMethods', {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        data.splitMethods.forEach((option: any) => {
                            element.values.push({
                                id      : option.id,
                                label   : option.label,
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
            }
        });
        this.http.get(environment['url'] + '/ws/inputs/splitter/allowedPath', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allowedPath = data.allowedPath;
                if (this.allowedPath) {
                    this.inputForm.forEach((element: any) => {
                        if (element.id === 'input_folder') {
                            element.placeholder = (this.allowedPath + "/input").replace(/\/\//g, '/');
                            element.hint = this.translate.instant('GLOBAL.allowed_path', {'allowedPath': this.allowedPath});
                        }
                    });
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
            const input: any = {
                'module': 'splitter'
            };
            this.inputForm.forEach(element => {
                input[element.id] = element.control.value;
            });
            this.createInputAndScriptAndIncron();
        }
    }

    createInputAndScriptAndIncron() {
        if (this.isValidForm()) {
            const input : any = {
                'module': 'splitter'
            };

            this.inputForm.forEach(element => {
                input[element.id] = element.control.value;
            });

            this.http.post(environment['url'] + '/ws/inputs/splitter/createScriptAndWatcher', {'args': input}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.http.post(environment['url'] + '/ws/inputs/splitter/create', {'args': input}, {headers: this.authService.headers}).pipe(
                        tap(() => {
                            this.historyService.addHistory('splitter', 'create_input', this.translate.instant('HISTORY-DESC.create-input', {input: input['input_label']}));
                            this.router.navigate(['/settings/splitter/inputs']).then();
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
