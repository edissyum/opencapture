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

 @dev : Nathan Cheval <nathan.cheval@outlook.fr>
 @dev : Oussama Brich <oussama.brich@edissyum.com> */

import { Component, OnInit } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import { SettingsService } from "../../../../../services/settings.service";
import { FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../../../../services/auth.service";

@Component({
    selector: 'app-workflow-builder-splitter',
    templateUrl: './workflow-builder.component.html',
    styleUrls: ['./workflow-builder.component.scss'],
    providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: {displayDefaultIndicatorType: false}
        }
    ]
})
export class WorkflowBuilderSplitterComponent implements OnInit {
    loading         : boolean       = true;
    creationMode    : boolean       = true;
    useInterface    : boolean       = false;
    separationMode  : string        = 'no_sep';
    workflowId      : any;
    stepValid       : any           = {
        input: false,
        process: false,
        separation: false,
        output: false
    };
    oldFolder       : string        = '';
    idControl       : FormControl   = new FormControl('', Validators.required);
    nameControl     : FormControl   = new FormControl('', Validators.required);

    form_outputs     : any          = [];
    workflow_outputs : any          = [];

    fields          : any           = {
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
                id: 'customer_id',
                show: true,
                label: this.translate.instant('WORKFLOW.associated_customer'),
                type: 'select',
                control: new FormControl(),
                required: false
            },
            {
                id: 'apply_process',
                show: true,
                label: this.translate.instant('WORKFLOW.apply_process'),
                type: 'boolean',
                control: new FormControl(true)
            },
            {
                id: 'splitter_method_id',
                show: true,
                label: this.translate.instant('WORKFLOW.splitter_method'),
                type: 'select',
                control: new FormControl(),
                required: true,
                values: []
            },
            {
                id: 'separate_by_document_number_value',
                show: true,
                label: this.translate.instant('WORKFLOW.separate_by_document_number_value'),
                type: 'number',
                control: new FormControl(2),
                required: false
            },
            {
                id: 'remove_blank_pages',
                show: true,
                label: this.translate.instant('WORKFLOW.remove_blank_pages'),
                type: 'boolean',
                control: new FormControl()
            }
        ],
        process: [
            {
                id: 'use_interface',
                show: true,
                label: this.translate.instant('WORKFLOW.use_interface'),
                type: 'boolean',
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
                id: 'rotation',
                multiple: false,
                label: this.translate.instant('WORKFLOW.rotation'),
                type: 'select',
                control: new FormControl(),
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
            }
        ]
    };

    constructor(
        private router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        private authService: AuthService,
        private notify: NotificationService,
        private translate: TranslateService,
        public serviceSettings: SettingsService
    ) {}

    ngOnInit() {
        this.serviceSettings.init();
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }

        this.workflowId = this.route.snapshot.params['id'];
        if (this.workflowId) {
            this.creationMode = false;
            this.http.get(environment['url'] + '/ws/workflows/splitter/getById/' + this.workflowId, {headers: this.authService.headers}).pipe(
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

        this.http.get(environment['url'] + '/ws/accounts/customers/list/splitter', {headers: this.authService.headers}).pipe(
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

        this.http.get(environment['url'] + '/ws/ai/splitter/list', {headers: this.authService.headers}).pipe(
            tap((aiModel: any) => {
                this.fields['input'].forEach((element: any) => {
                    if (element.id === 'ai_model_id') {
                        element.values = aiModel.models;
                        element.values.forEach((elem: any) => {
                            elem.label = elem.model_label;
                        });
                        element.values = [{'id': 0, 'label': this.translate.instant('WORKFLOW.no_ai_model_associated')}].concat(element.values);
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

        this.http.get(environment['url'] + '/ws/forms/splitter/list', {headers: this.authService.headers}).pipe(
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

        this.http.get(environment['url'] + '/ws/splitter/splitMethods', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.splitMethods.forEach((method: any) => {
                    this.fields['input'].forEach((element: any) => {
                        if (element.id === 'splitter_method_id') {
                            element.values.push(method);
                        }
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

        this.http.get(environment['url'] + '/ws/outputs/splitter/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.fields['output'].forEach((element: any) => {
                    if (element.id === 'outputs_id') {
                        element.values = data.outputs;
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
    }

    setSeparationMode(value: any) {
        this.separationMode = value;
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
        this.fields['process'].forEach((element: any) => {
            if (element.id === 'form_id' || element.id === 'allow_automatic_validation') {
                element.show = this.useInterface;
                if (element.id !== 'allow_automatic_validation') {
                    element.required = this.useInterface;
                }
            }
        });
        this.setUsedOutputs();
    }

    checkFolder(field: any) {
        if (field && field.control.value && field.control.value !== this.oldFolder) {
            this.http.post(environment['url'] + '/ws/workflows/splitter/verifyInputFolder',
                {'input_folder': field.control.value}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    field.control.setErrors();
                    this.notify.success(this.translate.instant('WORKFLOW.input_folder_ok'));
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

    isStepValid(step: any) {
        let valid = true;
        this.fields[step].forEach((element: any) => {
            if ((element.required && !element.control.value) || element.control.errors) {
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
            this.http.post(environment['url'] + '/ws/workflows/splitter/createScriptAndWatcher', {'args': data}, {headers: this.authService.headers}).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }

        this.http.put(environment['url'] + '/ws/workflows/splitter/update/' + this.workflowId, {'args': workflow}, {headers: this.authService.headers}).pipe(
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
            this.http.post(environment['url'] + '/ws/workflows/splitter/createScriptAndWatcher', {'args': data}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.http.post(environment['url'] + '/ws/workflows/splitter/create', {'args': workflow}, {headers: this.authService.headers}).pipe(
                        tap(() => {
                            this.router.navigate(['/settings/splitter/workflows']).then();
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
