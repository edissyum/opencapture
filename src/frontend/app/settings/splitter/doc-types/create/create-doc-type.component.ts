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

import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {environment} from  "../../../../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../../../services/auth.service";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {DocumentTypeFactoryComponent} from "../../../../splitter/document-type-factory/document-type-factory.component";

@Component({
  selector: 'app-create-doc-type',
  templateUrl: './create-doc-type.component.html',
  styleUrls: ['./create-doc-type.component.scss']
})
export class CreateDocTypeComponent implements OnInit {
    @ViewChild(DocumentTypeFactoryComponent, {static : true}) documentTypeFactoryComponent! : DocumentTypeFactoryComponent;
    selectedFormId: number | undefined;
    loading: boolean        = false;
    forms: any[]            = [];
    form!: FormGroup;
    fields: any = [
        {
            id      : 'key',
            type    : 'text',
            value   : '',
            label   : this.translate.instant('HEADER.id'),
            required: true,
        },
        {
            id      : 'label',
            type    : 'text',
            value   : '',
            label   : this.translate.instant('HEADER.label'),
            required: true,
        },
        {
            id      : 'isDefault',
            type    : 'slide',
            value   : false,
            label   : this.translate.instant('DOCTYPE.default_doctype'),
            required: false,
        },
    ];

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
    ) { }

    ngOnInit(): void {
        this.serviceSettings.init();
        this.form = this.toFormGroup();
    }

    getSelectedForm($event: any) {
        this.selectedFormId = $event.formId;
    }

    toFormGroup() {
        const group: any = {};
        this.fields.forEach((field: { id: string; required: boolean;disabled: boolean; value: any}) => {
            group[field.id] = field.required ? new FormControl({value:"", disabled: field.disabled}, [Validators.required])
                : new FormControl({value: field.value, disabled: field.disabled});
        });
        group['folder'] =  new FormControl({value:"", disabled: false}, Validators.required);
        return new FormGroup(group);
    }

    getLastFolderIndex(codeSelected: string) {
        let lastIndex = 0;
        this.documentTypeFactoryComponent.treeDataObj.doctypeData.forEach((docType:any) => {
            if(docType.code.startsWith(codeSelected)
                && docType.code.split('.').length === codeSelected.split('.').length + 1) {
                const currentIdx = Number(docType.code.split('.').pop());
                lastIndex = (currentIdx > lastIndex) ? currentIdx: lastIndex;
            }
        });
        return lastIndex + 1;
    }

    addDocType() {
        let newDocType = this.form.getRawValue();
        const lastIndexInFolder = this.getLastFolderIndex(newDocType.folder);
        newDocType = {
            'key'           : newDocType.key,
            'code'          : newDocType.folder + "." + lastIndexInFolder.toString(),
            'label'         : newDocType.label,
            'is_default'    : newDocType['isDefault'],
            'type'          : 'document',
            'form_id'       : this.selectedFormId,
        };
        this.http.post(environment['url'] + '/ws/doctypes/add', newDocType, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('DOCTYPE.doctype_added'));
                if (this.selectedFormId)
                    this.documentTypeFactoryComponent.treeDataObj.loadTree(this.selectedFormId);
                this.form.reset();
                Object.keys(this.form.controls).forEach(key => {
                    this.form.controls[key].setErrors(null);
                });
                }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }
}
