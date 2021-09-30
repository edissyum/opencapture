import { Injectable } from '@angular/core';
import {splitAtColon} from "@angular/compiler/src/util";
import {API_URL} from "../app/env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {NotificationService} from "./notifications/notifications.service";
import {AuthService} from "./auth.service";
import {UserService} from "./user.service";

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private userService: UserService,
        private notify: NotificationService
    ) { }

    addHistory(module: string, submodule: string, desc: string) {
        const user = this.userService.user.lastname + ' ' + this.userService.user.firstname + ' (' + this.userService.user.username + ')';
        const data = {
            'module': module,
            'submodule': submodule,
            'desc': desc,
            'user_info': user,
            'user_id': this.userService.user.id
        };
        this.http.post(API_URL + '/ws/history/add', data, {headers: this.authService.headers}).pipe(
            tap((data: any) => {

            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }
}
