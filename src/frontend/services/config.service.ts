import {Injectable} from '@angular/core';
import {environment} from  "../app/env";
import {HttpClient} from "@angular/common/http";
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
            this.http.get(environment['url'] + '/ws/config/readConfig', {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    this.setConfig(data.config);
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
        return JSON.parse(atob(this.authService.getTokenCustom('OpenCaptureForInvoicesConfig') as string));
    }
}
