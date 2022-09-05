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

import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { SettingsService } from "../../services/settings.service";
import { PrivilegesService } from "../../services/privileges.service";

@Component({
    selector: 'app-panel',
    templateUrl: "settings.component.html"
})

export class SettingsComponent implements OnInit {
    selectedSetting         : string    = this.serviceSettings.getSelectedSetting();
    selectedParentSetting   : string    = this.serviceSettings.getSelectedParentSetting();
    settings                : any       = this.serviceSettings.getSettings();

    constructor(
        public router: Router,
        public userService: UserService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.selectedSetting = this.serviceSettings.getSelectedSetting();
        this.selectedParentSetting = this.serviceSettings.getSelectedParentSetting();
        this.settings = this.serviceSettings.getSettings();
        let settingsFound = false;
        this.settings[this.selectedParentSetting].forEach((element: any) => {
            if (element['id'] === this.selectedSetting) {
                settingsFound = true;
                const routeToGo = element.route;
                if (routeToGo && this.privilegesService.hasPrivilege(element.privilege))
                    this.router.navigateByUrl(routeToGo).then();
            }
        });

        if (!settingsFound)
            this.router.navigateByUrl('/settings/general/configurations').then();
    }
}
