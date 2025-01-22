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

import {Component, OnInit, SecurityContext} from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../../../../../services/user.service";
import { AuthService } from "../../../../../services/auth.service";
import { _, TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { FormControl } from "@angular/forms";
import { catchError, finalize, tap } from "rxjs/operators";
import { FileValidators } from "ngx-file-drag-drop";
import { DomSanitizer } from "@angular/platform-browser";
import { environment } from  "../../../../env";
import { of } from "rxjs";

declare const $: any;

@Component({
    selector: 'update-positions-mask',
    templateUrl: './update-positions-mask.component.html',
    styleUrls: ['./update-positions-mask.component.scss'],
    standalone: false
})
export class UpdatePositionsMaskComponent implements OnInit {
    loading                 : boolean   = true;
    loadingFields           : boolean   = true;
    ocrFromUser             : boolean   = false;
    launchOnInit            : boolean   = false;
    ratio                   : any;
    positionMaskId          : any;
    positionsMask           : any;
    documentImageWidth      : any;
    documentImageNbPages     : any;
    currentPage             : number    = 1;
    suppliers               : any       = [];
    forms                   : any       = [];
    form                    : any       = {
        'label': {
            'control': new FormControl()
        },
        'supplier_id': {
            'control': new FormControl()
        },
        'form_id': {
            'control': new FormControl()
        }
    };
    toHighlight             : string    = '';
    availableFieldsParent   : any []    = [
        {
            'id': 'facturation_fields',
            'label': this.translate.instant('FACTURATION.facturation'),
            'values': [
                {
                    id: 'delivery_number',
                    label: _('FACTURATION.delivery_number'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'silver',
                    regex: ''
                },
                {
                    id: 'invoice_number',
                    label: _('FACTURATION.invoice_number'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'red',
                    regex: ''
                },
                {
                    id: 'quotation_number',
                    label: _('FACTURATION.quotation_number'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'orange',
                    regex: ''
                },
                {
                    id: 'document_date',
                    label: _('FACTURATION.document_date'),
                    unit: 'facturation',
                    type: 'date',
                    color: 'yellow',
                    regex: ''
                },
                {
                    id: 'document_due_date',
                    label: _('FACTURATION.document_due_date'),
                    unit: 'facturation',
                    type: 'date',
                    color: 'blue',
                    regex: ''
                },
                {
                    id: 'firstname',
                    label: _('FACTURATION.firstname'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'orange',
                    regex: ''
                },
                {
                    id: 'lastname',
                    label: _('FACTURATION.lastname'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'orange',
                    regex: ''
                },
                {
                    id: 'vat_rate',
                    label: _('FACTURATION.vat_rate'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'pink',
                    regex: ''
                },
                {
                    id: 'no_rate_amount',
                    label: _('FACTURATION.no_rate_amount'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'fuschia',
                    regex: ''
                },
                {
                    id: 'vat_amount',
                    label: _('FACTURATION.vat_amount'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'purple',
                    regex: ''
                },
                {
                    id: 'total_ttc',
                    label: _('FACTURATION.total_ttc'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'white',
                    regex: ''
                },
                {
                    id: 'total_ht',
                    label: this.translate.instant('FACTURATION.total_ht'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'green',
                    regex: ''
                },
                {
                    id: 'total_vat',
                    label: this.translate.instant('FACTURATION.total_vat'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'lime',
                    regex: ''
                }
            ]
        },
        {
            'id': 'custom_fields',
            'label': _('FORMS.custom_fields'),
            'values': []
        }
    ];
    imageDocument           : any;
    documentImageSrc        : any;
    documentImageName       : any;
    lastId                  : any;
    lastColor               : string    = '';
    lastLabel               : string    = '';
    fileControl             = new FormControl(
        [],
        [
            FileValidators.required,
            FileValidators.fileExtension(['pdf'])
        ]
    );

    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    async ngOnInit(): Promise<void> {
        this.serviceSettings.init();
        this.http.get(environment['url'] + '/ws/forms/verifier/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.forms = data.forms;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        this.serviceSettings.init();
        this.launchOnInit = true;
        this.positionMaskId = this.route.snapshot.params['id'];
        this.positionsMask = await this.getPositionMask();
        for (const cpt in this.availableFieldsParent) {
            this.availableFieldsParent[cpt]['values'].forEach((element: any) => {
                for (const key in this.positionsMask.regex) {
                    if (key === element.id) {
                        element.regex = this.positionsMask.regex[key];
                    }
                }
            });
        }
        if (this.positionsMask.filename) {
            this.documentImageName = this.positionsMask.filename;
            this.documentImageNbPages = this.positionsMask.nb_pages;
            this.documentImageWidth = this.positionsMask.width;
            this.imageDocument = $('#document_src');
            const thumbB64 : any = await this.getThumb(this.positionsMask.filename);
            this.documentImageSrc = this.sanitizer.sanitize(SecurityContext.URL, 'data:image/jpeg;base64, ' + thumbB64.file);
        }
        this.suppliers = await this.retrieveSuppliers('', 1000);
        this.suppliers = this.suppliers.suppliers;
        if (this.imageDocument) {
            this.ratio = this.documentImageWidth / this.imageDocument.width();
            this.ocr({
                'target' : {
                    'id': ''
                }
            }, true, '', false);
        }
        this.form['label'].control.setValue(this.positionsMask.label);
        this.form['form_id'].control.setValue(this.positionsMask.form_id);

        this.suppliers.forEach((element: any ) => {
            if (element.id === this.positionsMask.supplier_id) {
                this.form['supplier_id'].control.setValue(element.name);
            }
        });
        this.http.get(environment['url'] + '/ws/customFields/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data['customFields']) {
                    for (const field in data['customFields']) {
                        if (data['customFields'].hasOwnProperty(field)) {
                            if (data['customFields'][field].module === 'verifier' && data['customFields'][field].enabled) {
                                for (const parent in this.availableFieldsParent) {
                                    if (this.availableFieldsParent[parent].id === 'custom_fields') {
                                        this.availableFieldsParent[parent].values.push(
                                            {
                                                id: 'custom_' + data['customFields'][field].id,
                                                label: data['customFields'][field].label,
                                                type: data['customFields'][field].type,
                                                color: data['customFields'][field].color,
                                                regex: ''
                                            }
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
                this.loadingFields = false;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        setTimeout(() => {
            this.drawPositions();
            this.loading = false;
            this.launchOnInit = false;
        }, 500);

        const triggerEvent = $('.trigger');
        triggerEvent.hide();
    }

    async getPositionMask(): Promise<any> {
        return await this.http.get(environment['url'] + '/ws/positions_masks/getById/' + this.positionMaskId, {headers: this.authService.headers}).toPromise();
    }

    async retrieveSuppliers(name: string = '', limit: number = 0): Promise<any> {
        if (limit == 0) {
            return await this.http.get(environment['url'] + '/ws/accounts/suppliers/list?order=name ASC&name=' + name, {headers: this.authService.headers}).toPromise();
        } else {
            return await this.http.get(environment['url'] + '/ws/accounts/suppliers/list?order=name ASC&limit=' + limit, {headers: this.authService.headers}).toPromise();
        }
    }

    drawPositions() {
        if (this.positionsMask) {
            for (const field in this.positionsMask.positions) {
                const position = this.positionsMask.positions[field];
                const page = this.getPage(field);
                if (position && parseInt(String(page)) === parseInt(String(this.currentPage))) {
                    this.lastId = field;
                    for (const cpt in this.availableFieldsParent) {
                        this.availableFieldsParent[cpt]['values'].forEach((element: any) => {
                            if (field === element.id) {
                                this.lastLabel = this.translate.instant(element.label);
                                this.lastColor = element.color;
                            }
                        });
                    }
                    $('#' + field).focus();

                    if (this.ratio === Infinity) {
                        this.ratio = this.documentImageWidth / this.imageDocument.width();
                    }

                    const newArea = {
                        x: position.x / this.ratio,
                        y: position.y / this.ratio,
                        width: position.width / this.ratio,
                        height: position.height / this.ratio
                    };

                    const triggerEvent = $('.trigger');
                    triggerEvent.hide();
                    triggerEvent.trigger('mousedown');
                    triggerEvent.trigger('mouseup', [newArea]);
                }
            }
        }
    }

    drawPositionByField(field: any, position: any) {
        this.lastId = field.id;
        this.lastLabel = this.translate.instant(field.label).trim();
        this.lastColor = field.color;
        $('#' + field.id).focus();
        const newArea = {
            x: position.x / this.ratio,
            y: position.y / this.ratio,
            width: position.width / this.ratio,
            height: position.height / this.ratio
        };
        const triggerEvent = $('.trigger');
        triggerEvent.hide();
        triggerEvent.trigger('mousedown');
        triggerEvent.trigger('mouseup', [newArea]);
    }

    updatePositionsMask() {
        const _array = {
            'label': this.form['label'].control.value,
            'form_id': this.form['form_id'].control.value,
            'regex': {}
        };
        if (_array['label'] && _array['form_id']) {
            const supplierName = this.form['supplier_id'].control.value;
            this.suppliers.forEach((element: any) => {
                if (element.name === supplierName) {
                    Object.assign(_array, {'supplier_id': element.id});
                }
            });

            for (const cpt in this.availableFieldsParent) {
                this.availableFieldsParent[cpt]['values'].forEach((element: any) => {
                    if (element.regex) {
                        Object.assign(_array['regex'], {[element.id]: element.regex});
                    }
                });
            }

            if (_array['regex']) {
                _array['regex'] = JSON.stringify(_array['regex']);
            }

            this.http.put(environment['url'] + '/ws/positions_masks/update/' + this.positionMaskId, {'args': _array}, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('POSITIONS-MASKS.updated'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    checkFile(data: any): void {
        if (data && data.length !== 0) {
            this.loading = true;
            for (let i = 0; i < data.length; i++) {
                const fileName = data[i].name;
                const fileExtension = fileName.split('.').pop();
                if (fileExtension.toLowerCase() !== 'pdf') {
                    this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized', {count: data.length}));
                    this.loading = false;
                    return;
                } else {
                    const formData: FormData = new FormData();
                    if (data) {
                        formData.append(data[0].name, data[0]);
                    }

                    this.http.post(environment['url'] + '/ws/positions_masks/getImageFromPdf/' + this.positionMaskId, formData, {headers: this.authService.headers}).pipe(
                        tap((data: any) => {
                            this.documentImageSrc = this.sanitizer.sanitize(SecurityContext.URL, 'data:image/jpeg;base64, ' + data.file);
                            this.documentImageName = data.filename;
                            this.documentImageWidth = data.width;
                            this.imageDocument = $('#document_src');
                            setTimeout(() => {
                                this.ratio = this.documentImageWidth / this.imageDocument.width();
                            }, 500);
                            this.documentImageNbPages = data['nb_pages'];
                            this.fileControl.setValue([]);
                            this.ocr({
                                'target' : {
                                    'id': ''
                                }
                            }, true, '', false);
                        }),
                        finalize(() => this.loading = false),
                        catchError((err: any) => {
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                }
            }
        }
    }

    deleteImage() {
        this.documentImageSrc = '';
        this.imageDocument = undefined;
        this.positionsMask.positions = {};
        this.positionsMask.pages = {};
        for (const cpt in this.availableFieldsParent) {
            this.availableFieldsParent[cpt]['values'].forEach((element: any) => {
                element.value = '';
                const input = $('.input_' + element.id);
                const background = $('.background_' + element.id);
                const outline = $('.outline_' + element.id);
                input.remove();
                background.remove();
                outline.remove();
            });
        }
        const imageContainer = $('.image-container');
        imageContainer.addClass('pointer-events-none');
        imageContainer.addClass('cursor-auto');
        this.http.put(environment['url'] + '/ws/positions_masks/update/' + this.positionMaskId,
            {'args': {'filename': '', 'pages': '{}', 'regex': '{}'}},
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('POSITIONS-MASKS.updated'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err, '/settings/verifier/positions-mask');
                return of(false);
            })
        ).subscribe();
    }

    ocr(event: any, enable: boolean, color = 'green', removeClass = true) {
        $('.trigger').show();
        const _this = this;
        this.lastId = event.target.id;
        const lastLabel = $('#label_' + this.lastId);
        this.lastLabel = lastLabel.length !== 0 ? lastLabel[0].innerText : '';
        this.lastColor = color;
        const imageContainer = $('.image-container');
        const deleteArea = $('.delete-area');
        const backgroundArea = $('.select-areas-background-area');
        const resizeArea = $('.select-areas-resize-handler');
        deleteArea.addClass('pointer-events-auto');
        backgroundArea.addClass('pointer-events-auto');
        resizeArea.addClass('pointer-events-auto');
        imageContainer.addClass('pointer-events-none');
        imageContainer.addClass('cursor-auto');
        if (enable && this.imageDocument) {
            $('.outline_' + _this.lastId).toggleClass('animate');
            if (removeClass) {
                imageContainer.removeClass('pointer-events-none');
                imageContainer.removeClass('cursor-auto');
            }
            this.imageDocument.selectAreas({
                allowNudge: false,
                minSize: [20, 20],
                maxSize: [this.imageDocument.width(), this.imageDocument.height() / 8],
                onChanged(img: any, cpt: any, selection: any) {
                    if (selection.length !== 0 && selection['width'] !== 0 && selection['height'] !== 0) {
                        _this.ocr_process(img, cpt, selection);
                    }
                },
                onDeleted(img: any, cpt: any) {
                    const inputId = $('#select-area-label_' + cpt).attr('class').replace('input_', '').replace('select-none', '');
                    _this.deletePosition(inputId);
                    _this.deletePage(inputId);
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

    ocr_process(img: any, cpt: number, selection: any) {
        const page = this.getPage(this.lastId);
        if (this.ocrFromUser || (page === this.currentPage || page === 0)) {
            if ($('#select-area-label_' + cpt).length === 0) {
                const outline = $('#select-areas-outline_' + cpt);
                const backgroundArea = $('#select-areas-background-area_' + cpt);
                const labelContainer = $('#select-areas-label-container_' + cpt);
                labelContainer.append('<div id="select-area-label_' + cpt + '" class="input_' + this.lastId + ' select-none">' + this.lastLabel + '</div>');
                backgroundArea.css('background-color', this.lastColor);
                outline.addClass('outline_' + this.lastId);
                backgroundArea.addClass('background_' + this.lastId);
                backgroundArea.data('page', page);
                labelContainer.data('page', page);
                outline.data('page', page);
            }

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

            if (this.imageDocument && !this.launchOnInit) {
                const _selection = this.getSelectionByCpt(selection, cpt);
                this.savePosition(_selection);
                this.savePage(this.currentPage);
            }
        } else {
            const input = $('.input_' + this.lastId);
            const background = $('.background_' + this.lastId);
            const outline = $('.outline_' + this.lastId);
            input.remove();
            background.remove();
            outline.remove();
        }
    }

    getSelectionByCpt(selection: any, cpt: any) {
        for (const index in selection) {
            if (selection[index].id === cpt) {
                return selection[index];
            }
        }
    }

    getPage(fieldId: any) {
        let page: number = this.currentPage;
        if (this.positionsMask.pages) {
            Object.keys(this.positionsMask.pages).forEach((element: any) => {
                if (element === fieldId) {
                    page = this.positionsMask.pages[fieldId];
                }
            });
        }
        return page;
    }

    checkIfObjectIsEqual(object1: any, object2: any) {
        if (!object1 || !object2) {
            return false;
        }

        const aProps = Object.getOwnPropertyNames(object1);
        const bProps = Object.getOwnPropertyNames(object2);

        if (aProps.length !== bProps.length) {
            return false;
        }

        for (let i = 0; i < aProps.length; i++) {
            const propName = aProps[i];
            if (object1[propName] !== object2[propName]) {
                return false;
            }
        }
        return true;
    }

    savePosition(position: any) {
        position = {
            height: position.height * this.ratio,
            width: position.width * this.ratio,
            x: position.x * this.ratio,
            y: position.y * this.ratio
        };
        if (!this.checkIfObjectIsEqual(position, this.positionsMask.positions[this.lastId])) {
            this.http.put(environment['url'] + '/ws/positions_masks/updatePositions/' + this.positionMaskId,
                {'args': {[this.lastId]: position}},
                {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.positionsMask.positions[this.lastId] = position;
                    this.notify.success(this.translate.instant('POSITIONS-MASKS.position_and_page_updated', {"input": this.lastLabel}));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    savePage(page: any) {
        if (page !== this.positionsMask.pages[this.lastId]) {
            this.http.put(environment['url'] + '/ws/positions_masks/updatePages/' + this.positionMaskId,
                {'args': {[this.lastId]: page}},
                {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.positionsMask.pages[this.lastId] = page;
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    deletePosition(fieldId: any) {
        this.http.put(environment['url'] + '/ws/positions_masks/' + this.positionMaskId + '/deletePosition',
            {'args': fieldId.trim()},
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.positionsMask.positions[this.lastId] = '';
                this.notify.success(this.translate.instant('POSITIONS-MASKS.position_and_page_updated', {"input": this.lastLabel}));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    deletePage(fieldId: any) {
        this.http.put(environment['url'] + '/ws/positions_masks/' + this.positionMaskId + '/deletePage',
            {'args': fieldId.trim()},
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.positionsMask.pages[this.lastId] = '';
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    async nextPage() {
        if (this.currentPage < this.documentImageNbPages) {
            this.currentPage = this.currentPage + 1;
            await this.changeImage(this.currentPage, this.currentPage - 1);
        } else {
            await this.changeImage(1, this.documentImageNbPages);
        }
    }

    async previousPage() {
        if (this.currentPage > 1) {
            this.currentPage = this.currentPage - 1;
            await this.changeImage(this.currentPage, this.currentPage + 1);
        } else {
            await this.changeImage(this.documentImageNbPages, this.currentPage);
        }
    }

    async changeImage(pageToShow: number, oldPage: number) {
        if (pageToShow) {
            const extension = this.documentImageName.split('.').pop();
            const oldCpt = ('000' + oldPage).substr(-3);
            const newCpt = ('000' + pageToShow).substr(-3);

            const newFilename = this.documentImageName.replace(oldCpt + '.' + extension, newCpt + '.' + extension);
            this.documentImageName = newFilename;
            const thumbB64: any = await this.getThumb(newFilename);
            this.documentImageSrc = this.sanitizer.sanitize(SecurityContext.URL, 'data:image/jpeg;base64, ' + thumbB64.file);
            this.currentPage = pageToShow;
            for (const parentCpt in this.availableFieldsParent) {
                for (const cpt in this.availableFieldsParent[parentCpt]['values']) {
                    const field = this.availableFieldsParent[parentCpt]['values'][cpt];
                    const position = this.positionsMask.positions[field.id];
                    const page = this.positionsMask.pages[field.id];
                    if (position) {
                        const input = $('.input_' + field.id);
                        const background = $('.background_' + field.id);
                        const outline = $('.outline_' + field.id);
                        input.remove();
                        background.remove();
                        outline.remove();
                        if (page === this.currentPage) {
                            this.drawPositionByField(field, position);
                        }
                    }
                }
            }
        }
    }

    async getThumb(filename:string) {
        return await this.http.post(environment['url'] + '/ws/verifier/getThumb', {
            'args': {
                'type': 'positions_masks',
                'filename': filename
            }
        }, {headers: this.authService.headers}).toPromise();
    }

    async filterSupplier(value: any) {
        if (value.length < 3) {
            return;
        }
        this.toHighlight = value;
        this.suppliers = await this.retrieveSuppliers(value);
        this.suppliers = this.suppliers.suppliers;
    }
}
