import {Component, OnInit} from '@angular/core';
import {ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl} from "@angular/forms";
import {FileValidators} from "ngx-file-drag-drop";
import {API_URL} from "../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../services/notifications/notifications.service";
import {LocalStorageService} from "../../services/local-storage.service";


@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class UploadComponent implements OnInit {
    headers: HttpHeaders = this.authService.headers;

    constructor(
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        private translate: TranslateService,
        private notify: NotificationService,
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
    }

    checkFile(data: any): void {
        if (data && data.length != 0) {
            for (let i = 0; i < data.length; i++) {
                let file_name = data[i].name
                let file_extension = file_name.split('.').pop();
                console.log(file_extension)
                if (file_extension.toLowerCase() != 'pdf') {
                    this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized', {count: data.length}));
                    return;
                }
            }
        }
    }

    uploadFile(): void {
        const formData: FormData = new FormData();

        if (this.fileControl.value.length == 0) {
            this.notify.handleErrors(this.translate.instant('UPLOAD.no_file'));
            return;
        }

        for (let i = 0; i < this.fileControl.value.length; i++) {
            if (this.fileControl.status == 'VALID') {
                formData.append(this.fileControl.value[i].name, this.fileControl.value[i]);
            } else {
                this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized'));
                return;
            }
        }
        console.log(formData)
        let splitter_or_verifier = this.localeStorageService.get('splitter_or_verifier')
        if(splitter_or_verifier !== undefined || splitter_or_verifier !== ''){
            this.http.post(
                API_URL + '/ws/' + splitter_or_verifier + '/upload',
                formData,
                {
                    headers: this.authService.headers
                },
            ).pipe(
                tap((data: any) => {
                    this.notify.success(this.translate.instant('UPLOAD.upload_success'));
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