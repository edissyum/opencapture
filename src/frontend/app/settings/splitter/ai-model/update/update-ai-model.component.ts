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
import {DocumentTypeComponent} from "../../../../splitter/document-type/document-type.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-update-model',
  templateUrl: './update-ai-model.component.html',
  styleUrls: ['./update-ai-model.component.scss']
})

export class UpdateSplitterAiModelComponent implements OnInit {
    loading             : boolean   = true;
    forms               : any       = [];
    AiModel             : any       = {
        id             : 0,
        trainDocuments : [],
        fields         : [
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
        ]
    };

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
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
        this.serviceSettings.init();
        this.AiModel.id = this.route.snapshot.params['id'];
        await this.retrieveForms();
        this.http.get(environment['url'] + '/ws/ai/getById/' + this.AiModel.id, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.AiModel.trainDocuments = data.documents;
                console.log("this.AiModel.trainDocuments : ");
                console.log(this.AiModel.trainDocuments);
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/splitter/ai']).then();
                return of(false);
            })
        ).subscribe();
    }

    updateModel() {
        if (this.isValidForm(this.AiModel.fields)) {
            const modelName = this.getValueFromForm(this.AiModel.fields, 'model_path');
            const minProba = this.getValueFromForm(this.AiModel.fields, 'min_proba');

            if (this.AiModel.id !== undefined) {
                this.http.post(environment['url'] + '/ws/ai/splitter/update/' + this.AiModel.id, {
                    model_name: modelName, min_proba: minProba, doctypes: this.AiModel.trainDocuments }, {headers: this.authService.headers}).pipe(
                    tap(() => {
                        this.notify.success(this.translate.instant('ARTIFICIAL-INTELLIGENCE.model_updated'));
                        this.router.navigate(['/settings/splitter/ai']).then();
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

    async retrieveForms() {
        const retrieve = this.http.get(environment['url'] + '/ws/forms/splitter/list', {headers: this.authService.headers}).pipe(
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

    openDoctypeTree(trainDocument: any): void {
        const dialogRef = this.dialog.open(DocumentTypeComponent, {
            width   : '800px',
            height  : '860px',
            data    : {
                selectedDoctype: {
                    key: trainDocument.doctype ? trainDocument.doctype  : "",
                    label: ""
                },
                formId: trainDocument.form
            }
        });
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                trainDocument.doctype   = result.key;
            }
        });
    }
}
