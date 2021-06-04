import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {API_URL} from "../../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {NotificationService} from "../../../services/notifications/notifications.service";
declare var $: any;

@Component({
    selector: 'app-viewer',
    templateUrl: './verifier-viewer.component.html',
    styleUrls: ['./verifier-viewer.component.scss']
})

export class VerifierViewerComponent implements OnInit {
    loading: boolean = true
    imageInvoice: any;
    isOCRRunning: boolean = false;

    lastLabel: string = '';
    lastColor: string ='';
    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private authService: AuthService,
        private notify: NotificationService
    ) {}

    ngOnInit(): void {
        let invoiceId = this.route.snapshot.params['id'];
        this.imageInvoice = $('#my-image')
        // this.ocrOnFly(false, '')
    }

    ocr(event: any, enable: boolean, color = 'red'){
        let _this = this
        let inputId = event.target.id
        this.lastLabel = event.target.labels[0].textContent
        this.lastColor = color
        let imageContainer = $('.image-container');
        imageContainer.addClass('pointer-events-none')
        imageContainer.addClass('cursor-auto')

        if (enable){
            imageContainer.removeClass('pointer-events-none')
            imageContainer.removeClass('cursor-auto')
            this.imageInvoice.selectAreas({
                mineSize: [20, 20],
                maxSize: [this.imageInvoice.width(), this.imageInvoice.height() / 8],
                onChanged: function(img: any, cpt: any, selection: any) {
                    if (selection['width'] !== 0 && selection['height'] !== 0) {
                        // Write the label of the input above the selection rectangle
                        if ($('#select-area-label_' + cpt).length == 0) {
                            $('#select-areas-label-container_' + cpt).append('<div id="select-area-label_' + cpt + '">' + _this.lastLabel + '</div>')
                            $('#select-areas-background-area_' + cpt).css('background-color', _this.lastColor)
                        }
                        // End write

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
                                    selection: selection[cpt],
                                    fileName: $('#my-image')[0].src.replace(/^.*[\\\/]/, ''),
                                    thumbSize: {width: img.currentTarget.width, height: img.currentTarget.height}
                                },
                                {headers: _this.authService.headers})
                                .pipe(
                                    tap((data: any) => {
                                        console.log(data)
                                        _this.isOCRRunning = false
                                    }),
                                    catchError((err: any) => {
                                        console.debug(err);
                                        _this.notify.handleErrors(err);
                                        return of(false);
                                    })
                                ).subscribe()
                        }
                    }
                }
            });
        }
    }

    ocrOnFly(isRemoved: boolean, input: string, removeWhiteSpace = false, needToBeNumber = false, needToBeDate = false){
        let _this = this
        this.imageInvoice.imgAreaSelect({
            fadeSpeed: 400,
            autoHide: false,
            handles: true,
            remove: isRemoved,
            maxWidth: this.imageInvoice.width(),
            maxHeight: this.imageInvoice.height() / 8,
            onSelectEnd     : function(img: any, selection: any) {
                console.log(selection)
                if (selection['width'] !== 0 && selection['height'] !== 0) {
                    if (!_this.isOCRRunning){
                        _this.isOCRRunning = true
                        _this.http.post(API_URL + '/ws/verifier/ocrOnFly',
                            {selection: selection, fileName: $('#my-image')[0].src.replace(/^.*[\\\/]/, ''), thumbSize: {width: img.width, height: img.height}},
                            {headers: _this.authService.headers})
                        .pipe(
                            tap((data: any) => {
                                console.log(data)
                            }),
                            catchError((err: any) => {
                                console.debug(err);
                                _this.notify.handleErrors(err);
                                return of(false);
                            })
                        ).subscribe()
                    }
                }
            }
        });
        console.log(this.isOCRRunning)
    }

}
