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
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { AuthService } from "../../../../../services/auth.service";
import { UserService } from "../../../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { environment } from "../../../../env";
import { catchError, of, tap } from "rxjs";
import { finalize } from "rxjs/operators";

@Component({
  selector: 'app-create-model',
  templateUrl: './create-ai-model.component.html',
  styleUrls: ['./create-ai-model.component.scss']
})

export class CreateAiModelComponent implements OnInit {
    loading             : boolean   = true;
    docs                : any       = [];
    doctypes            : any       = [];
    docStatus           : any       = [];
    controls            : any       = [];
    formControl         : FormControl = new FormControl('');
    listModels          : any       = [];
    forms               : any       = [];
    chosenForm          : any       = [];
    chosenDocs          : any       = [];
    totalChecked        : number    = 0;
    splitterOrVerifier  : any       = 'verifier';
    modelForm           : any[]     = [
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
        private dialog: MatDialog,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    ngOnInit() {
        if (this.router.url.includes('/verifier/')) {
            this.splitterOrVerifier = 'verifier';
        } else if (this.router.url.includes('/splitter/')) {
            this.splitterOrVerifier = 'splitter';
        }
        this.serviceSettings.init();
        this.retrieveModels();
        this.retrieveDoctypes();
        this.retrieveOCDoctypes();
        this.retrieveForms();
    }

    retrieveDoctypes() {
        this.http.get(environment['url'] + '/ws/ai/' + this.splitterOrVerifier + '/getTrainDocuments', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.docs = data;
                this.docStatus.splice(0);
                for (const element of this.docs) {
                    this.docStatus.push({
                        doc: element,
                        isSelected: false,
                        linked_doctype: "",
                        linked_form: ""
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
        this.totalChecked = this.docStatus.filter((a: { isSelected: boolean }) => a.isSelected).length;
        this.onFormSelect({value: this.forms[0].id}, cpt, current_doc);
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

    changeOutputType(event: any, doc: string) {
        const val = event.value;
        const match = this.docStatus.find((a: { doc: string }) => a.doc === doc);
        match.linked_doctype = val;
        return true;
    }

    onFormSelect(event: any, index: number, doc: string) {
        const val = event.value;
        for (const element of this.forms) {
            if (element.id === val) {
                this.chosenForm[index] = element.id;
                this.chosenDocs[index] = this.doctypes.filter((a: { formId: number }) => a.formId === this.chosenForm[index]);
            }
        }
        if (this.splitterOrVerifier === 'splitter') {
            this.controls[index].value = this.chosenDocs[index][0].id;
        }
        const match = this.docStatus.find((a: { doc: string }) => a.doc === doc);
        if (this.splitterOrVerifier === 'splitter') {
            match.linked_doctype = this.chosenDocs[index][0].id;
        }
        match.linked_form = this.chosenForm[index];
    }

    createModel() {
        let start_training = true;
        if (this.isValidForm(this.modelForm) && this.totalChecked > 1 && this.isValidForm2(this.controls)) {
            const doctypes = [];
            const minProba = this.getValueFromForm(this.modelForm, 'min_proba');
            const label = this.getValueFromForm(this.modelForm, 'model_label');
            const modelName = label.toLowerCase().replace(/ /g, "_") + '.sav';
            const matches = this.docStatus.filter((a: { isSelected: boolean }) => a.isSelected);
            for (let i = 0; i < this.totalChecked; i = i + 1) {
                const fold = matches[i].doc;
                const formid = matches[i].linked_form;
                if (this.splitterOrVerifier === 'splitter') {
                    const ocTarget = matches[i].linked_doctype;
                    doctypes.push({
                        form: formid,
                        folder: fold,
                        doctype: ocTarget
                    });
                } else if (this.splitterOrVerifier === 'verifier')  {
                    doctypes.push({
                        form: formid,
                        folder: fold
                    });
                }
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
                this.http.post(environment['url'] + '/ws/ai/' + this.splitterOrVerifier + '/trainModel/' + modelName,
                    {label: label, docs: doctypes, min_proba: minProba, module: this.splitterOrVerifier},
                    {headers: this.authService.headers}).pipe(
                    catchError((err: any) => {
                        console.debug(err);
                        return of(false);
                    })
                ).subscribe();

                this.notify.success(this.translate.instant('ARTIFICIAL-INTELLIGENCE.created'));
                this.router.navigate(['/settings/' + this.splitterOrVerifier + '/ai']).then();
            }
        } else {
            if (this.totalChecked < 2) {
                this.notify.error(this.translate.instant('ARTIFICIAL-INTELLIGENCE.not_enough_checked'));
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
        this.http.get(environment['url'] + '/ws/ai/' + this.splitterOrVerifier + '/list?limit=', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.listModels = data.models;
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    retrieveForms() {
        this.http.get(environment['url'] + '/ws/forms/' + this.splitterOrVerifier + '/list', {headers: this.authService.headers}).pipe(
            tap((forms: any) => {
               this.forms = forms.forms;
               if (this.forms.length === 1) {
                   this.formControl.setValue(this.forms[0].id);
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

    displayDoctypes(form: any) {
        return !!form.value;
    }
}
