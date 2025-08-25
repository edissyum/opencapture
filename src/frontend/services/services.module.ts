/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LastUrlService } from './last-url.service';
import { HintServiceComponent } from './hint/hint.service';
import { ErrorServiceComponent } from './error/error.service';
import { TranslateModule } from "@ngx-translate/core";
import { AppMaterialModule } from '../app/app-material.module';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { CustomSnackbarComponent, NotificationService } from './notifications/notifications.service';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { CodeEditorModule } from "@ngstack/code-editor";
import { ExportDialogComponent } from './export-dialog/export-dialog.component';
import { ImportDialogComponent } from './import-dialog/import-dialog.component';
import { ReactiveFormsModule } from "@angular/forms";
import { NgxFileDragDropComponent } from 'ngx-file-drag-drop';

@NgModule({
    imports: [AppMaterialModule, CommonModule, TranslateModule, DragDropModule, CodeEditorModule, ReactiveFormsModule, NgxFileDragDropComponent],
    declarations: [CustomSnackbarComponent, ConfirmDialogComponent, CodeEditorComponent, ExportDialogComponent, ImportDialogComponent],
    exports: [],
    providers: [NotificationService, LastUrlService, HintServiceComponent, ErrorServiceComponent]
})
export class ServicesModule { }
