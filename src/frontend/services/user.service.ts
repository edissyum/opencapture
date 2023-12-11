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

import { environment } from "../app/env";
import { Router } from "@angular/router";
import { Injectable } from '@angular/core';
import { LocalStorageService } from "./local-storage.service";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    user : any = {};

    constructor(
        private router: Router,
        private localStorage: LocalStorageService
    ) {
    }

    setUser(value: any) {
        this.user = value;
    }

    getUser() {
        return this.user;
    }

    getUserFromLocal() {
        const token = this.getUserData();
        if (token) {
            return JSON.parse(atob(token as string));
        } else {
            if (this.router.url !== '/' && !this.router.url.includes('/resetPassword') && this.router.url !== '/forgotPassword' && this.router.url !== '/login' && this.router.url !== '/logout') {
                this.router.navigate(['/logout']).then();
            }
        }
    }

    getUserData() {
        let userTokenName = 'OpenCaptureUserData';
        if (environment['customId']) {
            userTokenName += '_' + environment['customId'];
        } else if (environment['fqdn']) {
            userTokenName += '_' + environment['fqdn'];
        }
        return this.localStorage.get(userTokenName);
    }
}
