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

import { Component, Inject, OnInit } from '@angular/core';
import { CodeModel } from "@ngstack/code-editor";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: 'app-code-editor',
    templateUrl: './code-editor.component.html',
    styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit {
    theme       : string    = 'vs';
    codeModel   : CodeModel = {
        language: 'python',
        uri: 'scripting.py',
        value: 'def main:\n\tprint("Hello World")'
    };

    options = {
        contextmenu: true,
        lineNumbers: true,
        minimap: {
            enabled: true
        }
    };

    constructor(
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit(): void {
        if (this.data['codeContent']) {
            this.codeModel.value = this.translate.instant(this.data['codeContent']);
        }
    }
}