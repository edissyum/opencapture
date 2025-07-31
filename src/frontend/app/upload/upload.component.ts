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

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from "@angular/forms";
import { FileValidators } from "ngx-file-drag-drop";
import { environment } from  "../env";
import {catchError, finalize, map, tap} from "rxjs/operators";
import {firstValueFrom, of} from "rxjs";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { _, TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../services/notifications/notifications.service";
import { SessionStorageService } from "../../services/session-storage.service";

@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})

export class UploadComponent implements OnInit {
    allowedExtensions           : string[]      = ['pdf', 'jpg', 'jpeg', 'png', 'heif', 'heic'];
    headers                     : HttpHeaders   = this.authService.headers;
    selectedWorkflow            : any           = '';
    selectedWorkflowTechnicalId : any           = '';
    workflows                   : any           = [];
    loading                     : boolean       = true;
    sending                     : boolean       = false;
    error                       : boolean       = false;
    timeout                     : number        = 2000;

    constructor(
        private http: HttpClient,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public sessionStorageService: SessionStorageService
    ) {}

    fileControl = new FormControl(
        [],
        [
            FileValidators.required,
            FileValidators.fileExtension(this.allowedExtensions)
        ]
    );

    async ngOnInit(): Promise<void> {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        if (!this.userService.user.id) {
            this.userService.user = this.userService.getUserFromLocal();
        }

        const splitterOrVerifier: any = this.sessionStorageService.get('splitter_or_verifier');
        if (splitterOrVerifier !== undefined || splitterOrVerifier !== '') {
            this.getWorkflows(splitterOrVerifier);
        }

        let resulTimeout = await this.retrieveTimeOut()
        if (resulTimeout != null) {
            this.timeout = resulTimeout;
        }
    }

    async retrieveTimeOut() {
        let confTimeout = 'timeoutUpload'
        return await firstValueFrom( this.http.get(environment['url'] + '/ws/config/getConfigurationNoAuth/' + confTimeout, {headers: this.authService.headers}).pipe(
            map((data: any) => {
                if (!data || data.configuration === undefined || data.configuration.length === 0) {
                    return 2000;
                }
                return parseInt(data.configuration[0].data.value)
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(null)
            })
        ));
    };

    getWorkflows(splitterOrVerifier: string): void {
        this.http.get(environment['url'] + '/ws/workflows/' + splitterOrVerifier + '/list/user/' + this.userService.user.id, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.workflows.forEach((element: any) => {
                    let show = true;

                    if (element.process && element.process['api_only']) {
                        show = false
                    }

                    if (show) {
                        this.workflows.push(element);
                    }
                });

                if (this.workflows.length === 1) {
                    this.selectedWorkflow = data.workflows[0].id;
                    this.selectedWorkflowTechnicalId = data.workflows[0].workflow_id;
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
        this.error = false;
        if (data && data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
                const fileExtension = data[i].name.split('.').pop();
                if (this.allowedExtensions.indexOf(fileExtension.toLowerCase()) === -1) {
                    this.error = true;
                    this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized'));
                    return;
                }
            }
        }
    }

    setWorkflow(workflowId: any) {
        this.workflows.forEach((element: any) => {
            if (element.id === workflowId) {
                this.selectedWorkflowTechnicalId = element.workflow_id;
            }
        });
        this.selectedWorkflow = workflowId;
    }

    uploadFile(): void {
        this.sending = true;
        const formData: FormData = new FormData();
        if (this.fileControl.value!.length === 0) {
            this.notify.handleErrors(this.translate.instant('UPLOAD.no_file'));
            return;
        }

        let timeout = this.timeout;
        for (let i = 0; i < this.fileControl.value!.length; i++) {
            if (this.fileControl.status === 'VALID') {
                if (timeout) {
                    timeout += this.fileControl.value![i]['size'] / 200;
                }
                formData.append(this.fileControl.value![i]['name'], this.fileControl.value![i]);
            } else {
                this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized'));
                return;
            }
        }

        formData.set('userId', this.userService.user.id);
        formData.set('workflowId', this.selectedWorkflowTechnicalId);

        const splitterOrVerifier = this.sessionStorageService.get('splitter_or_verifier');
        if (splitterOrVerifier !== undefined || splitterOrVerifier !== '') {
            let headersTimeout = timeout == 0 ? {} : {headers: new HttpHeaders({ timeout: `${timeout}`})}
            this.http.post(
                environment['url'] + '/ws/checkFileBeforeUpload', formData, headersTimeout
            ).pipe(
                tap(() => {
                    this.http.post(environment['url'] + '/ws/' + splitterOrVerifier + '/upload', formData, {headers: this.authService.headers}).pipe(
                        tap(() => {
                            this.sending = false;
                            this.fileControl.setValue([]);
                            this.notify.success(this.translate.instant('UPLOAD.upload_success'));
                        }),
                        catchError((err: any) => {
                            this.sending = false;
                            this.fileControl.setValue([]);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                }),
                catchError(() => {
                    this.sending = false;
                    this.fileControl.setValue([]);
                    this.notify.handleErrors(this.translate.instant('ERROR.permission_problem'));
                    return of(false);
                })
            ).subscribe();
        } else {
            this.notify.handleErrors(this.translate.instant('ERROR.unknow_error'));
        }
    }
}
