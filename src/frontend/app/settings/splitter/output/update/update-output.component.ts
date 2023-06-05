/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr>
 @dev : Oussama Brich <oussama.brich@edissyum.com> */

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormBuilder, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../../services/auth.service";
import { UserService } from "../../../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { environment } from  "../../../../env";
import { catchError, finalize, map, startWith, tap } from "rxjs/operators";
import { of } from "rxjs";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";

@Component({
    selector: 'app-splitter-update-output',
    templateUrl: './update-output.component.html',
    styleUrls: ['./update-output.component.scss']
})
export class SplitterUpdateOutputComponent implements OnInit {
    headers               : HttpHeaders   = this.authService.headers;
    loading               : boolean       = true;
    loadingCustomFields   : boolean       = true;
    connection            : boolean       = false;
    outputsTypes          : any[]         = [];
    outputsTypesForm      : any[]         = [];
    output                : any;
    outputId              : any;
    selectedOutputType    : any;
    originalOutputType    : any;
    toHighlight           : string        = '';
    allowedPath           : string        = '';
    outputForm            : any[]         = [
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
            required: true
        },
        {
            id: 'compress_type',
            label: this.translate.instant('OUTPUT.compress_type'),
            type: 'select',
            control: new FormControl(),
            values: [
                {
                    'id': '',
                    'label': marker('OUTPUT.no_compress')
                },
                {
                    'id': 'screen',
                    'label': marker('OUTPUT.compress_screen')
                },
                {
                    'id': 'ebook',
                    'label': marker('OUTPUT.compress_ebook')
                },
                {
                    'id': 'prepress',
                    'label': marker('OUTPUT.compress_prepress')
                },
                {
                    'id': 'printer',
                    'label': marker('OUTPUT.compress_printer')
                },
                {
                    'id': 'default',
                    'label': marker('OUTPUT.compress_default')
                }
            ],
            required: false
        },
        {
            id: 'ocrise',
            label: this.translate.instant('OUTPUT.enable_ocr'),
            type: 'select',
            control: new FormControl(),
            values: [
                {
                    'id': true,
                    'label': marker('OUTPUT.ocr_enabled')
                },
                {
                    'id': false,
                    'label': marker('OUTPUT.ocr_disabled')
                },
            ],
            required: false
        }
    ];
    availableFields       : any           = [
        {
            "labelShort"    : 'HEADER.id',
            'label'         : marker('HEADER.label')
        },
        {
            "labelShort"    : 'date',
            'label'         : marker('TYPES.date')
        },
        {
            "labelShort"    : 'id',
            'label'         : marker('SPLITTER.batch_identifier')
        },
        {
            "labelShort"    : 'document_identifier',
            'label'         : marker('SPLITTER.document_identifier')
        },
        {
            "labelShort"    : 'document_index',
            'label'         : marker('SPLITTER.document_index')
        },
        {
            "labelShort"    : 'validate_by_firstname',
            'label'         : marker('OUTPUT.validate_by_lastname')
        },
        {
            "labelShort"    : 'validate_by_firstname',
            'label'         : marker('OUTPUT.validate_by_firstname')
        },
        {
            "labelShort"    : 'doctype',
            'label'         : marker('SETTINGS.document_type')
        },
        {
            "labelShort"    : 'random',
            'label'         : marker('OUTPUT.random')
        },
        {
            "labelShort"    : 'filename',
            'label'         : marker('OUTPUT.filename')
        },
        {
            "labelShort"    : 'documents_count',
            'label'         : marker('OUTPUT.documents_count')
        },
        {
            "labelShort"    : 'fileIndex',
            'label'         : marker('OUTPUT.file_index')
        },
        {
            "labelShort"    : 'format',
            'label'         : marker('OUTPUT.format')
        },
        {
            "labelShort"    : 'zip_filename',
            'label'         : marker('OUTPUT.compressed_filename')
        }
    ];
    testConnectionMapping : any           = {
        'export_openads'   : "testOpenadsConnection()",
        'export_mem' : "testMEMConnection()",
        'export_cmis'   : "testCmisConnection()"
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

        this.http.get(environment['url'] + '/ws/outputs/splitter/getById/' + this.outputId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                /**
                 * Set the output type and output label
                 **/
                this.output = data;
                for (const field in data) {
                    if (data.hasOwnProperty(field)) {
                        this.outputForm.forEach(element => {
                            if (element.id === field) {
                                if (element.id === 'output_type_id') {
                                    this.selectedOutputType = this.originalOutputType = data[field];
                                }
                                element.control.setValue(data[field]);
                                if (element.id === 'compress_type') {
                                    if (data[field] === null || data[field] === undefined) {
                                        element.control.setValue('');
                                    }
                                }
                                if (element.id === 'ocrise') {
                                    if (data[field] === null || data[field] === undefined) {
                                        element.control.setValue('');
                                    }
                                }
                            }
                        });
                    }
                }
                this.http.get(environment['url'] + '/ws/outputs/splitter/allowedPath', {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        this.allowedPath = data.allowedPath;
                    }),
                    finalize(() => this.loading = false),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
                this.http.get(environment['url'] + '/ws/outputs/splitter/getOutputsTypes', {headers: this.authService.headers}).pipe(
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
                                        if (option.id === 'folder_out' && this.allowedPath) {
                                            option.placeholder = (this.allowedPath + '/output').replace(/\/\//g, '/');
                                            option.hint = this.translate.instant('GLOBAL.allowed_path', {allowedPath: this.allowedPath});
                                        }
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
        this.http.get(environment['url'] + '/ws/customFields/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                let newField;
                data.customFields.forEach((field: {
                        id: any
                        label_short: string
                        module: string
                        label: string
                        type: string
                        enabled: boolean
                    }) => {
                        newField = {
                            'id': field.id,
                            'labelShort': field.label_short,
                            'label': field.label,
                            'enabled': field.enabled
                        };
                        if (field.enabled) {
                            this.availableFields.push(newField);
                        }
                    }
                );
            }),
            finalize(() => this.loadingCustomFields = false),
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
        } else {
            return array;
        }
    }

    /**** CMIS Webservices call ****/
    testCmisConnection() {
        const args = this.getCmisConnectionInfo();
        this.http.post(environment['url'] + '/ws/splitter/cmis/testConnection', {'args': args}, {headers: this.authService.headers},
        ).pipe(
            tap((data: any) => {
                const status = data.status;
                if (status === true) {
                    this.notify.success(this.translate.instant('OUTPUT.cmis_connection_ok'));
                    this.connection = true;
                }
                else {
                    this.notify.error(this.translate.instant('OUTPUT.cmis_connection_ko') + ' : ' + data.message);
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

    getCmisConnectionInfo() {
        return {
            'cmis_ws': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'cmis_ws'),
            'login': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'login'),
            'password': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'password'),
            'folder': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'folder')
        };
    }

    /**** MEM Courrier Webservices call ****/
    testMEMConnection() {
        const args = this.getMEMConnectionInfo();
        this.http.post(environment['url'] + '/ws/mem/testConnection', {'args': args}, {headers: this.authService.headers},
        ).pipe(
            tap((data: any) => {
                const status = data.status;
                if (status === true) {
                    this.notify.success(this.translate.instant('OUTPUT.mem_connection_ok'));
                    this.connection = true;
                }
                else {
                    this.notify.error(this.translate.instant('OUTPUT.mem_connection_ko') + ' : ' + status[1]);
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

    getOpenadsConnectionInfo() {
        return {
            'openads_api': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'openads_api'),
            'login': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'login'),
            'password': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'password')
        };
    }

    /**** OpenADS Webservices call ****/
    testOpenadsConnection() {
        const args = this.getOpenadsConnectionInfo();
        this.http.post(environment['url'] + '/ws/splitter/openads/testConnection', {'args': args}, {headers: this.authService.headers},
        ).pipe(
            tap((data: any) => {
                const status = data.status;
                if (status === true) {
                    this.notify.success(this.translate.instant('OUTPUT.openads_connection_ok'));
                    this.connection = true;
                }
                else {
                    this.notify.error(this.translate.instant('OUTPUT.openads_connection_ko') + ' : ' + data.message);
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

    getMEMConnectionInfo() {
        return {
            'host': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'host'),
            'login': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'login'),
            'password': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'password')
        };
    }

    getUsersFromMem(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMEMConnectionInfo();
            this.http.post(environment['url'] + '/ws/mem/getUsers', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
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

    getEntitiesFromMem(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMEMConnectionInfo();
            this.http.post(environment['url'] + '/ws/mem/getEntities', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
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

    getDoctypesFromMem(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMEMConnectionInfo();
            this.http.post(environment['url'] + '/ws/mem/getDoctypes', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
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

    getPrioritiesFromMem(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMEMConnectionInfo();
            this.http.post(environment['url'] + '/ws/mem/getPriorities', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
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

    getStatusesFromMem(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMEMConnectionInfo();
            this.http.post(environment['url'] + '/ws/mem/getStatuses', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
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

    getIndexingModelsFromMem(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMEMConnectionInfo();
            this.http.post(environment['url'] + '/ws/mem/getIndexingModels', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
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

    /**** END MEM Courrier Webservices call  ****/

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
                    value: field.value === undefined ? field.control.value : field.value
                });
            }
        }

        this.outputForm.forEach(element => {
            _array[element.id] = element.control.value;
        });

        this.http.put(environment['url'] + '/ws/outputs/splitter/update/' + this.outputId, {'args': _array}, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('OUTPUT.output_updated'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
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
