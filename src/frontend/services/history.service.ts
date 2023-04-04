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

import { Injectable } from '@angular/core';
import { environment } from  "../app/env";
import { catchError } from "rxjs/operators";
import { of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "./notifications/notifications.service";
import { AuthService } from "./auth.service";
import { UserService } from "./user.service";

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

    addHistory(module: any, submodule: string, desc: string, predefined_user: any = {}) {
        if (!this.userService.user || !this.userService.user.id) {
            this.userService.user = this.userService.getUserFromLocal();
        }

        if (!this.userService.user) {
            this.userService.user = predefined_user;
        }
        const user = this.userService.user.lastname + ' ' + this.userService.user.firstname + ' (' + this.userService.user.username + ')';
        const data = {
            'module': module,
            'submodule': submodule,
            'desc': desc,
            'user_info': user,
            'user_id': this.userService.user.id
        };
        this.http.post(environment['url'] + '/ws/history/add', data).pipe(
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }
}
