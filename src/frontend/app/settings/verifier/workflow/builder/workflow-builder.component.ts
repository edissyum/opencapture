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

import { of } from "rxjs";
import { environment } from "../../../../env";
import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, finalize, tap } from "rxjs/operators";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import { AuthService } from "../../../../../services/auth.service";
import { SettingsService } from "../../../../../services/settings.service";
import { CodeEditorComponent } from "../../../../../services/code-editor/code-editor.component";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import {ConfigService} from "../../../../../services/config.service";

@Component({
    selector: 'app-workflow-builder',
    templateUrl: './workflow-builder.component.html',
    styleUrls: ['./workflow-builder.component.scss'],
    providers: [{
        provide: STEPPER_GLOBAL_OPTIONS,
        useValue: {
            displayDefaultIndicatorType: false
        }
    }]
})

export class WorkflowBuilderComponent implements OnInit {
    workflowId       : any;
    form_outputs     : any           = [];
    workflow_outputs : any           = [];
    loading          : boolean       = true;
    creationMode     : boolean       = true;
    outputAllowed    : boolean       = true;
    processAllowed   : boolean       = true;
    useInterface     : boolean       = false;
    allowWFScripting : boolean       = false;
    inputFolderOk    : boolean       = false;
    separationMode   : string        = 'no_sep';
    stepValid        : any           = {
        input: false,
        process: false,
        output: false
    };
    oldFolder        : string        = '';
    idControl        : FormControl   = new FormControl('', Validators.required);
    nameControl      : FormControl   = new FormControl('', Validators.required);
    fields           : any           = {
        input : [
            {
                id: 'input_folder',
                show: true,
                label: this.translate.instant('WORKFLOW.input_folder'),
                type: 'text',
                control: new FormControl(),
                placeholder: "/var/share/" + environment['customId'] + "/input",
                required: true
            },
            {
                id: 'customer_id',
                show: true,
                label: this.translate.instant('WORKFLOW.associated_customer'),
                type: 'select',
                control: new FormControl(),
                required: false
            },
            {
                id: 'ai_model_id',
                show: true,
                label: this.translate.instant('WORKFLOW.ai_model_id'),
                type: 'select',
                control: new FormControl(),
                required: false,
                hint: this.translate.instant('WORKFLOW.ai_model_id_hint')
            },
            {
                id: 'apply_process',
                show: true,
                label: this.translate.instant('WORKFLOW.apply_process'),
                type: 'boolean',
                control: new FormControl(true)
            },
            {
                id: 'facturx_only',
                show: true,
                label: this.translate.instant('WORKFLOW.facturx_only'),
                hint: this.translate.instant('WORKFLOW.facturx_only_hint'),
                type: 'boolean',
                control: new FormControl()
            },
            {
                id: 'splitter_method_id',
                show: true,
                label: this.translate.instant('WORKFLOW.splitter_method'),
                type: 'select',
                control: new FormControl('no_sep'),
                required: true,
                values: [
                    {
                        'id': 'no_sep',
                        'label': this.translate.instant('WORKFLOW.no_separation')
                    },
                    {
                        'id': 'qr_code_OC',
                        'label': this.translate.instant('WORKFLOW.qr_code_separation')
                    },
                    {
                        'id': 'c128_OC',
                        'label': this.translate.instant('WORKFLOW.c128_separation')
                    },
                    {
                        'id': 'separate_by_document_number',
                        'label': this.translate.instant('WORKFLOW.separate_by_document_number')
                    }
                ]
            },
            {
                id: 'separate_by_document_number_value',
                show: false,
                label: this.translate.instant('WORKFLOW.separate_by_document_number_value'),
                type: 'number',
                control: new FormControl(2),
                required: false
            },
            {
                id: 'rotation',
                multiple: false,
                label: this.translate.instant('WORKFLOW.rotation'),
                type: 'select',
                control: new FormControl('no_rotation'),
                required: true,
                show: true,
                values: [
                    {
                        'id': 'no_rotation',
                        'label': this.translate.instant('WORKFLOW.no_rotation')
                    },
                    {
                        'id': 90,
                        'label': this.translate.instant('WORKFLOW.rotate_90')
                    },
                    {
                        'id': 180,
                        'label': this.translate.instant('WORKFLOW.rotate_180')
                    },
                    {
                        'id': 270,
                        'label': this.translate.instant('WORKFLOW.rotate_270')
                    }
                ]
            },
            {
                id: 'remove_blank_pages',
                label: this.translate.instant('WORKFLOW.remove_blank_pages'),
                type: 'boolean',
                control: new FormControl()
            },
            {
                'id': 'script',
                'required': false,
                'control': new FormControl(),
                'show': false
            }
        ],
        process: [
            {
                id: 'use_interface',
                label: this.translate.instant('WORKFLOW.use_interface'),
                type: 'boolean',
                show: true,
                control: new FormControl()
            },
            {
                id: 'allow_automatic_validation',
                label: this.translate.instant('WORKFLOW.allow_automatic_validation'),
                hint: this.translate.instant('WORKFLOW.allow_automatic_validation_hint'),
                type: 'boolean',
                show: false,
                control: new FormControl()
            },
            {
                id: 'override_supplier_form',
                label: this.translate.instant('WORKFLOW.override_supplier_form'),
                type: 'boolean',
                show: false,
                control: new FormControl()
            },
            {
                id: 'delete_documents',
                label: this.translate.instant('WORKFLOW.delete_documents'),
                hint: this.translate.instant('WORKFLOW.delete_documents_hint'),
                type: 'boolean',
                show: true,
                control: new FormControl()
            },
            {
                id: 'form_id',
                multiple: false,
                label: this.translate.instant('POSITIONS-MASKS.form_associated'),
                type: 'select',
                control: new FormControl(),
                required: false,
                show: false,
                values: []
            },
            {
                id: 'system_fields',
                multiple: true,
                label: this.translate.instant('WORKFLOW.system_fields_to_search'),
                type: 'select',
                control: new FormControl(['name', 'invoice_number', 'quotation_number', 'document_date', 'document_due_date', 'footer']),
                required: false,
                show: true,
                values: [
                    {
                        'id': 'name',
                        'label': this.translate.instant('FORMS.supplier')
                    },
                    {
                        'id': 'invoice_number',
                        'label': this.translate.instant('FACTURATION.invoice_number')
                    },
                    {
                        'id': 'quotation_number',
                        'label': this.translate.instant('FACTURATION.quotation_number')
                    },
                    {
                        'id': 'delivery_number',
                        'label': this.translate.instant('FACTURATION.delivery_number')
                    },
                    {
                        'id': 'document_date',
                        'label': this.translate.instant('FACTURATION.document_date')
                    },
                    {
                        'id': 'document_due_date',
                        'label': this.translate.instant('FACTURATION.document_due_date')
                    },
                    {
                        'id': 'firstname_lastname',
                        'label': this.translate.instant('FACTURATION.firstname_lastname')
                    },
                    {
                        'id': 'footer',
                        'label': this.translate.instant('WORKFLOW.footer')
                    }
                ]
            },
            {
                id: 'custom_fields',
                multiple: true,
                label: this.translate.instant('WORKFLOW.custom_fields_to_search'),
                type: 'select',
                control: new FormControl(),
                required: false,
                show: true
            },
            {
                id: 'tesseract_function',
                multiple: false,
                label: this.translate.instant('WORKFLOW.tesseract_function'),
                hint: this.translate.instant('WORKFLOW.tesseract_function_hint'),
                type: 'select',
                control: new FormControl('line_box_builder'),
                required: true,
                show: true,
                values: [
                    {
                        'id': 'line_box_builder',
                        'label': this.translate.instant('WORKFLOW.line_box_builder')
                    },
                    {
                        'id': 'text_builder',
                        'label': this.translate.instant('WORKFLOW.text_builder')
                    }
                ]
            },
            {
                id: 'convert_function',
                multiple: false,
                label: this.translate.instant('WORKFLOW.convert_function'),
                hint: this.translate.instant('WORKFLOW.convert_function_hint'),
                type: 'select',
                control: new FormControl('pdf2image'),
                required: true,
                show: true,
                values: [
                    {
                        'id': 'pdf2image',
                        'label': 'pdf2image'
                    },
                    {
                        'id': 'imagemagick',
                        'label': 'ImageMagick'
                    }
                ]
            },
            {
                'id': 'script',
                'required': false,
                'control': new FormControl(),
                'show': false
            }
        ],
        output: [
            {
                id: 'outputs_id',
                label: this.translate.instant('WORKFLOW.choose_output'),
                type: 'select',
                multiple: true,
                control: new FormControl(['']),
                required: true
            },
            {
                'id': 'script',
                'required': false,
                'control': new FormControl(),
                'show': false
            }
        ]
    };

