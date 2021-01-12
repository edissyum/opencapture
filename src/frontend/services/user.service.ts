import {Injectable} from '@angular/core';
import {AuthService} from "./auth.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {API_URL} from "../app/env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {NotificationService} from "./notifications/notifications.service";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    user: any = {
        username: '',
        firstname: '',
        lastname: '',
        role: '',
        creation_date: '',
        enabled: '',
        status: '',
        groups: [],
        privileges: [],
        preferences: []
    };

    constructor(
        private http: HttpClient,
        private authService: AuthService,
    ) {
    }

    getUserFromLocal() {
        let token = this.authService.getTokenAuth()
        if (token) {
            return JSON.parse(atob(<string>token))
        }
    }
}
