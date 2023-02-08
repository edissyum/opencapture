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

import { OnInit, Component } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { SettingsService } from "../../../../services/settings.service";

import { Router } from "@angular/router";
import { UserService } from "../../../../services/user.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { environment } from  "../../../env";
import { catchError, tap } from "rxjs/operators";
import { of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../../../services/auth.service";
import { NotificationService } from "../../../../services/notifications/notifications.service";

@Component({
    selector: 'app-separator',
    templateUrl: './separator.component.html',
    styleUrls: ['./separator.component.scss']
})
export class SeparatorComponent implements OnInit {
    private selectedDocType: any;
    public separator: any      = {
        'total'      : 0,
        'current'    : 0,
        'fileUrl'    : '',
        'thumbnails' : []
    };
    loading           : boolean = false;
    loadingSeparator  : boolean = false;
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

    ngOnInit(): void {
        this.serviceSettings.init();
        this.generateSeparator( {
            'id'    : undefined,
            'type'  : 'bundleSeparator',
        });
    }

    onChangeType() {
        let args;
        if (this.selectedSeparator === "bundleSeparator") {
            args = {
                'id'   : undefined,
                'type' : 'bundleSeparator',
            };
        }
        else if (this.selectedSeparator === "documentSeparator") {
            args = {
                'id'   : undefined,
                'type' : 'documentSeparator',
            };
        }
        else {
            args = {
                'id'   : this.selectedDocType.id ? this.selectedDocType.id : null,
                'type' : 'docTypeSeparator',
            };
        }
        this.generateSeparator(args);
    }

    getOutPut($event: any) {
        this.selectedSeparator  = 'docTypeSeparator';
        this.selectedDocType    = $event;
        this.generateSeparator({
            'type' : 'docTypeSeparator',
            'id'   : this.selectedDocType.id
        });
    }

    generateSeparator(args: any) {
        this.loadingSeparator = true;
        this.http.post(environment['url'] + '/ws/doctypes/generateSeparator', args, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.separator.total      = data.total;
                this.separator.fileUrl    = data.encoded_file;
                this.separator.thumbnails = data.encoded_thumbnails;
                this.separator.current    = 1;
                this.loadingSeparator     = false;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.loadingSeparator = false;
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    downloadSeparator() {
        const fileName = this.selectedSeparator + (this.selectedDocType ? '_' + this.selectedDocType.key : '');
        this.downloadPdf(this.separator.fileUrl, fileName);
    }

    downloadPdf(base64String: any, fileName:any) {
        const link = document.createElement("a");
        link.href = base64String;
        link.download = `${fileName}.pdf`;
        link.click();
    }

    moveCurrentThumbnail(step: number) {
        if (this.separator.current + step <= this.separator.total && this.separator.current + step > 0) {
            this.separator.current += step;
        }
    }
}
