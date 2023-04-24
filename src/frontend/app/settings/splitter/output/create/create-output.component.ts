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

 @dev : Nathan Cheval <nathan.cheval@outlook.fr>
 @dev : Oussama Brich <oussama.brich@edissyum.com> */

import { Component, OnInit } from '@angular/core';
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../../../../../services/user.service";
import { AuthService } from "../../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { environment } from  "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";

@Component({
    selector: 'app-splitter-create-output',
    templateUrl: './create-output.component.html',
    styleUrls: ['./create-output.component.scss']
})
export class SplitterCreateOutputComponent implements OnInit {
    loading             : boolean       = true;
    outputsTypes        : any[]         = [];
    selectedOutputType  : any;
    outputForm          : any[]         = [
        {
            id: 'output_type_id',
            label: this.translate.instant('HEADER.output_type'),
            type: 'select',
            control: new FormControl(),
            required: true,
            values: this.outputsTypes
        },
        {
            id: 'output_label',
            label: this.translate.instant('HEADER.label'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'compress_type',
            label: this.translate.instant('OUTPUT.compress_type'),
            type: 'select',
            control: new FormControl(),
            values: [
                {
                    'id': '',
                    'label': marker('OUTPUT.no_compress')
                },
                {
                    'id': 'screen',
                    'label': marker('OUTPUT.compress_screen')
                },
                {
                    'id': 'ebook',
                    'label': marker('OUTPUT.compress_ebook')
                },
                {
                    'id': 'prepress',
                    'label': marker('OUTPUT.compress_prepress')
                },
                {
                    'id': 'printer',
                    'label': marker('OUTPUT.compress_printer')
                },
                {
                    'id': 'default',
                    'label': marker('OUTPUT.compress_default')
                }
            ],
            required: false,
        },
        {
            id: 'ocrise',
            label: this.translate.instant('OUTPUT.enable_ocr'),
            type: 'select',
            control: new FormControl(),
            values: [
                {
                    'id': true,
                    'label': marker('OUTPUT.ocr_enabled')
                },
                {
                    'id': false,
                    'label': marker('OUTPUT.ocr_disabled')
                },
            ],
            required: false,
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
        public privilegesService: PrivilegesService,
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();

        this.outputForm.forEach((element: any) => {
            if (element.id === 'compress_type') {
                element.control.setValue('');
            }
        });

        this.http.get(environment['url'] + '/ws/outputs/splitter/getOutputsTypes', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.outputsTypes = data.outputs_types;
            }),
            finalize(() => {this.loading = false;}),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/verifier/outputs']).then();
                return of(false);
            })
        ).subscribe();
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

    createOutput() {
        if (this.isValidForm(this.outputForm)) {
            const ocrise = this.getValueFromForm(this.outputForm, 'ocrise');
            const outputLabel = this.getValueFromForm(this.outputForm, 'output_label');
            const compressType = this.getValueFromForm(this.outputForm, 'compress_type');
            const outputTypeId = this.getValueFromForm(this.outputForm, 'output_type_id');
            this.http.post(environment['url'] + '/ws/outputs/splitter/create',
                {
                    'args': {
                        'output_type_id': outputTypeId,
                        'output_label'  : outputLabel,
                        'compress_type' : compressType,
                        'module'        : 'splitter',
                        'ocrise'        : ocrise,
                    }}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    this.notify.success(this.translate.instant('OUTPUT.created'));
                    this.router.navigate(['/settings/splitter/outputs/update/' + data.id]).then();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/settings/splitter/outputs');
                    return of(false);
                })
            ).subscribe();
        }
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

    changeOutputType(event: any) {
        this.selectedOutputType = event.value;
    }
}
