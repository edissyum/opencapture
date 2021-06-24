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
    fields          : any;
    lastLabel       : string = '';
    lastId          : string = '';
    lastColor       : string ='';
    fieldCategories: any[] = [
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

    form : any = {
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
    ) {}

    ngOnInit(): void {
        this.imageInvoice = $('#invoice_image');
        this.ocr({
            'target' : {
                'id': '',
                'labels': [
                    {'textContent': ''}
                ]
            }
        }, true)
        this.invoiceId = this.route.snapshot.params['id'];
        this.loadForm();
    }

    loadForm(){
        this.http.get(API_URL + '/ws/verifier/invoices/' + this.invoiceId, {headers: this.authService.headers}).pipe(
            tap((invoice: any) => {
                let accountId = invoice.account_id
                if (accountId) {
                    this.http.get(API_URL + '/ws/forms/getBySupplierId/' + accountId, {headers: this.authService.headers}).pipe(
                        tap((data: any) => {
                            this.fields = data.fields
                            for (let parent in this.fields){
                                data.fields[parent].forEach((field: any) => {
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
                                })
                            }
                        }),
                        finalize(() => {this.loading = false; this.getData(invoice)}),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                }else{
                    console.log('formulaire par défaut')
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    getData(data: any){
        for (let parent in this.fields){
            this.form[parent].forEach((field: any) => {
                let value = data[field.id];
                let value_position = data[field.id + '_position'];
                if (value_position){
                    value_position = JSON.parse(value_position);
                    let newArea = {
                        x: value_position.x,
                        y: value_position.y,
                        width: value_position.width,
                        height: value_position.height
                    };
                    let event = {
                        'target' : {
                            'id': field.id,
                            'labels': [
                                {'textContent': this.translate.instant(field.label)}
                            ]
                        }
                    }
                    this.imageInvoice.mousedown()
                    console.log('here')
                }
                if (field.format == 'date' && data[field.id] !== '' && data[field.id] !== undefined){
                    value = new Date(value)
                }
                field.control.setValue(value)
            })
        }
    }

    getSelectionByCpt(selection: any, cpt: any){
        for (let index in selection){
            if (selection[index].id == cpt)
                return selection[index]
        }
    }

    ocr(event: any, enable: boolean, color = 'green', newArea: any = false) {
        let _this = this;
        this.lastId = event.target.id;
        this.lastLabel = event.target.labels[0].textContent;
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
                        $('#' + inputId).focus()
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

                        if (!_this.isOCRRunning) {
                            _this.isOCRRunning = true
                            _this.http.post(API_URL + '/ws/verifier/ocrOnFly',
                                {
                                    selection: _this.getSelectionByCpt(selection, cpt),
                                    fileName: _this.imageInvoice[0].src.replace(/^.*[\\\/]/, ''),
                                    thumbSize: {width: img.currentTarget.width, height: img.currentTarget.height}
                                },{headers: _this.authService.headers})
                                .pipe(
                                    tap((data: any) => {
                                        $('#' + inputId).val(data.result.text)
                                        _this.isOCRRunning = false;
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
                onDeleted: function(img: any, cpt: any, selection: any){
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
