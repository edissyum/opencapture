// noinspection HttpUrlsUsage

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

import { BehaviorSubject, Observable, switchMap, take, throwError } from "rxjs";
import { environment } from "./env";
import { Router } from "@angular/router";
import { Injectable } from '@angular/core';
import { catchError, filter } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import { SessionStorageService } from "../services/session-storage.service";
import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";

@Injectable()
export class MiddlewareComponent implements HttpInterceptor {
    isRefreshing = false;
    private refreshTokenBehaviorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
        null
    );

    constructor(
        private router: Router,
        private authService: AuthService,
        private sessionStorage: SessionStorageService
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
            if (this.isValidFQDN(currentUrlArray[0])) {
                environment['fqdn'] = currentUrlArray[0];
            }
            for (let i = 0; i <= currentUrlArray.length; i++) {
                if (currentUrlArray[i] === 'dist') {
                    let customId = '';
                    const isIp = this.isValidIP(currentUrlArray[i - 1]);
                    const isFQDN = this.isValidFQDN(currentUrlArray[i - 1]);
                    const currentCustom = environment['customId'];
                    customId = currentUrlArray[i - 1];
                    if (!isFQDN && !isIp && currentUrlArray[i - 1] !== 'localhost' && !currentUrlArray[i - 1].includes('opencapture') && !currentUrlArray[i - 1].includes('opencaptureforinvoices') && !currentUrlArray[i - 1].includes('backend_oc')) {
                        customId = currentUrlArray[i - 1];
                        const oldUrl = environment['url'];
                        environment['customId'] = customId;
                        environment['url'] += '/' + customId;
                        if (environment.production) {
                            environment['url'] = '../' + environment['url'];
                        }
                        const token = this.sessionStorage.get('OpenCaptureToken_' + customId);
                        if (currentCustom && customId !== currentCustom) {
                            this.router.navigate(['/logout']).then();
                        }
                        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
                        const newRequest = new HttpRequest(request.method as any,
                            request.url.replace(oldUrl, environment['url']), {headers: headers});
                        request = Object.assign(request, newRequest);
                        return next.handle(request);
                    }
                }
            }
        }

        return next.handle(request).pipe(
            catchError((err: any) => {
                if (err.status === 401) {
                    return this.handle401Error(request, next);
                }
                return throwError(() => err) ;
            })
        );
    }

    addAuthenticationHeader(request: HttpRequest<any>) {
        const authenticationHeader = this.authService.getToken('tokenJwt');
        return request.clone({
            setHeaders: {
                'Authorization': 'Bearer ' + authenticationHeader
            }
        });
    }

    handle401Error(request: HttpRequest<unknown>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            return this.authService.refreshToken().pipe(
                switchMap((data: any) => {
                    this.isRefreshing = false;
                    this.refreshTokenBehaviorSubject.next(data.token);
                    request = this.addAuthenticationHeader(request);
                    return next.handle(request);
                })
            );
        } else {
            return this.refreshTokenBehaviorSubject.pipe(
                filter((token) => token != null),
                take(1),
                switchMap(() => {
                    request = this.addAuthenticationHeader(request);
                    return next.handle(request);
                })
            );
        }
    }
}
