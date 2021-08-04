import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../../services/user.service";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {LastUrlService} from "../../../../../services/last-url.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {LocalStorageService} from "../../../../../services/local-storage.service";

@Component({
    selector: 'app-output-create',
    templateUrl: './create-output.component.html',
    styleUrls: ['./create-output.component.scss']
})
export class CreateOutputComponent implements OnInit {
    loading: boolean = true

    constructor(
        public router: Router,
        public userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
    ) {
    }

    ngOnInit(): void {
    }
}
