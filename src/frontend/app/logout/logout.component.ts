import {Component, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../services/notifications/notifications.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
    constructor(
        private router: Router,
        private translate: TranslateService,
        private notify: NotificationService,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        this.authService.logout()
    }
}
