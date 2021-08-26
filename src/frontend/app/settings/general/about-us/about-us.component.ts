import { Component, OnInit } from '@angular/core';
import { SettingsService } from "../../../../services/settings.service";
import { Router } from "@angular/router";
import { PrivilegesService } from "../../../../services/privileges.service";
import {API_URL} from "../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../../services/auth.service";
import {NotificationService} from "../../../../services/notifications/notifications.service";

@Component({
    selector: 'app-about-us',
    templateUrl: './about-us.component.html',
    styleUrls: ['./about-us.component.scss']
})

export class AboutUsComponent implements OnInit {
    loading         : boolean   = true;
    git_version     : any       = 'dev';
    last_version    : any       = '';

    constructor(
        public router: Router,
        private http: HttpClient,
        private authService: AuthService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {}

    ngOnInit(): void {
        this.http.get(API_URL + '/ws/config/gitInfo', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.git_current && data.git_current !== 'None')
                    this.git_version = data.git_current;
                if (data.git_latest)
                    this.last_version = data.git_latest;

            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

}
