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
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import { SettingsService } from "../../../../../services/settings.service";
import {FormControl} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {environment} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../../../services/auth.service";

@Component({
    selector: 'app-workflow-builder',
    templateUrl: './workflow-builder.component.html',
    styleUrls: ['./workflow-builder.component.scss'],
    providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: {displayDefaultIndicatorType: false},
        },
    ],
})
export class WorkflowBuilderComponent implements OnInit {
    loading         : boolean       = true;
    creationMode    : boolean       = true;
    processAllowed  : boolean       = false;
    workflowId      : any;
    stepValid       : any           = {
        input: false,
        process: false,
        separation: false,
        output: false
    };
    idControl       : FormControl   = new FormControl();
    nameControl     : FormControl   = new FormControl();
    fields          : any           = {
        input : [
            {
                id: 'input_folder',
                label: this.translate.instant('INPUT.input_folder'),
                type: 'text',
                control: new FormControl(),
                placeholder: "/var/share/input",
                required: true,
            },
            {
                id: 'customer_id',
                label: this.translate.instant('INPUT.associated_customer'),
                type: 'select',
                control: new FormControl(),
                required: false,
            },
            {
                id: 'ai_model_id',
                label: this.translate.instant('INPUT.ai_model_id'),
                type: 'select',
                control: new FormControl(),
                required: false,
                hint: this.translate.instant('INPUT.ai_model_id_hint')
            },
            {
                id: 'apply_process',
                label: this.translate.instant('WORKFLOW.apply_process'),
                type: 'boolean',
                control: new FormControl()
            },
        ],
        process: [
            {
                id: 'rotation',
                label: this.translate.instant('WORKFLOW.rotation'),
                type: 'select',
                control: new FormControl(),
                required: true,
                values: [
                    {
                        'id': 'no_rotation',
                        'label': this.translate.instant('WORKFLOW.no_rotation'),
                    },
                    {
                        'id': 45,
                        'label': this.translate.instant('WORKFLOW.rotate_45')
                    },
                    {
                        'id': 90,
                        'label': this.translate.instant('WORKFLOW.rotate_90')
                    },
                    {
                        'id': 180,
                        'label': this.translate.instant('WORKFLOW.rotate_180')
                    }
                ]
            },
            {
                id: 'remove_blank_pages',
                label: this.translate.instant('INPUT.remove_blank_pages'),
                type: 'boolean',
                control: new FormControl()
            },
            {
                id: 'validate_using_interface',
                label: this.translate.instant('WORKFLOW.validate_using_interface'),
                type: 'boolean',
                control: new FormControl()
            }
        ],
        separation: [
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
                ]
            },
        ],
        output: [
            {

            }
        ]
    };

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private authService: AuthService,
        private notify: NotificationService,
        private translate: TranslateService,
        public serviceSettings: SettingsService,
    ) {}

    ngOnInit() {
        this.serviceSettings.init();
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }

        this.workflowId = this.route.snapshot.params['id'];
        if (this.workflowId) {
            this.creationMode = false;
            this.http.get(environment['url'] + '/ws/workflows/verifier/getById/' + this.workflowId, {headers: this.authService.headers}).pipe(
                tap((workflow: any) => {
                    this.idControl.setValue(workflow.workflow_id);
                    this.nameControl.setValue(workflow.label);
                    Object.keys(this.fields).forEach((parent: any) => {
                        this.fields[parent].forEach((field: any) => {
                            if (workflow[parent][field.id]) {
                                let value = workflow[parent][field.id];
                                if (parseInt(workflow[parent][field.id])) {
                                    value = parseInt(workflow[parent][field.id]);
                                }
                                if (workflow[parent][field.id] === 'true' || workflow[parent][field.id] === 'false' ) {
                                    value = workflow[parent][field.id] === 'true';
                                }
                                field.control.setValue(value);
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

        this.fields['input'].forEach((element: any) => {
            if (element.id === 'apply_process') {
                element.control.valueChanges.subscribe((value: any) => {
                    this.processAllowed = value;
                });
            }
        });
    }

    checkFolder(field: any) {
        if (field && field.control.value) {
            this.http.post(environment['url'] + '/ws/workflow/verifier/verifyInputFolder',
                {'input_folder': field.control.value}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    field.control.setErrors();
                    this.notify.success(this.translate.instant('WORKFLOW.input_folder_ok'));
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

    stepDisabled(step: any) {
        if (step === 'process') {
            return !this.stepValid['input'];
        }
        if (step === 'separation') {
            return !this.stepValid['input'] || (this.processAllowed && !this.stepValid['process']);
        }
        if (step === 'output') {
            return !this.stepValid['separation'] && (!this.stepValid['process'] || !this.stepValid['input']);
        }
        return false;
    }
}
