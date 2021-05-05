import {Injectable} from '@angular/core';
import {UserService} from "./user.service";

@Injectable({
    providedIn: 'root'
})
export class PrivilegesService {

    constructor(
        private userService: UserService
    ) { }

    hasPrivilege(privilege_id: any) {
        let found = false
        let user_privileges = this.userService.getUserFromLocal()['privileges']
        if (user_privileges){
            if (user_privileges == '*')
                return true

            user_privileges.forEach((element: any) => {
                if (privilege_id == element){
                    found = true
                }
            })
            return found
        }
        return false
    }
}
