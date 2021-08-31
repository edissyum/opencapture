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
        const userPrivileges = this.userService.getUserFromLocal()['privileges'];
        if (userPrivileges) {
            if (userPrivileges === '*')
                return true;

            userPrivileges.forEach((element: any) => {
                if (privilegeId === element) {
                    found = true;
                }
            });
            return found;
        }
        return false;
    }
}
