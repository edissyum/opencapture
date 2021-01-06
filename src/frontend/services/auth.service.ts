import {Injectable} from '@angular/core';
import {LocalStorageService} from "./local-storage.service";
import {HttpClient} from "@angular/common/http";
import {catchError, tap} from "rxjs/operators";
import { API_URL } from '../app/env';
import {of} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    user: any = {username: '', firstname: '', lastname: '', role: '', groups: [], privileges: [], preferences: [], featureTour: [] };

    constructor(
        private http: HttpClient,
        private localStorage: LocalStorageService,
    ) {
    }

    getUserFromLocal(){
        let token = this.getTokenAuth()
        if(token){
            return JSON.parse(atob(<string>token))
        }
    }

    setCachedUrl(url: string) {
        this.localStorage.save('OpenCaptureForInvoicesCachedUrl', url);
    }

    getCachedUrl() {
        return this.localStorage.get('OpenCaptureForInvoicesCachedUrl');
    }

    cleanCachedUrl() {
        return this.localStorage.remove('OpenCaptureForInvoicesCachedUrl');
    }

    cleanUrl(id: number) {
        return this.localStorage.remove(`OpenCaptureForInvoicesUrl_${id}`);
    }

    getUrl(id: number) {
        return this.localStorage.get(`OpenCaptureForInvoicesUrl_${id}`);
    }

    setUrl(url: string) {
        const arrUrl = url.split('/');

        if (arrUrl.indexOf('resources') === -1 && arrUrl.indexOf('content') === -1) {
            let token = this.getToken()
            if (token){
                this.localStorage.save(`OpenCaptureForInvoicesUrl_${JSON.parse(atob(token.split('.')[1])).user.id}`, url);
            }
        }
    }

    setTokens(token: string, token2: string) {
        this.localStorage.save('OpenCaptureForInvoicesToken', token);
        this.localStorage.save('OpenCaptureForInvoicesToken_2', token2);
    }

    getToken() {
        return this.localStorage.get('OpenCaptureForInvoicesToken');
    }

    getTokenAuth() {
        return this.localStorage.get('OpenCaptureForInvoicesToken_2');
    }

    clearTokens() {
        this.localStorage.remove('OpenCaptureForInvoicesToken');
        this.localStorage.remove('OpenCaptureForInvoicesToken_2');
    }

    setUser(value: any) {
        this.user = value;
    }

    getUser(){
        return this.user
    }

    logout(){
        if (this.getToken() !== null ) {
            let token = this.getToken()
            if (token){
                if (JSON.parse(atob(token.split('.')[1])).user) {
                    this.cleanUrl(JSON.parse(atob(token.split('.')[1])).user.id);
                }
            }
        }
        this.setUser({});
        this.clearTokens();
    }

}
