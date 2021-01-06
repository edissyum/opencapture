import {Injectable} from '@angular/core';
import {API_URL} from "../app/env";
import {HttpClient} from "@angular/common/http";
import {NotificationService} from "./notifications/notifications.service";
import {AuthService} from "./auth.service";

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    config = {}

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private notify:NotificationService,
    ) {
    }

    readConfig() {
        setTimeout(() =>{
            const headers = {}
            this.http.get(API_URL + '/ws/readConfig', {headers}).subscribe((data: {}) => {
                this.config = data
            }, (err: any) => {
                console.debug(err)
                this.notify.handleErrors(err);
                return {'error': "Could not config file"}
            });
        }, 100)
    }

    getConfig(){
        return this.config
    }
}
