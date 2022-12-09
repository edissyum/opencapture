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
        private localStorage: LocalStorageService,
    ) {
        if (!this.getToken()) {
            this.headersExists = false;
        }
        this.headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    }

    generateHeaders() {
        if (this.getToken()) {
            this.headersExists = true;
        }
        this.headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getToken());
    }

    setCachedUrl(url: string) {
        const tokenNames = this.getTokenName();
        this.localStorage.save(tokenNames['cachedUrlName'], url);
    }

    getCachedUrl() {
        const tokenNames = this.getTokenName();
        return this.localStorage.get(tokenNames['cachedUrlName']);
    }

    cleanCachedUrl() {
        const tokenNames = this.getTokenName();
        return this.localStorage.remove(tokenNames['cachedUrlName']);
    }

    setTokenCustom(name: string, token: string) {
        this.localStorage.save(name, token);
    }

    getTokenCustom(name: string) {
        return this.localStorage.get(name);
    }

    getTokenName() {
        let tokenName = 'OpenCaptureToken';
        let userTokenName = 'OpenCaptureToken_user';
        let cachedUrlName = 'OpenCaptureCachedUrl';
        if (environment['customId']) {
            tokenName += '_' + environment['customId'];
            userTokenName += '_' + environment['customId'];
            cachedUrlName += '_' + environment['customId'];
        } else if (environment['fqdn']) {
            tokenName += '_' + environment['fqdn'];
            userTokenName += '_' + environment['fqdn'];
            cachedUrlName += '_' + environment['fqdn'];
        }
        return {
            'tokenJwt': tokenName,
            'userToken': userTokenName,
            'cachedUrlName': cachedUrlName
        };
    }

    setTokens(token: string, user_token: string, minutesBeforeExp: number) {
        const tokenNames = this.getTokenName();
        this.localStorage.save(tokenNames['tokenJwt'], token);
        this.localStorage.setCookie(tokenNames['userToken'], user_token, minutesBeforeExp);
    }

    getToken() {
        const tokenNames = this.getTokenName();
        return this.localStorage.get(tokenNames['tokenJwt']);
    }

    logout() {
        const tokenNames = this.getTokenName();
        this.userService.setUser({});
        this.localStorage.remove('login_image_b64');
        this.localStorage.remove('selectedSettings');
        this.localStorage.remove('splitter_or_verifier');
        this.localStorage.remove('selectedParentSettings');
        this.localStorage.remove('selectedParentSettings');
        this.localStorage.remove('task_watcher_minimize_display');
        this.localStorage.remove(tokenNames['tokenJwt']);
        this.localStorage.deleteCookie(tokenNames['userToken']);
        this.http.get(environment['url'] + '/ws/auth/logout').pipe(
            catchError((err: any) => {
                console.debug(err);
                return of(false);
            })
        ).subscribe();
        this.router.navigateByUrl("/login").then();
    }
}
