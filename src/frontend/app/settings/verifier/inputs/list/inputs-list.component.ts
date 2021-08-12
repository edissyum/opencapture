import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../../services/user.service";
import {AuthService} from "../../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {LastUrlService} from "../../../../../services/last-url.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {LocalStorageService} from "../../../../../services/local-storage.service";

@Component({
    selector: 'app-list',
    templateUrl: './inputs-list.component.html',
    styleUrls: ['./inputs-list.component.scss']
})
export class InputsListComponent implements OnInit {
    headers         : HttpHeaders   = this.authService.headers;
    columnsToDisplay: string[]      = ['id', 'input_label', 'input_type_id', 'actions'];
    loading         : boolean       = true;
    inputs          : any           = [];
    pageSize        : number        = 10;
    pageIndex       : number        = 0;
    total           : number        = 0;
    offset          : number        = 0;

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localeStorageService: LocalStorageService,
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('inputs/') || lastUrl == '/') {
            if (this.localeStorageService.get('inputsPageIndex'))
                this.pageIndex = parseInt(<string>this.localeStorageService.get('inputsPageIndex'));
            this.offset = this.pageSize * (this.pageIndex);
        } else
            this.localeStorageService.remove('inputsPageIndex');
        this.loadInputs();
    }

    loadInputs() {

    }

}
