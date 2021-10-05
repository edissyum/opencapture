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

import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {SettingsService} from "../../../../services/settings.service";

import {DOC_SEPARATOR} from "./urls/docUrl";
import {BUNDLE_SEPARATOR} from "./urls/bundleUrl";
import {Router} from "@angular/router";
import {UserService} from "../../../../services/user.service";
import {PrivilegesService} from "../../../../services/privileges.service";

@Component({
    selector: 'app-separator',
    templateUrl: './separator.component.html',
    styleUrls: ['./separator.component.scss']
})
export class SeparatorComponent implements AfterViewInit {
    @ViewChild('pdfViewerAutoLoad') pdfViewerAutoLoad : any;
    constructor(
        public router: Router,
        public userService: UserService,
        public translate: TranslateService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    loading           : boolean = false;
    pdfFile           : any;
    selectedSeparator : string  = "bundleSeparator";
    base64            : string  = BUNDLE_SEPARATOR;
    separators        : any[]   = [
        {
            id  : 'bundleSeparator',
            name: "SPLITTER.bundle_separator",
        },
        {
            id  : 'documentSeparator',
            name: "SPLITTER.document_separator",
        },
    ];

    convertDataURIToBinary(dataURI: string) {
        const base64Index = dataURI.indexOf(';base64,') + ';base64,'.length;
        const base64      = dataURI.substring(base64Index);
        const raw         = window.atob(base64);
        const rawLength   = raw.length;
        const array       = new Uint8Array(new ArrayBuffer(rawLength));

        for(let i = 0; i < rawLength; i++) {
            array[i]      = raw.charCodeAt(i);
        }
        return array;
    }

    ngAfterViewInit(): void {
        this.refreshPdfView();
    }

    refreshPdfView(): void {
        this.pdfFile = this.convertDataURIToBinary(this.base64);
        this.pdfViewerAutoLoad.pdfSrc = this.pdfFile;
        this.pdfViewerAutoLoad.refresh();
    }

    onChangeType() {
        if(this.selectedSeparator === "bundleSeparator") {
            this.base64 = BUNDLE_SEPARATOR;
        }
        else if(this.selectedSeparator === "documentSeparator") {
            this.base64 = DOC_SEPARATOR;
        }
        this.refreshPdfView();
    }
}
