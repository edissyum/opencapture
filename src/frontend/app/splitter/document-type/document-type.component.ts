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

 @dev : Oussama Brich <oussama.brich@edissyum.com> */

import { Component, Inject, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'app-document-type',
    templateUrl: './document-type.component.html',
    styleUrls: ['./document-type.component.scss']
})
export class DocumentTypeComponent {
    selectedItem: any;

    constructor(
        public router: Router,
        private dialogRef: MatDialogRef<DocumentTypeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    getOutPut($event: any) {
        this.selectedItem = $event;
        this.selectedItem.isDblClick ? this.dialogRef.close(this.selectedItem) : '';
    }
}
