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

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-attachment-list',
    templateUrl: './attachment-list.component.html',
    styleUrls: ['./attachment-list.component.scss']
})
export class AttachmentListComponent {
    @Input() attachmentUpload!: HTMLInputElement;
    @Input() attachments: any[] = [];
    @Input() loadingAttachment: boolean = false;
    @Input() documentStatus: string = '';
    @Output() onShowAttachment = new EventEmitter<any>();
    @Output() onDownloadAttachment = new EventEmitter<any>();
    @Output() onDeleteAttachment = new EventEmitter<string>();
    @Output() toggleSidenav = new EventEmitter<void>();
    @Output() triggerUpload = new EventEmitter<void>();

    showAttachment(attachment: any) {
        this.onShowAttachment.emit(attachment);
    }

    downloadAttachment(attachment: any) {
        this.onDownloadAttachment.emit(attachment);
    }

    deleteAttachment(attachmentId: string) {
        this.onDeleteAttachment.emit(attachmentId);
    }

    closeSidenav() {
        this.toggleSidenav.emit();
    }

    uploadAttachment() {
        this.triggerUpload.emit();
    }
}
