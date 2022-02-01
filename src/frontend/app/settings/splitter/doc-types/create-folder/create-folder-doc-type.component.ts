import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../../../services/auth.service";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {DocumentTypeFactoryComponent} from "../../../../splitter/document-type-factory/document-type-factory.component";

@Component({
  selector: 'app-create-folder-doc-type',
  templateUrl: './create-folder-doc-type.component.html',
  styleUrls: ['./create-folder-doc-type.component.scss']
})
export class CreateFolderDocTypeComponent implements OnInit {
    @ViewChild(DocumentTypeFactoryComponent, {static : true}) documentTypeFactoryComponent! : DocumentTypeFactoryComponent;
    loading: boolean        = false;
    noMasterValue: string   = '_NO_MASTER';
    folderSelectControl     = new FormControl();
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
        group['folder'] =  new FormControl(this.noMasterValue, Validators.required);
        return new FormGroup(group);
    }

    getLastFolderIndex(codeSelected: string){
        let lastIndex = 0;
        if(codeSelected !== this.noMasterValue){
            this.documentTypeFactoryComponent.treeDataObj.treeData.forEach((docType:any) => {
                if(docType.type === 'folder' && docType.code.startsWith(codeSelected)
                    && docType.code.split('.').length === codeSelected.split('.').length + 1){
                    const currentIdx = Number(docType.code.split('.').pop());
                    lastIndex = (currentIdx > lastIndex) ? currentIdx: lastIndex;
                }
            });
        }
        else{
            this.documentTypeFactoryComponent.treeDataObj.treeData.forEach((docType:any) => {
                if(docType.type === 'folder' && docType.code.split('.').length === 2){
                    const currentIdx = Number(docType.code.split('.').pop());
                    lastIndex = (currentIdx > lastIndex) ? currentIdx: lastIndex;
                }
            });
        }
        return lastIndex + 1;
    }

    addFolder() {
        let newFolder = this.form.getRawValue();
        const lastIndex = this.getLastFolderIndex(newFolder.folder);
        newFolder = {
          'key'     : newFolder.key,
          'code'    : newFolder.folder !== this.noMasterValue ? newFolder.folder + '.' + lastIndex: '0.' + lastIndex,
          'label'   : newFolder.label,
          'type'    : 'folder',
        };
        this.http.post(API_URL + '/ws/docTypes/add', newFolder, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.notify.success(this.translate.instant('DOCTYPE.folder_added'));
                this.form.reset();
                Object.keys(this.form.controls).forEach(key => {
                    this.form.controls[key].setErrors(null) ;
                });
                this.documentTypeFactoryComponent.treeDataObj.reloadTree();
            }),
            catchError((err: any) => {
              console.debug(err);
              this.notify.handleErrors(err);
              return of(false);
            })
        ).subscribe();
    }
}
