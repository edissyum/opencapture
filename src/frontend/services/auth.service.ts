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

import { of } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../app/env";
import { Injectable } from '@angular/core';
import { UserService } from "./user.service";
import { catchError, tap } from "rxjs/operators";
import { SessionStorageService } from "./session-storage.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public headers : HttpHeaders;
    public headersExists : boolean = false;

    constructor(
        private router: Router,
        private http: HttpClient,
        private userService: UserService,
        private sessionStorage: SessionStorageService
    ) {
        if (!this.getToken('tokenJwt')) {
            this.headersExists = false;
        }
        this.headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken('tokenJwt'));
    }

    refreshToken() {
        const refreshToken = this.getToken('refreshTokenJwt');
        if (!refreshToken) {
            return of(false);
        }
        const new_headers = new HttpHeaders().set('Authorization', 'Bearer ' + refreshToken);

        return this.http
            .post<any>(environment['url'] + '/ws/auth/login/refresh', {token: refreshToken}, { headers: new_headers })
            .pipe(
                tap((data) => {
                    this.userService.setUser(data.user);
                    this.setTokens(data.token, '', btoa(JSON.stringify(this.userService.getUser())));
                    this.generateHeaders();
                }),
                catchError(() => {
                    return of(false);
                })
            );
    }

    generateHeaders() {
        if (this.getToken('tokenJwt')) {
            this.headersExists = true;
        }
        this.headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken('tokenJwt'));
    }

    cleanCachedUrl() {
        const tokenNames = this.getTokenName();
        return this.sessionStorage.remove(tokenNames['cachedUrlName']);
    }

    setToken(name: any, config: any) {
        const tokenNames: any = this.getTokenName();
        this.sessionStorage.save(tokenNames[name], config);
    }

    getTokenName() {
        let tokenName = 'OpenCaptureToken';
        let configName = 'OpenCaptureConfig';
        let userDataName = 'OpenCaptureUserData';
        let cachedUrlName = 'OpenCaptureCachedUrl';
        let refreshTokenName = 'OpenCaptureRefreshToken';
        let minimizeDisplay = 'OpenCaptureMinimizeDisplay';

        if (environment['customId']) {
            tokenName += '_' + environment['customId'];
            configName += '_' + environment['customId'];
            userDataName += '_' + environment['customId'];
            cachedUrlName += '_' + environment['customId'];
            minimizeDisplay += '_' + environment['customId'];
            refreshTokenName += '_' + environment['customId'];
        } else if (environment['fqdn']) {
            tokenName += '_' + environment['fqdn'];
            configName += '_' + environment['fqdn'];
            userDataName += '_' + environment['fqdn'];
            cachedUrlName += '_' + environment['fqdn'];
            minimizeDisplay += '_' + environment['fqdn'];
            refreshTokenName += '_' + environment['fqdn'];
        }
        return {
            'tokenJwt': tokenName,
            'configName': configName,
            'userData': userDataName,
            'cachedUrlName': cachedUrlName,
            'minimizeDisplay': minimizeDisplay,
            'refreshTokenJwt': refreshTokenName
        };
    }

    setTokens(token: string, refresh_token: string, user_token: string) {
        const tokenNames = this.getTokenName();
        this.sessionStorage.save(tokenNames['tokenJwt'], token);
        this.sessionStorage.save(tokenNames['userData'], user_token);
        this.sessionStorage.save(tokenNames['refreshTokenJwt'], refresh_token);
        this.sessionStorage.save(tokenNames['minimizeDisplay'], 'true');
    }

    getToken(name: any) {
        const tokenNames: any = this.getTokenName();
        return this.sessionStorage.get(tokenNames[name]);
    }

    logout() {
        const tokenNames = this.getTokenName();
        const user = this.userService.getUser();

        this.userService.setUser({});
        this.sessionStorage.remove('loginImageB64');
        this.sessionStorage.remove('selectedSettings');
        this.sessionStorage.remove(tokenNames['tokenJwt']);
        this.sessionStorage.remove(tokenNames['userData']);
        this.sessionStorage.remove('splitter_or_verifier');
        this.sessionStorage.remove('selectedParentSettings');
        this.sessionStorage.remove(tokenNames['refreshTokenJwt']);
        this.sessionStorage.remove(tokenNames['minimizeDisplay']);

        this.http.get(environment['url'] + '/ws/auth/logout?user_id=' + user['id']).pipe(
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
        this.router.navigateByUrl("/login").then();
    }
}
