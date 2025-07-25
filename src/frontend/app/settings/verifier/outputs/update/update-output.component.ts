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

import { Component, OnInit, PipeTransform, Pipe } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../../../../services/user.service";
import { _, TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormControl } from "@angular/forms";
import { AuthService } from "../../../../../services/auth.service";
import { environment } from  "../../../../env";
import { catchError, finalize, map, startWith, tap } from "rxjs/operators";
import { of } from "rxjs";
import { Clipboard } from '@angular/cdk/clipboard';

@Pipe({
    name: 'highlight',
    standalone: false
})
export class HighlightPipe implements PipeTransform {
    transform(text: string, search: string): string {
        if (search) {
            const pattern = search
                .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
                .split(' ')
                .filter((t:any) => t.length > 0)
                .join('|');
            const regex = new RegExp(pattern, 'gi');
            if (text) {
                return search ? text.replace(regex, match => `<b>${match}</b>`) : text;
            }
        }
        return text
    }
}

@Component({
    selector: 'update-output',
    templateUrl: './update-output.component.html',
    styleUrls: ['./update-output.component.scss'],
    standalone: false
})
export class UpdateOutputComponent implements OnInit {
    headers                 : HttpHeaders   = this.authService.headers;
    loading                 : boolean       = true;
    loadingCustomFields     : boolean       = true;
    connection              : boolean       = false;
    outputId                : any;
    output                  : any;
    selectedOutputType      : any;
    originalOutputType      : any;
    outputsTypes            : any[]         = [];
    outputsTypesForm        : any[]         = [];
    oldFolder               : string        = '';
    toHighlight             : string        = '';
    allowedPath             : string        = '';
    showPassword            : { [key: string]: boolean; } = {};
    outputForm              : any[]         = [
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
                    'label': _('OUTPUT.no_compress')
                },
                {
                    'id': 'screen',
                    'label': _('OUTPUT.compress_screen')
                },
                {
                    'id': 'ebook',
                    'label': _('OUTPUT.compress_ebook')
                },
                {
                    'id': 'prepress',
                    'label': _('OUTPUT.compress_prepress')
                },
                {
                    'id': 'printer',
                    'label': _('OUTPUT.compress_printer')
                },
                {
                    'id': 'default',
                    'label': _('OUTPUT.compress_default')
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
                    'label': _('OUTPUT.ocr_enabled')
                },
                {
                    'id': false,
                    'label': _('OUTPUT.ocr_disabled')
                }
            ],
            required: false
        }
    ];
    availableFields         : any           = [
        {
            'id': _('HEADER.technical_id'),
            'label': 'HEADER.label'
        },
        {
            'id': 'name',
            'label': 'ACCOUNTS.supplier_name'
        },
        {
            'id': 'supplier_id',
            'label': _('ACCOUNTS.supplier_id')
        },
        {
            'id': 'lastname',
            'label': 'ACCOUNTS.lastname'
        },
        {
            'id': 'firstname',
            'label': 'ACCOUNTS.firstname'
        },
        {
            'id': 'email',
            'label': 'FORMATS.email'
        },
        {
            'id': 'phone',
            'label': 'FORMATS.phone'
        },
        {
            'id': 'civility',
            'label': 'ACCOUNTS.civility'
        },
        {
            'id': 'function',
            'label': 'ACCOUNTS.function'
        },
        {
            'id': 'b64_file_content',
            'label': _('OUTPUT.b64_file_content')
        },
        {
            'id': 'original_filename',
            'label': _('VERIFIER.original_filename')
        },
        {
            'id': 'mime_type',
            'label': _('VERIFIER.mime_type')
        },
        {
            'id': 'vat_number',
            'label': 'ACCOUNTS.vat_number'
        },
        {
            'id': 'siret',
            'label': 'ACCOUNTS.siret'
        },
        {
            'id': 'siren',
            'label': 'ACCOUNTS.siren'
        },
        {
            'id': 'rccm',
            'label': 'ACCOUNTS.rccm'
        },
        {
            'id': 'duns',
            'label': 'ACCOUNTS.duns'
        },
        {
            'id': 'bic',
            'label': 'ACCOUNTS.bic'
        },
        {
            'id': 'invoice_number',
            'label': 'FACTURATION.invoice_number'
        },
        {
            'id': 'quotation_number',
            'label': 'FACTURATION.quotation_number'
        },
        {
            'id': 'current_date',
            'label': _('FACTURATION.current_date')
        },
        {
            'id': 'document_date_full',
            'label': _('FACTURATION.document_date')
        },
        {
            'id': 'document_date_year',
            'label': _('FACTURATION.document_date_year')
        },
        {
            'id': 'document_date_month',
            'label': _('FACTURATION.document_date_month')
        },
        {
            'id': 'document_date_day',
            'label': _('FACTURATION.document_date_day')
        },
        {
            'id': 'register_date_full',
            'label': _('FACTURATION.register_date')
        },
        {
            'id': 'register_date_year',
            'label': _('FACTURATION.register_date_year')
        },
        {
            'id': 'register_date_month',
            'label': _('FACTURATION.register_date_month')
        },
        {
            'id': 'register_date_day',
            'label': _('FACTURATION.register_date_day')
        },
        {
            'id': 'currency',
            'label': _('WORKFLOW.currency')
        },
        {
            'id': 'total_ht',
            'label': _('FACTURATION.total_ht')
        },
        {
            'id': 'total_ttc',
            'label': _('FACTURATION.total_ttc')
        },
        {
            'id': 'total_vat',
            'label': _('FACTURATION.total_vat')
        },
        {
            'id': 'delivery_number',
            'label': 'FACTURATION.delivery_number'
        }
    ];
    testConnectionMapping   : any           = {
        'export_mem' : "testMEMConnection",
        'export_coog' : "testCOOGConnection",
        'export_opencrm': "testOpenCRMConnection"
    };

    /**
     * Pour ajouter une nouvelle chaine sortante (e.g : Alfresco)
     * Rajouter une nouvelle ligne dans le tableau testConnectionMapping() contenant l'id de la nouvelle chaine et le nom de la fonction permettant de verifier la connection
     * Dans le JSON présent dans la table output_types, en se basant sur celui existant (export_mem), créer vos champs par défaut
     * Attention à bien garder les clé "auth" et "parameters" présentes
     * Si un champs "parameters" à besoin de récupérer des données depuis un WS de la solution cible (e.g récupération des utilisateurs MEM Courrier)
     * Rajouter une ligne dans le JSON 'webservice' avec un nom de fonction (sans mettre les parenthèses)
     * Créer cette fonction et faites le process permettant de récupérer les données
     * Les données doivent être formatés comme suit : {'id': XX, 'value': XX} et être mise dans la clé "values" du champ
     * Regarder la fonction getUsersMEM() pour voir le fonctionnement
     * Du côté des webservices permettant l'execution des chaînes sortantes, il faut créer un WS dans le fichier rest/verifier.py
     * La route doit être : verifier/documents/<int:document_id>/output_type_id (e.g : verifier/documents/<int:document_id>/export_mem)
    **/

    constructor(
        public router: Router,
        private http: HttpClient,
        public clipboard: Clipboard,
        private route: ActivatedRoute,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.outputId = this.route.snapshot.params['id'];

        this.http.get(environment['url'] + '/ws/outputs/verifier/getById/' + this.outputId, {headers: this.authService.headers}).pipe(
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
                this.http.get(environment['url'] + '/ws/outputs/verifier/allowedPath', {headers: this.authService.headers}).pipe(
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
                this.http.get(environment['url'] + '/ws/outputs/verifier/getOutputsTypes', {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        this.http.get(environment['url'] + '/ws/customFields/list?module=verifier', {headers: this.authService.headers}).pipe(
                            tap((data: any) => {
                                data['customFields'].forEach((field: any) => {
                                    this.availableFields.push({
                                        'id': 'custom_' + field.id,
                                        'label': field.label
                                    });
                                });
                            }),
                            finalize(() => this.loadingCustomFields = false),
                            catchError((err: any) => {
                                console.debug(err);
                                this.notify.handleErrors(err);
                                return of(false);
                            })
                        ).subscribe();
                        this.outputsTypes = data['outputs_types'];
                        /**
                         * Create the form with auth and parameters data
                         **/
                        for (const _output of this.outputsTypes) {
                            this.outputsTypesForm[_output.output_type_id] = {
                                'auth' : [],
                                'links' : [],
                                'parameters' : []
                            };
                            for (const category in this.outputsTypesForm[_output.output_type_id]) {
                                if (_output.data.options[category]) {
                                    for (const option of _output.data.options[category]) {
                                        if (option.id === 'folder_out' && this.allowedPath) {
                                            option.placeholder = (this.allowedPath + '/output').replace(/\/\//g, '/');
                                            option.hint = this.translate.instant('GLOBAL.allowed_path', {allowedPath: this.allowedPath});
                                        }

                                        if (option.type == 'password') {
                                            this.showPassword[option.id] = false;
                                        }

                                        this.outputsTypesForm[_output.output_type_id][category].push({
                                            id: option.id,
                                            label: option.label,
                                            type: option.type,
                                            placeholder: option.placeholder,
                                            control: new FormControl(),
                                            required: option.required == 'true',
                                            isJson: option.isJson,
                                            hint: option.hint,
                                            webservice: option.webservice
                                        });
                                    }
                                } else if (category === 'links') {
                                    delete this.outputsTypesForm[_output.output_type_id].links;
                                }
                            }
                        }
                        /**
                         * Fill the form (created with data in output_types) table with the value stored (in outputs table)
                         **/
                        for (const category in this.outputsTypesForm[this.originalOutputType]) {
                            this.outputsTypesForm[this.originalOutputType][category].forEach((element: any) => {
                                if (this.output.data.options[category]) {
                                    this.output.data.options[category].forEach((outputElement: any) => {
                                        if (element.id === outputElement.id) {
                                            if (outputElement.value) {
                                                if (outputElement.webservice) {
                                                    element.values = [outputElement.value];
                                                }
                                                element.control.setValue(outputElement.value);
                                            }
                                        }
                                    });
                                }
                            });
                            this.testConnection();
                        }
                    }),
                    finalize(() => this.loading = false),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        this.router.navigate(['/settings/verifier/outputs']).then();
                        return of(false);
                    })
                ).subscribe();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/verifier/outputs']).then();
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
            if ((element.control.status !== 'DISABLED' && element.control.status !== 'VALID') || (element.required && element.control.value == null)) {
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

    retrieveDataFromWS(fieldId: any, category: string = 'parameters') {
        for (const cpt in this.outputsTypesForm[this.selectedOutputType][category]) {
            const element = this.outputsTypesForm[this.selectedOutputType][category][cpt];
            if (element.id === fieldId) {
                if ((!element.values || element.values.length === 1) && element.webservice) {
                    // @ts-ignore
                    this[element.webservice](cpt);
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

    /**** OpenCRM Webservices call ****/
    testOpenCRMConnection() {
        const args = this.getOpenCRMConnectionInfo();
        this.http.post(environment['url'] + '/ws/opencrm/getAccessToken', {'args': args}, {headers: this.authService.headers},
        ).pipe(
            tap((data: any) => {
                const status = data.status[0];
                if (status === true) {
                    this.notify.success(this.translate.instant('OUTPUT.opencrm_connection_ok'));
                    this.connection = true;
                } else {
                    this.notify.error('<strong>' + this.translate.instant('OUTPUT.opencrm_connection_ko') + '</strong> : ' + data.status[1]);
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


    getOpenCRMConnectionInfo() {
        return {
            'host': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'host'),
            'client_id': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'client_id'),
            'client_secret': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'client_secret')
        };
    }

    /**** COOG Webservices call ****/
    testCOOGConnection() {
        const args = this.getCOOGConnectionInfo();
        this.http.post(environment['url'] + '/ws/coog/getAccessToken', {'args': args}, {headers: this.authService.headers},
        ).pipe(
            tap((data: any) => {
                const status = data.status[0];
                if (status === true) {
                    this.notify.success(this.translate.instant('OUTPUT.coog_connection_ok'));
                    this.connection = true;
                } else {
                    this.notify.error('<strong>' + this.translate.instant('OUTPUT.coog_connection_ko') + '</strong> : ' + data.status[1]);
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

    getCOOGConnectionInfo() {
        return {
            'host': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'host'),
            'token': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'token'),
            'cert_path': this.getValueFromForm(this.outputsTypesForm[this.selectedOutputType].auth, 'cert_path')
        };
    }

    /**** MEM Courrier Webservices call ****/
    testMEMConnection() {
        const args = this.getMEMConnectionInfo();
        this.http.post(environment['url'] + '/ws/mem/testConnection', {'args': args}, {headers: this.authService.headers},
        ).pipe(
            tap((data: any) => {
                const status = data.status[0];
                if (status === true) {
                    this.notify.success(this.translate.instant('OUTPUT.mem_connection_ok'));
                    this.connection = true;
                } else {
                    this.notify.error('<strong>' + this.translate.instant('OUTPUT.mem_connection_ko') + '</strong> : ' + data.status[1]);
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
                if (_return && _return[0].users) {
                    const data = _return[0].users;
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
                            'id': data[cpt]['serialId'],
                            'value': data[cpt]['entity_label'],
                            'extra': data[cpt]['entity_id']
                        });
                    }
                    this.setAutocompleteValues(cpt, entities);
                }
            });
        }
    }

    getCustomFieldsFromMem(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMEMConnectionInfo();
            this.http.post(environment['url'] + '/ws/mem/getCustomFields', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return['customFields']) {
                    const data = _return['customFields'];
                    const customFields = [];
                    for (const cpt in data) {
                        customFields.push({
                            'id': data[cpt].id,
                            'value': data[cpt].label,
                            'extra': data[cpt].id
                        });
                    }
                    this.setAutocompleteValues(cpt, customFields, 'links');
                }
            });
        }
    }

    getContactsCustomFieldsFromMem(cpt: any) {
        if (this.isValidForm(this.outputsTypesForm[this.selectedOutputType].auth) && this.connection) {
            const args = this.getMEMConnectionInfo();
            this.http.post(environment['url'] + '/ws/mem/getContactsCustomFields', {'args': args}, {headers: this.authService.headers}).toPromise().then((_return: any) => {
                if (_return && _return['customFields']) {
                    const data = _return['customFields'];
                    const customFields = [];
                    for (const cpt in data) {
                        customFields.push({
                            'id': data[cpt].id,
                            'value': data[cpt].label,
                            'extra': data[cpt].id
                        });
                    }
                    this.setAutocompleteValues(cpt, customFields, 'links');
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
                            'id': data[cpt]['type_id'],
                            'value': data[cpt].description,
                            'extra': data[cpt]['type_id']
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
                if (_return && _return['priorities']) {
                    const data = _return['priorities'];
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
                if (_return && _return['statuses']) {
                    const data = _return['statuses'];
                    const statuses = [];
                    for (const cpt in data) {
                        statuses.push({
                            'id': data[cpt].id,
                            'value': data[cpt]['label_status'],
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
                if (_return && _return['indexingModels']) {
                    const data = _return['indexingModels'];
                    const indexingModels = [];
                    for (const cpt in data) {
                        indexingModels.push({
                            'id': data[cpt].id,
                            'value': data[cpt].label,
                            'extra': data[cpt]['category']
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
                    "links": [],
                    "parameters": []
                }
            }
        };

        for (const category in this.outputsTypesForm[this.selectedOutputType]) {
            if (this.outputsTypesForm[this.selectedOutputType][category]) {
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

                    _array.data.options[category].push({
                        id: field.id,
                        type: field.type,
                        webservice: field.webservice,
                        value: field.value === undefined ? field.control.value : field.value
                    });
                }
            }
        }
        if (_array.data.options['links'].length === 0) {
            delete _array.data.options.links;
        }

        this.outputForm.forEach(element => {
            _array[element.id] = element.control.value;
        });

        this.http.put(environment['url'] + '/ws/outputs/verifier/update/' + this.outputId, {'args': _array}, {headers: this.authService.headers}).pipe(
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

    setAutocompleteValues(cpt: number, array: any, category: string = 'parameters') {
        this.outputsTypesForm[this.selectedOutputType][category][cpt].values = this.sortArrayAlphab(array);
        /**
         * Ces 6 lignes sont obligatoires afin de filter les résultats des champs au fur et à mesure que l'on écrit
         */
        const element = this.outputsTypesForm[this.selectedOutputType][category][cpt];
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
            if (functionName) {
                // @ts-ignorefeval
                this[functionName]();
            }
        }
    }

    checkFolder(field: any, fromUser = false) {
        if (fromUser || (field && field.control.value && field.control.value !== this.oldFolder)) {
            this.http.post(environment['url'] + '/ws/outputs/verifier/verifyFolderOut',
                {'folder_out': field.control.value}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    field.control.setErrors();
                    this.notify.success(this.translate.instant('OUTPUT.folder_out_ok'));
                    this.oldFolder = field.control.value;
                }),
                catchError((err: any) => {
                    field.control.setErrors({'folder_not_found': true});
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }
}
