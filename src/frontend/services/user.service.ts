import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { LocalStorageService } from "./local-storage.service";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    user : any = {};

    constructor(
        private http: HttpClient,
        private localStorage: LocalStorageService,
    ) {
    }

    setUser(value: any) {
        this.user = value;
    }

    getUser() {
        return this.user;
    }

    getUserFromLocal() {
        const token = this.getTokenAuth();
        if (token) {
            return JSON.parse(atob(token as string));
        }
    }

    getTokenAuth() {
        return this.localStorage.getCookie('OpenCaptureForInvoicesToken_2');
    }
}
