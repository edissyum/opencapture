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

import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {
    CdkDragDrop,
    moveItemInArray,
    transferArrayItem
} from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-export-dialog',
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.scss'],
    standalone: false
})
export class ExportDialogComponent {
    extensions: any[] = [
        {
            id: 'csv',
            label: 'CSV'
        }
    ];
    delimiters: any[] = [
        {
            id: 'COMMA',
            label: ','
        },
        {
            id: 'SEMICOLON',
            label: ';'
        },
        {
            id: 'TAB',
            label: 'TAB'
        }
    ];

    config: any = {
        extension: 'csv',
        delimiter: 'COMMA',
        selectedColumns: [],
        availableColumns: []
    };

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.config.availableColumns = data.availableColumns;
        this.config.selectedColumns = data.selectedColumns;
    }

    drop(event: CdkDragDrop<any[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }
    }
}
