/** This file is part of Open-Capture for Invoices.

 Open-Capture for Invoices is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {API_URL} from "../../../env";
import {catchError, finalize, map, startWith, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../services/auth.service";
import {UserService} from "../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../services/settings.service";
import {PrivilegesService} from "../../../../services/privileges.service";
import {ConfirmDialogComponent} from "../../../../services/confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-custom-fields',
    templateUrl: './custom-fields.component.html',
    styleUrls: ['./custom-fields.component.scss'],
})
export class CustomFieldsComponent implements OnInit {
    update              : boolean   = false;
    loading             : boolean   = true;
    inactiveFields      : any[]     = [];
    activeFields        : any[]     = [];
    selectOptions       : any[]     = [];
    inactiveOrActive    : string    = '';
    updateCustomId      : any ;
    form!               : FormGroup;
    parent              : any[]     = [
        {
            'id': 'verifier',
            'label': this.translate.instant('HOME.verifier')
        },
        {
            'id': 'splitter',
            'label': this.translate.instant('HOME.splitter')
        }
    ];
    addFieldInputs      : any[]     = [
        {
            field_id    : 'label_short',
            controlType : 'text',
            control     : new FormControl(),
            label       : this.translate.instant('HEADER.label_short'),
            autoComplete: [],
            required    : true,
        },
        {
            field_id    : 'label',
            controlType : 'text',
            control     : new FormControl(),
            label       : this.translate.instant('HEADER.label'),
            autoComplete: [],
            required    : true,
        },
        {
            field_id    : 'module',
            controlType : 'dropdown',
            control     : new FormControl(),
            label       : this.translate.instant('CUSTOM-FIELDS.module'),
            options     : [
                {key: 'verifier', value: this.translate.instant('HOME.verifier')},
                {key: 'splitter', value: this.translate.instant('HOME.splitter')}
            ],
            required: true,
            autoComplete: [],
        },
        {
            field_id    : 'type',
            controlType : 'dropdown',
            control     : new FormControl(),
            label       : this.translate.instant('CUSTOM-FIELDS.type'),
            options     : [
                {key: 'text', value: this.translate.instant('CUSTOM-FIELDS.text')},
                {key: 'textarea', value: this.translate.instant('CUSTOM-FIELDS.textarea')},
                {key: 'select', value: this.translate.instant('CUSTOM-FIELDS.select')},
                {key: 'checkbox', value: this.translate.instant('CUSTOM-FIELDS.checkbox')},
            ],
            autoComplete: [],
            required: true,
        },
        {
            field_id    : 'metadata_key',
            controlType : 'text',
            control     : new FormControl(),
            label       : this.translate.instant('SETTINGS.autocomplete'),
            limit       : 'splitter',
            autoComplete: [
                {key: '', value: this.translate.instant('SPLITTER.Other')},
                {key: 'SEPARATOR_MAARCH', value: this.translate.instant('SPLITTER.separator_maarch')},
                {key: 'SEPARATOR_META1', value: this.translate.instant('SPLITTER.separator_meta1')},
                {key: 'SEPARATOR_META2', value: this.translate.instant('SPLITTER.separator_meta2')},
                {key: 'SEPARATOR_META3', value: this.translate.instant('SPLITTER.separator_meta3')},
            ],
            required    : false,
            class       : "",
        },
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
    ) {
    }

    ngOnInit(): void {
        this.serviceSettings.init();
        this.retrieveCustomFields();
        this.form = this.toFormGroup();
    }

    dropCustomField(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            this.enableCustomField(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
    }

    toFormGroup() {
        const group: any = {};
        this.addFieldInputs.forEach(input => {
            group[input.field_id] = input.required ? new FormControl(input.value || '', Validators.required)
                : new FormControl(input.value || '');
        });
        return new FormGroup(group);
    }

    moveToActive(index: number) {
        this.enableCustomField(this.inactiveFields, this.activeFields, index, this.activeFields.length);
    }

    moveToInactive(index: number) {
        this.enableCustomField(this.activeFields, this.inactiveFields, index, this.inactiveFields.length);
    }

    displayInput(input: any) {
        let _return = false;
        if (input.limit) {
            this.addFieldInputs.forEach((element: any) => {
                if (element.field_id === 'module') {
                    if (element.control.value === input.limit) {
                        _return = true;
                    }
                }
            });
        }
        return _return;
    }

    retrieveCustomFields() {
        this.loading        = true;
        this.activeFields   = [];
        this.inactiveFields = [];
        let newField;
        this.http.get(API_URL + '/ws/customFields/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.customFields.forEach((field: any) => {
                    newField = {
                        'id'            : field.id,
                        'label_short'   : field.label_short,
                        'module'        : field.module,
                        'label'         : field.label,
                        'type'          : field.type,
                        'enabled'       : field.enabled,
                        'settings'      : field.settings,
                        'metadata_key'  : field.metadata_key,
                    };
                    field.enabled ? this.activeFields.push(newField) : this.inactiveFields.push(newField);
                });
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    addSelectOption() {
        this.selectOptions.push({
            idControl      : new FormControl(),
            labelControl   : new FormControl(),
        });
    }

    displayChoicesList() {
        let _return = false;
        this.addFieldInputs.forEach((element: any) => {
            if (element.field_id === 'type') {
                if (element.control.value && (element.control.value === 'checkbox' || element.control.value === 'select')) {
                    _return = true;
                }
            }
        });
        return _return;
    }

    dropSelectOption(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.selectOptions, event.previousIndex, event.currentIndex);
    }

    deleteSelectOption(optionIndex: number) {
        this.selectOptions.splice(optionIndex, 1);
    }

    addSelectOptionsToArgs(args: any) {
        args.options  = [];
        for(const option of this.selectOptions) {
            args.options.push({
                id      : option.idControl.value,
                label   : option.labelControl.value
            });
        }
        return args;
    }

    addCustomField() {
        let newField: any = {};
        newField = this.addSelectOptionsToArgs(newField);
        this.addFieldInputs.forEach((element: any) => {
            newField[element.field_id] = element.control.value;
        });
        this.http.post(API_URL + '/ws/customFields/add', newField, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                newField['id'] = data.id;
                this.retrieveCustomFields();
                this.notify.success(this.translate.instant('CUSTOM-FIELDS.field_added'));
                this.resetForm();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    deleteCustom(customFieldId: number, activeOrInactive: string) {
        this.http.delete(API_URL + '/ws/customFields/delete/' + customFieldId, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('CUSTOM-FIELDS.deleted'));

                if (activeOrInactive === 'active') {
                    this.activeFields.forEach((element:any, index, object) => {
                        if (element.id === customFieldId) {
                            object.splice(index, 1);
                        }
                    });
                } else {
                    this.inactiveFields.forEach((element:any, index, object) => {
                        if (element.id === customFieldId) {
                            object.splice(index, 1);
                        }
                    });
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    deleteCustomField(customFieldId: number, activeOrInactive: string) {
        if (customFieldId) {
            this.http.get(API_URL + '/ws/customFields/customPresentsInForm/' + customFieldId, {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    if (data) {
                        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                            data:{
                                confirmTitle        : this.translate.instant('CUSTOM-FIELDS.custom_exists'),
                                confirmText         : this.translate.instant('CUSTOM-FIELDS.confirm_delete'),
                                confirmButton       : this.translate.instant('GLOBAL.delete'),
                                confirmButtonColor  : "warn",
                                cancelButton        : this.translate.instant('GLOBAL.cancel'),
                            },
                            width: "600px",
                        });

                        dialogRef.afterClosed().subscribe((result: any) => {
                            if (result) {
                                this.deleteCustom(customFieldId, activeOrInactive);
                            }
                        });
                    } else {
                        this.deleteCustom(customFieldId, activeOrInactive);
                    }
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    enableCustomField(oldList: any[], newList: any[], oldIndex: number, newIndex: number) {
        let updatedField = oldList[oldIndex];

        updatedField = {
            'id': updatedField['id'],
            'label_short': updatedField['label_short'],
            'module': updatedField['module'],
            'label': updatedField['label'],
            'type': updatedField['type'],
            'enabled': !updatedField['enabled'],
            'metadata_key': updatedField['metadata_key']
        };

        this.http.post(API_URL + '/ws/customFields/update', updatedField, {headers: this.authService.headers}).pipe(
            tap(() => {
                transferArrayItem(
                    oldList,
                    newList,
                    oldIndex,
                    newIndex,
                );
                this.notify.success(this.translate.instant('CUSTOM-FIELDS.field_updated'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    updateCustomOnSubmit() {
        let updatedField : any = {};
        updatedField           = this.addSelectOptionsToArgs(updatedField);
        updatedField['id']     = this.updateCustomId;
        if (this.inactiveOrActive === 'active') {
            this.addFieldInputs.forEach((field: any) => {
                this.activeFields.forEach((element: any) => {
                    if (this.updateCustomId === element.id) {
                        element[field.field_id] = updatedField[field.field_id] = field.control.value;
                    }
                });
            });
            updatedField['enabled'] = true;
        } else {
            this.addFieldInputs.forEach((field: any) => {
                this.inactiveFields.forEach((element: any) => {
                    if (this.updateCustomId === element.id) {
                        element[field.field_id] = updatedField[field.field_id] = field.control.value;
                    }
                });
            });
            updatedField['enabled'] = false;
        }

        this.http.post(API_URL + '/ws/customFields/update', updatedField, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('CUSTOM-FIELDS.field_updated'));
                this.resetForm();
                this.retrieveCustomFields();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    updateCustomField(customField: any, activeOrInactive: string) {
        this.update = true;
        this.selectOptions = [];
        if (customField) {
            this.updateCustomId = customField.id;
            this.inactiveOrActive = activeOrInactive;
            this.addFieldInputs.forEach((element: any) => {
                element.control.setValue(customField[element.field_id]);
            });
            if (customField.settings.hasOwnProperty('options')) {
                for (const option of customField.settings.options) {
                    this.selectOptions.push({
                        'idControl'     : new FormControl(option.id),
                        'labelControl'  : new FormControl(option.label)
                    });
                }
            }
        }
    }

    resetForm() {
        this.addFieldInputs.forEach((element: any) => {
            element.control.setValue('');
        });
        this.selectOptions      = [];
        this.inactiveOrActive   = '';
        this.updateCustomId     = '';
        this.update             = false;
    }
}
