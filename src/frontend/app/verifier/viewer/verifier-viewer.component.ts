import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {API_URL} from "../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {NotificationService} from "../../../services/notifications/notifications.service";
import {TranslateService} from "@ngx-translate/core";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
import {FormControl} from "@angular/forms";
import { DatePipe } from '@angular/common';
import {LocalStorageService} from "../../../services/local-storage.service";
declare var $: any;

@Component({
    selector: 'app-viewer',
    templateUrl: './verifier-viewer.component.html',
    styleUrls: ['./verifier-viewer.component.scss'],
    providers: [DatePipe]
})

export class VerifierViewerComponent implements OnInit {
    loading         : boolean = true
    imageInvoice    : any;
    isOCRRunning    : boolean = false;
    invoiceId       : any;
    invoice         : any;
    fields          : any;
    lastLabel       : string = '';
    lastId          : string = '';
    lastColor       : string ='';
    fieldCategories : any[] = [
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
    disableOCR      : boolean = false;
    form            : any = {
        'supplier': [],
        'facturation': [],
        'other': []
    }

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        private localeStorageService: LocalStorageService
    ) {}

    async ngOnInit(): Promise<void> {
        this.localeStorageService.save('splitter_or_verifier', 'verifier')
        this.imageInvoice = $('#invoice_image');
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
        let form = await this.getForm();
        await this.fillForm(form);
        await this.drawPositions(form);
        this.loading = false;
    }

    async drawPositions(data: any): Promise<any> {
        for (let parent in this.fields) {
            for (let cpt in data.fields[parent]) {
                let field = data.fields[parent][cpt]
                let position = this.invoice[field.id + '_position'];
                if (position){
                    position = JSON.parse(position);
                    this.lastId = field.id;
                    this.lastLabel = this.translate.instant(field.label).trim();
                    this.lastColor = field.color
                    this.disableOCR = true
                    $('#' + field.id).focus()
                    let newArea = {
                        x: position.x,
                        y: position.y,
                        width: position.width,
                        height: position.height
                    };
                    let triggerEvent = $('.trigger');
                    triggerEvent.trigger('mousedown');
                    triggerEvent.trigger('mouseup', [newArea]);
                    setTimeout(() => {
                        $('#' + field.id).blur();
                    });
                }
            }
        }
    }

    async getInvoice(): Promise<any> {
        return await this.http.get(API_URL + '/ws/verifier/invoices/' + this.invoiceId, {headers: this.authService.headers}).toPromise();
    }

    async getForm(): Promise<any> {
        if (this.invoice.account_id)
            return await this.http.get(API_URL + '/ws/forms/getBySupplierId/' + this.invoice.account_id, {headers: this.authService.headers}).toPromise();
        else
            return await this.http.get(API_URL + '/ws/forms/getDefault', {headers: this.authService.headers}).toPromise();
    }

    async fillForm(data: any): Promise<any> {
        this.fields = data.fields
        for (let parent in this.fields){
            for (let cpt in data.fields[parent]){
                let field = data.fields[parent][cpt]
                this.form[parent].push({
                    id: field.id,
                    label: field.label,
                    required: field.required,
                    control: new FormControl(),
                    type: field.type,
                    color: field.color,
                    unit: field.unit,
                    class: field.class,
                    format: field.format,
                    format_icon: field.format_icon,
                    class_label: field.class_label,
                })
                let value = this.invoice[field.id];
                let _field = this.form[parent][this.form[parent].length - 1]
                if (field.format == 'date' && field.id !== '' && field.id !== undefined){
                    value = new Date(value)
                }
                _field.control.setValue(value)
            }
        }
    }

    getSelectionByCpt(selection: any, cpt: any) {
        for (let index in selection){
            if (selection[index].id == cpt)
                return selection[index]
        }
    }

