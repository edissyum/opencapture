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
import { FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../../services/auth.service";
import { UserService } from "../../../../../services/user.service";
import { _, TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { environment } from "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { lastValueFrom, of } from "rxjs";

@Component({
    selector: 'app-update-model',
    templateUrl: './update-ai-model.component.html',
    styleUrls: ['./update-ai-model.component.scss'],
    standalone: false
})

export class UpdateVerifierAiModelComponent implements OnInit {
    loading             : boolean   = true;
    modelId             : number    = 0;
    doc_types           : any       = [];
    workflows           : any       = [];
    worklowById         : any       = [];
    workflowsFormControl: any       = [];
    tableData           : any       = [];
    choseWorkflow       : any       = [];
    chosenDocs          : any       = [];
    documents           : any       = [];
    len                 : number    = 0;
    modelForm           : any[]     = [
        {
            id: 'model_label',
            label: this.translate.instant("ARTIFICIAL-INTELLIGENCE.model_name"),
            type: 'text',
            control: new FormControl(''),
            required: true
        },
        {
            id: 'model_path',
            label: this.translate.instant("ARTIFICIAL-INTELLIGENCE.model_path"),
            type: 'text',
            control: new FormControl(''),
            required: true
        },
        {
            id: 'min_proba',
            label: this.translate.instant("ARTIFICIAL-INTELLIGENCE.min_proba"),
            type: 'text',
            control: new FormControl(''),
            required: true
        }
    ];

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {}

    async ngOnInit() {
        this.modelForm.forEach((element: any) => {
            if (element.id === 'model_path') {
                element.control.valueChanges.subscribe((value: any) => {
                    if (value && value.includes('/')) {
                        element.control.setValue(value.replace('/', ''));
                    }
                });
            }
        });

        this.serviceSettings.init();
        this.modelId = this.route.snapshot.params['id'];
        await this.retrieveWorkflows();
        this.http.get(environment['url'] + '/ws/ai/getById/' + this.modelId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.documents = data.documents;
                this.len = this.documents.length;
                for (let i = 0; i < this.len; i++) {
                    for (const doc of this.documents) {
                        if (doc.workflow_id) {
                            this.worklowById.push(doc.workflow_id);
                        }
                    }
                    this.workflowsFormControl.push(new FormControl(this.worklowById[i], [Validators.required]));
                    this.tableData.push({Documents: this.documents[i].folder, Formulaires: this.worklowById[i], id: i});
                }

                for (const field in data) {
                    if (data.hasOwnProperty(field)) {
                        this.modelForm.forEach(element => {
                            if (element.id === field) {
                                element.control.setValue(data[field]);
                                if (element.id === 'compress_type') {
                                    if (data[field] === null || data[field] === undefined) {
                                        element.control.setValue('');
                                    }
                                }
                            }
                        });
                    }
                }
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/verifier/ai']).then();
                return of(false);
            })
        ).subscribe();
    }

    updateModel() {
        if (this.isValidForm(this.modelForm)) {
            const minProba = this.getValueFromForm(this.modelForm, 'min_proba');
            const modelPath = this.getValueFromForm(this.modelForm, 'model_path');
            const modelLabel = this.getValueFromForm(this.modelForm, 'model_label');
            const documents = [];
            for (let i = 0; i < this.len; i++) {
                const fold = this.documents[i].folder;
                const workflow_id = this.workflowsFormControl[i].value;
                documents.push({
                    folder: fold,
                    workflow_id: workflow_id
                });
            }
            if (this.modelId !== undefined) {
                this.http.post(environment['url'] + '/ws/ai/verifier/update/' + this.modelId, {
                    model_path: modelPath, model_label: modelLabel, min_proba: minProba, documents: documents }, {headers: this.authService.headers}).pipe(
                    tap(() => {
                        this.notify.success(this.translate.instant('ARTIFICIAL-INTELLIGENCE.model_updated'));
                        this.router.navigate(['/settings/verifier/ai']).then();
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }
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

    getValueFromForm(form: any, fieldId: any) {
        let value = '';
        form.forEach((element: any) => {
            if (fieldId === element.id) {
                value = element.control.value;
            }
        });
        return value;
    }

    async retrieveWorkflows() {
        const retrieve = this.http.get(environment['url'] + '/ws/workflows/verifier/list', {headers: this.authService.headers}).pipe(
            tap((workflows: any) => {
                this.workflows = workflows.workflows;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        );
        return await lastValueFrom(retrieve).then();
    }

    onWorkflowSelect(event: any, index: number) {
        const val = event.value;
        for (const element of this.workflows) {
            if (element.id === val) {
                this.choseWorkflow[index] = element.workflow_id;
                this.chosenDocs[index] = this.doc_types.filter((a: { workflowId: number; }) => a.workflowId === this.choseWorkflow[index]);
            }
        }
    }
}
