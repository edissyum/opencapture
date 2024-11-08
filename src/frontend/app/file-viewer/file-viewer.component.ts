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

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-file-viewer',
    templateUrl: './file-viewer.component.html',
    styleUrls: ['./file-viewer.component.scss']
})

export class FileViewerComponent implements OnDestroy {
    mimeType : string;
    fileUrl  : SafeResourceUrl;

    constructor(
        private sanitizer: DomSanitizer,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<FileViewerComponent>
    ) {
        (<any>window).pdfWorkerSrc = 'pdfjs/pdf.worker.min.mjs';
        this.mimeType = data.mimeType;
        if (this.mimeType === 'application/pdf') {
            this.fileUrl = data.fileUrl;
        } else {
            this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(data.fileUrl);
        }
    }

    ngOnDestroy() {
        if (this.fileUrl && typeof this.fileUrl === 'string') {
            URL.revokeObjectURL(this.fileUrl);
        }
    }

    close(): void {
        this.dialogRef.close();
    }
}
