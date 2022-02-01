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
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
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
    loading: boolean    = false;
    addTypes: any       = [];
    folderSelectControl = new FormControl();
    form!: FormGroup;
    fields: any = [
        {
            id      : 'key',
            type    : 'text',
            label   : this.translate.instant('HEADER.id'),
            control : new FormControl(),
            required: true,
        },
        {
            id      : 'label',
            type    : 'text',
            label   : this.translate.instant('HEADER.label'),
            control : new FormControl(),
            required: true,
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

    toFormGroup() {
        const group: any = {};
        this.fields.forEach((field: { id: string; required: boolean;}) => {
            group[field.id] = field.required ? new FormControl('', Validators.required)
                : new FormControl(field.id || '');
        });
        group['folder'] =  new FormControl('', Validators.required);
        return new FormGroup(group);
    }

    addDocType() {
        let newDocType = this.form.getRawValue();
        newDocType = {
            'key'   : newDocType.key,
            'code'  : newDocType.folder + '.1',
            'label' : newDocType.label,
            'type'  : 'document',
        };
        this.http.post(API_URL + '/ws/docTypes/add', newDocType, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.notify.success(this.translate.instant('DOCTYPE.doctype_added'));
                this.documentTypeFactoryComponent.treeDataObj.reloadTree();
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
