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

 @dev : Tristan Coulange <tristan.coulange@free.fr> */

import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { FormControl, Validators } from "@angular/forms";
import { AuthService } from "../../../../../services/auth.service";
import { UserService } from "../../../../../services/user.service";
import { _, TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { environment } from "../../../../env";
import { catchError, of, tap } from "rxjs";
import { finalize } from "rxjs/operators";

@Component({
    selector: 'app-create-model',
    templateUrl: './create-ai-model.component.html',
    styleUrls: ['./create-ai-model.component.scss'],
    standalone: false
})

export class CreateVerifierAiModelComponent implements OnInit {
    totalChecked        : number        = 0;
    docs                : any           = [];
    doctypes            : any           = [];
    docStatus           : any           = [];
    controls            : any           = [];
    listModels          : any           = [];
    workflows           : any           = [];
    chosenWorkflow      : any           = [];
    chosenDocs          : any           = [];
    loading             : boolean       = true;
    formControl         : FormControl   = new FormControl('');
    modelForm           : any[]         = [
        {
            id: 'model_label',
            label: this.translate.instant("ARTIFICIAL-INTELLIGENCE.model_name"),
            placeholder: this.translate.instant("ARTIFICIAL-INTELLIGENCE.model_name_placeholder"),
            type: 'text',
            control: new FormControl(''),
            required: true
        },
        {
            id: 'min_proba',
            label: this.translate.instant("ARTIFICIAL-INTELLIGENCE.min_proba"),
            type: 'text',
            control: new FormControl('', Validators.pattern("^[1-9][0-9]?$|^100$")),
            required: true
        }
    ];

    constructor(
        public router: Router,
        private http: HttpClient,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    ngOnInit() {
        this.serviceSettings.init();

        this.modelForm.forEach((element: any) => {
            if (element.id === 'model_label') {
                element.control.valueChanges.subscribe((value: any) => {
                    if (value && value.includes('/')) {
                        element.control.setValue(value.replace('/', ''));
                    }
                });
            }
        });

        this.retrieveModels();
        this.retrieveDoctypes();
        this.retrieveOCDoctypes();
        this.retrieveForms();
    }

    retrieveDoctypes() {
        this.http.get(environment['url'] + '/ws/ai/verifier/getTrainDocuments', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.docs = data;
                this.docStatus.splice(0);
                for (const element of this.docs) {
                    this.docStatus.push({
                        doc: element,
                        isSelected: false,
                        linked_doctype: "",
                        linked_workflow: ""
                    });
                    this.controls.push(new FormControl(''));
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    checkSelectedBatch(cpt: number, current_doc: any) {
        this.totalChecked = this.docStatus.filter((a: { isSelected: boolean; }) => a.isSelected).length;
        this.onWorkflowSelect({value: this.workflows[0].workflow_id}, cpt, current_doc);
    }

    retrieveOCDoctypes() {
        this.doctypes = [];
        this.http.get(environment['url'] + '/ws/ai/list/' + 'document', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                let newDoctype;
                data.doctypes.forEach((doctype: any) => {
                    newDoctype = {
                        'id': doctype.id,
                        'key': doctype.key,
                        'type': doctype.type,
                        'code': doctype.code,
                        'label': doctype.label,
                        'status': doctype.status,
                        'formId': doctype.form_id,
                        'isDefault': doctype.is_default
                    };
                    this.doctypes.push(newDoctype);
                });
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    getErrorMessage(field: any, form: any) {
        let error: any;
        form.forEach((element: any) => {
            if (element.id === field) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }

    onWorkflowSelect(event: any, index: number, doc: string) {
        const val = event.value;
        for (const element of this.workflows) {
            if (element.id === val) {
                this.chosenWorkflow[index] = element.workflow_id;
                this.chosenDocs[index] = this.doctypes.filter((a: { formId: number; }) => a.formId === this.chosenWorkflow[index]);
            }
        }
        const match = this.docStatus.find((a: { doc: string; }) => a.doc === doc);
        match.linked_workflow = this.chosenWorkflow[index];
    }

    createModel() {
        let start_training = true;
        if (this.isValidForm(this.modelForm) && this.totalChecked > 1 && this.isValidForm2(this.controls)) {
            const doctypes = [];
            const minProba = this.getValueFromForm(this.modelForm, 'min_proba');
            const label = this.getValueFromForm(this.modelForm, 'model_label');
            const modelName = label.toLowerCase().replace(/ /g, "_") + '.sav';
            const matches = this.docStatus.filter((a: { isSelected: boolean; }) => a.isSelected);
            for (let i = 0; i < this.totalChecked; i = i + 1) {
                const fold = matches[i].doc;
                const workflow_id = matches[i].linked_workflow;
                doctypes.push({
                    workflow_id: workflow_id,
                    folder: fold
                });
            }

            for (const element of this.listModels) {
                const exists = Object.values(element).includes(modelName);
                if (exists) {
                    this.notify.error(this.translate.instant('ARTIFICIAL-INTELLIGENCE.already_existing_model'));
                    start_training = false;
                    break;
                }
            }
            if (start_training) {
                this.http.post(environment['url'] + '/ws/ai/verifier/trainModel/' + modelName,
                    {label: label, docs: doctypes, min_proba: minProba},
                    {headers: this.authService.headers}).pipe(
                    catchError((err: any) => {
                        console.debug(err);
                        return of(false);
                    })
                ).subscribe();

                this.notify.success(this.translate.instant('ARTIFICIAL-INTELLIGENCE.created'));
                this.router.navigate(['/settings/verifier/ai']).then();
            }
        } else if (this.totalChecked < 2) {
            this.notify.error(this.translate.instant('ARTIFICIAL-INTELLIGENCE.not_enough_checked'));
        }
    }

    isValidForm(form: any) {
        let state = true;
        form.forEach((element: any) => {
            if ((element.control.status !== 'DISABLED' && element.control.status !== 'VALID') || element.control.value == null) {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }

    isValidForm2(form: any) {
        let state = true;
        form.forEach((element: any) => {
            if ((element.status !== 'DISABLED' && element.status !== 'VALID') || element.value == null) {
                state = false;
            }
            element.markAsTouched();
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

    retrieveModels() {
        this.http.get(environment['url'] + '/ws/ai/verifier/list?limit=', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.listModels = data['models'];
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    retrieveForms() {
        this.http.get(environment['url'] + '/ws/workflows/verifier/list', {headers: this.authService.headers}).pipe(
            tap((workflows: any) => {
               this.workflows = workflows.workflows;
               if (this.workflows.length === 1) {
                   this.formControl.setValue(this.workflows[0].workflow_id);
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
}
