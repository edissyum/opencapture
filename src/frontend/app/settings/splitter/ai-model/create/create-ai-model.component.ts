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
import {DocumentTypeComponent} from "../../../../splitter/document-type/document-type.component";

@Component({
  selector: 'app-create-model',
  templateUrl: './create-ai-model.component.html',
  styleUrls: ['./create-ai-model.component.scss']
})

export class CreateSplitterAiModelComponent implements OnInit {
    loading             : boolean   = true;
    forms               : any       = [];
    AiModel             : any       = {
        id             : 0,
        trainFolders : [],
        fields         : [
            {
                id: 'model_label',
                label: this.translate.instant("ARTIFICIAL-INTELLIGENCE.model_label"),
                type: 'text',
                control: new FormControl('', Validators.required),
                required: true
            },
            {
                id: 'model_path',
                label: this.translate.instant("ARTIFICIAL-INTELLIGENCE.model_path"),
                type: 'text',
                control: new FormControl('', Validators.pattern("[a-zA-Z0-9+._-éùà)(î]+\\.sav+")),
                required: true
            },
            {
                id: 'min_proba',
                label: this.translate.instant("ARTIFICIAL-INTELLIGENCE.min_proba"),
                type: 'number',
                control: new FormControl('', Validators.pattern("^[1-9][0-9]?$|^100$")),
                required: true
            }
        ]
    };

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
        this.serviceSettings.init();
        this.retrieveDoctypes();
        this.retrieveForms();
    }

    retrieveDoctypes() {
        this.http.get(environment['url'] + '/ws/ai/splitter/getTrainDocuments', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                for (const trainFolder of data) {
                    this.AiModel.trainFolders.push({
                        folder: trainFolder,
                        isSelected: false,
                        doctype: "",
                        form: ""
                    });
                }
                console.log("this.AiModel.trainFolders : ");
                console.log(this.AiModel.trainFolders);
            }),
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
    }

    createModel() {
        let startTraining = true;
        let totalTrainFolders = 0;

        this.AiModel.trainFolders.forEach((trainFolders: any) => {
            if (trainFolders.isSelected && trainFolders.doctype === "") {
                startTraining = false;
            }
            else {
                totalTrainFolders ++;
            }
        });

        if (this.isValidForm(this.AiModel.fields) && totalTrainFolders > 1) {
            const selectedTrainFolders: any[] = [];
            const minProba = this.getValueFromForm(this.AiModel.fields, 'min_proba');
            const label = this.getValueFromForm(this.AiModel.fields, 'model_label');
            const modelName = label.toLowerCase().replace(/ /g, "_") + '.sav';

            this.AiModel.trainFolders.forEach((trainFolders: any) => {
                if (trainFolders.isSelected) {
                    const folder = trainFolders.folder;
                    const formId = trainFolders.form;
                    const doctype = trainFolders.doctype;
                    selectedTrainFolders.push({
                        form: formId,
                        folder: folder,
                        doctype: doctype
                    });
                }
            });

            for (const element of this.AiModel.trainFolders) {
                const exists = Object.values(element).includes(modelName);
                if (exists) {
                    this.notify.error(this.translate.instant('ARTIFICIAL-INTELLIGENCE.already_existing_model'));
                    startTraining = false;
                    break;
                }
            }
            if (startTraining) {
                this.http.post(environment['url'] + '/ws/ai/splitter/trainModel/' + modelName,
                    {label: label, docs: selectedTrainFolders, min_proba: minProba},
                    {headers: this.authService.headers}).pipe(
                    catchError((err: any) => {
                        console.debug(err);
                        return of(false);
                    })
                ).subscribe();

                this.notify.success(this.translate.instant('ARTIFICIAL-INTELLIGENCE.created'));
                this.router.navigate(['/settings/splitter/ai']).then();
            }
        } else {
            if (totalTrainFolders < 2) {
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

    getValueFromForm(form: any, fieldId: any) {
        let value = '';
        form.forEach((element: any) => {
            if (fieldId === element.id) {
                value = element.control.value;
            }
        });
        return value;
    }

    retrieveForms() {
        this.http.get(environment['url'] + '/ws/forms/splitter/list', {headers: this.authService.headers}).pipe(
            tap((forms: any) => {
               this.forms = forms.forms;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    openDoctypeTree(trainFolder: any): void {
        const dialogRef = this.dialog.open(DocumentTypeComponent, {
            width   : '800px',
            height  : '860px',
            data    : {
                selectedDoctype: {
                    key: trainFolder.doctype  ? trainFolder.doctype  : "",
                    label: ""
                },
                formId: trainFolder.form
            }
        });
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                trainFolder.doctype   = result.key;
            }
        });
    }
}
