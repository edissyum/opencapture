import {Injectable} from '@angular/core';
import {PrivilegesService} from "./privileges.service";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "./notifications/notifications.service";

@Injectable({
        providedIn: 'root'
})
export class HasPrivilegeService {

    constructor(
        private router: Router,
        private translate: TranslateService,
        private notify: NotificationService,
        private privilegesService: PrivilegesService,
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (route.data.privilege !== undefined){
            let hasPrivilege = this.privilegesService.hasPrivilege(route.data.privilege)
            if (hasPrivilege){
                return true
            }else{
                this.translate.get('ERROR.unauthorized').subscribe((translated: string) => {
                    this.notify.error(translated)
                    this.router.navigateByUrl('/home')
                });
                return false
            }
        }else{
          return true
        }
    }
}
