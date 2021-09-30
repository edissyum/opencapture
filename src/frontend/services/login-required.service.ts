import {Injectable} from '@angular/core';
import {AuthService} from "./auth.service";
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from "@angular/router";
import {NotificationService} from "./notifications/notifications.service";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
    providedIn: 'root'
})
export class LoginRequiredService implements CanActivate{

    constructor(
        private authService: AuthService,
        private notify: NotificationService,
        private translate: TranslateService,
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (!this.authService.getToken()) {
            this.translate.get('AUTH.not_connected').subscribe((translated: string) => {
                this.authService.setCachedUrl(state.url.replace(/^\//g, ''));
                this.notify.error(translated);
                this.authService.logout();
            });
            return false;
        }
        return true;
    }
}
