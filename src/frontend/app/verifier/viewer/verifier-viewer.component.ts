import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {API_URL} from "../../env";
import {catchError, map, startWith, tap} from "rxjs/operators";
import {Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {NotificationService} from "../../../services/notifications/notifications.service";
import {TranslateService} from "@ngx-translate/core";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
import {FormControl} from "@angular/forms";
import { DatePipe } from '@angular/common';
import {LocalStorageService} from "../../../services/local-storage.service";
import {ConfigService} from "../../../services/config.service";
declare var $: any;
import 'moment/locale/en-gb';
import 'moment/locale/fr';
import * as moment from 'moment';
import {parseName} from "@schematics/angular/utility/parse-name";

@Component({
    selector: 'app-viewer',
    templateUrl: './verifier-viewer.component.html',
    styleUrls: ['./verifier-viewer.component.scss'],
    providers: [DatePipe]
})

export class VerifierViewerComponent implements OnInit {
    loading         : boolean   = true
    imageInvoice    : any;
    isOCRRunning    : boolean   = false;
    invoiceId       : any;
    invoice         : any;
    fields          : any;
    lastLabel       : string    = '';
    lastId          : string    = '';
    lastColor       : string    = '';
    ratio           : number    = 0;
    fieldCategories : any[]     = [
        {
            'id': 'supplier',
            'label': marker('FORMS.supplier')
        },
        {
            'id': 'facturation',
            'label': marker('FACTURATION.facturation')
        },
        {
            'id': 'other',
            'label': marker('FORMS.other')
        }
    ];
    disableOCR      : boolean   = false;
    form            : any       = {
        'supplier': [],
        'facturation': [],
        'other': []
    }
    pattern         : any       = {
        'alphanum': '^[0-9a-zA-Z\\s]*$',
        'alphanum_extended': '^[0-9a-zA-Z-/#\\s]*$',
        'number_int': '^[0-9]*$',
        'number_float': '^[0-9]*([.][0-9]*)*$',
        'char': '^[A-Za-z\\s]*$',
    }
    suppliers       : any       = [
        {
            'id': 1,
            'name': 'Edissyum'
        },
        {
            'id': 2,
            'name': 'Ideal Standard'
        },
        {
            'id': 3,
            'name': 'ETM'
        },
    ]
    filteredOptions : Observable<any> | undefined;
    supplierNamecontrol = new FormControl();
    get_only_raw_footer : boolean   = false;
    oldValue            : string    = '';

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        private configService: ConfigService,
        private localeStorageService: LocalStorageService
    ) {}

    async ngOnInit(): Promise<void> {
        marker('VERIFIER.only_raw_footer')
        marker('VERIFIER.calculated_footer')
        this.localeStorageService.save('splitter_or_verifier', 'verifier');
        this.imageInvoice = $('#invoice_image');

        /*
        * Enable library to draw rectangle on load (OCR ON FLY)
        */
        this.ocr({
            'target' : {
                'id': '',
                'labels': [
                    {'textContent': ''}
                ]
            }
        }, true);
        this.invoiceId = this.route.snapshot.params['id'];
        this.invoice = await this.getInvoice();
        this.ratio = this.invoice.img_width / this.imageInvoice.width();
        let form = await this.getForm();
        this.suppliers = await this.retrieveSuppliers();
        this.suppliers = this.suppliers.suppliers;
        if (this.invoice.supplier_id) {
            this.getSupplierInfo(this.invoice.supplier_id);
        }
        await this.fillForm(form);
        await this.drawPositions(form);
        this.loading = false;
        let triggerEvent = $('.trigger');
        triggerEvent.hide();
        this.filteredOptions = this.supplierNamecontrol.valueChanges
            .pipe(
                startWith(''),
                map(option => option ? this._filter(option) : this.suppliers.slice())
            );
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.suppliers.filter((supplier: any) => supplier.name.toLowerCase().indexOf(filterValue) === 0);
    }

    updateFilteredOption(event: any, control: any) {
        let value = '';
        if (event.target.value) value = event.target.value;
        else if (control.value) value = control.value;
        control.patchValue(value);
    }

    async drawPositions(data: any): Promise<any> {
        for (let parent in this.fields) {
            for (let cpt in data.fields[parent]) {
                let field = data.fields[parent][cpt]
                let position = this.getPosition(field.id);
                if (position) {
                    this.lastId = field.id;
                    this.lastLabel = this.translate.instant(field.label).trim();
                    this.lastColor = field.color;
                    this.disableOCR = true;
                    $('#' + field.id).focus();
                    let newArea = {
                        x: position.x / this.ratio,
                        y: position.y / this.ratio,
                        width: position.width / this.ratio,
                        height: position.height / this.ratio
                    };
                    let triggerEvent = $('.trigger');
                    triggerEvent.hide();
                    triggerEvent.trigger('mousedown');
                    triggerEvent.trigger('mouseup', [newArea]);
                }
            }
        }
    }

    getPosition(field_id: any) {
        let position: any;
        if (this.invoice.positions) {
            Object.keys(this.invoice.positions).forEach((element: any) => {
                if (element == field_id) {
                    position = this.invoice.positions[field_id];
                }
            })
        }
        return position
    }

    async retrieveSuppliers(): Promise<any> {
        return await this.http.get(API_URL + '/ws/accounts/suppliers/list?order=name ASC', {headers: this.authService.headers}).toPromise();
    }

    async getInvoice(): Promise<any> {
        return await this.http.get(API_URL + '/ws/verifier/invoices/' + this.invoiceId, {headers: this.authService.headers}).toPromise();
    }

    async getForm(): Promise<any> {
        if (this.invoice.supplier_id)
            return await this.http.get(API_URL + '/ws/forms/getBySupplierId/' + this.invoice.supplier_id, {headers: this.authService.headers}).toPromise();
        else
            return await this.http.get(API_URL + '/ws/forms/getDefault', {headers: this.authService.headers}).toPromise();
    }

    async fillForm(data: any): Promise<any> {
        this.fields = data.fields;
        for (let category in this.fields) {
            for (let cpt in this.fields[category]) {
                let field = this.fields[category][cpt];
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
                });

                let _field = this.form[category][this.form[category].length - 1];
                if (this.invoice.datas[field.id]) {
                    let value = this.invoice.datas[field.id];
                    if (field.format == 'date' && field.id !== '' && field.id !== undefined && value) {
                        value = value.replaceAll('.', '/');
                        value = value.replaceAll(',', '/');
                        value = value.replaceAll(' ', '/');
                        let format = moment().localeData().longDateFormat('L');
                        value = moment(value, format);
                        value = new Date(value._d);
                    }
                    _field.control.setValue(value);
                    _field.control.markAsTouched();
                }
                if (field.id == 'name' && category == 'supplier') this.supplierNamecontrol = this.form[category][cpt].control;
                this.findChildren(field.id, _field, category);
            }
        }
    }

    findChildren(parent_id: any, parent: any, category_id: any) {
        for (let field in this.invoice.datas) {
            if (field.includes(parent_id + '_')) {
                parent.cpt += 1;
                let splitted = field.split('_');
                let cpt = parseInt(splitted[splitted.length - 1]) + 1;
                this.form[category_id].push({
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
                    cpt: cpt,
                });
                let value = this.invoice.datas[field];
                let _field = this.form[category_id][this.form[category_id].length - 1];
                _field.control.setValue(value);
            }
        }
    }

    getSelectionByCpt(selection: any, cpt: any) {
        for (let index in selection) {
            if (selection[index].id == cpt)
                return selection[index];
        }
    }

    ocr(event: any, enable: boolean, color = 'green') {
        $('.trigger').show();
        let _this = this;
        this.lastId = event.target.id;
        this.lastLabel = event.target.labels[0].textContent.trim();
        this.lastColor = color;
        let imageContainer = $('.image-container');
        let deleteArea = $('.delete-area');
        let backgroundArea = $('.select-areas-background-area');
        let resizeArea = $('.select-areas-resize-handler');
        deleteArea.addClass('pointer-events-auto');
        backgroundArea.addClass('pointer-events-auto');
        resizeArea.addClass('pointer-events-auto');
        imageContainer.addClass('pointer-events-none');
        imageContainer.addClass('cursor-auto');

        if (enable) {
            $('.outline_' + _this.lastId).toggleClass('animate');
            imageContainer.removeClass('pointer-events-none');
            imageContainer.removeClass('cursor-auto');
            this.imageInvoice.selectAreas({
                allowNudge: false,
                minSize: [20, 20],
                maxSize: [this.imageInvoice.width(), this.imageInvoice.height() / 8],
                onChanged: function(img: any, cpt: any, selection: any) {
                    if (selection.length !== 0 && selection['width'] !== 0 && selection['height'] !== 0) {
                        // Write the label of the input above the selection rectangle
                        if ($('#select-area-label_' + cpt).length == 0) {
                            $('#select-areas-label-container_' + cpt).append('<div id="select-area-label_' + cpt + '" class="input_' + _this.lastId + ' select-none">' + _this.lastLabel + '</div>');
                            $('#select-areas-background-area_' + cpt).css('background-color', _this.lastColor);
                            $('#select-areas-outline_' + cpt).addClass('outline_' + _this.lastId);
                        }
                        // End write

                        let inputId = $('#select-area-label_' + cpt).attr('class').replace('input_', '').replace('select-none', '');
                        $('#' + inputId).focus();

                        // Test to avoid multi selection for same label. If same label exists, remove the selected areas and replace it by the new one
                        let label = $('div[id*=select-area-label_]:contains(' + _this.lastLabel + ')');
                        let labelCount = label.length;
                        if (labelCount > 1) {
                            let cptToDelete = label[labelCount - 1].id.split('_')[1]
                            $('#select-areas-label-container_' + cptToDelete).remove();
                            $('#select-areas-background-area_' + cptToDelete).remove();
                            $('#select-areas-outline_' + cptToDelete).remove();
                            $('#select-areas-delete_' + cptToDelete).remove();
                            $('.select-areas-resize-handler_' + cptToDelete).remove();
                        }
                        if (!_this.isOCRRunning && !_this.loading) {
                            _this.isOCRRunning = true;
                            _this.http.post(API_URL + '/ws/verifier/ocrOnFly',
                                {
                                    selection: _this.getSelectionByCpt(selection, cpt),
                                    fileName: _this.imageInvoice[0].src.replace(/^.*[\\\/]/, ''),
                                    thumbSize: {width: img.currentTarget.width, height: img.currentTarget.height}
                                },{headers: _this.authService.headers})
                                .pipe(
                                    tap((data: any) => {
                                        _this.updateFormValue(inputId, data.result);
                                        _this.isOCRRunning = false;
                                        let res = _this.saveData(data.result, _this.lastId, true);
                                        if (res) _this.savePosition(_this.getSelectionByCpt(selection, cpt));
                                    }),
                                    catchError((err: any) => {
                                        console.debug(err);
                                        _this.notify.handleErrors(err);
                                        return of(false);
                                    })
                                ).subscribe();
                        }
                    }
                },
                onDeleted: function(img: any, cpt: any) {
                    let inputId = $('#select-area-label_' + cpt).attr('class').replace('input_', '');
                    if (inputId) {
                        _this.updateFormValue(inputId, '');
                    }
                }
            });
        }else{
            let deleteClicked = false;
            $(".select-areas-delete-area").click(function() {
                deleteClicked = true;
            });
            setTimeout(function () {
                if (!deleteClicked) {
                    resizeArea.css('display', 'none');
                    deleteArea.css('display', 'none');
                }
            }, 50);
            $('.outline_' + _this.lastId).removeClass('animate');
        }
    }

    updateFormValue(input_id: string, value: any) {
        for (let category in this.form) {
            this.form[category].forEach((input: any) => {
                if (input.id.trim() === input_id.trim()) {
                    if (input.type == 'date') {
                        let format = moment().localeData().longDateFormat('L');
                        value = moment(value, format);
                        value = new Date(value._d);
                    }
                    input.control.setValue(value);
                }
            });
        }
    }

    savePosition(position: any) {
        position = {
            x: position.x * this.ratio,
            y: position.y * this.ratio,
            height: position.height * this.ratio,
            width: position.width * this.ratio
        }

        this.http.put(API_URL + '/ws/accounts/supplier/' + this.invoice.supplier_id + '/updatePosition',
            {'args': {[this.lastId]: position}},
            {headers: this.authService.headers}).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
        ).subscribe()

        this.http.put(API_URL + '/ws/verifier/invoices/' + this.invoice.id + '/updatePosition',
            {'args': {[this.lastId]: position}},
            {headers: this.authService.headers}).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
        ).subscribe()
    }

    saveData(data: any, field_id: any = false, show_notif: boolean = false) {
        if (data) {
            if (field_id) {
                let field = this.getField(field_id);
                if (field.control.errors || this.oldValue == data) return false;
                data = {[field_id]: data};
            }
            this.http.put(API_URL + '/ws/verifier/invoices/' + this.invoice.id + '/updateData',
                {'args': data},
                {headers: this.authService.headers}).pipe(
                tap(() => {
                    if (show_notif) this.notify.success(this.translate.instant('INVOICES.position_and_data_updated', {"input": this.lastLabel}));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
            return true;
        }
        return false;
    }

    getField(field_id: any) {
        let _field : any = {};
        for (let category in this.form) {
            this.form[category].forEach((field: any) => {
                if (field.id.trim() == field_id.trim()){
                    _field = field;
                }
            });
        }
        return _field;
    }

    deleteData(field_id: any) {
        this.http.put(API_URL + '/ws/verifier/invoices/' + this.invoice.id + '/deleteData',
            {'args': field_id},
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('INVOICES.data_deleted', {"input": this.lastLabel}));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    getPattern(format: any) {
        let pattern = ''
        for (let cpt in this.pattern) {
            if (cpt == format) {
                pattern = this.pattern[cpt]
            }
        }
        return pattern
    }

    duplicateField(field_id: any, category_id: any) {
        for (let category in this.form) {
            if (category == category_id) {
                this.form[category].forEach((field: any, cpt:number) => {
                    if (field.id.trim() === field_id.trim()) {
                        let new_field = Object.assign({}, field);
                        new_field.id = new_field.id + '_' + field.cpt;
                        field.cpt += 1;
                        new_field.cpt = field.cpt;
                        new_field.display = 'simple';
                        new_field.control.value = '';
                        this.form[category].splice(cpt + field.cpt, 0, new_field);
                        this.saveData('', new_field.id);
                    }
                })
            }
        }
    }

    removeDuplicateField(field_id: any, category_id: any) {
        let parent_id = field_id.split('_').slice(0,-1).join('_');
        for (let category in this.form) {
            if (category == category_id) {
                this.form[category].forEach((field: any, cpt:number) => {
                    if (field.id.trim() === field_id.trim()) {
                        this.deleteData(field.id);
                        this.form[category].splice(cpt, 1);
                    }else if (field.id.trim() === parent_id.trim()) {
                        field.cpt = field.cpt - 1;
                    }
                })
            }
        }
    }

    isChildField(field_id: any) {
        let splitted_id = field_id.split('_')
        return Number.isInteger(parseInt(splitted_id[splitted_id.length - 1]));
    }

    getSupplierInfo(supplier_id: any, show_notif = false) {
        this.suppliers.forEach((supplier: any) => {
            if (supplier.id == supplier_id) {
                this.http.get(API_URL + '/ws/accounts/getAdressById/' + supplier.address_id, {headers: this.authService.headers}).pipe(
                    tap((address: any) => {
                        let supplier_data : any = {
                            'name': supplier.name,
                            'address1': address.address1,
                            'address2': address.address2,
                            'city': address.city,
                            'country': address.country,
                            'postal_code': address.postal_code,
                            'siret': supplier.siret,
                            'siren': supplier.siren,
                            'vat_number': supplier.vat_number,
                        }
                        this.get_only_raw_footer = supplier.get_only_raw_footer;
                        for (let column in supplier_data) {
                            this.updateFormValue(column, supplier_data[column]);
                        }

                        this.http.put(API_URL + '/ws/verifier/invoices/' + this.invoiceId + '/update',
                            {'args': {'supplier_id': supplier_id}},
                            {headers: this.authService.headers}).pipe(
                            catchError((err: any) => {
                                console.debug(err);
                                this.notify.handleErrors(err);
                                return of(false);
                            })
                        ).subscribe();

                        this.saveData(supplier_data)

                        this.http.put(API_URL + '/ws/verifier/invoices/' + this.invoice.id + '/updateData',
                            {'args': supplier_data},
                            {headers: this.authService.headers}).pipe(
                            tap(() => {
                                if (show_notif) {
                                    this.notify.success(this.translate.instant('INVOICES.supplier_infos_updated'));
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
        })
    }

    getErrorMessage(field: any, category: any) {
        let error = undefined;
        this.form[category].forEach((element: any) => {
            if (element.id == field) {
                if (element.control.errors) {
                    let required = element.control.errors.required;
                    let pattern = element.control.errors.pattern;
                    let datePickerPattern = element.control.errors.matDatepickerParse;
                    if (pattern) {
                        if (pattern.requiredPattern == this.getPattern('alphanum')) {
                            error = this.translate.instant('ERROR.alphanum_pattern');
                        }
                        if (pattern.requiredPattern == this.getPattern('alphanum_extended')) {
                            error = this.translate.instant('ERROR.alphanum_extended_pattern');
                        }else if(pattern.requiredPattern == this.getPattern('number_int')) {
                            error = this.translate.instant('ERROR.number_int_pattern');
                        }else if(pattern.requiredPattern == this.getPattern('number_float')) {
                            error = this.translate.instant('ERROR.number_float_pattern');
                        }
                    }else if (datePickerPattern) {
                        error = this.translate.instant('ERROR.date_pattern');
                    }else if (required) {
                        error = this.translate.instant('ERROR.field_required');
                    }else {
                        error = this.translate.instant('ERROR.unknow_error');
                    }
                }
            }
        });
        return error;
    }

    validateForm() {
        let valid = true;
        for (let category in this.form) {
            this.form[category].forEach((input: any) => {
                if(input.control.errors) {
                    valid = false;
                    this.notify.error('ERROR.form_not_valid');
                    return;
                }
            });
        }
    }
}
