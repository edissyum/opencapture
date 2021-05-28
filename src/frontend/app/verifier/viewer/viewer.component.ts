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
    templateUrl: './viewer.component.html',
    styleUrls: ['./viewer.component.scss']
})

export class VerifierViewerComponent implements OnInit {
    loading: boolean = true
    imageInvoice: any;
    isOCRRunning: boolean = false;

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private authService: AuthService,
        private notify: NotificationService
    ) {
    }

    ngOnInit(): void {
        let invoiceId = this.route.snapshot.params['id'];
        this.imageInvoice = $('#my-image')
        this.ocrOnFly(false, '')
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
