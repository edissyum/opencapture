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

@Component({
    selector: 'app-custom-fields',
    templateUrl: './custom-fields.component.html',
    styleUrls: ['./custom-fields.component.scss'],
})
export class CustomFieldsComponent implements OnInit {
    form!: FormGroup;
    inactiveFields: any[] = [];
    activeFields: any[] = [];
    parent: any[] = [
        {
            'id': 'verifier',
            'label': this.translate.instant('HOME.verifier')
        },
        {
            'id': 'splitter',
            'label': this.translate.instant('HOME.splitter')
        }
    ];
    addFieldInputs  : any[] = [
        {
            field_id    : 'label_short',
            controlType : 'text',
            control     : new FormControl(),
            label       : this.translate.instant('HEADER.label_short'),
            required    : true,
        },
        {
            field_id    : 'label',
            controlType : 'text',
            control     : new FormControl(),
            label       : this.translate.instant('HEADER.label'),
            required    : true,
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
            required: true,
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
        },
        {
            field_id    : 'metadata_key',
            controlType : 'text',
            control     : new FormControl(),
            label       : this.translate.instant('SETTINGS.autocomplete'),
            required    : false,
            class       : "",
        },
    ];
    loading = true;

    constructor(
        private http: HttpClient,
        public router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
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

    drop(event: CdkDragDrop<string[]>) {
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

    retrieveCustomFields() {
        let newField;
        this.http.get(API_URL + '/ws/customFields/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.customFields.forEach((field: {
                        id          : any;
                        label_short : string;
                        module      : string;
                        label       : string;
                        type        : string;
                        enabled     : boolean;
                    }) => {
                        newField = {
                            'id'            : field.id,
                            'label_short'   : field.label_short,
                            'module'        : field.module,
                            'label'         : field.label,
                            'type'          : field.type,
                            'enabled'       : field.enabled,
                        };
                        field.enabled ? this.activeFields.push(newField) : this.inactiveFields.push(newField);
                    }
                );
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    addCustomField() {
        let newField = this.form.getRawValue();
        newField = {
            'label_short': newField.label_short,
            'metadata_key': newField.metadata_key,
            'label': newField.label,
            'type': newField.type,
            'module': newField.module,
            'enabled': newField.enabled,
        };

        this.http.post(API_URL + '/ws/customFields/add', newField, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                newField['id'] = data.id;
                this.activeFields.push(newField);
                this.notify.success(this.translate.instant('CUSTOM-FIELDS.field_added'));
                this.form.reset();
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
    }

    enableCustomField(oldList: any[], newList: any[], oldIndex: number, newIndex: number) {
        let updatedField = oldList[oldIndex];

        updatedField = {
            'id': updatedField['id'],
            'label_short': updatedField['label_short'],
            'module': updatedField['module'],
            'label': updatedField['label'],
            'type': updatedField['type'],
            'enabled': !updatedField['enabled']
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
    updateCustomId  : any ;
    inactiveOrActive: string = '';
    update          : boolean = false;

    updateCustomOnSubmit() {
        const updatedField : any = {};
        updatedField['id'] = this.updateCustomId;
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
        if (customField) {
            this.updateCustomId = customField.id;
            this.inactiveOrActive = activeOrInactive;
            console.log(this.addFieldInputs);

            this.addFieldInputs.forEach((element: any) => {
                console.log(element);
                element.control.setValue(customField[element.field_id]);
            });
        }
    }

    resetForm() {
        this.addFieldInputs.forEach((element: any) => {
            element.control.setValue('');
        });
        this.update = false;
        this.inactiveOrActive = '';
        this.updateCustomId = '';
    }
}
