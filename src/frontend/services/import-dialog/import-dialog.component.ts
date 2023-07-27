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

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormControl } from "@angular/forms";
import { FileValidators } from "ngx-file-drag-drop";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { AuthService } from "../auth.service";
import { NotificationService } from "../notifications/notifications.service";
import { TranslateService } from "@ngx-translate/core";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
import {environment} from "../../app/env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";

@Component({
  selector: 'app-import-dialog',
  templateUrl: './import-dialog.component.html',
  styleUrls: ['./import-dialog.component.scss']
})
export class ImportDialogComponent {
  headers                     : HttpHeaders   = this.authService.headers;
  loading                     : boolean       = false;
  error                       : boolean       = false;
  markers: any = {
    placeholder: marker('DATA-IMPORT.placeholder')
  };

  constructor(
      private authService: AuthService,
      public translate: TranslateService,
      private notify: NotificationService,
      private http: HttpClient,
      @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.data.fileControl = new FormControl(
        [],
        [
          FileValidators.required,
          FileValidators.fileExtension([data['extension'].toLowerCase()])
        ]
    );
  }

  checkFile(data: any): void {
      console.log("data: ", data);
      this.error = false;
    if (data && data.length !== 0) {
      for (let i = 0; i < data.length; i++) {
        const fileName = data[i].name;
        const fileExtension = fileName.split('.').pop();
        if (fileExtension.toLowerCase() !== 'csv') {
          this.error = true;
          this.notify.handleErrors(this.translate.instant('UPLOAD.extension_unauthorized', {count: data.length}));
          return;
        }
      }
      this.preview_csv(data[0]);
    }
  }

  preview_csv(file: any): void {
      const formData: FormData = new FormData();
      formData.append(file['name'], file);
      formData.set('columns', this.data.selectedColumns);
      this.http.post(environment['url'] + '/ws/doctypes/csv/preview', formData, {headers: this.authService.headers}).pipe(
          tap((data: any) => {
            data.rows.forEach((row: any) => {
                const data_rows: any    = [];
                let cpt : number        = 0;
                row.forEach((col: any) => {
                    data_rows[this.data.selectedColumns[cpt]] = col;
                    cpt++;
                });
                console.log(data_rows);
                this.data.rows.push(data_rows);
              cpt++;
            });
            this.loading = false;
            console.log(this.data.rows);
          }),
          catchError((err: any) => {
              this.notify.handleErrors(err);
              return of(false);
          })
        ).subscribe();
  }
}
