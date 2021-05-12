import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";

@Component({
    selector: 'app-create',
    templateUrl: './form-builder.component.html',
    styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {
    loading = true
    formId: any;
    creationMode: boolean = true
    fieldCategories: any[] = [
        {
            'id': 'accounts',
            'label': this.translate.instant('ACCOUNTS.accounts')
        },
        {
            'id': 'facturation',
            'label': this.translate.instant('FACTURATION.facturation')
        },
    ];
    labelType = [
        this.translate.instant('TYPES.text')
    ]

    availableFieldsParent = [
        {
            'id': 'accounts',
            'label': this.translate.instant('ACCOUNTS.accounts'),
            'values': [
                {
                    id: 'name',
                    label: this.translate.instant('ACCOUNTS.name'),
                    unit: 'accounts',
                    type: 'text',
                    required: true,
                },
                {
                    id: 'siret',
                    label: this.translate.instant('ACCOUNTS.siret'),
                    unit: 'accounts',
                    type: 'text',
                    required: false,
                },
                {
                    id: 'siren',
                    label: this.translate.instant('ACCOUNTS.siren'),
                    unit: 'accounts',
                    type: 'text',
                    required: false,
                },
                {
                    id: 'vat_number',
                    label: this.translate.instant('ACCOUNTS.vat_number'),
                    unit: 'accounts',
                    type: 'text',
                    required: true,
                },
            ]
        },
        {
            'id': 'facturation',
            'label': this.translate.instant('FACTURATION.facturation'),
            'values': []
        },
        {
            'id': 'custom',
            'label': this.translate.instant('FORMS.custom_fields'),
            'values': []
        },
    ]

    fields_accounts: any = [];
    fields_facturation: any = [];

    constructor(
        private http: HttpClient,
        public router: Router,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    ngOnInit(): void {
        this.serviceSettings.init()
        this.formId = this.route.snapshot.params['id'];
        if (this.formId){
            this.creationMode = false
        }
        this.loading = false
    }

    drop(event: any) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
    }

}
