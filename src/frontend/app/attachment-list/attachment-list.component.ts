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

 @dev : Arthur Mondon <arthur.mondon@edissyum.com> */

import {Component, Input, Output, EventEmitter, SecurityContext} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService} from "../../services/notifications/notifications.service";
import { FileViewerComponent } from "../file-viewer/file-viewer.component";
import { environment } from "../env";
import {catchError, finalize, tap} from 'rxjs/operators';
import { TranslateService } from "@ngx-translate/core";
import { of } from 'rxjs';
import {ConfirmDialogComponent} from "../../services/confirm-dialog/confirm-dialog.component";
import {AuthService} from "../../services/auth.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: 'app-attachment-list',
    templateUrl: './attachment-list.component.html',
    styleUrls: ['./attachment-list.component.scss']
})

export class AttachmentListComponent {
    @Input() attachmentUpload!: HTMLInputElement;
    @Input() documentStatus : any;
    @Input() documentId     : string      = '';
    @Output() toggleSidenav = new EventEmitter<void>();
    @Output() attachmentsLength = new EventEmitter<number>();
    loadingAttachment       : boolean     = true;
    attachments             : any[]       = [];

    constructor(
        private http: HttpClient,
        private dialog: MatDialog,
        public translate: TranslateService,
        private authService: AuthService,
        private sanitizer: DomSanitizer,
        private notify: NotificationService
    ) {}

    async ngOnInit() {
        this.getAttachments();
    }

    getAttachments() {
        this.http.get(environment['url'] + '/ws/attachments/verifier/list/' + this.documentId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.attachments = data;
                this.attachments.forEach((attachment: any) => {
                    if (attachment['thumb']) {
                        attachment['thumb'] = this.sanitizer.sanitize(SecurityContext.URL, 'data:image/jpeg;base64, ' + attachment['thumb']);
                    }
                    attachment['extension'] = attachment['filename'].split('.').pop();
                    if (['csv'].includes(attachment['extension'])) {
                        attachment['extension_icon'] = 'fa-file-csv';
                    } else if (['xls', 'xlsx', 'ods'].includes(attachment['extension'])) {
                        attachment['extension_icon'] = 'fa-file-excel';
                    } else if (['pptx', 'ppt', 'odp'].includes(attachment['extension'])) {
                        attachment['extension_icon'] = 'fa-file-powerpoint';
                    } else if (['doc', 'docx', 'odt', 'dot'].includes(attachment['extension'])) {
                        attachment['extension_icon'] = 'fa-file-word';
                    } else if (['zip', 'tar.gz', 'tar', '7z', 'tgz', 'tar.z'].includes(attachment['extension'])) {
                        attachment['extension_icon'] = 'fa-file-zipper';
                    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(attachment['extension'])) {
                        attachment['extension_icon'] = 'fa-file-video';
                    } else if (['mp3', 'wav', 'flac', 'ogg', 'wma', 'aac', 'm4a'].includes(attachment['extension'])) {
                        attachment['extension_icon'] = 'audio-file-video';
                    } else {
                        attachment['extension_icon'] = 'fa-file';
                    }
                });
                this.attachmentsLength.emit(this.attachments.length);
            }),
            finalize(() => {
                this.loadingAttachment = false;
            }),
            catchError((err: any) => {
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    showAttachment(attachment: any) {
        this.http.post(environment['url'] + '/ws/attachments/verifier/download/' + attachment['id'], {}, {
            headers: this.authService.headers
        }).pipe(
            tap((data: any) => {
                const byteCharacters = atob(data['file']);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: data['mime'] });

                const fileURL = URL.createObjectURL(blob);

                this.dialog.open(FileViewerComponent, {
                    data: {
                        title: attachment.filename,
                        fileUrl: fileURL,
                        mimeType: data['mime']
                    },
                    width: '80%',
                    height: '80%'
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    downloadAttachment(attachment: any) {
        this.http.post(environment['url'] + '/ws/attachments/verifier/download/' + attachment['id'], {},
            {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                const referenceFile = 'data:' + data['mime'] + ';base64, ' + data['file'];
                const link = document.createElement("a");
                link.href = referenceFile;
                link.download = attachment['filename'];
                link.click();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    deleteAttachment(attachmentId: string) {
        this.http.delete(environment['url'] + '/ws/attachments/verifier/delete/' + attachmentId, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('ATTACHMENTS.attachment_deleted'));
                this.getAttachments();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    deleteConfirmDialog(attachmentId: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('ATTACHMENTS.confirm_delete_attachment'),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadingAttachment = true;
                this.deleteAttachment(attachmentId);
            }
        });
    }

    closeSidenav() {
        this.toggleSidenav.emit();
    }

    uploadAttachments(event: any) {
        this.loadingAttachment = true;
        const attachments = new FormData();
        for (const file of event.target.files) {
            attachments.append(file['name'], file);
        }

        attachments.set('documentId', this.documentId);
        this.http.post(environment['url'] + '/ws/attachments/verifier/upload', attachments, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('ATTACHMENTS.attachment_uploaded'));
                this.getAttachments();
            }),
            catchError((err: any) => {
                this.loadingAttachment = false;
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }
}
