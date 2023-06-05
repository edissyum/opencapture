/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from  "../../env";
import { catchError, map, startWith, tap } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "../../../services/auth.service";
import { NotificationService } from "../../../services/notifications/notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { FormControl } from "@angular/forms";
import { DatePipe } from '@angular/common';
import { LocalStorageService } from "../../../services/local-storage.service";
import * as moment from 'moment';
import { UserService } from "../../../services/user.service";
import { HistoryService } from "../../../services/history.service";
import { LocaleService } from "../../../services/locale.service";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
declare const $: any;

@Component({
    selector: 'verifier-viewer',
    templateUrl: './verifier-viewer.component.html',
    styleUrls: ['./verifier-viewer.component.scss'],
    providers: [DatePipe]
})

export class VerifierViewerComponent implements OnInit {
    imageDocument           : any;
    documentId              : any;
    document                : any;
    fields                  : any;
    fromTokenFormId         : any;
    saveInfo                : boolean     = true;
    loading                 : boolean     = true;
    supplierExists          : boolean     = true;
    deleteDataOnChangeForm  : boolean     = true;
    processMultiDocument    : boolean     = false;
    isOCRRunning            : boolean     = false;
    processDone             : boolean     = false;
    fromToken               : boolean     = false;
    settingsOpen            : boolean     = false;
    ocrFromUser             : boolean     = false;
    accountingPlanEmpty     : boolean     = false;
    getOnlyRawFooter        : boolean     = false;
    disableOCR              : boolean     = false;
    tokenINSEEError         : boolean     = false;
    visualIsHide            : boolean     = false;
    loadingSubmit           : boolean     = false;
    formEmpty               : boolean     = false;
    processErrorMessage     : string      = '';
    processErrorIcon        : string      = '';
    token                   : string      = '';
    oldVAT                  : string      = '';
    oldSIRET                : string      = '';
    oldSIREN                : string      = '';
    currentFilename         : string      = '';
    lastLabel               : string      = '';
    lastId                  : string      = '';
    lastColor               : string      = '';
    toHighlight             : string      = '';
    toHighlightAccounting   : string      = '';
    tokenINSEE              : string      = '';
    imgSrc                  : SafeUrl     = '';
    ratio                   : number      = 0;
    currentPage             : number      = 1;
    accountingPlan          : any         = {};
    formSettings            : any         = {};
    workflowSettings        : any         = {};
    formList                : any         = {};
    currentFormFields       : any         = {};
    imgArray                : any         = {};
    currentSupplier         : any         = {};
    suppliers               : any         = [];
    outputsLabel            : any         = [];
    outputs                 : any         = [];
    multiDocumentsData      : any         = [];
    fieldCategories         : any[]       = [
        {
            id: 'supplier',
            label: this.translate.instant('FORMS.supplier')
        },
        {
            id: 'lines',
            label: this.translate.instant('FACTURATION.lines')
        },
        {
            id: 'facturation',
            label: this.translate.instant('FACTURATION.facturation')
        },
        {
            id: 'other',
            label: this.translate.instant('FORMS.other')
        }
    ];
    form                    : any         = {
        supplier      : [],
        lines         : [],
        facturation   : [],
        other         : []
    };
    pattern                 : any         = {
        alphanum                        : '^[(\\-)?0-9a-zA-Z\\s\']*$',
        alphanum_extended               : '^[(\\-)?0-9a-zA-Z-/#,\\.\'\\s]*$',
        alphanum_extended_with_accent   : '^[(\\-)?0-9a-zA-Z\\u00C0-\\u017F-/#,\'\\.\\s]*$',
        number_int                      : '^[(\\-)?0-9]*$',
        number_float                    : '^[(\\-)?0-9]*([.][0-9]*)*$',
        char                            : '^[A-Za-z\\s]*$',
        email                           : '^([A-Za-z0-9]+[\\.\\-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\\.[A-Z|a-z]{2,})+$'
    };
    supplierNamecontrol     : FormControl =  new FormControl();
    filteredOptions         : Observable<any> | any;

    constructor(
        private router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private authService: AuthService,
        private userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        private localeService: LocaleService,
        private historyService: HistoryService,
        private localStorageService: LocalStorageService
    ) {}

    async ngOnInit(document_id_from_multi = false): Promise<void> {
        this.localStorageService.save('splitter_or_verifier', 'verifier');
        this.ocrFromUser = false;
        this.saveInfo = true;

        if (this.route.snapshot.params['token']) {
            const token = this.route.snapshot.params['token'];
            const res: any = await this.retrieveDocumentIdAndStatusFromToken(token);
            this.fromToken = true;
            this.token = res['token'];
            if (res['status'] === 'wait') {
                this.loading = false;
                this.processErrorIcon = 'fa-clock fa-fade text-gray-400';
                this.processErrorMessage = marker('VERIFIER.waiting');
                return;
            } else if (res['status'] === 'running') {
                this.loading = false;
                this.processErrorIcon = 'fa-circle-notch fa-spin text-green-400';
                this.processErrorMessage = marker('VERIFIER.processing');
                return;
            } else if (res['status'] === 'error' || res['error']) {
                this.loading = false;
                this.processErrorIcon = 'fa-xmark text-red-400';
                this.processErrorMessage = this.translate.instant('VERIFIER.error', {reference: res['token']});
                return;
            } else {
                this.processDone = true;
                this.authService.headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
                if (res['document_ids'] && res['document_ids'].length  === 1) {
                    this.documentId = res['document_ids'][0];
                } else {
                    if (!document_id_from_multi) {
                        this.loading = false;
                        this.processMultiDocument = true;
                        for (const cpt in res['document_ids']) {
                            if (res['document_ids'].hasOwnProperty(cpt)) {
                                const id = res['document_ids'][cpt];
                                const tmp_thumb: any = await this.getThumbByDocumentId(id);
                                const thumb: SafeUrl = this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64, ' + tmp_thumb['file']);
                                const document: any = await this.getDocumentById(id);
                                if (document['status'] === 'NEW') {
                                    this.multiDocumentsData.push({
                                        id: id,
                                        thumb: thumb
                                    });
                                }
                            }

                            if (this.multiDocumentsData.length === 1) {
                                this.loadDocument(this.multiDocumentsData[0].id);
                            }
                        }
                        return;
                    } else {
                        this.documentId = document_id_from_multi;
                    }
                }
            }
        } else {
            this.documentId = this.route.snapshot.params['id'];
            if (!this.authService.headersExists) {
                this.authService.generateHeaders();
            }
        }

        this.translate.get('HISTORY-DESC.viewer', {document_id: this.documentId}).subscribe((translated: string) => {
            this.translate.get('HISTORY.user').subscribe((firstname: string) => {
                this.historyService.addHistory('verifier', 'viewer', translated, {
                    'username': 'token_user',
                    'lastname': 'Token',
                    'firstname': firstname
                });
            });
        });

        this.updateDocument({
            'locked': true,
            'locked_by': this.userService.user.username
        });
        this.document = await this.getDocument();
        if (this.document.workflow_id) {
            this.getWorkflow();
        }
        if (this.fromToken && (this.document.status === 'END' || this.document.status === 'ERR')) {
            this.loading = false;
            this.processDone = false;
            this.processErrorIcon = 'fa-check text-green-400';
            this.processErrorMessage = marker('VERIFIER.document_already_processed');
            return;
        }

        this.currentFilename = this.document.full_jpg_filename;
        await this.getThumb(this.document.full_jpg_filename);

        if (this.fromTokenFormId) {
            this.document.form_id = this.fromTokenFormId;
        }

        if (this.document.form_id) {
            await this.generateOutputs(this.document.form_id);
        }

        this.formList = await this.getAllForm();
        this.formList = this.formList.forms;
        this.suppliers = await this.retrieveSuppliers();
        this.suppliers = this.suppliers.suppliers;

        let supplierFormFound = false;
        if (this.document.supplier_id) {
            for (const element of this.suppliers) {
                if (element.id === this.document.supplier_id) {
                    this.currentSupplier = element;
                    if (element.form_id) {
                        supplierFormFound = element.form_id;
                    }
                }
            }
        }

        if (Object.keys(this.currentFormFields).length === 0) {
            let defaultFormFound = false;
            if (supplierFormFound) {
                await this.generateOutputs(supplierFormFound);
            } else {
                for (const element of this.formList) {
                    if (element.default_form) {
                        defaultFormFound = element.id;
                    }
                }
                if (defaultFormFound) {
                    await this.generateOutputs(defaultFormFound);
                }
            }
            if (defaultFormFound || supplierFormFound) {
                this.currentFormFields = await this.getForm();
            } else {
                this.notify.error(this.translate.instant('FORMS.no_form_available'));
                await this.router.navigate(['/verifier/list']);
            }
        }
        /*
        * Enable library to draw rectangle on load (OCR ON FLY)
        */
        this.imageDocument = $('#document_image');
        this.ratio = this.document.img_width / this.imageDocument.width();
        this.ocr({
            'target' : {
                'id': '',
                'labels': [
                    {'textContent': ''}
                ]
            }
        }, true);
        await this.fillForm(this.currentFormFields);
        if (this.document.supplier_id) {
            this.getSupplierInfo(this.document.supplier_id, false, true);
        }
        setTimeout(() => {
            this.drawPositions();
            this.convertAutocomplete();
            document.getElementById('image')!.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            document.getElementById('form')!.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            this.loading = false;
        }, 500);
        const triggerEvent = $('.trigger');
        triggerEvent.hide();

        if (this.formSettings.settings.unique_url && this.formSettings.settings.unique_url.allow_supplier_autocomplete) {
            this.filteredOptions = this.supplierNamecontrol.valueChanges.pipe(
                startWith(''),
                map(option => option ? this._filter(option) : this.suppliers.slice())
            );
        }
    }

