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
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../../services/auth.service";
import { UserService } from "../../../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { environment } from "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { lastValueFrom, of } from "rxjs";

@Component({
  selector: 'app-update-model',
  templateUrl: './update-ai-model.component.html',
  styleUrls: ['./update-ai-model.component.scss']
})

export class UpdateVerifierAiModelComponent implements OnInit {
    loading             : boolean   = true;
    modelId             : number    = 0;
    doc_types           : any       = [];
    forms               : any       = [];
    formById            : any       = [];
    doctypesFormControl : any       = [];
    formsFormControl    : any       = [];
    tableData           : any       = [];
    chosenForm          : any       = [];
    chosenDocs          : any       = [];
    documents           : any       = [];
    len                 : number    = 0;
    splitterOrVerifier  : any       = 'verifier';
    modelForm           : any[]     = [
        {
            id: 'model_path',
            label: this.translate.instant("ARTIFICIAL-INTELLIGENCE.model_name"),
            type: 'text',
            control: new FormControl('', Validators.pattern("[a-zA-Z0-9+._-éùà)(î]+\\.sav+")),
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
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    async ngOnInit() {
        if (this.router.url.includes('/verifier/')) {
            this.splitterOrVerifier = 'verifier';
        } else if (this.router.url.includes('/splitter/')) {
            this.splitterOrVerifier = 'splitter';
        }
        this.serviceSettings.init();
        this.modelId = this.route.snapshot.params['id'];
        this.retrieveOCDoctypes();
        await this.retrieveForms();
        this.http.get(environment['url'] + '/ws/ai/getById/' + this.modelId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.documents = data.documents;
                const selectedFormId : any = [];
                this.len = this.documents.length;
                for (let i = 0; i < this.len; i++) {
                    if (this.splitterOrVerifier === 'splitter') {
                        for (const element of this.doc_types) {
                            if (element.id === this.documents[i].doctype) {
                                selectedFormId.push(element.formId);
                                break;
                            }
                        }
                        this.formById.push((this.forms.find((a: { id: number; }) => a.id === selectedFormId[i])).id);
                        this.chosenDocs[i] = this.doc_types.filter((a: { formId: number; }) => a.formId === selectedFormId[i]);
                    } else if (this.splitterOrVerifier === 'verifier') {
                        for (const doc of this.documents) {
                            if (doc.form) {
                                this.formById.push(doc.form);
                            }
                        }
                    }
                    this.doctypesFormControl.push(new FormControl(this.documents[i].doctype, [Validators.required]));
                    this.formsFormControl.push(new FormControl(this.formById[i], [Validators.required]));
                    this.tableData.push({Documents: this.documents[i].folder, Doctypes: this.documents[i].doctype, Formulaires: this.formById[i], id: i});
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
                this.router.navigate(['/settings/' + this.splitterOrVerifier + '/ai']).then();
                return of(false);
            })
        ).subscribe();
    }

    updateModel() {
        if (this.isValidForm(this.modelForm)) {
            const modelName = this.getValueFromForm(this.modelForm, 'model_path');
            const minProba = this.getValueFromForm(this.modelForm, 'min_proba');
            const doctypes = [];
            for (let i = 0; i < this.len; i++) {
                const fold = this.documents[i].folder;
                const formid = this.formsFormControl[i].value;
                const oc_targets = this.doctypesFormControl[i].value;
                doctypes.push({
                    folder: fold,
                    doctype: oc_targets,
                    form: formid
                });
            }
            if (this.modelId !== undefined) {
                this.http.post(environment['url'] + '/ws/ai/' + this.splitterOrVerifier + '/update/' + this.modelId, {
                    model_name: modelName, min_proba: minProba, doctypes: doctypes }, {headers: this.authService.headers}).pipe(
                    tap(() => {
                        this.notify.success(this.translate.instant('ARTIFICIAL-INTELLIGENCE.model_updated'));
                        this.router.navigate(['/settings/' + this.splitterOrVerifier + '/ai']).then();
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

    retrieveOCDoctypes() {
        this.doc_types = [];
        this.http.get(environment['url'] + '/ws/ai/list/document', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                let newDoctype;
                data.doctypes.forEach((doctype: any) => {
                    newDoctype = {
                        'id': doctype.id,
                        'key': doctype.key,
                        'code': doctype.code,
                        'label': doctype.label,
                        'type': doctype.type,
                        'status': doctype.status,
                        'isDefault': doctype.is_default,
                        'formId': doctype.form_id
                    };
                    this.doc_types.push(newDoctype);
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    async retrieveForms() {
        const retrieve = this.http.get(environment['url'] + '/ws/forms/' + this.splitterOrVerifier + '/list', {headers: this.authService.headers}).pipe(
            tap((forms: any) => {
                this.forms = forms.forms;
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

    onFormSelect(event: any, index: number) {
        const val = event.value;
        for (const element of this.forms) {
            if (element.id === val) {
                this.chosenForm[index] = element.id;
                this.chosenDocs[index] = this.doc_types.filter((a: { formId: number; }) => a.formId === this.chosenForm[index]);
            }
        }
        this.doctypesFormControl[index].value = this.chosenDocs[index][0].id;
    }
}
