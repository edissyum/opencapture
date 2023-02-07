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

import { Injectable } from '@angular/core';
import { PrivilegesService } from "./privileges.service";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "./notifications/notifications.service";
import {LocalStorageService} from "./local-storage.service";

@Injectable({
    providedIn: 'root'
})
export class HasPrivilegeService {

    constructor(
        private router: Router,
        private translate: TranslateService,
        private notify: NotificationService,
        private localStorage: LocalStorageService,
        private privilegesService: PrivilegesService
    ) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        if (route.data['privileges'] !== undefined) {
            let returnValue = true;
            route.data['privileges'].forEach((privilege: any) => {
                const hasPrivilege = this.privilegesService.hasPrivilege(privilege);
                if (!hasPrivilege) {
                    this.translate.get('ERROR.unauthorized').subscribe((translated: string) => {
                        let label = '';
                        if (route.routeConfig) {
                            label = '<b>' + this.translate.instant(route.data['title']) + '</b>';
                        }
                        this.notify.error(translated + label);
                        if (route.url[0].path === 'settings') {
                            this.localStorage.remove('selectedSettings');
                            this.localStorage.remove('selectedParentSettings');
                        }
                        this.router.navigateByUrl('/home').then();
                    });
                    returnValue = false;
                }
            });
            return returnValue;
        } else {
            return false;
        }
    }
}
