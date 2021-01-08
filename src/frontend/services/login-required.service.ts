import {Injectable} from '@angular/core';
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";
import {NotificationService} from "./notifications/notifications.service";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
    providedIn: 'root'
})
export class LoginRequiredService {

    constructor(
        private authService: AuthService,
        private notify: NotificationService,
        private translate: TranslateService,
        private router: Router
    ) {
    }

    canActivate(): boolean {

        if (this.authService.getToken()) {
            return true;
        }
        else {
            this.notify.error(this.translate.instant('AUTH.not_connected'))
            this.router.navigateByUrl('/login');
            return false;
        }
    }
}
