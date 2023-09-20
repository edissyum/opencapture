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
import { ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from "@angular/forms";
import { FileValidators } from "ngx-file-drag-drop";
import { environment } from  "../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { HttpClient, HttpHeaders} from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../services/notifications/notifications.service";
import { LocalStorageService } from "../../services/local-storage.service";

@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class UploadComponent implements OnInit {
    headers                     : HttpHeaders   = this.authService.headers;
    selectedWorkflow            : any           = '';
    selectedWorkflowTechnicalId : any           = '';
    workflows                   : any[]         = [];
    loading                     : boolean       = true;
    sending                     : boolean       = false;
    error                       : boolean       = false;

    constructor(
        private router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public localStorageService: LocalStorageService
    ) {}

    fileControl = new FormControl(
        [],
        [
            FileValidators.required,
            FileValidators.fileExtension(['pdf'])
        ]
    );

    ngOnInit(): void {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        if (!this.userService.user.id) {
            this.userService.user = this.userService.getUserFromLocal();
        }

        const splitterOrVerifier = this.localStorageService.get('splitter_or_verifier');
        if (!splitterOrVerifier) {
            this.http.get(environment['url'] + '/ws/config/getConfigurationNoAuth/defaultModule', {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    if (data.configuration.length === 1) {
                        this.localStorageService.save('splitter_or_verifier', data.configuration[0].data.value);
                        this.getWorkflows(data.configuration[0].data.value);
                    }
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            this.getWorkflows(splitterOrVerifier);
        }
    }

    getWorkflows(splitterOrVerifier: string): void {
        this.http.get(environment['url'] + '/ws/workflows/' + splitterOrVerifier + '/list/user/' + this.userService.user.id, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.workflows = data.workflows;
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
                const fileName = data[i].name;
                const fileExtension = fileName.split('.').pop();
                if (fileExtension.toLowerCase() !== 'pdf') {
                    this.error = true;
                    this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized', {count: data.length}));
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

        for (let i = 0; i < this.fileControl.value!.length; i++) {
            if (this.fileControl.status === 'VALID') {
                formData.append(this.fileControl.value![i]['name'], this.fileControl.value![i]);
            } else {
                this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized'));
                return;
            }
        }
        formData.set('workflowId', this.selectedWorkflowTechnicalId);
        formData.set('userId', this.userService.user.id);

        const splitterOrVerifier = this.localStorageService.get('splitter_or_verifier');
        if (splitterOrVerifier !== undefined || splitterOrVerifier !== '') {
            this.http.post(
                environment['url'] + '/ws/verifier/checkFileBeforeUpload', formData, {headers: new HttpHeaders({ timeout: `${2000}` })},
            ).pipe(
                tap(() => {
                    this.http.post(environment['url'] + '/ws/' + splitterOrVerifier + '/upload', formData, {headers: this.authService.headers}).pipe(
                        tap(() => {
                            this.sending = false;
                            this.fileControl.setValue([]);
                            this.notify.success(this.translate.instant('UPLOAD.upload_success'));
                        }),
                        catchError((err: any) => {
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
            return;
        }
    }
}
