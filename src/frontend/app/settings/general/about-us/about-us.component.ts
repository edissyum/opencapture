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
import { SettingsService } from "../../../../services/settings.service";
import { Router } from "@angular/router";
import { PrivilegesService } from "../../../../services/privileges.service";
import {API_URL, environment} from "../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../../services/auth.service";
import {NotificationService} from "../../../../services/notifications/notifications.service";

@Component({
    selector: 'app-about-us',
    templateUrl: './about-us.component.html',
    styleUrls: ['./about-us.component.scss']
})

export class AboutUsComponent implements OnInit {
    loading        : boolean   = true;
    isProd         : boolean   = false;
    currentVersion : any       = 'dev';
    lastVersion    : any       = '';

    constructor(
        public router: Router,
        private http: HttpClient,
        private authService: AuthService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.isProd = environment.production;
        this.currentVersion = environment.VERSION;
        this.http.get(API_URL + '/ws/config/gitInfo', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.git_latest) {
                    this.lastVersion = data.git_latest;
                } else {
                    this.lastVersion = undefined;
                }
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

}