    ocr(event: any, enable: boolean, color = 'green') {
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
            $('.outline_' + _this.lastId).toggleClass('animate')
            imageContainer.removeClass('pointer-events-none');
            imageContainer.removeClass('cursor-auto');
            this.imageInvoice.selectAreas({
                minSize: [20, 20],
                maxSize: [this.imageInvoice.width(), this.imageInvoice.height() / 8],
                onChanged: function(img: any, cpt: any, selection: any) {
                    if (selection.length !== 0 && selection['width'] !== 0 && selection['height'] !== 0) {
                        // Write the label of the input above the selection rectangle
                        if ($('#select-area-label_' + cpt).length == 0) {
                            $('#select-areas-label-container_' + cpt).append('<div id="select-area-label_' + cpt + '" class="input_' + _this.lastId + '">' + _this.lastLabel + '</div>')
                            $('#select-areas-background-area_' + cpt).css('background-color', _this.lastColor)
                            $('#select-areas-outline_' + cpt).addClass('outline_' + _this.lastId)
                        }
                        // End write

                        let inputId = $('#select-area-label_' + cpt).attr('class').replace('input_', '')
                        let input = $('#' + inputId)
                        input.focus()
                        // Test to avoid multi selection for same label. If same label exists, remove the selected areas and replace it by the new one
                        let label = $('div[id*=select-area-label_]:contains(' + _this.lastLabel + ')')
                        let labelCount = label.length
                        if (labelCount > 1){
                            let cptToDelete = label[labelCount - 1].id.split('_')[1]
                            $('#select-areas-label-container_' + cptToDelete).remove()
                            $('#select-areas-background-area_' + cptToDelete).remove()
                            $('#select-areas-outline_' + cptToDelete).remove()
                            $('#select-areas-delete_' + cptToDelete).remove()
                            $('.select-areas-resize-handler_' + cptToDelete).remove()
                        }
                        if (!_this.isOCRRunning && !_this.loading) {
                            _this.isOCRRunning = true
                            _this.http.post(API_URL + '/ws/verifier/ocrOnFly',
                                {
                                    selection: _this.getSelectionByCpt(selection, cpt),
                                    fileName: _this.imageInvoice[0].src.replace(/^.*[\\\/]/, ''),
                                    thumbSize: {width: img.currentTarget.width, height: img.currentTarget.height}
                                },{headers: _this.authService.headers})
                                .pipe(
                                    tap((data: any) => {
                                        input.val(data.result.text)
                                        _this.isOCRRunning = false;
                                        _this.savePosition(_this.getSelectionByCpt(selection, cpt))
                                    }),
                                    catchError((err: any) => {
                                        console.debug(err);
                                        _this.notify.handleErrors(err);
                                        return of(false);
                                    })
                                ).subscribe()
                        }
                    }
                },
                onDeleted: function(img: any, cpt: any) {
                    let inputId = $('#select-area-label_' + cpt).attr('class').replace('input_', '')
                    if (inputId){
                        $('#' + inputId).val('')
                    }
                }
            });
        }else{
            let deleteClicked = false
            $(".select-areas-delete-area").click(function(){
                deleteClicked = true
            });
            setTimeout(function (){
                if (!deleteClicked){
                    resizeArea.css('display', 'none');
                    deleteArea.css('display', 'none');
                }
            }, 50)
            $('.outline_' + _this.lastId).removeClass('animate')
        }
    }

    savePosition(position: []) {
        this.http.put(API_URL + '/ws/verifier/invoices/' + this.invoiceId + '/updatePosition',
            {'args': {'input_id' : this.lastId, 'position': position}},
            {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('INVOICES.position_updated', {"input": this.lastLabel}));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    // getErrorMessageSupplier(field: any) {
    //     let error = undefined;
    //     this.customerForm.forEach(element => {
    //         if (element.id == field) {
    //             if (element.required && !(element.value || element.control.value)) {
    //                 error = this.translate.instant('AUTH.field_required');
    //             }
    //         }
    //     })
    //     return error
    // }
}
