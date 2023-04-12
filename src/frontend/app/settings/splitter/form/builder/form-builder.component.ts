/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
s
 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormControl } from "@angular/forms";
import { AuthService } from "../../../../../services/auth.service";
import { UserService } from "../../../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { environment } from  "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";

@Component({
    selector: 'form-builder',
    templateUrl: './form-builder.component.html'
})
export class SplitterFormBuilderComponent implements OnInit {
    loading                 : boolean   = true;
    loadingCustomFields     : boolean   = true;
    outputs                 : any[]     = [];
    metadataMethods         : any[]     = [];
    form                    : any       = {
        'label': {
            'control': new FormControl(),
        },
        'default_form': {
            'control': new FormControl(),
        },
    };
    formSettings            : any       = {
        'metadata_method': {
            'control': new FormControl(),
        },
        'export_zip_file': {
            'control': new FormControl(),
        },
    };
    outputForm              : any       = [
        {
            control: new FormControl(),
            cpt: 0
        }
    ];
    formId                  : any;
    creationMode            : boolean   = true;
    labelType               : any []    = [
        marker('FORMATS.text'),
        marker('TYPES.text'),
        marker('TYPES.textarea'),
        marker('TYPES.date'),
        marker('TYPES.select'),
        marker('VERIFIER.field_settings'),
        marker('FORMS.delete_field'),
        marker('FORMS.update_label')
    ];
    fieldCategories         : any []    = [
        {
            'id'    : 'batch_metadata',
            'label' : marker('SPLITTER.batch_metadata')
        },
        {
            'id'    : 'document_metadata',
            'label' : marker('SPLITTER.document_metadata')
        },
    ];
    availableFieldsParent   : any []    = [
        {
            'id'    : 'custom_fields',
            'label' : marker('FORMS.custom_fields'),
            'values': []
        },
    ];
    fields                  : any       = {
        'batch_metadata'    : [],
        'document_metadata' : []
    };
    classList               : any []    = [
        {
            'id'    : 'w-full',
            'label' : '1'
        },
        {
            'id'    : 'w-1/2',
            'label' : '1/2'
        },
        {
            'id'    : 'w-30',
            'label' : '1/3'
        },
        {
            'id'    : 'w-1/3',
            'label' : '1/33'
        },
        {
            'id'    : 'w-1/4',
            'label' : '1/4'
        },
        {
            'id'    : 'w-1/5',
            'label' : '1/5'
        }
    ];
    displayList             : any []    = [
        {
            'id'    : 'simple',
            'label' : marker('DISPLAY.simple'),
            'icon'  : 'fa-solid fa-file-alt'
        },
        {
            'id'    : 'multi',
            'label' : marker('DISPLAY.multi'),
            'icon'  : 'fa-solid fa-layer-group'
        },
    ];
    mandatoryList           : any []    = [
        {
            'id'    : true,
            'label' : marker('MANDATORY.required'),
            'icon'  : 'fa-solid fa-star'
        },
        {
            'id'    : false,
            'label' : marker('MANDATORY.not_required'),
            'icon'  : 'far fa-star'
        },
    ];
    disabledList            : any []    = [
        {
            'id'    : true,
            'label' : marker('DISABLED.disabled'),
            'icon'  : 'fa-solid fa-ban'
        },
        {
            'id'    : false,
            'label' : marker('DISABLED.not_disabled'),
            'icon'  : ''
        },
    ];
    fieldMetadata           : any []    = [
        {
            'id'            : 'searchMask',
            'placeholder'   : marker('FIELD_METADATA.search_mask'),
            'control'       : new FormControl(),
        },
        {
            'id'            : 'resultMask',
            'placeholder'   : marker('FIELD_METADATA.result_mask'),
            'control'       : new FormControl(),
        },
        {
            'id'            : 'defaultValue',
            'placeholder'   : marker('FIELD_METADATA.default_value'),
            'control'       : new FormControl(),
        },
        {
            'id'            : 'validationMask',
            'placeholder'   : marker('FIELD_METADATA.validation_mask'),
            'control'       : new FormControl(),
        }
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
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.formId = this.route.snapshot.params['id'];

        this.http.get(environment['url'] + '/ws/outputs/splitter/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.outputs = data.outputs;
                if (this.formId) {
                    this.creationMode = false;
                    this.http.get(environment['url'] + '/ws/forms/splitter/getById/' + this.formId, {headers: this.authService.headers}).pipe(
                        tap((data: any) => {
                            for (const field in this.form) {
                                for (const info in data) {
                                    if (info === field) this.form[field].control.setValue(data[field]);
                                }
                            }

                            for (const field in this.formSettings) {
                                for (const setting in data['settings']) {
                                    if (setting === field) {
                                        this.formSettings[setting].control.setValue(data['settings'][setting]);
                                    }
                                }
                            }

                            if (data.outputs) {
                                const length = data.outputs.length;
                                if (length === 1) this.outputForm[0].control.setValue(data.outputs[0]);
                                if (length > 1) {
                                    for (const cpt in data.outputs) {
                                        if (parseInt(cpt) !== 0) this.addOutput();
                                        this.outputForm[cpt].control.setValue(data.outputs[cpt]);
                                    }
                                }
                            }
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                }
            }), catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/splitter/metadataMethods', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.metadataMethods.forEach((option: any) => {
                    this.metadataMethods.push({
                        id      : option.id,
                        label   : option.label,
                    });
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/customFields/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.customFields) {
                    for (const field in data.customFields) {
                        if (data.customFields.hasOwnProperty(field)) {
                            if (data.customFields[field].module === 'splitter' && data.customFields[field].enabled) {
                                for (const parent in this.availableFieldsParent) {
                                    if (this.availableFieldsParent[parent].id === 'custom_fields') {
                                        this.availableFieldsParent[parent].values.push(
                                            {
                                                id           : 'custom_' + data.customFields[field].id,
                                                metadata_key : data.customFields[field].metadata_key,
                                                label_short  : data.customFields[field].label_short,
                                                settings     : data.customFields[field].settings,
                                                required     : data.customFields[field].required,
                                                label        : data.customFields[field].label,
                                                type         : data.customFields[field].type,
                                                format       : data.customFields[field].type,
                                                unit         : 'custom',
                                                class        : "w-1/3",
                                                class_label  : "1/33",
                                            }
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
                this.loadingCustomFields = false;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        if (this.formId) {
            this.http.get(environment['url'] + '/ws/forms/fields/getByFormId/' + this.formId, {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    if (data.fields) {
                        if (data.fields.batch_metadata)
                            this.fields.batch_metadata = data.fields.batch_metadata;
                        if (data.fields.document_metadata)
                            this.fields.document_metadata = data.fields.document_metadata;

                        for (const category in this.fields) {
                            if (this.fields.hasOwnProperty(category)) {
                                this.fields[category].forEach((currentField: any) => {
                                    this.availableFieldsParent.forEach((parent: any) => {
                                        let cpt = 0;
                                        parent['values'].forEach((childFields: any) => {
                                            if (currentField.id === childFields.id) {
                                                parent['values'].splice(cpt, 1);
                                            }
                                            cpt = cpt + 1;
                                        });
                                    });
                                });
                            }
                        }
                    }
                }),
                finalize(() => setTimeout(() => {
                    this.loading = false;
                }, 500)),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            this.loading = false;
        }
    }

    dropFromAvailableFields(event: any) {
        const unit = event.previousContainer.id;
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data ? event.previousContainer.data : this.fields[unit],
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
    }

    changeClass(fieldId: any, newClass: any, classLabel: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.class = newClass;
                element.class_label = classLabel;
            }
        });
    }

    changeDisplay(fieldId: any, newDisplay: any, displayIcon: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.display = newDisplay;
                element.display_icon = displayIcon;
            }
        });
    }

    changeRequired(fieldId: any, newRequired: any, requiredIcon: any, category: any) {
        const id = fieldId;
        this.fields[category].forEach((element: any) => {
            if (element.id === id) {
                element.required = newRequired;
                element.required_icon = requiredIcon;
            }
        });
    }

    dropFromForm(event: any) {
        const unit = event.container.id;
        const previousUnit = event.previousContainer.id;

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data ? event.previousContainer.data : this.fields[previousUnit],
                event.container.data ? event.container.data : this.fields[unit],
                event.previousIndex,
                event.currentIndex);
        }
    }

