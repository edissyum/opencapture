import {Component, OnInit} from '@angular/core';
import {Validators, FormBuilder} from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";
import {API_URL} from "../env";
import {HttpClient} from "@angular/common/http";
import {NotificationService} from "../../services/notifications/notifications.service";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {LocalStorageService} from "../../services/local-storage.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
    loginForm: any;
    submittedForm: boolean = false;

    constructor(
        private router: Router,
        private translate: TranslateService,
        private notify: NotificationService,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        this.authService.logout()
        this.router.navigateByUrl("/login")
    }
}
