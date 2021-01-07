import {Injectable} from '@angular/core';
import {AuthService} from "./auth.service";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    user: any = {
        username: '',
        firstname: '',
        lastname: '',
        role: '',
        groups: [],
        privileges: [],
        preferences: [],
        featureTour: []
    };

    constructor(
        private authService: AuthService
    ) {
    }

    getUserFromLocal() {
        let token = this.authService.getTokenAuth()
        if (token) {
            return JSON.parse(atob(<string>token))
        }
    }
}