    deleteField(event: any, previousIndex: any, category:any, unit: any) {
        if (unit === 'addresses')
            unit = 'supplier';
        for (const parentField in this.availableFieldsParent) {
            const id = this.availableFieldsParent[parentField].id.split('_fields')[0];
            if (id === unit) {
                const currentIndex = this.availableFieldsParent[parentField]['values'].length;
                transferArrayItem(this.fields[category],
                    this.availableFieldsParent[parentField]['values'],
                    previousIndex,
                    currentIndex);
            }
        }
    }

    storeNewOrder(event: any, categoryId: any) {
        const tmpCurrentOrder: any[] = [];
        event.currentOrder.forEach((element: any) => {
            this.fields[categoryId].forEach((field: any) => {
                if (element.id === field.id) {
                    tmpCurrentOrder.push(element);
                }
            });
        });
        this.fields[categoryId] = tmpCurrentOrder;
    }

    addOutput() {
        this.outputForm[0].cpt = this.outputForm[0].cpt + 1;
        this.outputForm.push({
            'control': new FormControl(),
            'canRemove': true
        });
    }

    removeOutput(cpt: any) {
        this.outputForm.splice(cpt, 1);
    }

    updateForm() {
        const label             = this.form.label.control.value;
        const isDefault         = this.form.default_form.control.value;
        const metadataMethod    = this.formSettings.metadata_method.control.value;
        const exportZipFile     = this.formSettings.export_zip_file.control.value;
        const outputs: any[]    = [];
        this.outputForm.forEach((element: any) => {
            if (element.control.value) outputs.push(element.control.value);
        });

        if (label !== '' && outputs.length >= 1) {
            this.http.put(environment['url'] + '/ws/forms/splitter/update/' + this.formId, {
                    'args': {
                        'label'        : label,
                        'default_form' : isDefault,
                        'outputs'      : outputs,
                        'settings'     : {
                            'metadata_method' : metadataMethod,
                            'export_zip_file' : exportZipFile
                        },
                    }
                }, {headers: this.authService.headers},
            ).pipe(
                tap(()=> {
                    this.http.post(environment['url'] + '/ws/forms/updateFields/' + this.formId, this.fields,
                        {headers: this.authService.headers}).pipe(
                        tap(() => {
                            this.notify.success(this.translate.instant('FORMS.updated'));
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            if (!label && outputs.length === 0) this.notify.error(this.translate.instant('FORMS.label_and_output_mandatory'));
            else if (!label) this.notify.error(this.translate.instant('FORMS.label_mandatory'));
            else if (outputs.length === 0) this.notify.error(this.translate.instant('FORMS.output_type_mandatory'));
        }
    }

    createForm() {
        const label             = this.form.label.control.value;
        const isDefault         = this.form.default_form.control.value;
        const metadataMethod    = this.formSettings.metadata_method.control.value;
        const exportZipFile     = this.formSettings.export_zip_file.control.value;
        if (label) {
            this.http.post(environment['url'] + '/ws/forms/splitter/create',
                {
                    'args': {
                        'label'         : label,
                        'default_form'  : isDefault,
                        'module'        : "splitter",
                        'settings'      : {
                            'metadata_method' : metadataMethod,
                            'export_zip_file' : exportZipFile
                        },
                    }
                }, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    this.http.post(environment['url'] + '/ws/forms/updateFields/' + data.id, this.fields,
                        {headers: this.authService.headers}).pipe(
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                    this.notify.success(this.translate.instant('FORMS.created'));
                    this.router.navigateByUrl('settings/splitter/forms').then();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            this.notify.error(this.translate.instant('FORMS.label_mandatory'));
        }
    }
}
