import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    user    : any = {username: '', firstname: '', lastname: '', role: '', groups: [], privileges: [], preferences: [], featureTour: [] };

    constructor(
        private authService: AuthService,
        private userService: UserService
    ) {
    }

    ngOnInit() {
        this.user = this.userService.getUserFromLocal()
    }
}
