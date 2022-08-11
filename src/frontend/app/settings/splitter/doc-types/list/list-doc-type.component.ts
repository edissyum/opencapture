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

 @dev : Oussama Brich <oussama.brich@edissyum.com> */

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { DocumentTypeFactoryComponent } from "../../../../splitter/document-type-factory/document-type-factory.component";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../../../../services/auth.service";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { environment } from  "../../../../env";
import { catchError, tap } from "rxjs/operators";
import { of } from "rxjs";
import { ConfirmDialogComponent } from "../../../../../services/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: 'app-list-doc-type',
    templateUrl: './list-doc-type.component.html',
    styleUrls: ['./list-doc-type.component.scss']
})
export class ListDocTypeComponent implements OnInit {
    @ViewChild(DocumentTypeFactoryComponent, {static : true}) documentTypeFactoryComponent! : DocumentTypeFactoryComponent;
    loading         : boolean = false;
    noMasterFolder  : string  = '_NO_MASTER';
    fields          : any     = [
        {
            id        : 'key',
            type      : 'text',
            label     : this.translate.instant('HEADER.id'),
            required  : true,
            disabled  : true,
        },
        {
            id        : 'label',
            type      : 'text',
            label     : this.translate.instant('HEADER.label'),
            required  : true,
            disabled  : false,
        },
        {
            id      : 'isDefault',
            type    : 'slide',
            label   : this.translate.instant('DOCTYPE.default_doctype'),
            required: false,
            disabled: false,
        },
    ];
    selectedDocType : any     = {
        label   : '',
        key     : '',
        code    : '',
    };
    selectedFormId  : number | undefined;
    form!           : FormGroup;

    constructor(
        private http: HttpClient,
        private dialog: MatDialog,
        public router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    ngOnInit(): void {
        this.authService.generateHeaders();
        this.serviceSettings.init();
        this.form = this.toFormGroup();
    }

    toFormGroup() {
        const group: any = {};
        this.fields.forEach((field: { id: string; required: boolean;disabled: boolean}) => {
            group[field.id] = field.required ? new FormControl({value:"", disabled: field.disabled}, [Validators.required])
                : new FormControl({value:"", disabled: field.disabled});
        });
        group['folder'] =  new FormControl(this.noMasterFolder, Validators.required);
        return new FormGroup(group);
    }

    update() {
        let newDocType = this.form.getRawValue();
        const lastIndexInFolder = this.getLastFolderIndex(newDocType.folder);
        if (newDocType.folder === '_NO_MASTER') {
            newDocType.folder = "0";
        }
        newDocType = {
            'key'       : newDocType.key,
            'code'      : newDocType.folder + "." + lastIndexInFolder.toString(),
            'label'     : newDocType.label,
            'is_default': newDocType.isDefault,
            'form_id'   : this.selectedFormId,
            'status'    : 'OK',
        };
        this.updateDoctype(newDocType);
    }

    getOutPut($event: any) {
        this.selectedDocType = $event;
        const code = this.selectedDocType.code.split('.');
        code.pop();
        this.form.controls['folder'].setValue(code.join('.'));
        this.form.controls['key'].setValue(this.selectedDocType.key);
        this.form.controls['label'].setValue(this.selectedDocType.label);
        this.form.controls['isDefault'].setValue(this.selectedDocType.isDefault);
        this.selectedDocType.type === 'document' ? this.form.controls['isDefault'].enable(): this.form.controls['isDefault'].disable();
    }

    deleteDoctype() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('DOCTYPE.confirm_delete', {"doctypeLabel": this.selectedDocType.label}),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                const updateValue = {
                    'key'       : this.form.controls['key'].value,
                    'code'      : this.form.controls['folder'].value,
                    'label'     : this.form.controls['label'].value,
                    'is_default': this.form.controls['isDefault'].value,
                    'form_id'   : this.selectedFormId,
                    'status'    : 'DEL',
                };
                this.updateDoctype(updateValue);
                this.form.reset();
                Object.keys(this.form.controls).forEach(key => {
                    this.form.controls[key].setErrors(null) ;
                });
            }
        });
    }

    getSelectedForm($event: any) {
        this.selectedFormId = $event.formId;
    }

    getLastFolderIndex(codeSelected: string) {
        let lastIndex = 0;
        if (codeSelected !== this.noMasterFolder) {
            this.documentTypeFactoryComponent.treeDataObj.doctypeData.forEach((docType:any) => {
                if (docType.code.startsWith(codeSelected)
                    && docType.code.split('.').length === codeSelected.split('.').length + 1) {
                    const currentIdx = Number(docType.code.split('.').pop());
                    lastIndex = (currentIdx > lastIndex) ? currentIdx: lastIndex;
                }
            });
        }
        else {
            this.documentTypeFactoryComponent.treeDataObj.doctypeData.forEach((docType:any) => {
                if (docType.code.split('.').length === 2) {
                    const currentIdx = Number(docType.code.split('.').pop());
                    lastIndex = (currentIdx > lastIndex) ? currentIdx: lastIndex;
                }
            });
        }
        return lastIndex + 1;
    }

    updateDoctype(newDocType: any) {
        this.http.post(environment['url'] + '/ws/doctypes/update', newDocType, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('DOCTYPE.doctype_edited'));
                if (this.selectedFormId)
                    this.documentTypeFactoryComponent.treeDataObj.loadTree(this.selectedFormId);
                this.selectedDocType.code = newDocType.code;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }
}
