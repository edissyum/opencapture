import {Injectable} from '@angular/core';
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class LoginRedirectService {

    constructor(private authService: AuthService, private router: Router) {
    }

    canActivate(): boolean {
        if (this.authService.getToken()) {
            this.router.navigateByUrl('/home');
            return false;
        } else {
            return true;
        }
    }
}
