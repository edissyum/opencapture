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

import {Injectable } from '@angular/core';
import { LocalStorageService } from "./local-storage.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { UserService } from "./user.service";
import { environment } from "../app/env";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";

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
        private localStorage: LocalStorageService
    ) {
        if (!this.getToken('tokenJwt')) {
            this.headersExists = false;
        }
        this.headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken('tokenJwt'));
    }

    generateHeaders() {
        if (this.getToken('tokenJwt')) {
            this.headersExists = true;
        }
        this.headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken('tokenJwt'));
    }

    cleanCachedUrl() {
        const tokenNames = this.getTokenName();
        return this.localStorage.remove(tokenNames['cachedUrlName']);
    }

    setToken(name: any, config: any) {
        const tokenNames: any = this.getTokenName();
        this.localStorage.save(tokenNames[name], config);
    }

    getTokenName() {
        let tokenName = 'OpenCaptureToken';
        let userDataName = 'OpenCaptureUserData';
        let cachedUrlName = 'OpenCaptureCachedUrl';
        let configName = 'OpenCaptureConfig';
        let minimizeDisplay = 'OpenCaptureMinimizeDisplay';

        if (environment['customId']) {
            tokenName += '_' + environment['customId'];
            userDataName += '_' + environment['customId'];
            cachedUrlName += '_' + environment['customId'];
            configName += '_' + environment['customId'];
            minimizeDisplay += '_' + environment['customId'];
        } else if (environment['fqdn']) {
            tokenName += '_' + environment['fqdn'];
            userDataName += '_' + environment['fqdn'];
            cachedUrlName += '_' + environment['fqdn'];
            configName += '_' + environment['fqdn'];
            minimizeDisplay += '_' + environment['fqdn'];
        }
        return {
            'tokenJwt': tokenName,
            'configName': configName,
            'userData': userDataName,
            'cachedUrlName': cachedUrlName,
            'minimizeDisplay': minimizeDisplay
        };
    }

    setTokens(token: string, user_token: string) {
        const tokenNames = this.getTokenName();
        this.localStorage.save(tokenNames['tokenJwt'], token);
        this.localStorage.save(tokenNames['userData'], user_token);
        this.localStorage.save(tokenNames['minimizeDisplay'], 'true');
    }

    getToken(name: any) {
        const tokenNames: any = this.getTokenName();
        return this.localStorage.get(tokenNames[name]);
    }

    logout() {
        const tokenNames = this.getTokenName();
        const user = this.userService.getUser();
        let user_info = '';
        if (user) {
            user_info = user['lastname'] + ' ' + user['firstname'] + ' (' + user['username'] + ')';
        }

        this.userService.setUser({});
        this.localStorage.remove('loginImageB64');
        this.localStorage.remove('selectedSettings');
        this.localStorage.remove(tokenNames['tokenJwt']);
        this.localStorage.remove(tokenNames['userData']);
        this.localStorage.remove('splitter_or_verifier');
        this.localStorage.remove('selectedParentSettings');
        this.localStorage.remove(tokenNames['minimizeDisplay']);
        this.http.get(environment['url'] + '/ws/auth/logout?user_info=' + user_info).pipe(
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
        this.router.navigateByUrl("/login").then();
    }
}
