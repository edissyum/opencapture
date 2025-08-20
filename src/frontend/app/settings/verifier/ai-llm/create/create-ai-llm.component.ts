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

import { Component } from '@angular/core';
import { FormControl} from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../../../../../services/user.service";
import { AuthService } from "../../../../../services/auth.service";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { environment } from "../../../../env";
import { catchError, tap } from "rxjs/operators";
import { of } from "rxjs";

@Component({
    selector: 'app-ai-llm-create',
    templateUrl: './create-ai-llm.component.html',
    styleUrl: './create-ai-llm.component.scss',
    standalone: false
})
export class CreateAiLLMComponent {
    loading             : boolean       = true;
    modelLLMForm        : any[]         = [
        {
            id: 'name',
            label: this.translate.instant('AI-LLM.model_name'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'provider',
            label: this.translate.instant('AI-LLM.provider'),
            type: 'select',
            control: new FormControl(),
            required: true,
            values: [
                {id: 'mistral', label: 'Mistral'},
                {id: 'copilot', label: 'Microsoft Copilot'}
                //{id: 'custom', label: this.translate.instant('AI-LLM.custom')}
            ]
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
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.loading = false;
    }

    isValidForm(form: any) {
        let state = true;
        form.forEach((element: any) => {
            if ((element.control.status !== 'DISABLED' && element.control.status !== 'VALID') ||
                (element.required && element.control.value == null)) {
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

    createLlmModel() {
        if (this.isValidForm(this.modelLLMForm)) {
            const name = this.getValueFromForm(this.modelLLMForm, 'name');
            const provider = this.getValueFromForm(this.modelLLMForm, 'provider');
            this.http.post(environment['url'] + '/ws/ai/llm/create', {
                'args': {
                    'name': name,
                    'provider': provider
                }
            }, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    this.notify.success(this.translate.instant('AI-LLM.created'));
                    this.router.navigate(['/settings/verifier/ai-llm/update/' + data.id]).then();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/settings/verifier/ai-llm');
                    return of(false);
                })
            ).subscribe();
        }
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
}
