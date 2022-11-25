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

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    browser: string = '';

    constructor() {
        if (this.browser === '') {
            this.browser = this.detectBrowserVersion();
        }
    }

    detectBrowserVersion() {
        let tem;
        const userAgent = navigator.userAgent;
        let matchTest = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

        if(/trident/i.test(matchTest[1])) {
            tem =  /\brv[ :]+(\d+)/g.exec(userAgent) || [];
            return 'IE '+(tem[1] || '');
        }

        if(matchTest[1]=== 'Chrome') {
            tem = userAgent.match(/\b(OPR|Edge)\/(\d+)/);
            if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        matchTest= matchTest[2]? [matchTest[1]] : [navigator.appName];
        if ((tem = userAgent.match(/version\/(\d+)/i)) != null) {
            matchTest.splice(1, 1, tem[1]);
        }
        return matchTest.join(' ');
    }

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
        console.log(this.browser)
        const d = new Date();
        if (expMinutes !== 0) {
            d.setMinutes(d.getMinutes() + expMinutes);
            const expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=None;Secure";
        } else {
            document.cookie = cname + "=" + cvalue + ";path=/;SameSite=None;Secure";
        }
    }

    deleteCookie(cname: string) {
        this.setCookie(cname, '', -1);
    }
}
