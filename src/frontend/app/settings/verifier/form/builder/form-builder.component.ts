import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";

@Component({
    selector: 'app-create',
    templateUrl: './form-builder.component.html',
    styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {
    loading = true
    form: any = {
        'label': {
            'control': new FormControl(),
        },
        'default': {
            'control': new FormControl(),
        }
    }
    formId: any;
    creationMode: boolean = true
    labelType = [
        this.translate.instant('TYPES.text')
    ]

    fieldCategories: any[] = [
        {
            'id': 'accounts',
            'label': this.translate.instant('ACCOUNTS.accounts')
        },
        {
            'id': 'facturation',
            'label': this.translate.instant('FACTURATION.facturation')
        }
    ];
    availableFieldsParent = [
        {
            'id': 'accounts_fields',
            'label': this.translate.instant('ACCOUNTS.accounts'),
            'values': [
                {
                    id: 'name',
                    label: this.translate.instant('ACCOUNTS.name'),
                    unit: 'accounts',
                    type: 'text',
                    required: true,
                    class: "w-30"
                },
                {
                    id: 'siret',
                    label: this.translate.instant('ACCOUNTS.siret'),
                    unit: 'accounts',
                    type: 'text',
                    required: false,
                    class: "w-30"
                },
                {
                    id: 'siren',
                    label: this.translate.instant('ACCOUNTS.siren'),
                    unit: 'accounts',
                    type: 'text',
                    required: false,
                    class: "w-30"
                },
                {
                    id: 'vat_number',
                    label: this.translate.instant('ACCOUNTS.vat_number'),
                    unit: 'accounts',
                    type: 'text',
                    required: true,
                    class: "w-30"
                },
                {
                    id: 'address1',
                    label: this.translate.instant('ADDRESSES.address_1'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    class: "w-30"
                },
                {
                    id: 'address2',
                    label: this.translate.instant('ADDRESSES.address_2'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    class: "w-30"
                },
                {
                    id: 'postal_code',
                    label: this.translate.instant('ADDRESSES.postal_code'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    class: "w-30"
                },
                {
                    id: 'city',
                    label: this.translate.instant('ADDRESSES.city'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    class: "w-30"
                },
                {
                    id: 'country',
                    label: this.translate.instant('ADDRESSES.country'),
                    unit: 'addresses',
                    type: 'text',
                    required: true,
                    class: "w-30"
                },
            ]
        },
        {
            'id': 'facturation_fields',
            'label': this.translate.instant('FACTURATION.facturation'),
            'values': []
        },
        {
            'id': 'custom_fields',
            'label': this.translate.instant('FORMS.custom_fields'),
            'values': []
        },
    ]
    fields: any = {
        'accounts': [],
        'facturation': []
    }
    classList: any[] = [
        {
            'id': 'w-full',
            'label': '1'
        },
        {
            'id': 'w-1/2',
            'label': '1/2'
        },
        {
            'id': 'w-30',
            'label': '1/3'
        },
        {
            'id': 'w-1/4',
            'label': '1/4'
        },
        {
            'id': 'w-1/5',
            'label': '1/5'
        }
    ]

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
    ) {
    }

    ngOnInit(): void {
        this.serviceSettings.init()
        this.formId = this.route.snapshot.params['id'];
        if (this.formId) {
            this.creationMode = false

            this.http.get(API_URL + '/ws/forms/getById/' + this.formId, {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    for (let field in this.form){
                        if (this.form.hasOwnProperty(field)){
                            for (let info in data){
                                if (data.hasOwnProperty(info)){
                                    if (info == field){
                                        this.form[field].control.value = data[info]
                                    }
                                }
                            }
                        }
                    }
                }),
                finalize(() => setTimeout(() => {
                    this.loading = false
                }, 500)),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe()

            this.http.get(API_URL + '/ws/forms/getFields/' + this.formId, {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    if (data.form_fields.fields) {
                        this.fields = data.form_fields.fields
                        for (let category in this.fields) {
                            if (this.fields.hasOwnProperty(category)) {
                                this.fields[category].forEach((current_field: any) => {
                                    this.availableFieldsParent.forEach((parent: any) => {
                                        let cpt = 0
                                        parent['values'].forEach((child_fields: any) => {
                                            if (current_field.id == child_fields.id) {
                                                parent['values'].splice(cpt, 1)
                                            }
                                            cpt = cpt + 1
                                        })
                                    })
                                })
                            }
                        }
                    }
                }),
                finalize(() => setTimeout(() => {
                    this.loading = false
                }, 500)),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe()
        }else{
            this.loading = false
        }
    }

    dropFromAvailableFields(event: any) {
        let unit = event.previousContainer.id
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data ? event.previousContainer.data : this.fields[unit],
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
    }

    changeClass(event: any, category: any) {
        let new_class = event.value
        let id = event.source.id.replace('_size', '')
        this.fields[category].forEach((element: any) => {
            if (element.id == id) {
                element.class = new_class
            }
        })
    }

    dropFromForm(event: any) {
        let unit = event.container.id
        let previousUnit = event.previousContainer.id
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data ? event.previousContainer.data : this.fields[previousUnit],
                event.container.data ? event.container.data : this.fields[unit],
                event.previousIndex,
                event.currentIndex);
        }
    }

    storeNewOrder(event: any, category_id: any) {
        let tmpCurrentOrder: any[] = []
        event.currentOrder.forEach((element: any) => {
            this.fields[category_id].forEach((field: any) => {
                if (element.id == field.id) {
                    tmpCurrentOrder.push(element)
                    console.log(element.id)
                }
            })
        })
        this.fields[category_id] = tmpCurrentOrder
    }

    updateForm() {
        let label = this.form.label.control.value
        let is_default = this.form.default.control.value
        if (label){
            this.http.put(API_URL + '/ws/forms/update/' + this.formId, {'args': {'label' : label, '"default"' : is_default}}, {headers: this.authService.headers},
            ).pipe(
                tap(()=> {
                    this.http.post(API_URL + '/ws/forms/updateFields/' + this.formId, this.fields, {headers: this.authService.headers}).pipe(
                        tap((data: any) => {
                            this.notify.success(this.translate.instant('FORMS.updated'))
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe()
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }else{
            this.notify.error('FORMS.label_mandatory')
        }
    }

    createForm(){
        let label = this.form.label.control.value
        let is_default = this.form.default.control.value
        if (label){
            this.http.post(API_URL + '/ws/forms/add', {'args': {'label' : label, '"default"' : is_default}}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    this.notify.success(this.translate.instant('FORMS.created'))

                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }else{
            this.notify.error('FORMS.label_mandatory')
        }
    }
}
