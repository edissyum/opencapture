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

 @dev : Oussama Brich <oussama.brich@edissyum.com> */

import {Component, Inject, OnInit} from '@angular/core';
import { Router } from "@angular/router";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
    selector: 'app-document-tree',
    templateUrl: './document-tree.component.html',
    styleUrls: ['./document-tree.component.scss']
})
export class DocumentTreeComponent implements OnInit {
    selectedItem:any;

    constructor(
        public router: Router,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit(): void {
    }

    getOutPut($event: any) {
        this.selectedItem = $event;
    }
}
