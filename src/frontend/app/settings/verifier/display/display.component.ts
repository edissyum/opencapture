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
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../../../../services/user.service";
import { FormBuilder, FormControl } from "@angular/forms";
import { AuthService } from "../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { HistoryService } from "../../../../services/history.service";
import { SettingsService } from "../../../../services/settings.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { environment } from "../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import {
    getParsedCommandLineOfConfigFile
} from "@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript";

@Component({
    selector: 'app-display-list',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.scss'],
})
export class VerifierDisplayComponent implements OnInit {
    loading             : boolean   = true;
    loadingCustomFields : boolean   = true;
    formLoaded          : boolean   = false;
    forms               : any       = [];
    availableFieldsTmp  : any       = [];
    currentForm         : any       = {};
    formInput           : any       = {
        control: new FormControl(),
        values:[]
    };
    availableFields     : any       = [
        {
            "id": 'invoice_id',
            'label': marker('VERIFIER.document_id')
        },
        {
            "id": 'invoice_number',
            'label': 'FACTURATION.invoice_number'
        },
        {
            "id": 'quotation_number',
            'label': 'FACTURATION.quotation_number'
        },
        {
            "id": 'invoice_date',
            'label': marker('FACTURATION.invoice_date')
        },
        {
            "id": 'date',
            'label': marker('VERIFIER.register_date')
        },
        {
            "id": 'delivery_number',
            'label': 'FACTURATION.delivery_number'
        },
        {
            "id": 'form_label',
            'label': marker('VERIFIER.form')
        },
        {
            "id": 'original_filename',
            'label': marker('VERIFIER.original_file')
        },
    ];

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        private historyService: HistoryService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    ngOnInit(): void {
        this.serviceSettings.init();
        this.http.get(environment['url'] + '/ws/customFields/list?module=verifier', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.customFields.forEach((field: any) => {
                    this.availableFields.push({
                        'id': 'custom_' + field.id,
                        'label': field.label
                    });
                });
                this.availableFields.forEach((element: any) => {
                    this.availableFieldsTmp.push(element);
                });
            }),
            finalize(() => this.loadingCustomFields = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/forms/list?module=verifier', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.forms = data.forms;
                this.formInput.values = data.forms;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadDisplay(event: any) {
        this.loading = true;
        this.availableFieldsTmp = [];
        this.availableFields.forEach((element: any) => {
            this.availableFieldsTmp.push(element);
        });
        const form_id = event.value;
        this.forms.forEach((element: any) => {
            if (element.id === form_id) {
                this.formLoaded = true;
                this.currentForm = element;
                if (this.currentForm.settings.display) {
                   this.currentForm.settings.display.subtitles.forEach((subtitle: any) => {
                        this.availableFieldsTmp.forEach((item: any, index: number, object: any) => {
                            if (subtitle.id === item.id) {
                                object.splice(index, 1);
                            }
                        });
                    });
                }
            }
        });
        this.loading = false;
    }

    updateLabel(event: any, subtitle: any) {
        subtitle['label'] = event.target.value;
        subtitle['updateMode'] = false;
    }

    updateDisplay() {
       this.currentForm.settings.display.subtitles.forEach((element: any) => {
            delete element['updateMode'];
        });
        this.http.put(environment['url'] + '/ws/forms/updateDisplay/' + this.currentForm.module_settings_id, this.currentForm.settings.display,
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.historyService.addHistory('verifier', 'update_form_display', this.translate.instant('HISTORY-DESC.udpate_form_display', {'form': this.currentForm.label}))
                this.notify.success(this.translate.instant('FORMS.display_updated_success'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    removeLine(id: any, cpt: number) {
       this.currentForm.settings.display.subtitles.forEach((element: any) => {
            if (id === element.id) {
               this.currentForm.settings.display.subtitles.splice(cpt, 1);
                this.loadDisplay({value: this.currentForm.id});
            }
        });
    }

    drop_card(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }
    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }
    }
}
