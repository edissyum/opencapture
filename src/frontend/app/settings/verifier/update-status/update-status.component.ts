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

 @dev : Oussama BRICH <oussama.brich@edissyum.com> */

import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { UserService } from "../../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { SettingsService } from "../../../../services/settings.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../../../services/auth.service";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { FormControl } from "@angular/forms";
import { environment } from "../../../env";
import { catchError, tap } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: 'app-status-update',
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.scss']
})
export class VerifierStatusUpdateComponent implements OnInit {
  loading           : boolean     = false;
  identifierControl : FormControl = new FormControl<any>('');
  statusControl     : FormControl = new FormControl<any>('');
  identifiers       : number[]    = [];
  status            : any[]       = [];

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
    this.http.get(environment['url'] + '/ws/status/verifier/list', {headers: this.authService.headers}).pipe(
        tap((data: any) => {
          this.status = data.status;
        }),
        catchError((err: any) => {
          console.debug(err);
          this.notify.handleErrors(err);
          return of(false);
        })
    ).subscribe();
  }

  addIdentifier() {
    if (this.identifierControl.value && this.identifiers.indexOf(this.identifierControl.value) === -1) {
      this.identifiers.push(this.identifierControl.value);
    }
    this.identifierControl.setValue('');
  }

  removeIdentifier(identifier: number) {
    this.identifiers = this.identifiers.filter((id) => id !== identifier);
  }

  updateStatus() {
    const data = {'ids': this.identifiers, 'status': this.statusControl.value};
    this.http.put(environment['url'] + '/ws/verifier/status', data,
        {headers: this.authService.headers}).pipe(
        tap(() => {
          this.identifiers = [];
          this.notify.success(this.translate.instant('STATUS.UPDATE_SUCCESS'));
        }),
        catchError((err: any) => {
          console.debug(err);
          this.notify.error(err.error.message);
          return of(false);
        })
    ).subscribe();
  }
}
