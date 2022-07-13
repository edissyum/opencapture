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

import {Injectable} from '@angular/core';
import {environment} from "./env";
import {Observable} from "rxjs";
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {LocalStorageService} from "../services/local-storage.service";
import {Router} from "@angular/router";

@Injectable()
export class MiddlewareComponent implements HttpInterceptor {

    constructor(
        private router: Router,
        private localStorage: LocalStorageService,
    ) {}

    isValidIP(str: any) {
        const arr = str.split(".").filter((el: any) => !/^0.|\D/g.test(el));
        return arr.filter((el: any) => el.length && el >= 0 && el <= 255).length === 4;
    }

    isValidFQDN(str: any) {
        return /(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}$)/g.test(str);
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (!environment['customId'] && /http(s)?:\/\/|backend_oc\//.test(request.url)) {
            let currentUrl = window.location.href;
            currentUrl = currentUrl.replace('http://', '').replace('https://', '');
            currentUrl = currentUrl.replace(new RegExp('//'), '/');
            const currentUrlArray = currentUrl.split('/');
            for (let i = 0; i <= currentUrlArray.length; i++) {
                if (currentUrlArray[i] === 'dist') {
                    let customId = '';
                    const isIp = this.isValidIP(currentUrlArray[i - 1]);
                    const isFQDN = this.isValidFQDN(currentUrlArray[i - 1]);
                    const currentCustom = this.localStorage.getCookie('OpenCaptureCustom');
                    if (!isFQDN && !isIp && currentUrlArray[i - 1] !== 'localhost') {
                        customId = currentUrlArray[i - 1];
                        const oldUrl = environment['url'];
                        environment['customId'] = customId;
                        environment['url'] += '/' + customId;
                        const token = this.localStorage.getCookie('OpenCaptureForInvoicesToken');
                        if (currentCustom && customId !== currentCustom) {
                            this.router.navigate(['/logout']).then();
                        }
                        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
                        const newRequest = new HttpRequest(request.method as any,
                            request.url.replace(oldUrl, environment['url']), {headers: headers});
                        request = Object.assign(request, newRequest);
                        this.localStorage.setCookie('OpenCaptureCustom', customId, 1);
                        return next.handle(request);
                    }
                }
            }
        }
        return next.handle(request);
    }
}
