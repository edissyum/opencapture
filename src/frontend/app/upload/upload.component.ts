import {Component, OnInit} from '@angular/core';
import {ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl} from "@angular/forms";
import {FileValidators} from "ngx-file-drag-drop";
import {API_URL} from "../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../services/notifications/notifications.service";


@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class UploadComponent implements OnInit {
    constructor(
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        private translate: TranslateService,
        private notify: NotificationService,
    ) {
    }

    fileControl = new FormControl(
        [],
        [
            FileValidators.required,
            FileValidators.fileExtension(['pdf'])
        ]
    );

    formData: FormData = new FormData();

    ngOnInit(): void {
    }

    checkFile(data: any): void {
        if (data && data.length != 0) {
            for (let i = 0; i < data.length; i++) {
                let file_name = data[i].name
                let file_extension = file_name.split('.').pop();
                console.log(file_extension)
                if (file_extension.toLowerCase() != 'pdf') {
                    this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized'));
                    return;
                }
            }
        }
    }

    uploadFile(): void {
        const formData: FormData = new FormData();
        let headers = this.authService.headers;

        if (this.fileControl.value.length == 0) {
            this.notify.handleErrors("No file!");
            return;
        }

        for (let i = 0; i < this.fileControl.value.length; i++) {
            if (this.fileControl.status == 'VALID') {
                formData.append('file', this.fileControl.value[i], this.fileControl.value[i].name);
            } else {
                this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized'));
                return;
            }
        }

        this.http.post(API_URL + '/ws/splitter/upload', formData,
            {
                headers
            },
        ).pipe(
            tap((data: any) => {
                this.notify.success(this.translate.instant('SPLITTER.download_success'));
            }),
            catchError((err: any) => {
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }
}