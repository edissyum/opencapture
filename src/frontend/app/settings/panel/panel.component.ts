import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { Location } from '@angular/common';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {UserService} from "../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {LocalStorageService} from "../../../services/local-storage.service";
import {LastUrlService} from "../../../services/last-url.service";
import {SettingsService} from "../../../services/settings.service";

@Component({
    selector: 'app-panel',
    templateUrl: './panel.component.html',
    styleUrls: ['./panel.component.scss']
})

export class PanelComponent implements OnInit {
    isMenuOpen : boolean            = this.serviceSettings.getIsMenuOpen();
    selectedSetting : string        = this.serviceSettings.getSelectedSetting();
    selectedParentSetting : string  = this.serviceSettings.getSelectedParentSetting();
    settingListOpenState : boolean  = this.serviceSettings.getSettingListOpenState();
    settingsParent : any[]          = this.serviceSettings.getSettingsParent();
    settings : any                  = this.serviceSettings.getSettings()

    constructor(
        private http: HttpClient,
        private router: Router,
        private location: Location,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        private translate: TranslateService,
        public serviceSettings: SettingsService,
    ) { }

    ngOnInit(): void {
        this.serviceSettings.init()
        this.isMenuOpen = this.serviceSettings.getIsMenuOpen();
        this.selectedSetting = this.serviceSettings.getSelectedSetting();
        this.selectedParentSetting = this.serviceSettings.getSelectedParentSetting();
        this.settingListOpenState = this.serviceSettings.getSettingListOpenState();
        this.settingsParent = this.serviceSettings.getSettingsParent();
        this.settings = this.serviceSettings.getSettings()
        console.log(this.selectedSetting)
        this.settings[this.selectedParentSetting].forEach((element: any) =>{
            if (element['id'] == this.selectedSetting){
                let routeToGo = element.route
                if (routeToGo)
                    this.router.navigateByUrl(routeToGo)
            }
        })
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }
}
