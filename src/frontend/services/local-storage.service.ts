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

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    constructor() {}

    save(id: string, content: any) {
        localStorage.setItem(id, content);
    }

    get(id: string) {
        return localStorage.getItem(id);
    }

    remove(id: string) {
        localStorage.removeItem(id);
    }

    getCookie(cname: string) {
        const name = cname + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    setCookie(cname: string, cvalue: string, expMinutes: number) {
        const d = new Date();
        if (expMinutes !== 0) {
            d.setMinutes(d.getMinutes() + expMinutes);
            const expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Strict";
        } else {
            document.cookie = cname + "=" + cvalue + ";path=/;SameSite=Strict";
        }
    }

    deleteCookie(cname: string) {
        this.setCookie(cname, '', -1);
    }
}
