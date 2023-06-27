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

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { CodeModel } from "@ngstack/code-editor";
import { TranslateService } from "@ngx-translate/core";
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from "../../app/env";
import { catchError, tap } from "rxjs/operators";
import { of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "../notifications/notifications.service";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";

@Component({
    selector: 'app-code-editor',
    templateUrl: './code-editor.component.html',
    styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit {
    theme               : string    = 'vs';
    testing             : boolean   = false;
    splitterOrVerifier  : any       = 'verifier';
    codeModel           : CodeModel = {
        language: 'python',
        uri: 'scripting.py',
        value: ''
    };
    options             : any       = {
        contextmenu: true,
        lineNumbers: true,
        minimap: {
            enabled: true
        }
    };

    constructor(
        private router: Router,
        private http: HttpClient,
        private authService: AuthService,
        private notify: NotificationService,
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit(): void {
        if (this.router.url.includes('/verifier/')) {
            this.splitterOrVerifier = 'verifier';
        } else if (this.router.url.includes('/splitter/')) {
            this.splitterOrVerifier = 'splitter';
        }

        if (this.data['codeContent']) {
            this.codeModel.value = this.translate.instant(this.data['codeContent']);
        }
    }

    testScript() {
        if (this.testing) return;
        this.testing = true;
        this.http.post(environment['url'] + '/ws/workflows/' + this.splitterOrVerifier + '/testScript', {
            'args': {
                'input_folder': this.data.input_folder,
                'step': this.data.step,
                'codeContent': this.codeModel.value
            }
        }, {headers: this.authService.headers},
        ).pipe(
            tap((data: any) => {
                this.testing = false;
                this.notify.success(this.translate.instant('WORKFLOW.test_script_success', {return: data.replace(/[\n\r]/g, '<br>')}));
            }),
            catchError((err: any) => {
                this.testing = false;
                console.debug(err);
                this.notify.error(this.translate.instant('WORKFLOW.test_script_error', {return: err.error.replace(/[\n\r]/g, '<br>')}));
                return of(false);
            })
        ).subscribe();
    }
}