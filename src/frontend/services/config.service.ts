import {Injectable} from '@angular/core';
import {API_URL} from "../app/env";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {NotificationService} from "./notifications/notifications.service";
import {AuthService} from "./auth.service";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private notify:NotificationService,
    ) {}

    readConfig() {
        return new Promise((resolve) => {
            this.http.get(API_URL + '/ws/config/readConfig', {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    this.setConfig(data.text)
                    resolve(true);
                }),
                catchError((err: any) => {
                    console.debug(err);
                    resolve(false);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        });
    }

    setConfig(config: any) {
        this.authService.setTokenCustom('OpenCaptureForInvoicesConfig', btoa(JSON.stringify(config)));
    }

    getConfig() {
        return JSON.parse(atob(<string>this.authService.getTokenCustom('OpenCaptureForInvoicesConfig')));
    }
}
