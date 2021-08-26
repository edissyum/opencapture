import {Injectable} from '@angular/core';
import {PrivilegesService} from "./privileges.service";
import {ActivatedRouteSnapshot, Router} from "@angular/router";
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

    canActivate(route: ActivatedRouteSnapshot): boolean {
        if (route.data.privileges !== undefined) {
            let return_value = true
            route.data.privileges.forEach((privilege:any) => {
                let hasPrivilege = this.privilegesService.hasPrivilege(privilege)
                if (!hasPrivilege) {
                    this.translate.get('ERROR.unauthorized').subscribe((translated: string) => {
                        let label = ''
                        if (route.routeConfig) {
                            label = this.translate.instant(route.data['title']);
                        }
                        this.notify.error(translated + label)
                        this.router.navigateByUrl('/home')
                    });
                    return_value = false
                }
            })
            return return_value
        }else{
          return false
        }
    }
}
