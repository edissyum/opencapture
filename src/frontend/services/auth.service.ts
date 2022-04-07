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

import {Injectable} from '@angular/core';
import {LocalStorageService} from "./local-storage.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {UserService} from "./user.service";
import {SettingsService} from "./settings.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public headers : HttpHeaders;

    constructor(
        private router: Router,
        private http: HttpClient,
        private userService: UserService,
        public serviceSettings: SettingsService,
        private localStorage: LocalStorageService,
    ) {
        this.headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    }

    generateHeaders() {
        this.headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    }

    setCachedUrl(url: string) {
        this.localStorage.save('OpenCaptureForInvoicesCachedUrl', url);
    }

    getCachedUrl() {
        return this.localStorage.get('OpenCaptureForInvoicesCachedUrl');
    }

    cleanCachedUrl() {
        return this.localStorage.remove('OpenCaptureForInvoicesCachedUrl');
    }

    setTokenCustom(name: string, token: string) {
        this.localStorage.save(name, token);
    }

    getTokenCustom(name: string) {
        return this.localStorage.get(name);
    }

    setTokens(token: string, token2: string, daysBeforeExp: number) {
        this.localStorage.setCookie('OpenCaptureForInvoicesToken', token, daysBeforeExp);
        this.localStorage.setCookie('OpenCaptureForInvoicesToken_2', token2, daysBeforeExp);
    }

    setTokenAuth(token: string, daysBeforeExp: number) {
        this.localStorage.setCookie('OpenCaptureForInvoicesToken_2', token, daysBeforeExp);
    }

    getToken() {
        return this.localStorage.getCookie('OpenCaptureForInvoicesToken');
    }

    clearTokens() {
        this.localStorage.deleteCookie('OpenCaptureForInvoicesToken');
        this.localStorage.deleteCookie('OpenCaptureForInvoicesToken_2');
        this.localStorage.remove('splitter_or_verifier');
    }

    logout() {
        this.clearTokens();
        this.userService.setUser({});
        this.localStorage.remove('selectedSettings');
        this.localStorage.remove('selectedParentSettings');
        this.router.navigateByUrl("/login").then();
    }
}
