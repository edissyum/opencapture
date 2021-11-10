/** This file is part of Open-Capture for Invoices.

Open-Capture for Invoices is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Open-Capture is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

@dev : Nathan Cheval <nathan.cheval@outlook.fr>
@dev : Oussama Brich <oussama.brich@edissyum.com> */

import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {FormBuilder, FormControl} from "@angular/forms";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../../services/auth.service";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, map, startWith, tap} from "rxjs/operators";
import {of} from "rxjs";

@Component({
  selector: 'app-splitter-update-output',
  templateUrl: './update-output.component.html',
  styleUrls: ['./update-output.component.scss']
})
export class SplitterUpdateOutputComponent implements OnInit {
    headers             : HttpHeaders   = this.authService.headers;
    loading             : boolean       = true;
    connection          : boolean       = false;
    outputId            : any;
    output              : any;
    outputsTypes        : any[]         = [];
    outputsTypesForm    : any[]         = [];
    selectedOutputType  : any;
    originalOutputType  : any;
    toHighlight         : string        = '';
    outputForm          : any[]         = [
        {
            id: 'output_type_id',
            label: this.translate.instant('HEADER.output_type'),
            type: 'select',
            control: new FormControl(),
            required: true,
            values: this.outputsTypes
        },
        {
            id: 'output_label',
            label: this.translate.instant('HEADER.label'),
            type: 'text',
            control: new FormControl(),
            required: true,
        }
    ];
    availableFields     : any           = [
        {
            "labelShort"    : 'HEADER.id',
            'label'         : 'HEADER.label'
        },
        {
            "labelShort"    : 'doctype',
            'label'         : 'SETTINGS.document_type'
        },
        {
            "labelShort"    : 'date',
            'label'         : 'TYPES.date'
        },
    ];
    testConnectionMapping : any         = {
        'export_maarch' : "testMaarchConnection()"
    };

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.outputId = this.route.snapshot.params['id'];

