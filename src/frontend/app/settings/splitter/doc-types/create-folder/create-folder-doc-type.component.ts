import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../../../../services/auth.service";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { environment } from  "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { DocumentTypeFactoryComponent } from "../../../../splitter/document-type-factory/document-type-factory.component";

@Component({
  selector: 'app-create-folder-doc-type',
  templateUrl: './create-folder-doc-type.component.html',
  styleUrls: ['./create-folder-doc-type.component.scss']
})
export class CreateFolderDocTypeComponent implements OnInit {
    @ViewChild(DocumentTypeFactoryComponent, {static : true}) documentTypeFactoryComponent! : DocumentTypeFactoryComponent;
    selectedFormId: number | undefined;
    loading: boolean        = false;
    noMasterFolder: string  = '_NO_MASTER';
    form!: FormGroup;
    fields: any = [
        {
            id      : 'key',
            type    : 'text',
            label   : this.translate.instant('HEADER.id'),
            control : new FormControl(),
            required: true,
            disabled  : false,
        },
        {
            id      : 'label',
            type    : 'text',
            label   : this.translate.instant('HEADER.label'),
            control : new FormControl(),
            required: true,
            disabled  : false,
        },
        {
            id      : 'isDefault',
            type    : 'slide',
            label   : this.translate.instant('DOCTYPE.default_doctype'),
            control : new FormControl(),
            required: false,
            disabled: true,
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
        this.fields.forEach((field: { id: string; required: boolean;disabled: boolean}) => {
            group[field.id] = field.required ? new FormControl({value:"", disabled: field.disabled}, [Validators.required])
                : new FormControl({value:"", disabled: field.disabled});
        });
        group['folder'] =  new FormControl(this.noMasterFolder, Validators.required);
        return new FormGroup(group);
    }

    getLastFolderIndex(codeSelected: string) {
        let lastIndex = 0;
        if(codeSelected !== this.noMasterFolder) {
            this.documentTypeFactoryComponent.treeDataObj.doctypeData.forEach((docType:any) => {
                if(docType.code.startsWith(codeSelected)
                    && docType.code.split('.').length === codeSelected.split('.').length + 1) {
                    const currentIdx = Number(docType.code.split('.').pop());
                    lastIndex = (currentIdx > lastIndex) ? currentIdx: lastIndex;
                }
            });
        }
        else {
            this.documentTypeFactoryComponent.treeDataObj.doctypeData.forEach((docType:any) => {
                if(docType.code.split('.').length === 2) {
                    const currentIdx = Number(docType.code.split('.').pop());
                    lastIndex = (currentIdx > lastIndex) ? currentIdx: lastIndex;
                }
            });
        }
        return lastIndex + 1;
    }

    getSelectedForm($event: any) {
        this.selectedFormId = $event.formId;
    }

    addFolder() {
        let newFolder = this.form.getRawValue();
        const lastIndex = this.getLastFolderIndex(newFolder.folder);
        newFolder = {
            'key'       : newFolder.key,
            'code'      : newFolder.folder !== this.noMasterFolder ? newFolder.folder + '.' + lastIndex: '0.' + lastIndex,
            'label'     : newFolder.label,
            'is_default': false,
            'type'      : 'folder',
            'form_id'   : this.selectedFormId,
        };
        this.loading = true;
        this.http.post(environment['url'] + '/ws/doctypes/add', newFolder, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('DOCTYPE.folder_added'));
                this.form.reset();
                this.form.controls['folder'].setValue(this.noMasterFolder);
                Object.keys(this.form.controls).forEach(key => {
                    this.form.controls[key].setErrors(null) ;
                });
                if (this.selectedFormId)
                    this.documentTypeFactoryComponent.treeDataObj.loadTree(this.selectedFormId);
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                this.loading = false;
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }
}