    loadDocument(documentId: any) {
        this.loading = true;
        this.processMultiDocument = false;
        this.ngOnInit(documentId).then();
    }

    copyToken() {
        navigator.clipboard.writeText(this.token).then(() => {
            this.notify.success(this.translate.instant('CONFIGURATIONS.token_copied'));
        });
    }

    async retrieveDocumentIdAndStatusFromToken(token: any) {
        return await this.http.post(environment['url'] + '/ws/verifier/documents/getDocumentIdAndStatusByToken', {'token': token}).toPromise().catch((err: any) => {
            this.notify.handleErrors(err);
            this.authService.logout();
        });
    }

    convertAutocomplete() {
        this.outputs.forEach((output: any) => {
            if (output.data.options.links && output.output_type_id === 'export_mem') {
                const data = {
                    "host": output.data.options.auth[0].value,
                    "login": output.data.options.auth[1].value,
                    "password": output.data.options.auth[2].value,
                    "autocompleteField": '',
                    "memCustomField": '',
                    "memClause": '',
                    "vatNumberContactCustom": '',
                    "enabled": false,
                    "supplierCustomId": ''
                };

                output.data.options.links.forEach((element: any) => {
                    if (element.id === 'enabled' && element.value) {
                        data['enabled'] = true;
                    }
                    if (element.id === 'openCaptureField' && element.value) {
                        data['autocompleteField'] = element.value;
                    } else if (element.id === 'memCustomField' && element.value) {
                        data['memCustomField'] = element.value;
                    } else if (element.id === 'memClause' && element.value) {
                        data['memClause'] = element.value;
                    } else if (element.id === 'vatNumberContactCustom' && element.value) {
                        data['vatNumberContactCustom'] = element.value;
                    }
                });
                if (data['enabled']) {
                    this.form.supplier.forEach((supplier_element: any) => {
                        if (supplier_element.id === 'vat_number' || supplier_element.id === 'siret') {
                            data['supplierCustomId'] += supplier_element.control.value;
                        }
                    });

                    this.form.facturation.forEach((element: any) => {
                       if (element.id === data['autocompleteField']) {
                           this.http.post(environment['url'] + 'getDocumentsWithContact/ws/mem/', data, {headers: this.authService.headers},
                           ).pipe(
                               tap((_return: any) => {
                                   element.type = 'autocomplete';
                                   if (_return && _return.count > 0) {
                                       element.autocomplete_values = element.control.valueChanges.pipe(
                                           startWith(''),
                                           map(option => option ? this._filter_data(option, _return.resources) : _return.resources.slice())
                                       );
                                   }
                               }),
                               catchError((err: any) => {
                                   console.debug(err);
                                   this.notify.handleErrors(err);
                                   return of(false);
                               })
                           ).subscribe();
                       }
                    });
                }
            }
        });
    }

    async generateOutputs(formId: any) {
        this.currentFormFields = await this.getFormFieldsById(formId);
        this.formSettings = await this.getFormById(formId);
        if (this.formSettings.outputs.length !== 0) {
            for (const outputId in this.formSettings.outputs) {
                const output = await this.getOutputs(this.formSettings.outputs[outputId]);
                this.outputs.push(output);
                this.outputsLabel.push(output.output_label);
            }
        }

        if (!this.fromToken && !this.formSettings.settings.unique_url) {
            this.formSettings.settings.unique_url = {
                "expiration": 7,
                "change_form": true,
                "create_supplier": true,
                "enable_supplier": true,
                "refuse_document": true,
                "validate_document": true
            };
        }

        if (this.formSettings.settings.supplier_verif && !this.tokenINSEE) {
            const token: any = await this.generateTokenInsee();
            if (token['token']) {
                if (token['token'].includes('ERROR')) {
                    this.tokenINSEEError = true;
                    this.tokenINSEE = token['token'].replace('ERROR : ', '');
                } else {
                    this.tokenINSEEError = false;
                    this.tokenINSEE = token['token'];
                }
            }
        }
    }

    async generateTokenInsee() {
        return await this.http.get(environment['url'] + '/ws/verifier/getTokenINSEE', {headers: this.authService.headers}).toPromise();
    }

    getCategoryLabel(category: any) {
        return this.formSettings.labels[category.id] ? this.formSettings.labels[category.id] : this.translate.instant(category.label);
    }

    async getThumbByDocumentId(documentId: any) {
        return this.http.post(environment['url'] + '/ws/verifier/getThumbByDocumentId', {'documentId': documentId}, {headers: this.authService.headers}).toPromise();
    }

