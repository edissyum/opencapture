import {Injectable} from '@angular/core';
import {UserService} from "./user.service";

@Injectable({
    providedIn: 'root'
})
export class PrivilegesService {

    constructor(
        private userService: UserService
    ) { }

    hasPrivilege(privilegeId: any) {
        let found = false;
        const user = this.userService.getUserFromLocal();
        if (user) {
            const userPrivileges = user['privileges'];
            if (userPrivileges) {
                if (privilegeId === undefined) {
                    return true;
                }
                if (userPrivileges === '*')
                    return true;

                userPrivileges.forEach((element: any) => {
                    if (privilegeId === element) {
                        found = true;
                    }
                });
                return found;
            }
        }
        return false;
    }
}
