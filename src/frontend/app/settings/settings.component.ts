import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";
import {SettingsService} from "../../services/settings.service";
import {PrivilegesService} from "../../services/privileges.service";

@Component({
    selector: 'app-panel',
    templateUrl: "settings.component.html"
})

export class SettingsComponent implements OnInit {
    isMenuOpen : boolean            = this.serviceSettings.getIsMenuOpen();
    selectedSetting : string        = this.serviceSettings.getSelectedSetting();
    selectedParentSetting : string  = this.serviceSettings.getSelectedParentSetting();
    settingListOpenState : boolean  = this.serviceSettings.getSettingListOpenState();
    settings : any                  = this.serviceSettings.getSettings()

    constructor(
        public router: Router,
        public userService: UserService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    ngOnInit(): void {
        this.serviceSettings.init()
        this.selectedSetting = this.serviceSettings.getSelectedSetting();
        this.selectedParentSetting = this.serviceSettings.getSelectedParentSetting();
        this.settings = this.serviceSettings.getSettings();
        this.settings[this.selectedParentSetting].forEach((element: any) => {
            if (element['id'] == this.selectedSetting){
                let routeToGo = element.route;
                if (routeToGo && this.privilegesService.hasPrivilege(element.privilege))
                    this.router.navigateByUrl(routeToGo).then();
            }
        })
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }
}