        this.http.get(API_URL + '/ws/outputs/getById/' + this.outputId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                /**
                 * Set the output type and output label
                 **/
                this.output = data;
                for (const field in data) {
                    if (data.hasOwnProperty(field)) {
                        this.outputForm.forEach(element => {
                            if (element.id === field) {
                                if (element.id === 'output_type_id') this.selectedOutputType = this.originalOutputType = data[field];
                                element.control.setValue(data[field]);
                            }
                        });
                    }
                }
                this.http.get(API_URL + '/ws/outputs/getOutputsTypes?module=splitter', {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        this.outputsTypes = data.outputs_types;
                        /**
                         * Create the form with auth and parameters data
                         **/
                        for (const _output of this.outputsTypes) {
                            this.outputsTypesForm[_output.output_type_id] = {
                                'auth' : [],
                                'parameters' : [],
                            };
                            for (const category in this.outputsTypesForm[_output.output_type_id]) {
                                if (_output.data.options[category]) {
                                    for (const option of _output.data.options[category]) {
                                        this.outputsTypesForm[_output.output_type_id][category].push({
                                            id: option.id,
                                            label: option.label,
                                            type: option.type,
                                            placeholder: option.placeholder,
                                            control: new FormControl(),
                                            required: option.required,
                                            isJson: option.isJson,
                                            hint: option.hint,
                                            webservice: option.webservice,
                                        });
                                    }
                                }
                            }
                        }
                        /**
                         * Fill the form (created with data in output_types) table with the value stored (in outputs table)
                         **/
                        for (const category in this.outputsTypesForm[this.originalOutputType]) {
                            this.outputsTypesForm[this.originalOutputType][category].forEach((element: any) => {
                                this.output.data.options[category].forEach((outputElement: any) => {
                                    if (element.id === outputElement.id) {
                                        if (outputElement.value) {
                                            if (outputElement.webservice) element.values = [outputElement.value];
                                            element.control.setValue(outputElement.value);
                                        }
                                    }
                                });
                            });
                            this.testConnection();
                        }
                    }),
                    finalize(() => {this.loading = false;}),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        this.router.navigate(['/settings/splitter/outputs']).then();
                        return of(false);
                    })
                ).subscribe();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/splitter/outputs']).then();
                return of(false);
            })
        ).subscribe();

         /**
        * Get custom fields
         **/
        this.http.get(API_URL + '/ws/customFields/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                let newField;
                data.customFields.forEach((field: {
                        id: any;
                        label_short: string;
                        module: string;
                        label: string;
                        type: string;
                        enabled: boolean;
                    }) => {
                        newField = {
                            'id': field.id,
                            'labelShort': field.label_short,
                            'label': field.label,
                            'enabled': field.enabled,
                        };
                        if (field.enabled)
                            this.availableFields.push(newField);
                    }
                );
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    displayFn(option: any) {
        return option ? option.value : undefined;
    }

    getErrorMessage(field: any, form: any) {
        let error: any;
        form.forEach((element: any) => {
            if (element.id === field && element.control.invalid) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }

                if (element.control.errors.json_error) {
                    error = this.translate.instant('ERROR.json_pattern');
                }
            }
        });
        return error;
    }

    changeOutputType(event: any) {
        this.selectedOutputType = event.value;
    }

    isValidForm(form: any) {
        let state = true;
        form.forEach((element: any) => {
            if ((element.control.status !== 'DISABLED' && element.control.status !== 'VALID') || element.control.value == null) {
                state = false;
            }
        });
        return state;
    }

    getValueFromForm(form: any, fieldId: any) {
        let value = '';
        form.forEach((element: any) => {
            if (fieldId === element.id) {
                value = element.control.value;
            }
        });
        return value;
    }

    retrieveDataFromWS(fieldId: any) {
        for (const cpt in this.outputsTypesForm[this.selectedOutputType]['parameters']) {
            const element = this.outputsTypesForm[this.selectedOutputType]['parameters'][cpt];
            if (element.id === fieldId) {
                if (!element.values || element.values.length === 1) {
                    eval("this." + element.webservice + '(' + cpt + ')');
                }
            }
        }
    }

    private _filter(value: any, array: any) {
        if (typeof value === 'string') {
            this.toHighlight = value;
            const filterValue = value.toLowerCase();
            return array.filter((option: any) => option.value.toLowerCase().indexOf(filterValue) !== -1);
        }else {
            return array;
        }
    }

    /**** Maarch Webservices call ****/
    testMaarchConnection() {
        const args = this.getMaarchConnectionInfo();
        this.http.post(API_URL + '/ws/maarch/testConnection', {'args': args}, {headers: this.authService.headers},
        ).pipe(
            tap((data: any) => {
                const status = data.status;
                if (status === true) {
                    this.notify.success(this.translate.instant('OUTPUT.maarch_connection_ok'));
                    this.connection = true;
                }
                else{
                    this.notify.error(this.translate.instant('OUTPUT.maarch_connection_ko') + ' : ' + status[1]);
                    this.connection = false;
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    getMaarchConnectionInfo() {
        return {
            'host': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'host'),
            'login': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'login'),
            'password': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'password'),
        };
    }

    getUsersFromMaarch(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMaarchConnectionInfo();
            this.http.post(API_URL + '/ws/maarch/getUsers', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return.users) {
                    const data = _return.users;
                    const users = [];
                    for (const cpt in data) {
                        users.push({
                            'id': data[cpt].id,
                            'value': data[cpt].firstname + ' ' +  data[cpt].lastname,
                            'extra': data[cpt].user_id
                        });
                    }
                    this.setAutocompleteValues(cpt, users);
                }
            });
        }
    }

    getEntitiesFromMaarch(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMaarchConnectionInfo();
            this.http.post(API_URL + '/ws/maarch/getEntities', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return.entities) {
                    const data = _return.entities;
                    const entities = [];
                    for (const cpt in data) {
                        entities.push({
                            'id': data[cpt].serialId,
                            'value': data[cpt].entity_label,
                            'extra': data[cpt].entity_id
                        });
                    }
                    this.setAutocompleteValues(cpt, entities);
                }
            });
        }
    }

    getDoctypesFromMaarch(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMaarchConnectionInfo();
            this.http.post(API_URL + '/ws/maarch/getDoctypes', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return.doctypes) {
                    const data = _return.doctypes;
                    const doctypes = [];
                    for (const cpt in data) {
                        doctypes.push({
                            'id': data[cpt].type_id,
                            'value': data[cpt].description,
                            'extra': data[cpt].type_id
                        });
                    }
                    this.setAutocompleteValues(cpt, doctypes);
                }
            });
        }
    }

    getPrioritiesFromMaarch(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMaarchConnectionInfo();
            this.http.post(API_URL + '/ws/maarch/getPriorities', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return.priorities) {
                    const data = _return.priorities;
                    const priorities = [];
                    for (const cpt in data) {
                        priorities.push({
                            'id': data[cpt].id,
                            'value': data[cpt].label,
                            'extra': data[cpt].id
                        });
                    }
                    this.setAutocompleteValues(cpt, priorities);
                }
            });
        }
    }

    getStatusesFromMaarch(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMaarchConnectionInfo();
            this.http.post(API_URL + '/ws/maarch/getStatuses', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return.statuses) {
                    const data = _return.statuses;
                    const statuses = [];
                    for (const cpt in data) {
                        statuses.push({
                            'id': data[cpt].id,
                            'value': data[cpt].label_status,
                            'extra': data[cpt].id
                        });
                    }
                    this.setAutocompleteValues(cpt, statuses);
                }
            });
        }
    }

    getIndexingModelsFromMaarch(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMaarchConnectionInfo();
            this.http.post(API_URL + '/ws/maarch/getIndexingModels', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return.indexingModels) {
                    const data = _return.indexingModels;
                    const indexingModels = [];
                    for (const cpt in data) {
                        indexingModels.push({
                            'id': data[cpt].id,
                            'value': data[cpt].label,
                            'extra': data[cpt].category
                        });
                    }
                    this.setAutocompleteValues(cpt, indexingModels);
                }
            });
        }
    }

    /**** END Maarch Webservices call  ****/

    updateOutput() {
        const _array: any = {
            "output_type_id": "",
            "output_label": "",
            "data": {
                "options": {
                    "auth": [],
                    "parameters": []
                }
            }
        };

        for (const category in this.outputsTypesForm[this.selectedOutputType]) {
            for (const cpt in this.outputsTypesForm[this.selectedOutputType][category]) {
                const field = this.outputsTypesForm[this.selectedOutputType][category][cpt];
                if (field.isJson) {
                    try {
                        JSON.parse(field.control.value);
                    } catch (error) {
                        field.control.setErrors({'json_error': true});
                        this.notify.error(this.translate.instant('OUTPUT.json_input_erorr', {"field": field.label}));
                        return;
                    }
                }

                _array['data']['options'][category].push({
                    id: field.id,
                    type: field.type,
                    webservice: field.webservice,
                    value: field.value === undefined ? field.control.value : field.value,
                });
            }
        }

        this.outputForm.forEach(element => {
            _array[element.id] = element.control.value;
        });

        this.http.put(API_URL + '/ws/outputs/update/' + this.outputId, {'args': _array},{headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('OUTPUT.output_updated'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/splitter/outputs']).then();
                return of(false);
            })
        ).subscribe();
    }

    setAutocompleteValues(cpt: number, array: any) {
        this.outputsTypesForm[this.selectedOutputType]['parameters'][cpt].values = this.sortArrayAlphab(array);
        /**
         * Ces 6 lignes sont obligatoires afin de filter les résultats des champs au fur et à mesure que l'on écrit
         */
        const element = this.outputsTypesForm[this.selectedOutputType]['parameters'][cpt];
        element.filteredOptions = element.control.valueChanges
            .pipe(
                startWith(''),
                map(option => option ? this._filter(option, element.values) : element.values)
            );
    }

    sortArrayAlphab(array: any) {
        return array.sort((a: any, b: any) => {
            const x = a.value.toUpperCase(),
                y = b.value.toUpperCase();
            return x === y ? 0 : x > y ? 1 : -1;
        });
    }

    testConnection() {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth)) {
            const functionName = this.testConnectionMapping[this.selectedOutputType];
            eval("this." + functionName);
        }
    }
}
