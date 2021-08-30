import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../../../../services/user.service";
import {AuthService} from "../../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {FormControl} from "@angular/forms";
import {API_URL} from "../../../../env";
import {catchError, finalize, map, startWith, tap} from "rxjs/operators";
import {Observable, of} from "rxjs";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
import {FileValidators} from "ngx-file-drag-drop";
import {DomSanitizer} from "@angular/platform-browser";
import {ConfigService} from "../../../../../services/config.service";
declare var $: any;

@Component({
    selector: 'update-positions-mask',
    templateUrl: './update-positions-mask.component.html',
    styleUrls: ['./update-positions-mask.component.scss']
})
export class UpdatePositionsMaskComponent implements OnInit {
    loading                 : boolean   = true;
    ratio                   : any;
    positionMaskId          : any;
    positionsMask           : any;
    invoiceImageWidth       : any;
    invoiceImageNbPages     : any;
    currentPage             : number    = 1;
    suppliers               : any       = [];
    filteredOptions         : Observable<any> | undefined;
    form                    : any       = {
        'label': {
            'control': new FormControl(),
        },
        'supplier_id': {
            'control': new FormControl(),
        }
    };
    toHighlight             : string    = '';
    availableFieldsParent   : any []    = [
        {
            'id': 'facturation_fields',
            'label': this.translate.instant('FACTURATION.facturation'),
            'values': [
                {
                    id: 'order_number',
                    label: marker('FACTURATION.order_number'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'yellow',
                },
                {
                    id: 'delivery_number',
                    label: marker('FACTURATION.delivery_number'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'silver',
                },
                {
                    id: 'invoice_number',
                    label: marker('FACTURATION.invoice_number'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'red',
                },
                {
                    id: 'invoice_date',
                    label: marker('FACTURATION.invoice_date'),
                    unit: 'facturation',
                    type: 'date',
                    color: 'yellow',
                },
                {
                    id: 'invoice_due_date',
                    label: marker('FACTURATION.invoice_due_date'),
                    unit: 'facturation',
                    type: 'date',
                    color: 'blue',
                },
                {
                    id: 'vat_rate',
                    label: marker('FACTURATION.vat_rate'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'pink',
                },
                {
                    id: 'no_rate_amount',
                    label: marker('FACTURATION.no_rate_amount'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'fuschia',
                },
                {
                    id: 'vat_amount',
                    label: marker('FACTURATION.vat_amount'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'purple',
                },
                {
                    id: 'total_ttc',
                    label: marker('FACTURATION.total_ttc'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'white'
                },
                {
                    id: 'total_ht',
                    label: this.translate.instant('FACTURATION.total_ht'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'green'
                },
                {
                    id: 'total_vat',
                    label: this.translate.instant('FACTURATION.total_vat'),
                    unit: 'facturation',
                    type: 'text',
                    color: 'lime',
                },
            ]
        },
        {
            'id': 'custom_fields',
            'label': marker('FORMS.custom_fields'),
            'values': []
        },
    ];
    imageInvoice            : any;
    invoiceImageSrc         : any;
    invoiceImageName        : any;
    lastId                  : any;
    lastColor               : string    = '';
    lastLabel               : string    = '';
    config                  : any;
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
        private configService: ConfigService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    async ngOnInit(): Promise<void>  {
        this.serviceSettings.init();
        this.positionMaskId = this.route.snapshot.params['id'];
        this.config = this.configService.getConfig();
        this.positionsMask = await this.getPositionMask();
        if (this.positionsMask.filename) {
            this.invoiceImageName = this.positionsMask.filename;
            this.invoiceImageNbPages = this.positionsMask.nb_pages;
            this.invoiceImageWidth = this.positionsMask.width;
            this.imageInvoice = $('#invoice_image_src');
            this.ratio = this.invoiceImageWidth / this.imageInvoice.width();
            let thumb_b64: any = {}
            thumb_b64 = await this.getThumb(this.positionsMask.filename);
            this.invoiceImageSrc = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64, ' + thumb_b64.file);
        }
        this.suppliers = await this.retrieveSuppliers();
        this.suppliers = this.suppliers.suppliers;
        this.ocr({
            'target' : {
                'id': ''
            }
        }, true);
        this.form['label'].control.setValue(this.positionsMask.label);
        this.filteredOptions = this.form['supplier_id'].control.valueChanges
            .pipe(
                startWith(''),
                map(option => option ? this._filter(option) : this.suppliers.slice())
            );
        this.suppliers.forEach((element: any ) => {
            if (element.id == this.positionsMask.supplier_id) {
                this.form['supplier_id'].control.setValue(element.name);
            }
        })

        setTimeout(() => {
            this.drawPositions();
            this.loading = false;
        }, 1500)

        let triggerEvent = $('.trigger');
        triggerEvent.hide();

        // await this.http.get(API_URL + '/ws/positions_masks/getById/' + this.positionMaskId, {headers: this.authService.headers}).pipe(
        //     tap((positions_mask_data: any) => {
        //         this.http.get(API_URL + '/ws/accounts/suppliers/list', {headers: this.authService.headers}).pipe(
        //             tap((data: any) => {
        //
        //                 this.http.get(API_URL + '/ws/customFields/list', {headers: this.authService.headers}).pipe(
        //                     tap((data: any) => {
        //                         if (data.customFields) {
        //                             for (let field in data.customFields) {
        //                                 if (data.customFields.hasOwnProperty(field)) {
        //                                     if(data.customFields[field].module == 'verifier') {
        //                                         for (let parent in this.availableFieldsParent) {
        //                                             if(this.availableFieldsParent[parent].id == 'custom_fields') {
        //                                                 this.availableFieldsParent[parent].values.push(
        //                                                     {
        //                                                         id: 'custom_' + data.customFields[field].id,
        //                                                         label: data.customFields[field].label,
        //                                                         type: data.customFields[field].type,
        //                                                         color: data.customFields[field].color,
        //                                                     }
        //                                                 )
        //                                             }
        //                                         }
        //                                     }
        //                                 }
        //                             }
        //                             let triggerEvent = $('.trigger');
        //                             triggerEvent.hide();
        //                         }
        //                     }),
        //                     catchError((err: any) => {
        //                         console.debug(err);
        //                         this.notify.handleErrors(err);
        //                         return of(false);
        //                     })
        //                 ).subscribe();
        //             }),
        //             catchError((err: any) => {
        //                 console.debug(err);
        //                 this.notify.handleErrors(err);
        //                 return of(false);
        //             })
        //         ).subscribe();
        //     }),
        //     catchError((err: any) => {
        //         console.debug(err);
        //         this.notify.handleErrors(err);
        //         return of(false);
        //     })
        // ).subscribe();
        // setTimeout(() => {
        //     this.drawPositions();
        //     this.loading = false;
        // }, 5000);
    }

    private _filter(value: any) {
        if (typeof value == 'string') {
            this.toHighlight = value;
            const filterValue = value.toLowerCase();
            return this.suppliers.filter((option: any) => option.name.toLowerCase().indexOf(filterValue) !== -1);
        }else {
            return this.suppliers;
        }
    }

    async getPositionMask(): Promise<any> {
        return await this.http.get(API_URL + '/ws/positions_masks/getById/' + this.positionMaskId, {headers: this.authService.headers}).toPromise();
    }

    async retrieveSuppliers(): Promise<any> {
        return await this.http.get(API_URL + '/ws/accounts/suppliers/list?order=name ASC', {headers: this.authService.headers}).toPromise();
    }

    drawPositions() {
        if (this.positionsMask) {
            for (let field in this.positionsMask.positions) {
                let position = this.positionsMask.positions[field]
                let page = this.getPage(field);
                if (position && parseInt(String(page)) == parseInt(String(this.currentPage))) {
                    this.lastId = field;
                    for (let cpt in this.availableFieldsParent) {
                        this.availableFieldsParent[cpt]['values'].forEach((element: any) => {
                            if (field == element.id) {
                                this.lastLabel = this.translate.instant(element.label);
                                this.lastColor = element.color;
                            }
                        });
                    }
                    $('#' + field).focus();
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

    updatePositionsMask() {

    }

    checkFile(data: any): void {
        if (data && data.length != 0) {
            this.loading = true;
            for (let i = 0; i < data.length; i++) {
                let file_name = data[i].name;
                let file_extension = file_name.split('.').pop();
                if (file_extension.toLowerCase() != 'pdf') {
                    this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized', {count: data.length}));
                    this.loading = false;
                    return;
                }else {
                    const formData: FormData = new FormData();
                    if (data) formData.append(data[0].name, data[0])

                    this.http.post(API_URL + '/ws/positions_masks/getImageFromPdf/' + this.positionMaskId, formData, {headers: this.authService.headers}).pipe(
                        tap((data: any) => {
                            this.invoiceImageSrc = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64, ' + data.file);
                            this.invoiceImageName = data.filename;
                            this.invoiceImageWidth = data.width;
                            this.invoiceImageNbPages = data.nb_pages
                            this.fileControl.setValue([]);
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
        this.invoiceImageSrc = '';
    }

    ocr(event: any, enable: boolean, color = 'green') {
        $('.trigger').show();
        let _this = this;
        this.lastId = event.target.id;
        this.lastLabel = $('#label_' + this.lastId).length !== 0 ? $('#label_' + this.lastId)[0].innerText : '';
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
                onChanged: function (img: any, cpt: any, selection: any) {
                    if (selection.length !== 0 && selection['width'] !== 0 && selection['height'] !== 0) {
                        _this.ocr_process(img, cpt, selection);
                    }
                },
                onDeleted: function (img: any, cpt: any) {
                    let inputId = $('#select-area-label_' + cpt).attr('class').replace('input_', '').replace('select-none', '');

                }
            });
        }
    }

    ocr_process(img: any, cpt: number, selection: any) {
        let page = this.getPage(this.lastId);
        if ((page == this.currentPage || page == 0)) {
            if ($('#select-area-label_' + cpt).length == 0) {
                let outline = $('#select-areas-outline_' + cpt);
                let background_area = $('#select-areas-background-area_' + cpt);
                let resize_handler_area = $('.select-areas-resize-handler_' + cpt);
                let delete_area = $('#select-areas-delete_' + cpt);
                let label_container = $('#select-areas-label-container_' + cpt);
                label_container.append('<div id="select-area-label_' + cpt + '" class="input_' + this.lastId + ' select-none">' + this.lastLabel + '</div>');
                background_area.css('background-color', this.lastColor);
                outline.addClass('outline_' + this.lastId);
                background_area.addClass('background_' + this.lastId);
                delete_area.addClass('delete_area_' + this.lastId);
                resize_handler_area.addClass('resize_handler_' + this.lastId);
                background_area.data('page', page);
                label_container.data('page', page);
                outline.data('page', page);
            }

            let inputId = $('#select-area-label_' + cpt).attr('class').replace('input_', '').replace('select-none', '');
            $('#' + inputId).focus();

            // Test to avoid multi selection for same label. If same label exists, remove the selected areas and replace it by the new one
            let label = $('div[id*=select-area-label_]:contains(' + this.lastLabel + ')');
            let labelCount = label.length;
            if (labelCount > 1) {
                let cptToDelete = label[labelCount - 1].id.split('_')[1];
                $('#select-areas-label-container_' + cptToDelete).remove();
                $('#select-areas-background-area_' + cptToDelete).remove();
                $('#select-areas-outline_' + cptToDelete).remove();
                $('#select-areas-delete_' + cptToDelete).remove();
                $('.select-areas-resize-handler_' + cptToDelete).remove();
            }
            this.savePosition(this.getSelectionByCpt(selection, cpt));
            this.savePages(this.currentPage);
        }else {
            let input = $('.input_' + this.lastId);
            let background = $('.background_' + this.lastId);
            let outline = $('.outline_' + this.lastId);
            input.remove();
            background.remove();
            outline.remove();
        }
    }

    getSelectionByCpt(selection: any, cpt: any) {
        for (let index in selection) {
            if (selection[index].id == cpt)
                return selection[index];
        }
    }

    getPage(field_id: any) {
        let page: number = this.currentPage;
        if (this.positionsMask.pages) {
            Object.keys(this.positionsMask.pages).forEach((element: any) => {
                if (element == field_id) {
                    page = this.positionsMask.pages[field_id];
                }
            })
        }
        return page;
    }

    savePosition(position: any) {
        position = {
            x: position.x * this.ratio,
            y: position.y * this.ratio,
            height: position.height * this.ratio,
            width: position.width * this.ratio
        }

        this.http.put(API_URL + '/ws/positions_masks/updatePositions/' + this.positionMaskId,
            {'args': {[this.lastId]: position}},
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.positionsMask.positions[this.lastId] = position;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    async savePages(page: any) {
        this.http.put(API_URL + '/ws/positions_masks/updatePages/' + this.positionMaskId,
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

    async nextPage() {
        if (this.currentPage < this.invoiceImageNbPages) {
            this.currentPage = this.currentPage + 1;
            await this.changeImage(this.currentPage, this.currentPage - 1);
        }else {
            await this.changeImage(1, this.invoiceImageNbPages);
        }
    }

    async previousPage() {
        if (this.currentPage > 1) {
            this.currentPage = this.currentPage - 1;
            await this.changeImage(this.currentPage, this.currentPage + 1);
        }else {
            await this.changeImage(this.invoiceImageNbPages, this.currentPage);
        }
    }

    async changeImage(pageToShow: number, oldPage: number) {
        if (pageToShow) {
            let extension = this.invoiceImageName.split('.').pop();
            let old_cpt = ('000' + oldPage).substr(-3);
            let new_cpt = ('000' + pageToShow).substr(-3);

            let new_filename = this.invoiceImageName.replace(old_cpt + '.' + extension, new_cpt + '.' + extension);
            this.invoiceImageName = new_filename;
            let thumb_b64: any = {}
            thumb_b64 = await this.getThumb(new_filename);
            this.invoiceImageSrc = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64, ' + thumb_b64.file);
            this.currentPage = pageToShow;
            for (let parent_cpt in this.availableFieldsParent) {
                for (let cpt in this.availableFieldsParent[parent_cpt]['values']) {
                   let field = this.availableFieldsParent[parent_cpt]['values'][cpt]
                   let position = this.positionsMask.positions[field.id];
                   let page = this.positionsMask.pages[field.id];
                   console.log(field.id, position)
                    if (position) {
                        let input = $('.input_' + field.id);
                        let background = $('.background_' + field.id);
                        let outline = $('.outline_' + field.id);
                        let delete_area = $('.delete_area_' + field.id);
                        let resize_handler = $('.resize_handler_' + field.id);
                        input.remove();
                        background.remove();
                        outline.remove();
                        resize_handler.remove();
                        delete_area.remove();
                        // if (page == this.currentPage) this.drawPositionByField(field, position);
                    }
                }
            }
        }
    }

    async getThumb(filename:string) {
        return await this.http.post(API_URL + '/ws/verifier/getThumb',{'args': {'path': this.config['GLOBAL']['positionsmaskspath'], 'filename': filename}}, {headers: this.authService.headers}).toPromise();
    }
}