    async getThumb(filename:string) {
        const cpt = filename.split('-')[filename.split('-').length - 1].split('.')[0];
        if (this.imgArray[cpt]) {
            this.imgSrc = this.imgArray[cpt];
        } else {
            this.http.post(environment['url'] + '/ws/verifier/getThumb',
                {'args': {'type': 'full', 'filename': filename, 'registerDate': this.document.register_date}},
                {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    this.imgSrc = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64, ' + data.file);
                    this.imgArray[cpt] = this.imgSrc;
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
        return this.imgSrc;
    }

    private _filter(value: any): string[] {
        this.toHighlight = value;
        const filterValue = value.toLowerCase();
        const _return = this.suppliers.filter((supplier: any) => supplier.name.toLowerCase().indexOf(filterValue) !== -1);
        this.supplierExists = _return.length !== 0;
        if (!this.supplierExists) {
            this.form['supplier'].forEach((element: any) => {
                if (element.id !== 'name') {
                    element.control.setValue('');
                    element.control.setErrors(null);
                }
            });
        }
        return _return;
    }

    private _filter_data(value: any, data: any): string[] {
        this.toHighlight = value;
        const filterValue = value.toLowerCase();
        return data.filter((element: any) => element.data.toLowerCase().indexOf(filterValue) !== -1);
    }

    updateFilteredOption(event: any, control: any) {
        let value = '';
        if (event.target.value) value = event.target.value;
        else if (control.value) value = control.value;
        control.patchValue(value);
    }

    getFieldInfo(fieldId: any) {
        for (const parent in this.fields) {
            for (const cpt in this.form[parent]) {
                const field = this.form[parent][cpt];
                if (field.id === fieldId) {
                    return field;
                }
            }
        }
    }

    async drawPositions(): Promise<any> {
        for (const fieldId in this.document.datas) {
            const page = this.getPage(fieldId);
            const position = this.document.positions[fieldId];
            if (position && parseInt(String(page)) === parseInt(String(this.currentPage))) {
                const splittedFieldId = fieldId.split('_');
                const field = this.getFieldInfo(fieldId);
                let cpt = '0';
                if (!isNaN(parseInt(splittedFieldId[splittedFieldId.length - 1])) && !fieldId.includes('custom_')) {
                    cpt = splittedFieldId[splittedFieldId.length - 1];
                }
                if (field) {
                    this.drawPositionByField(field, position, cpt);
                    $('#' + field.id).blur();
                }
            }
        }
    }

    drawPositionByField(field: any, position: any, cpt = '0') {
        this.lastId = field.id;
        this.lastLabel = this.translate.instant(field.label).trim();
        if (cpt !== '0') this.lastLabel += ' ' + parseInt(cpt);
        this.lastColor = field.color;
        this.disableOCR = true;
        const newArea = {
            x: position.ocr_from_user ? position.x / this.ratio : position.x / this.ratio - ((position.x / this.ratio) * 0.005),
            y: position.ocr_from_user ? position.y / this.ratio : position.y / this.ratio - ((position.y / this.ratio) * 0.003),
            width: position.ocr_from_user ? position.width / this.ratio : position.width / this.ratio + ((position.width / this.ratio) * 0.05),
            height: position.ocr_from_user ? position.height / this.ratio : position.height / this.ratio + ((position.height / this.ratio) * 0.6)
        };
        const triggerEvent = $('.trigger');
        triggerEvent.hide();
        triggerEvent.trigger('mousedown');
        triggerEvent.trigger('mouseup', [newArea]);
    }

    getPage(fieldId: any) {
        let page: number = 1;
        if (this.document.pages) {
            Object.keys(this.document.pages).forEach((element: any) => {
                if (element === fieldId) {
                    page = this.document.pages[fieldId];
                }
            });
        }
        return page;
    }

    async retrieveSuppliers(): Promise<any> {
        return await this.http.get(environment['url'] + '/ws/accounts/suppliers/list?order=name ASC', {headers: this.authService.headers}).toPromise();
    }

    async getDocument(): Promise<any> {
        return await this.http.get(environment['url'] + '/ws/verifier/documents/' + this.documentId, {headers: this.authService.headers}).toPromise();
    }

    async getDocumentById(id: any): Promise<any> {
        return await this.http.get(environment['url'] + '/ws/verifier/documents/' + id, {headers: this.authService.headers}).toPromise();
    }

    getWorkflow() {
        this.http.get(environment['url'] + '/ws/workflows/verifier/getById/' + this.document.workflow_id,
            {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.workflowSettings = data;
            })
        ).subscribe();
    }

    async getForm(): Promise<any> {
        if (this.document.form_id) {
            return await this.http.get(environment['url'] + '/ws/forms/fields/getByFormId/' + this.document.form_id, {headers: this.authService.headers}).toPromise();
        }
        if (this.document.supplier_id) {
            return await this.http.get(environment['url'] + '/ws/forms/fields/getBySupplierId/' + this.document.supplier_id, {headers: this.authService.headers}).toPromise();
        }
        else {
            return await this.http.get(environment['url'] + '/ws/forms/getDefault/verifier', {headers: this.authService.headers}).toPromise();
        }
    }

    async getAllForm(): Promise<any> {
        return await this.http.get(environment['url'] + '/ws/forms/verifier/list', {headers: this.authService.headers}).toPromise();
    }

    async getFormFieldsById(formId: number): Promise<any> {
        return await this.http.get(environment['url'] + '/ws/forms/fields/getByFormId/' + formId, {headers: this.authService.headers}).toPromise();
    }

    async getFormById(formId: number): Promise<any> {
        return await this.http.get(environment['url'] + '/ws/forms/verifier/getById/' + formId, {headers: this.authService.headers}).toPromise();
    }

    async fillForm(data: any): Promise<any> {
        this.form = {
            'supplier': [],
            'lines': [],
            'facturation': [],
            'other': []
        };
        this.fields = data.fields;
        for (const category in this.fields) {
            for (const cpt in this.fields[category]) {
                const field = this.fields[category][cpt];
                this.form[category].push({
                    id: field.id,
                    label: field.label,
                    required: field.required,
                    control: new FormControl(),
                    type: field.type,
                    pattern: this.getPattern(field.format),
                    color: field.color,
                    unit: field.unit,
                    class: field.class,
                    format: field.format,
                    display: field.display,
                    format_icon: field.format_icon,
                    display_icon: field.display_icon,
                    class_label: field.class_label,
                    cpt: 0,
                    values: '',
                    lineSelected: field.lineSelected,
                    fullSizeSelected: field.fullSizeSelected
                });

                const _field = this.form[category][this.form[category].length - 1];
                if (field.id === 'accounting_plan') {
                    let array : any = {};
                    if (this.document.customer_id && this.document.customer_id !== 0) {
                        array = await this.retrieveAccountingPlan();
                    }
                    this.accountingPlanEmpty = Object.keys(array).length === 0;
                    if (this.accountingPlanEmpty) {
                        array = await this.retrieveDefaultAccountingPlan();
                    }
                    this.accountingPlan = this.sortArray(array);
                    _field.values = this.form[category][cpt].control.valueChanges
                        .pipe(
                            startWith(''),
                            map(option => option ? this._filter_accounting(this.accountingPlan, option) : this.accountingPlan)
                        );
                }

                if (this.document.datas[field.id]) {
                    let value = this.document.datas[field.id];
                    if (field.format === 'date' && field.id !== '' && field.id !== undefined && value && typeof value === 'string') {
                        value = value.replaceAll('.', '/');
                        value = value.replaceAll(',', '/');
                        value = value.replaceAll(' ', '/');
                        const format = moment().localeData().longDateFormat('L');
                        value = moment(value, format);
                        value = new Date(value._d);
                    }
                    _field.control.setValue(value);
                    _field.control.markAsTouched();

                    if (field.id === 'siret' || field.id === 'siren') this.checkSirenOrSiret(field.id, value);
                    if (field.id === 'vat_number') this.checkVAT(field.id, value);
                }

                if (field.id === 'name' && category === 'supplier') {
                    this.supplierNamecontrol = this.form[category][cpt].control;
                }

                if (!field.lineSelected && !field.fullSizeSelected) {
                    this.findChildren(field.id, _field, category);
                } else if (field.fullSizeSelected) {
                    for (const field_data in this.document.datas) {
                        if (field_data.includes(field.id + '_')) {
                            this.duplicateLine(field.id, category, true);
                        }
                    }
                }
            }
        }
        if (this.form.facturation.length === 0 && this.form.supplier.length === 0 && this.form.other.length === 0) {
            this.formEmpty = true;
        }
    }

    async getOutputs(outputId: any): Promise<any> {
        return await this.http.get(environment['url'] + '/ws/outputs/verifier/getById/' + outputId, {headers: this.authService.headers}).toPromise();
    }

    private _filter_accounting(array: any, value: any): string[] {
        this.toHighlightAccounting = value;
        const filterValue = value.toLowerCase();
        return array.filter((option: any) => option.compte_lib.toLowerCase().indexOf(filterValue) !== -1 || option.compte_num.toLowerCase().indexOf(filterValue) !== -1);
    }

    sortArray(array: any) {
        return array.sort((a: any, b: any) => {
            const x = a.compte_num, y = b.compte_num;
            return x === y ? 0 : x > y ? 1 : -1;
        });
    }

    async retrieveAccountingPlan() {
        return await this.http.get(environment['url'] + '/ws/accounts/customers/getAccountingPlan/' + this.document.customer_id, {headers: this.authService.headers}).toPromise();
    }

    async retrieveDefaultAccountingPlan() {
        return await this.http.get(environment['url'] + '/ws/accounts/customers/getDefaultAccountingPlan', {headers: this.authService.headers}).toPromise();
    }

    hideVisuals() {
        this.visualIsHide = !this.visualIsHide;
        const visuals = document.getElementsByClassName('select-areas-background-area');
        Array.from(visuals).forEach((element: any) => {
            const cpt = element.id.match(/(\d+)/)[0];
            if (this.visualIsHide) {
                document.getElementById("select-areas-background-area_" + cpt)!.style.display = 'none';
                document.getElementById("select-areas-outline_" + cpt)!.style.display = 'none';
                document.getElementById("select-areas-label-container_" + cpt)!.style.display = 'none';
            } else {
                document.getElementById("select-areas-background-area_" + cpt)!.style.display = 'block';
                document.getElementById("select-areas-outline_" + cpt)!.style.display = 'block';
                document.getElementById("select-areas-label-container_" + cpt)!.style.display = 'block';
            }
        });
    }

    findChildren(parentId: any, parent: any, categoryId: any) {
        for (const field in this.document.datas) {
            if (field.includes(parentId + '_')) {
                parent.cpt += 1;
                const splitted = field.split('_');
                const cpt = parseInt(splitted[splitted.length - 1]) + 1;
                this.form[categoryId].push({
                    id: field,
                    label: parent.label,
                    required: parent.required,
                    control: new FormControl(),
                    type: parent.type,
                    pattern: this.getPattern(parent.format),
                    color: parent.color,
                    unit: parent.unit,
                    class: parent.class,
                    format: parent.format,
                    display: 'simple',
                    format_icon: parent.format_icon,
                    display_icon: parent.display_icon,
                    class_label: parent.class_label,
                    cpt: cpt
                });
                const value = this.document.datas[field];
                const _field = this.form[categoryId][this.form[categoryId].length - 1];
                _field.control.setValue(value);
            }
        }
    }

    getSelectionByCpt(selection: any, cpt: any) {
        for (const index in selection) {
            if (selection[index].id === cpt)
                return selection[index];
        }
    }

    ocr(event: any, enable: boolean, color = 'green') {
        $('.trigger').show();
        const _this = this;
        this.lastId = event.target.id;
        this.lastLabel = event.target.labels[0].textContent.replace('*', '').trim();
        this.lastColor = color;
        const imageContainer = $('.image-container');
        const deleteArea = $('.delete-area');
        const backgroundArea = $('.select-areas-background-area');
        const resizeArea = $('.select-areas-resize-handler');
        if (this.document.status !== 'END') {
            deleteArea.addClass('pointer-events-auto');
            backgroundArea.addClass('pointer-events-auto');
            resizeArea.addClass('pointer-events-auto');
        }
        imageContainer.addClass('pointer-events-none');
        imageContainer.addClass('cursor-auto');
        if (enable) {
            $('.outline_' + _this.lastId).toggleClass('animate');
            this.scrollToElement();
            if (this.document.status !== 'END') {
                imageContainer.removeClass('pointer-events-none');
                imageContainer.removeClass('cursor-auto');
            }
            this.imageDocument.selectAreas({
                allowNudge: false,
                minSize: [20, 20],
                maxSize: [this.imageDocument.width(), this.imageDocument.height() / 8],
                onChanged(img: any, cpt: any, selection: any) {
                    if (selection.length !== 0 && selection['width'] !== 0 && selection['height'] !== 0) {
                        if (_this.lastId) {
                            if ($('#select-area-label_' + cpt).length > 0) {
                                const inputId = $('#select-area-label_' + cpt).attr('class').replace('input_', '').replace('select-none', '');
                                if (inputId.trim() !== _this.lastId.trim()) {
                                    _this.lastId = inputId;
                                    _this.lastLabel = $('#select-area-label_' + cpt).text();
                                }
                            }
                            _this.ocr_process(img, cpt, selection);
                        }
                    }
                },
                onDeleted(_img: any, cpt: any) {
                    const inputId = $('#select-area-label_' + cpt).attr('class').replace('input_', '').replace('select-none', '');
                    if (inputId) {
                        _this.updateFormValue(inputId, '');
                        delete _this.document.positions[inputId.trim()];
                        if (_this.deleteDataOnChangeForm) {
                            _this.deleteData(inputId);
                            _this.deletePosition(inputId);
                            _this.deletePage(inputId);
                        }
                    }
                }
            });
        } else {
            let deleteClicked = false;
            $(".select-areas-delete-area").click(() => {
                deleteClicked = true;
            });
            setTimeout(() => {
                if (!deleteClicked) {
                    resizeArea.hide();
                    deleteArea.hide();
                }
            }, 200);
            $('.outline_' + _this.lastId).removeClass('animate');
        }
    }

    scrollToElement() {
        if (this.document.pages[this.lastId]) {
            this.changeImage(this.document.pages[this.lastId], this.currentPage)
        }
        if (this.document.positions[this.lastId]) {
            const currentHeight = window.innerHeight;
            if (document.getElementsByClassName('input_' + this.lastId).length > 0) {
                const position = document.getElementsByClassName('input_' + this.lastId)![0]!.getBoundingClientRect().top;
                if (position >= currentHeight || position <= currentHeight) {
                    document.getElementById('image')!.scrollTo({
                        top: position - 200,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }

    ocr_process(img: any, cpt: number, selection: any) {
        // Write the label of the input above the selection rectangle
        const page = this.getPage(this.lastId);
        if (this.ocrFromUser || (parseInt(String(page)) === this.currentPage || page === 0)) {
            if ($('#select-area-label_' + cpt).length === 0) {
                const outline = $('#select-areas-outline_' + cpt);
                const backgroundArea = $('#select-areas-background-area_' + cpt);
                const labelContainer = $('#select-areas-label-container_' + cpt);
                const deleteContainer = $('#select-areas-delete_' + cpt);
                const resizeHandler = $('.select-areas-resize-handler_' + cpt);
                labelContainer.append('<div id="select-area-label_' + cpt + '" class="input_' + this.lastId + ' select-none">' + this.lastLabel + '</div>');
                backgroundArea.css('background-color', this.lastColor);
                outline.addClass('outline_' + this.lastId);
                backgroundArea.addClass('background_' + this.lastId);
                resizeHandler.addClass('resize_' + this.lastId);
                deleteContainer.addClass('delete_' + this.lastId);
                backgroundArea.data('page', page);
                labelContainer.data('page', page);
                outline.data('page', page);
                if (this.document.status === 'END') {
                    outline.addClass('pointer-events-none');
                    backgroundArea.addClass('pointer-events-none');
                    resizeHandler.addClass('pointer-events-none');
                    deleteContainer.addClass('pointer-events-none');
                }
            }
            // End write
            const inputId = $('#select-area-label_' + cpt).attr('class').replace('input_', '').replace('select-none', '');
            $('#' + inputId).focus();

            // Test to avoid multi selection for same label. If same label exists, remove the selected areas and replace it by the new one
            const label = $('div[id*=select-area-label_]:contains(' + this.lastLabel + ')');
            const labelCount = label.length;
            if (labelCount > 1) {
                const cptToDelete = label[labelCount - 1].id.split('_')[1];
                $('#select-areas-label-container_' + cptToDelete).remove();
                $('#select-areas-background-area_' + cptToDelete).remove();
                $('#select-areas-outline_' + cptToDelete).remove();
                $('#select-areas-delete_' + cptToDelete).remove();
                $('.select-areas-resize-handler_' + cptToDelete).remove();
            }
            if (!this.isOCRRunning && !this.loading && this.saveInfo) {
                this.isOCRRunning = true;
                let lang = this.localeService.currentLang;
                if (Object.keys(this.currentSupplier).length !== 0) {
                    lang = this.currentSupplier.document_lang;
                }
                this.http.post(environment['url'] + '/ws/verifier/ocrOnFly',
                    {
                        selection: this.getSelectionByCpt(selection, cpt),
                        fileName: this.currentFilename, lang: lang,
                        thumbSize: {width: img.currentTarget.width, height: img.currentTarget.height},
                        registerDate: this.document.register_date
                    }, {headers: this.authService.headers})
                    .pipe(
                        tap((data: any) => {
                            this.isOCRRunning = false;
                            let oldPosition = {
                                x: 0,
                                y: 0,
                                width: 0,
                                height: 0,
                            };
                            if (this.document.positions[inputId.trim()]) {
                                oldPosition = {
                                    x: this.document.positions[inputId.trim()].x / this.ratio - ((this.document.positions[inputId.trim()].x / this.ratio) * 0.005),
                                    y: this.document.positions[inputId.trim()].y / this.ratio - ((this.document.positions[inputId.trim()].y / this.ratio) * 0.003),
                                    width: this.document.positions[inputId.trim()].width / this.ratio + ((this.document.positions[inputId.trim()].width / this.ratio) * 0.05),
                                    height: this.document.positions[inputId.trim()].height / this.ratio + ((this.document.positions[inputId.trim()].height / this.ratio) * 0.6)
                                };
                            }

                            const newPosition = this.getSelectionByCpt(selection, cpt);
                            if (newPosition.x !== oldPosition.x && newPosition.y !== oldPosition.y &&
                                newPosition.width !== oldPosition.width && newPosition.height !== oldPosition.height) {
                                this.updateFormValue(inputId, data.result);
                                const res = this.saveData(data.result, this.lastId, true);
                                if (res) {
                                    this.savePosition(newPosition);
                                    this.savePages(this.currentPage).then();
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
            this.saveInfo = true;
        } else {
            const input = $('.input_' + this.lastId);
            const background = $('.background_' + this.lastId);
            const outline = $('.outline_' + this.lastId);
            input.remove();
            background.remove();
            outline.remove();
        }
    }

    updateFormValue(inputId: string, value: any) {
        for (const category in this.form) {
            this.form[category].forEach((input: any) => {
                if (input.id.trim() === inputId.trim()) {
                    if (value && (input.format === 'number_int' || input.format === 'number_float')) {
                        value = value.replace(/[A-Za-z€%$]/g, '');
                    }
                    if (input.type === 'date' && value) {
                        const format = moment().localeData().longDateFormat('L');
                        value = moment(value, format);
                        value = new Date(value._d);
                    }
                    input.control.setValue(value);
                    input.control.markAsTouched();
                }
            });
        }
    }

    savePosition(position: any) {
        position = {
            ocr_from_user: true,
            x: position.x * this.ratio,
            y: position.y * this.ratio,
            height: position.height * this.ratio,
            width: position.width * this.ratio
        };

        if (this.document.supplier_id) {
            this.http.put(environment['url'] + '/ws/accounts/supplier/' + this.document.supplier_id + '/updatePosition',
                {'args': {'form_id': this.currentFormFields.form_id, [this.lastId]: position}},
                {headers: this.authService.headers}).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }

        this.http.put(environment['url'] + '/ws/verifier/documents/' + this.document.id + '/updatePosition',
            {'args': {[this.lastId]: position}},
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.document.positions[this.lastId] = position;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    async savePages(page: any) {
        if (this.document.supplier_id) {
            this.http.put(environment['url'] + '/ws/accounts/supplier/' + this.document.supplier_id + '/updatePage',
                {'args': {'form_id': this.currentFormFields.form_id, [this.lastId]: page}},
                {headers: this.authService.headers}).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }

        this.http.put(environment['url'] + '/ws/verifier/documents/' + this.document.id + '/updatePage',
            {'args': {[this.lastId]: page}},
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.document.pages[this.lastId] = page;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    saveData(data: any, fieldId: any = false, showNotif: boolean = false) {
        if (this.document.status !== 'END') {
            const oldData = data;
            if (fieldId) {
                const field = this.getField(fieldId);
                if (Object.keys(field).length !== 0) {
                    if (field.unit === 'addresses' || field.unit === 'supplier') showNotif = false;
                    if (field.control.errors || this.document.datas[fieldId] === data) return false;
                    data = {[fieldId]: data};
                    this.http.put(environment['url'] + '/ws/verifier/documents/' + this.document.id + '/updateData',
                        {'args': data},
                        {headers: this.authService.headers}).pipe(
                        tap(() => {
                            this.document.datas[fieldId] = oldData;
                            if (showNotif) {
                                this.notify.success(this.translate.instant('DOCUMENTS.position_and_data_updated', {"input": this.lastLabel}));
                            }
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                    return true;
                }
            }
        }
        return false;
    }

    createSupplier() {
        const addressData: any = {};
        const supplierData: any = {};
        this.fields.supplier.forEach((element: any) => {
            const field = this.getField(element.id);
            if (element.unit === 'supplier') supplierData[element.id] = field.control.value;
            if (element.unit === 'addresses') addressData[element.id] = field.control.value;
            this.saveData(field.control.value, element.id);
        });

        this.http.post(environment['url'] + '/ws/accounts/addresses/create', {'args': addressData}, {headers: this.authService.headers},
        ).pipe(
            tap((data: any) => {
                supplierData['address_id'] = data.id;
                this.http.post(environment['url'] + '/ws/accounts/suppliers/create', {'args': supplierData}, {headers: this.authService.headers},
                ).pipe(
                    tap(async (supplier_data: any) => {
                        this.notify.success(this.translate.instant('ACCOUNTS.supplier_created'));
                        this.updateDocument({'supplier_id': supplier_data['id']});
                        this.document.supplier_id = supplier_data['id'];
                        this.suppliers = await this.retrieveSuppliers();
                        this.suppliers = this.suppliers.suppliers;
                        this.supplierExists = true;
                        for (const element of this.suppliers) {
                            if (element.id === this.document.supplier_id) {
                                this.currentSupplier = element;
                            }
                        }
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
    }

    editSupplier() {
        const supplierData: any = {};
        const addressData: any = {};
        this.fields.supplier.forEach((element: any) => {
            const field = this.getField(element.id);
            if (element.unit === 'supplier') supplierData[element.id] = field.control.value;
            if (element.unit === 'addresses') addressData[element.id] = field.control.value;
            this.saveData(field.control.value, element.id);
        });

        this.http.put(environment['url'] + '/ws/accounts/suppliers/update/' + this.document.supplier_id, {'args': supplierData}, {headers: this.authService.headers},
        ).pipe(
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.put(environment['url'] + '/ws/accounts/addresses/updateBySupplierId/' + this.document.supplier_id, {'args': addressData}, {headers: this.authService.headers},
        ).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('ACCOUNTS.supplier_updated'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    updateDocument(data: any) {
        this.http.put(environment['url'] + '/ws/verifier/documents/' + this.documentId + '/update',
            {'args': data},
            {headers: this.authService.headers}).pipe(
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    getField(fieldId: any) {
        let _field : any = {};
        for (const category in this.form) {
            this.form[category].forEach((field: any) => {
                if (field.id.trim() === fieldId.trim()) {
                    _field = field;
                }
            });
        }
        return _field;
    }

    deleteData(fieldId: any, multiple: boolean = false) {
        let args: any;
        if (multiple) {
            args = {'fields': fieldId, 'multiple': true};
        } else {
            args = fieldId.trim();
        }

        this.http.put(environment['url'] + '/ws/verifier/documents/' + this.document.id + '/deleteData',
            {'args': args}, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('DOCUMENTS.data_deleted', {"input": this.lastLabel}));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    deletePosition(fieldId: any, multiple: boolean = false) {
        let args: any;
        if (multiple) {
            args = {'fields': fieldId, 'multiple': true};
        } else {
            args = fieldId.trim();
        }

        this.http.put(environment['url'] + '/ws/verifier/documents/' + this.document.id + '/deletePosition',
            {'args': args}, {headers: this.authService.headers}).pipe(
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        if (this.document.supplier_id) {
            if (multiple) {
                args = {'fields': fieldId, 'multiple': true, 'form_id' : this.document.form_id};
            } else {
                args = {'field_id': fieldId.trim(), 'form_id' : this.document.form_id};
            }
            this.http.put(environment['url'] + '/ws/accounts/suppliers/' + this.document.supplier_id + '/deletePosition',
                {'args': args}, {headers: this.authService.headers}).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    deletePage(fieldId: any, multiple: boolean = false) {
        let args: any;
        if (multiple) {
            args = {'fields': fieldId, 'multiple': true};
        } else {
            args = fieldId.trim();
        }

        this.http.put(environment['url'] + '/ws/verifier/documents/' + this.document.id + '/deletePage',
            {'args': args}, {headers: this.authService.headers}).pipe(
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        if (this.document.supplier_id) {
            if (multiple) {
                args = {'fields': fieldId, 'multiple': true, 'form_id' : this.document.form_id};
            } else {
                args = {'field_id': fieldId.trim(), 'form_id' : this.document.form_id};
            }
            this.http.put(environment['url'] + '/ws/accounts/suppliers/' + this.document.supplier_id + '/deletePage',
                {'args': args}, {headers: this.authService.headers}).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    getPattern(format: any) {
        let pattern = '';
        for (const cpt in this.pattern) {
            if (cpt === format) {
                pattern = this.pattern[cpt];
            }
        }
        return pattern;
    }

    duplicateLine(fieldId: any, categoryId: any, neededValue: boolean = false) {
        const listOfNewField: any = {};
        const listOfNewFieldData: any = {};
        this.form[categoryId].forEach((field: any, cpt: number) => {
            if (field.id.trim() === fieldId.trim()) {
                const numberOfField = field.class.replace('w-1/', '');
                if (numberOfField !== 'full') {
                    for (let i = cpt - numberOfField + 1; i <= cpt; i++) {
                        const newField = Object.assign({}, this.form[categoryId][i]);
                        this.form[categoryId][i].cpt += 1;
                        newField.id = newField.id + '_' + this.form[categoryId][i].cpt;
                        newField.cpt = this.form[categoryId][i].cpt;
                        newField.display = 'simple';
                        newField.deleteLine = this.form[categoryId][i].fullSizeSelected;
                        newField.lineSelected = true;
                        newField.fullSizeSelected = false;
                        newField.control = new FormControl();
                        if (this.document.datas[newField.id]) {
                            let value = this.document.datas[newField.id];
                            if (newField.format === 'date' && newField.id !== '' && newField.id !== undefined && value && typeof value === 'string') {
                                value = value.replaceAll('.', '/');
                                value = value.replaceAll(',', '/');
                                value = value.replaceAll(' ', '/');
                                const format = moment().localeData().longDateFormat('L');
                                value = moment(value, format);
                                value = new Date(value._d);
                            }
                            newField.control.setValue(value);
                            newField.control.markAsTouched();
                            listOfNewFieldData[newField.id] = value;
                        } else {
                            listOfNewField[newField.id] = '';
                            listOfNewFieldData[newField.id] = '';
                        }

                        if (this.form[categoryId][i].cpt > 1 ) {
                            this.form[categoryId].splice(i + (parseInt(numberOfField) * parseInt(this.form[categoryId][i].cpt)), 0, newField);
                        } else {
                            this.form[categoryId].splice(i + parseInt(numberOfField), 0, newField);
                        }

                        if (newField.id === 'accounting_plan') {
                            this.form[categoryId][cpt + field.cpt].values = this.form[categoryId][cpt].control.valueChanges.pipe(
                                startWith(''),
                                map(option => option ? this._filter_accounting(this.accountingPlan, option) : this.accountingPlan)
                            );
                        }
                    }
                }
            }
        });

        if (!neededValue) {
            this.http.put(environment['url'] + '/ws/verifier/documents/' + this.document.id + '/updateData',
                {'args': listOfNewField}, {headers: this.authService.headers}).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            let lineEmpty = true;
            Object.keys(listOfNewFieldData).forEach((newFieldId: any) => {
                if (listOfNewFieldData[newFieldId]) {
                    lineEmpty = false;
                }
            });

            if (lineEmpty) {
                Object.keys(listOfNewFieldData).forEach((newFieldId: any) => {
                    this.form[categoryId].forEach((element: any, cpt: number) => {
                        if (newFieldId === element.id) {
                            const parentId = element.id.split('_').slice(0, -1).join('_');
                            this.form[categoryId].splice(cpt, 1);
                            this.form[categoryId].forEach((parent_field: any) => {
                                if (parent_field.id.trim() === parentId.trim()) {
                                    parent_field.cpt = parent_field.cpt - 1;
                                }
                            });
                        }
                    });
                });
            }
        }
    }

    duplicateField(fieldId: any, categoryId: any) {
        for (const category in this.form) {
            if (category === categoryId) {
                this.form[category].forEach((field: any, cpt: number) => {
                    if (field.id.trim() === fieldId.trim()) {
                        const newField = Object.assign({}, field);
                        newField.id = newField.id + '_' + field.cpt;
                        field.cpt += 1;
                        newField.cpt = field.cpt;
                        newField.display = 'simple';
                        newField.control = new FormControl();
                        this.form[category].splice(cpt + field.cpt, 0, newField);
                        this.saveData('', newField.id);
                        this.notify.success(this.translate.instant('DOCUMENTS.field_duplicated', {"input": this.translate.instant(field.label)}));
                    }
                });
            }
        }
    }

    removeDuplicateLine(fieldId: any, categoryId: any) {
        const listOfFieldToDelete: any[] = [];
        this.form[categoryId].forEach((field: any, cpt: number) => {
            if (field.id.trim() === fieldId.trim()) {
                const numberOfField = field.class.replace('w-1/', '');
                if (numberOfField !== 'full') {
                    for (let i = cpt - numberOfField + 1; i <= cpt; i++) {
                        const parentId = this.form[categoryId][i].id.split('_').slice(0, -1).join('_');
                        listOfFieldToDelete.push(this.form[categoryId][i].id);
                        this.form[categoryId].forEach((parent_field: any) => {
                            if (parent_field.id.trim() === parentId.trim()) {
                                parent_field.cpt = parent_field.cpt - 1;
                            }
                        });
                    }
                    this.form[categoryId].splice((cpt + 1) - numberOfField, numberOfField);
                }
            }
        });
        this.deleteData(listOfFieldToDelete, true);
        this.deletePosition(listOfFieldToDelete, true);
        this.deletePage(listOfFieldToDelete, true);
    }

    removeDuplicateField(fieldId: any, categoryId: any) {
        const parentId = fieldId.split('_').slice(0, -1).join('_');
        this.form[categoryId].forEach((field: any, cpt:number) => {
            if (field.id.trim() === fieldId.trim()) {
                this.deleteData(field.id);
                this.deletePosition(field.id);
                this.deletePage(field.id);
                this.form[categoryId].splice(cpt, 1);
            } else if (field.id.trim() === parentId.trim()) {
                field.cpt = field.cpt - 1;
            }
        });
    }

    isChildField(fieldId: any) {
        const splittedId = fieldId.split('_');
        return Number.isInteger(parseInt(splittedId[splittedId.length - 1])) && !fieldId.includes('custom_');
    }

    getSupplierInfo(supplierId: any, showNotif = false, launchOnInit = false) {
        this.suppliers.forEach((supplier: any) => {
            if (supplier.id === supplierId) {
                if (!supplier.address_id) supplier.address_id = 0;
                this.http.get(environment['url'] + '/ws/accounts/getAdressById/' + supplier.address_id, {headers: this.authService.headers}).pipe(
                    tap((address: any) => {
                        const supplierData : any = {
                            'name': supplier.name,
                            'address1': address.address1,
                            'address2': address.address2,
                            'city': address.city,
                            'country': address.country,
                            'postal_code': address.postal_code,
                            'siret': supplier.siret,
                            'siren': supplier.siren,
                            'iban': supplier.iban,
                            'email': supplier.email,
                            'vat_number': supplier.vat_number
                        };
                        this.getOnlyRawFooter = supplier.get_only_raw_footer;
                        for (const column in supplierData) {
                            this.updateFormValue(column, supplierData[column]);
                        }

                        if (!launchOnInit) {
                            this.updateDocument({'supplier_id': supplierId});
                            this.saveData(supplierData);
                            this.http.put(environment['url'] + '/ws/verifier/documents/' + this.document.id + '/updateData',
                                {'args': supplierData},
                                {headers: this.authService.headers}).pipe(
                                tap(() => {
                                    this.document.supplier_id = supplierId;
                                    for (const element of this.suppliers) {
                                        if (element.id === this.document.supplier_id) {
                                            this.currentSupplier = element;
                                        }
                                    }
                                    if (showNotif) {
                                        this.notify.success(this.translate.instant('DOCUMENTS.supplier_infos_updated'));
                                    }
                                }),
                                catchError((err: any) => {
                                    console.debug(err);
                                    this.notify.handleErrors(err);
                                    return of(false);
                                })
                            ).subscribe();
                        }
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }
        });
    }

    // Function used to verify SIRET or SIREN using the Luhn algorithm
    verify(value: any, size: any, isVAT = false) {
        if (isVAT) {
            return value.length === size;
        }

        if (isNaN(value) || value.length !== size) {
            return false;
        }
        let bal     = 0;
        let total   = 0;
        for (let i = size - 1; i >= 0; i--) {
            const step = (value.charCodeAt(i) - 48) * (bal + 1);
            total += (step > 9) ? step - 9 : step;
            bal = 1 - bal;
        }
        return total % 10 === 0;
    }

    getErrorMessage(field: any, category: any) {
        let error: any;
        this.form[category].forEach((element: any) => {
            if (element.id === field) {
                if (element.control.errors) {
                    const required = element.control.errors.required;
                    const pattern = element.control.errors.pattern;
                    const datePickerPattern = element.control.errors.matDatepickerParse;
                    const siret_error = element.control.errors.siret_error;
                    const siren_error = element.control.errors.siren_error;
                    const vat_error = element.control.errors.vat_error;
                    if (pattern) {
                        if (pattern.requiredPattern === this.getPattern('alphanum')) {
                            error = this.translate.instant('ERROR.alphanum_pattern');
                        } else if (pattern.requiredPattern === this.getPattern('alphanum_extended')) {
                            error = this.translate.instant('ERROR.alphanum_extended_pattern');
                        } else if (pattern.requiredPattern === this.getPattern('number_int')) {
                            error = this.translate.instant('ERROR.number_int_pattern');
                        } else if (pattern.requiredPattern === this.getPattern('number_float')) {
                            error = this.translate.instant('ERROR.number_float_pattern');
                        } else if (pattern.requiredPattern === this.getPattern('char')) {
                            error = this.translate.instant('ERROR.char_pattern');
                        } else if (pattern.requiredPattern === this.getPattern('email')) {
                            error = this.translate.instant('ERROR.email_pattern');
                        }
                    } else if (datePickerPattern) {
                        error = this.translate.instant('ERROR.date_pattern');
                    } else if (required) {
                        error = this.translate.instant('ERROR.field_required');
                    } else if (siret_error) {
                        error = siret_error;
                    } else if (siren_error) {
                        error = siren_error;
                    } else if (vat_error) {
                        error = vat_error;
                    } else if (this.tokenINSEEError) {
                        error = this.tokenINSEE;
                    } else {
                        error = this.translate.instant('ERROR.unknow_error');
                    }
                }
            }
        });
        return error;
    }

    setAutocompleteDefaultValue(event: any) {
        if (event.isUserInput) {
            this.form.facturation.forEach((element: any) => {
                if (element.autocomplete_values) {
                    element.autocomplete_id = event.source.id;
                }
            });
        }
    }

    validateForm() {
        this.loadingSubmit = true;
        let valid = true;
        const arrayData: any = {};
        for (const category in this.form) {
            this.form[category].forEach((input: any) => {
                if (input.control.value) {
                    let value = input.control.value;
                    if (input.type === 'date') {
                        const format = moment().localeData().longDateFormat('L');
                        value = moment(value, format);
                        value = value.format(format);
                    }
                    Object.assign(arrayData, {[input.id] : value});
                }
                if (input.control.errors) {
                    valid = false;
                    input.control.markAsTouched();
                    this.notify.error(this.translate.instant('ERROR.form_not_valid'));
                }
            });
        }

        if (!valid) {
            this.loadingSubmit = false;
            return;
        }

        const countLines = {
            ['lines_count']: 0,
            ['taxes_count']: 0
        };
        this.form['lines'].forEach((element: any) => {
            const cpt = element.id.match(/\d+/g) + 1;
            if (cpt && cpt[0] > (countLines['lines_count'])) {
                countLines['lines_count']++;
            }
        });
        this.form['facturation'].forEach((element: any) => {
            if (element.id.includes('vat_amount') || element.id.includes('vat_rate') || element.id.includes('no_rate_amount')) {
                const cpt = element.id.match(/\d+/g) + 1;
                if (cpt && cpt[0] > (countLines['taxes_count'])) {
                    countLines['taxes_count']++;
                }
            }
        });

        this.http.put(environment['url'] + '/ws/verifier/documents/' + this.document.id + '/updateData',
            {'args': countLines},
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.document.datas['lines_count'] = countLines['lines_count'];
                this.document.datas['taxes_count'] = countLines['taxes_count'];
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        /*
            Executer les actions paramétrées dans les réglages du formulaires
         */
        if (this.formSettings.outputs.length !== 0) {
            this.formSettings.outputs.forEach((outputId: any, cpt: number) => {
                this.http.get(environment['url'] + '/ws/outputs/verifier/getById/' + outputId, {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        if (data.data.options.links) {
                            this.form.facturation.forEach((element: any) => {
                                if (element.autocomplete_values) {
                                    if (data.output_type_id === 'export_mem') {
                                        data.data['res_id'] = element.autocomplete_id;
                                    }
                                }
                            });
                        }

                        this.http.post(environment['url'] + '/ws/verifier/documents/' + this.document.id + '/' + data.output_type_id, {'args': data}, {headers: this.authService.headers}).pipe(
                            tap(() => {
                                /* Actions à effectuer après le traitement des chaînes sortantes */
                                if (cpt + 1 === this.formSettings.outputs.length) {
                                    this.historyService.addHistory('verifier', 'document_validated', this.translate.instant('HISTORY-DESC.document_validated', {document_id: this.documentId, outputs: this.outputsLabel.join(', ')}));
                                    this.updateDocument({'status': 'END', 'locked': false, 'locked_by': null});
                                    this.router.navigate(['/verifier']).then();
                                    this.loadingSubmit = false;
                                    if (this.workflowSettings && this.workflowSettings.process) {
                                        if (this.workflowSettings.process['delete_documents']) {
                                            console.log('here')
                                            this.http.get(environment['url'] + '/ws/verifier/documents/' + this.document.id + '/deleteDocuments', {headers: this.authService.headers}).pipe(
                                                catchError((err: any) => {
                                                    console.debug(err);
                                                    this.notify.handleErrors(err);
                                                    return of(false);
                                                })
                                            ).subscribe();
                                        }
                                    }
                                    this.notify.success(this.translate.instant('VERIFIER.form_validated_and_output_done', {outputs: this.outputsLabel.join('<br>')}));
                                }
                            }),
                            catchError((err: any) => {
                                this.loadingSubmit = false;
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
            });
        } else {
            this.notify.error(this.translate.instant('VERIFIER.no_outputs_for_this_form', {'form': this.formSettings.label}));
            this.loadingSubmit = false;
        }
    }

    refuseForm() {
        this.historyService.addHistory('verifier', 'document_refused', this.translate.instant('HISTORY-DESC.document_refused', {document_id: this.documentId}));
        this.updateDocument({'status': 'ERR', 'locked': false, 'locked_by': null});
        this.notify.error(this.translate.instant('VERIFIER.document_refused'));
        this.router.navigate(['/verifier/list']).then();
    }

    async changeForm(event: any) {
        this.outputs = [];
        this.outputsLabel = [];
        this.loading = true;
        this.formEmpty = false;
        const newFormId = event.value;
        for (const cpt in this.formList) {
            if (this.formList[cpt].id === newFormId) {
                if (!this.fromToken) {
                    this.updateDocument({'form_id': newFormId});
                } else {
                    this.fromTokenFormId = newFormId;
                }
                this.currentFormFields = await this.getFormFieldsById(newFormId);
                this.deleteDataOnChangeForm = false;
                this.imageDocument.selectAreas('destroy');
                this.settingsOpen = false;
                this.notify.success(this.translate.instant('VERIFIER.form_changed'));
                await this.ngOnInit();
                this.deleteDataOnChangeForm = true;
            }
        }
    }

    nextPage() {
        if (this.currentPage < this.document.nb_pages) {
            this.currentPage = this.currentPage + 1;
            this.changeImage(this.currentPage, this.currentPage - 1);
        } else {
            this.changeImage(1, this.document.nb_pages);
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage = this.currentPage - 1;
            this.changeImage(this.currentPage, this.currentPage + 1);
        } else {
            this.changeImage(this.document.nb_pages, this.currentPage);
        }
    }

    changeImage(pageToShow: number, oldPage: number) {
        if (pageToShow !== oldPage) {
            const extension = this.currentFilename.split('.').pop();
            const oldCpt = ('000' + oldPage).substr(-3);
            const newCpt = ('000' + pageToShow).substr(-3);
            const newFilename = this.currentFilename.replace(oldCpt + '.' + extension, newCpt + '.' + extension);
            this.currentFilename = newFilename;
            this.getThumb(newFilename).then();
            this.currentPage = pageToShow;
            for (const fieldId in this.document.datas) {
                const page = this.getPage(fieldId);
                const position = this.document.positions[fieldId];
                if (position) {
                    const input = $('.input_' + fieldId);
                    const background = $('.background_' + fieldId);
                    const outline = $('.outline_' + fieldId);
                    const resizeHandler = $('.resize_' + fieldId);
                    const deleteContainer = $('.delete_' + fieldId);
                    input.remove();
                    background.remove();
                    outline.remove();
                    resizeHandler.remove();
                    deleteContainer.remove();
                    if (parseInt(String(page)) === parseInt(String(this.currentPage))) {
                        this.lastId = fieldId;
                        const splittedFieldId = fieldId.split('_');
                        let field = this.getFieldInfo(fieldId);
                        if (!isNaN(parseInt(splittedFieldId[splittedFieldId.length - 1])) && !fieldId.includes('custom_')) {
                            const cpt = splittedFieldId[splittedFieldId.length - 1];
                            const tmpFieldId = splittedFieldId.join('_').replace('_' + cpt, '');
                            field = this.getFieldInfo(tmpFieldId);
                            field.label = this.translate.instant(field.label) + ' ' + (parseInt(cpt) + 1);
                        }
                        this.saveInfo = false;
                        if (field) {
                            if (parseInt(String(page)) === this.currentPage) {
                                this.drawPositionByField(field, position);
                            }
                        }
                    }
                }
            }
        }
    }

    checkSirenOrSiret(siretOrSiren: any, value: any) {
        if (this.formSettings.settings.supplier_verif && this.document.status !== 'END') {
            const sizeSIREN = 9;
            const sizeSIRET = 14;
            if (siretOrSiren === 'siren' && this.oldSIREN !== value) {
                if (this.verify(value, sizeSIREN) && this.tokenINSEE) {
                    this.oldSIREN = value;
                    this.http.post(environment['url'] + '/ws/verifier/verifySIREN', {'token': this.tokenINSEE, 'siren': value}, {headers: this.authService.headers}).pipe(
                        catchError((err: any) => {
                            this.form['supplier'].forEach((element: any) => {
                                if (element.id === 'siren') {
                                    setTimeout(() => {
                                        element.control.setErrors({'siren_error': err.error.status});
                                        element.control.markAsTouched();
                                    }, 100);
                                }
                            });
                            return of(false);
                        })
                    ).subscribe();
                }
                else {
                    this.form['supplier'].forEach((element: any) => {
                        if (element.id === 'siren') {
                            setTimeout(() => {
                                if (!this.tokenINSEE) {
                                    element.control.setErrors({'siren_error': this.translate.instant('ERROR.insee_api_not_up')});
                                } else {
                                    element.control.setErrors({'siren_error': this.translate.instant('ERROR.wrong_siren_format')});
                                }
                                element.control.markAsTouched();
                            }, 100);
                        }
                    });
                }
            } else if (siretOrSiren === 'siret'  && this.oldSIRET !== value) {
                if (this.verify(value, sizeSIRET) && this.tokenINSEE) {
                    this.oldSIRET = value;
                    this.http.post(environment['url'] + '/ws/verifier/verifySIRET', {'token': this.tokenINSEE, 'siret': value}, {headers: this.authService.headers}).pipe(
                        catchError((err: any) => {
                            this.form['supplier'].forEach((element: any) => {
                                if (element.id === 'siret') {
                                    setTimeout(() => {
                                        element.control.setErrors({'siret_error': err.error.status});
                                        element.control.markAsTouched();
                                    }, 100);
                                }
                            });
                            return of(false);
                        })
                    ).subscribe();
                }
                else {
                    this.form['supplier'].forEach((element: any) => {
                        if (element.id === 'siret') {
                            setTimeout(() => {
                                if (!this.tokenINSEE) {
                                    element.control.setErrors({'siret_error': this.translate.instant('ERROR.insee_api_not_up')});
                                } else {
                                    element.control.setErrors({'siret_error': this.translate.instant('ERROR.wrong_siret_format')});
                                }
                                element.control.markAsTouched();
                            }, 100);
                        }
                    });
                }
            }
        }
    }

    checkVAT(id: any, value: any) {
        if (id === 'vat_number' && this.formSettings.settings.supplier_verif && this.document.status !== 'END') {
            if (this.oldVAT !== value) {
                const sizeVAT = 13;
                if (this.verify(value, sizeVAT, true)) {
                    this.oldVAT = value;
                    this.http.post(environment['url'] + '/ws/verifier/verifyVATNumber', {'vat_number': value}, {headers: this.authService.headers}).pipe(
                        catchError((err: any) => {
                            this.form['supplier'].forEach((element: any) => {
                                if (element.id === 'vat_number') {
                                    setTimeout(() => {
                                        element.control.setErrors({'vat_error': err.error.status});
                                        element.control.markAsTouched();
                                    }, 100);
                                }
                            });
                            return of(false);
                        })
                    ).subscribe();
                } else {
                    this.form['supplier'].forEach((element: any) => {
                        if (element.id === 'vat_number') {
                            setTimeout(() => {
                                if (!this.tokenINSEE) {
                                    element.control.setErrors({'vat_error': this.translate.instant('ERROR.ecu_api_not_up')});
                                } else {
                                    element.control.setErrors({'vat_error': this.translate.instant('ERROR.wrong_vat_number_format')});
                                }
                                element.control.markAsTouched();
                            }, 100);
                        }
                    });
                }
            }
        }
    }
}
