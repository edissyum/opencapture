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

import { Component } from '@angular/core';
import { UserService } from "../../../services/user.service";
import { SettingsService } from "../../../services/settings.service";
import { PrivilegesService } from "../../../services/privileges.service";

@Component({
    selector: 'app-error',
    templateUrl: './error-500.component.html',
    styleUrls: ['./error-500.component.scss']
})
export class Error500Component {

    constructor(
        public userService: UserService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {}
}
