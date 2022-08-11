/** This file is part of Open-Capture for Invoices.

 Open-Capture for Invoices is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { LocalStorageService } from "./local-storage.service";
import {environment} from "../app/env";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    user : any = {};

    constructor(
        private http: HttpClient,
        private localStorage: LocalStorageService,
    ) {
    }

    setUser(value: any) {
        this.user = value;
    }

    getUser() {
        return this.user;
    }

    getUserFromLocal() {
        const token = this.getTokenUser();
        if (token) {
            return JSON.parse(atob(token as string));
        }
    }

    getTokenUser() {
        let user_token_name = 'OpenCaptureForInvoicesToken_user';
        if (environment['customId']) {
            user_token_name += '_' + environment['customId'];
        } else if (environment['fqdn']) {
            user_token_name += '_' + environment['fqdn'];
        }
        return this.localStorage.getCookie(user_token_name);
    }
}
