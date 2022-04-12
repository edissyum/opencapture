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

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../services/user.service";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../services/notifications/notifications.service";
import {HistoryService} from "../../../services/history.service";
import {SettingsService} from "../../../services/settings.service";
import {LastUrlService} from "../../../services/last-url.service";
import {PrivilegesService} from "../../../services/privileges.service";
import {LocalStorageService} from "../../../services/local-storage.service";

@Component({
  selector: 'app-error',
  templateUrl: './error-500.component.html',
  styleUrls: ['./error-500.component.scss']
})
export class Error500Component implements OnInit {

  constructor(
      public router: Router,
      public userService: UserService,
      public serviceSettings: SettingsService,
      public privilegesService: PrivilegesService,
  ) { }

  ngOnInit(): void {
  }

}