    constructor(
        private router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        private authService: AuthService,
        private notify: NotificationService,
        private translate: TranslateService,
        private configService: ConfigService,
        public serviceSettings: SettingsService
    ) {}

    ngOnInit() {
        this.serviceSettings.init();
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }

        const config = this.configService.getConfig()[0];
        this.allowWFScripting = config['GLOBAL']['allowwfscripting'];
        this.allowWFScripting = this.allowWFScripting.toString().toLowerCase() === 'true';

        this.workflowId = this.route.snapshot.params['id'];
        if (this.workflowId) {
            this.creationMode = false;
            this.http.get(environment['url'] + '/ws/workflows/verifier/getById/' + this.workflowId, {headers: this.authService.headers}).pipe(
                tap((workflow: any) => {
                    this.idControl.setValue(workflow.workflow_id);
                    this.nameControl.setValue(workflow.label);
                    Object.keys(this.fields).forEach((parent: any) => {
                        this.fields[parent].forEach((field: any) => {
                            let value = workflow[parent][field.id];
                            if (parseInt(value) && !Array.isArray(value)) {
                                value = parseInt(value);
                            }
                            if (value === 'true' || value === 'false' ) {
                                value = value === 'true';
                            }
                            if (field.id === 'splitter_method_id') {
                                this.setSeparationMode(value);
                            }
                            if (field.id === 'use_interface') {
                                this.setUseInterface(value);
                            }
                            if (field.id === 'input_folder') {
                                this.oldFolder = value;
                            }
                            if (field.id === 'outputs_id') {
                                this.workflow_outputs = value;
                            }
                            field.control.setValue(value);

                            if (field.id === 'input_folder') {
                                this.checkFolder(field, true, true);
                            }
                        });
                    });
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }

        this.http.get(environment['url'] + '/ws/accounts/customers/list/verifier', {headers: this.authService.headers}).pipe(
            tap((customers: any) => {
                this.fields['input'].forEach((element: any) => {
                    if (element.id === 'customer_id') {
                        element.values = customers.customers;
                        element.values.forEach((elem: any) => {
                            elem.label = elem.name;
                        });
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

        this.http.get(environment['url'] + '/ws/ai/verifier/list', {headers: this.authService.headers}).pipe(
            tap((aiModel: any) => {
                this.fields['input'].forEach((element: any) => {
                    if (element.id === 'ai_model_id') {
                        element.values = aiModel.models;
                        element.values.forEach((elem: any) => {
                            elem.label = elem.model_label;
                        });
                        element.values = [{'id': 0, 'label': this.translate.instant('WORKFLOW.no_ai_model_associated')}].concat(element.values);
                        if (element.values.length === 1) {
                            element.control.setValue(element.values[0].id);
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

        this.http.get(environment['url'] + '/ws/forms/verifier/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.fields['process'].forEach((element: any) => {
                    data.forms.forEach((form: any) => {
                        if (this.form_outputs.filter((f: any) => f.form_id === form.id).length === 0) {
                            this.form_outputs.push({
                                'form_id': form.id,
                                'outputs': form.outputs.map(Number)
                            });
                        }
                    });
                    if (element.id === 'form_id') {
                        element.values = data.forms;
                        if (data.forms.length === 1) {
                            element.control.setValue(data.forms[0].id);
                        }
                    }
                });
                if (this.useInterface) {
                    this.fields['process'].forEach((element: any) => {
                        if (element.id === 'form_id' && element.control.value) {
                            this.form_outputs.forEach((form: any) => {
                                if (form.form_id === element.control.value) {
                                    this.fields['output'].forEach((_element: any) => {
                                        if (_element.id === 'outputs_id') {
                                            _element.control.setValue(form.outputs.map(Number));
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/outputs/verifier/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.fields['output'].forEach((element: any) => {
                    if (element.id === 'outputs_id') {
                        element.values = data.outputs;
                        element.values.unshift({
                            "id": 0,
                            "output_label": this.translate.instant("WORKFLOW.no_output"),
                            "output_type_id": "no_output"
                        });
                        element.values.forEach((elem: any) => {
                            elem.label = elem.output_label;
                        });
                        if (data.outputs.length === 1) {
                            element.control.setValue(data.outputs[0].id);
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

        this.http.get(environment['url'] + '/ws/customFields/list?module=verifier', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.customFields) {
                    this.fields['process'].forEach((element: any) => {
                        if (element.id === 'custom_fields') {
                            element.values = data.customFields;
                        }
                    });
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.fields['input'].forEach((element: any) => {
            if (element.id === 'apply_process') {
                element.control.valueChanges.subscribe((value: any) => {
                    this.processAllowed = value;
                    this.fields['process'].forEach((elem: any) => {
                        if (elem.id === 'use_interface') {
                            if (value === false) {
                                this.outputAllowed = true;
                            }
                            if (value && elem.control.value) {
                                this.outputAllowed = false;
                            }
                        }

                        if (!this.processAllowed) {
                            elem.control.disable();
                        } else {
                            elem.control.enable();
                        }
                    });
                });
            }
            if (element.id === 'facturx_only') {
                element.control.valueChanges.subscribe((value: any) => {
                    this.fields['input'].forEach((elem: any) => {
                        if (elem.id === 'ai_model_id') {
                            elem.show = !value;
                        }
                    });
                    this.fields['process'].forEach((elem: any) => {
                        if (elem.id === 'system_fields') {
                            if (value) {
                                elem.values.push({'id': 'facturx', 'label': 'Lignes de détails Factur-X'});
                                elem.control.value.push('facturx');
                            } else {
                                elem.values = elem.values.filter((elem: any) => elem.id !== 'facturx');
                                elem.control.value = elem.control.value.filter((elem: any) => elem !== 'facturx');
                            }
                        }
                    });
                });
            }
        });
    }

    openCodeEditor(step: string) {
        let codeContent = '';
        this.fields[step].forEach((element: any) => {
            if (element.id === 'script' && element.control.value) {
                codeContent = element.control.value;
            }
        });

        const dialogRef = this.dialog.open(CodeEditorComponent, {
            data: {
                testScriptButton    : this.translate.instant('WORKFLOW.test_script'),
                confirmButton       : this.translate.instant('WORKFLOW.save_script'),
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
                step                : step,
                input_folder        : this.fields['input'].find((element: any) => element.id === 'input_folder').control.value,
                codeContent         : codeContent
            },
            width: "80vw",
            height: "calc(100vh - 5rem)",
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result !== false) {
                this.fields[step].push({
                    'show': false,
                    'id': 'script',
                    'required': false,
                    'control': new FormControl(result, Validators.required)
                });

                if (!this.creationMode) {
                    this.updateWorkflow(step);
                }
            }
        });
    }

    setSeparationMode(value: any) {
        this.separationMode = value;
        this.fields['input'].forEach((element: any) => {
            if (element.id === 'separate_by_document_number_value') {
                element.show = value === 'separate_by_document_number';
            }
        });
    }

    setUsedOutputs() {
        if (this.useInterface) {
            this.fields['output'].forEach((element: any) => {
                if (element.id === 'outputs_id') {
                    this.fields['process'].forEach((elem: any) => {
                        if (elem.id === 'form_id' && elem.control.value) {
                            this.form_outputs.forEach((form: any) => {
                                if (form.form_id === elem.control.value) {
                                    element.control.setValue(form.outputs);
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            this.fields['output'].forEach((element: any) => {
                if (element.id === 'outputs_id') {
                    element.control.setValue(this.workflow_outputs);
                }
            });
        }
    }

    setUseInterface(value: any) {
        this.useInterface = value;
        if (this.processAllowed) {
            this.outputAllowed = !value;
        }

        this.fields['process'].forEach((element: any) => {
            if (this.processAllowed) {
                element.control.enable();
            } else {
                element.control.disable();
            }

            if (element.id === 'form_id' || element.id === 'allow_automatic_validation' || element.id === 'override_supplier_form') {
                element.show = this.useInterface;
                if (!this.useInterface) {
                    element.control.disable(false);
                }
                if (element.type !== 'boolean') {
                    element.required = this.useInterface;
                }
            }
        });
        this.setUsedOutputs();
    }

    checkFolder(field: any, fromUser = false, auto = false) {
        if (fromUser || (field && field.control.value && field.control.value !== this.oldFolder)) {
            this.http.post(environment['url'] + '/ws/workflows/verifier/verifyInputFolder',
                {'input_folder': field.control.value}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.inputFolderOk = true;
                    field.control.setErrors();
                    if (!auto) {
                        this.notify.success(this.translate.instant('WORKFLOW.input_folder_ok'));
                    }
                    this.oldFolder = field.control.value;
                }),
                catchError((err: any) => {
                    this.inputFolderOk = false;
                    field.control.setErrors({'folder_not_found': true});
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    isStepValid(step: any) {
        let valid = true;
        this.fields[step].forEach((element: any) => {
            if ((element.required && !element.control.value) || (element.control.errors && element.id !== 'script')) {
                valid = false;
            }

            if (element.id == 'input_folder' && !this.inputFolderOk) {
                valid = false;
            }
        });
        this.stepValid[step] = valid;
        return valid;
    }

    updateWorkflow(step: any) {
        const workflow: any = {
            workflow_id: this.idControl.value,
            label: this.nameControl.value,
            input: {},
            process: {},
            output: {}
        };

        Object.keys(this.fields).forEach((parent: any) => {
            this.fields[parent].forEach((field: any) => {
                workflow[parent][field.id] = field.control.value;
            });
        });

        if (step === 'input') {
            const data = workflow['input'];
            data['workflow_id'] = this.idControl.value;
            data['workflow_label'] = this.nameControl.value;
            this.http.post(environment['url'] + '/ws/workflows/verifier/createScriptAndWatcher', {'args': data}, {headers: this.authService.headers}).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }

        this.http.put(environment['url'] + '/ws/workflows/verifier/update/' + this.workflowId, {'args': workflow}, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('WORKFLOW.workflow_updated'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    createWorkflow() {
        const workflow: any = {
            workflow_id: this.idControl.value,
            label: this.nameControl.value,
            input: {},
            process: {},
            output: {}
        };
        if (this.idControl.value && this.nameControl.value) {
            Object.keys(this.fields).forEach((parent: any) => {
                this.fields[parent].forEach((field: any) => {
                    workflow[parent][field.id] = field.control.value;
                });
            });

            const data = workflow['input'];
            data['workflow_id'] = this.idControl.value;
            data['workflow_label'] = this.nameControl.value;
            this.http.post(environment['url'] + '/ws/workflows/verifier/createScriptAndWatcher', {'args': data}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    delete data['workflow_id'];
                    delete data['workflow_label'];
                    this.http.post(environment['url'] + '/ws/workflows/verifier/create', {'args': workflow}, {headers: this.authService.headers}).pipe(
                        tap(() => {
                            this.router.navigate(['/settings/verifier/workflows']).then();
                            this.notify.success(this.translate.instant('WORKFLOW.workflow_created'));
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
        } else {
            this.notify.error(this.translate.instant('WORKFLOW.workflow_id_and_name_required'));
        }
    }

    updateOutputs(value: any) {
        if (value) {
            this.form_outputs.forEach((form: any) => {
                if (form.form_id === value) {
                    this.fields['output'].forEach((element: any) => {
                        if (element.id === 'outputs_id') {
                            element.control.setValue(form.outputs);
                        }
                    });
                }
            });
        }
    }
}
