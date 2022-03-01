/** This file is part of Open-Capture for Invoices.

Open-Capture for Invoices is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Open-Capture is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import {Component, OnInit} from '@angular/core';
import {ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl} from "@angular/forms";
import {FileValidators} from "ngx-file-drag-drop";
import {API_URL} from "../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../services/notifications/notifications.service";
import {LocalStorageService} from "../../services/local-storage.service";
import {HistoryService} from "../../services/history.service";


@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class UploadComponent implements OnInit {
    headers                  : HttpHeaders   = this.authService.headers;
    selectedInput            : any           = '';
    selectedInputTechnicalId : any           = '';
    inputs                   : any[]         = [];
    loading                  : boolean       = true;
    sending                  : boolean       = false;

    constructor(
        private router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        private historyService: HistoryService,
        public localeStorageService: LocalStorageService
    ) {
    }

    fileControl = new FormControl(
        [],
        [
            FileValidators.required,
            FileValidators.fileExtension(['pdf'])
        ]
    );

    ngOnInit(): void {
        const splitterOrVerifier = this.localeStorageService.get('splitter_or_verifier');
        this.http.get(API_URL + '/ws/inputs/list?module=' + splitterOrVerifier, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.inputs = data.inputs;
                if (this.inputs.length === 1) {
                    this.selectedInput = data.inputs[0].id;
                    this.selectedInputTechnicalId = data.inputs[0].input_id;
                }
             }),
            finalize(() => {this.loading = false;}),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    checkFile(data: any): void {
        if (data && data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
                const fileName = data[i].name;
                const fileExtension = fileName.split('.').pop();
                if (fileExtension.toLowerCase() !== 'pdf') {
                    this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized', {count: data.length}));
                    return;
                }
            }
        }
    }

    setInput(inputId: any) {
        this.inputs.forEach((element: any) => {
            if (element.id === inputId) {
                this.selectedInputTechnicalId = element.input_id;
            }
        });
        this.selectedInput = inputId;
    }

    uploadInvoice(): void {
        this.sending = true;
        const formData: FormData = new FormData();

        if (this.fileControl.value.length === 0) {
            this.notify.handleErrors(this.translate.instant('UPLOAD.no_file'));
            return;
        }

        for (let i = 0; i < this.fileControl.value.length; i++) {
            if (this.fileControl.status === 'VALID') {
                formData.append(this.fileControl.value[i].name, this.fileControl.value[i]);
            } else {
                this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized'));
                return;
            }
        }
        const splitterOrVerifier = this.localeStorageService.get('splitter_or_verifier');
        if (splitterOrVerifier !== undefined || splitterOrVerifier !== '') {
            this.http.post(
                API_URL + '/ws/' + splitterOrVerifier + '/upload?inputId=' + this.selectedInputTechnicalId,
                formData,
                {
                    headers: this.authService.headers
                },
            ).pipe(
                tap(() => {
                    this.fileControl.setValue('');
                    this.notify.success(this.translate.instant('UPLOAD.upload_success'));
                    this.sending = false;
                    this.historyService.addHistory(splitterOrVerifier, 'upload_file', this.translate.instant('HISTORY-DESC.file_uploaded', {input: this.selectedInputTechnicalId}));
                }),
                catchError((err: any) => {
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }else{
            this.notify.handleErrors(this.translate.instant('ERROR.unknow_error'));
            return;
        }
    }
}
