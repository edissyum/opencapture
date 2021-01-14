import {Injectable} from '@angular/core';
import {AuthService} from "./auth.service";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
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

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

        if (this.authService.getToken()) {
            return true;
        }
        else {
            this.translate.get('AUTH.not_connected').subscribe((translated: string) => {
                this.authService.setCachedUrl(state.url.replace(/^\//g, ''));
                this.notify.error(translated)
                this.authService.logout()
            });
            return false;
        }
    }
}
