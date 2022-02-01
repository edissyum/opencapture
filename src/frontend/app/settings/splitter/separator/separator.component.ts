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

import {Router} from "@angular/router";
import {UserService} from "../../../../services/user.service";
import {PrivilegesService} from "../../../../services/privileges.service";
import {API_URL} from "../../../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../../services/auth.service";
import {NotificationService} from "../../../../services/notifications/notifications.service";

@Component({
    selector: 'app-separator',
    templateUrl: './separator.component.html',
    styleUrls: ['./separator.component.scss']
})
export class SeparatorComponent implements AfterViewInit {
    @ViewChild('pdfViewerAutoLoad') pdfViewerAutoLoad : any;
    private selectedDocType: any;
    constructor(
        public router: Router,
        public userService: UserService,
        public translate: TranslateService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
        private http: HttpClient,
        private authService: AuthService,
        private notify:NotificationService,
    ) { }

    pdfFile           : any;
    loading           : boolean = false;
    base64            : string  = "";
    selectedSeparator : string  = "bundleSeparator";
    separators        : any[]   = [
        {
            id          : 'bundleSeparator',
            name        : this.translate.instant("SPLITTER.bundle_separator"),
            disabled    : false
        },
        {
            id          : 'documentSeparator',
            name        : this.translate.instant("SPLITTER.document_separator"),
            disabled    : false
        },
        {
            id          : 'docTypeSeparator',
            name        : this.translate.instant("SPLITTER.doc_type_separator"),
            disabled    : true
        },
    ];

    onChangeType() {
        let args = {};
        if (this.selectedSeparator === "bundleSeparator") {
            args = {
                'type': 'bundleSeparator',
                'key': '',
                'label': ''
            };
        }
        else if (this.selectedSeparator === "documentSeparator") {
            args = {
                'type': 'documentSeparator',
                'key': '',
                'label': ''
            };
        }
        else{
            args = {
                'type'  : 'docTypeSeparator',
                'key'   : this.selectedDocType ? this.selectedDocType.key : '',
                'label' : this.selectedDocType ? this.selectedDocType.label : ''
            };
        }
        this.getSeparatorBase64(args);
    }

    getOutPut($event: any) {
        this.selectedSeparator = 'docTypeSeparator';
        this.selectedDocType = $event;
        const args = {
            'type': 'docTypeSeparator',
            'key': this.selectedDocType.key,
            'label': this.selectedDocType.item
        };
        this.getSeparatorBase64(args);
    }

    getSeparatorBase64(args: any) {
        this.http.post(API_URL + '/ws/docTypes/generateSeparator',  args,{headers: this.authService.headers}).pipe(
            tap((data: any) => {
                console.log(data);
                this.base64 = "data:application/pdf;base64," + data.res;
                this.refreshPdfView();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }


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

    ngOnInit(): void {
        this.serviceSettings.init();
        this.getSeparatorBase64( {
            'type': 'bundleSeparator',
            'key': '',
            'label': ''
        });
    }

    ngAfterViewInit(): void {
    }

    refreshPdfView(): void {
        this.pdfFile = this.convertDataURIToBinary(this.base64);
        this.pdfViewerAutoLoad.pdfSrc = this.pdfFile;
        this.pdfViewerAutoLoad.refresh();
    }
}
