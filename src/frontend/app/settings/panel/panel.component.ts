import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {UserService} from "../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {LocalStorageService} from "../../../services/local-storage.service";
import {LastUrlService} from "../../../services/last-url.service";

@Component({
    selector: 'app-panel',
    templateUrl: './panel.component.html',
    styleUrls: ['./panel.component.scss']
})

export class PanelComponent implements OnInit {
    isMenuOpen : boolean            = true;
    selectedSetting : string        = "users";
    selectedParentSetting : string  = "general";
    searchSetting : string          = "";
    settingListOpenState : boolean  = true;
    settingsParent : any[]          = [
        {
            "id"    : "general",
            "label" : this.translate.instant("SETTINGS.general"),
        },
        {
            "id"    : "verifier",
            "label" : this.translate.instant("SETTINGS.verifier"),
        },
        {
            "id"    : "splitter",
            "label" : this.translate.instant("SETTINGS.splitter"),
        },
    ]
    settings : any                  = {
        "general" : [
            {
                "id"    : "users",
                "label" : this.translate.instant("SETTINGS.users_list"),
                "icon"  : "fas fa-user",
            },
            {
                "id"    : "roles",
                "label" : this.translate.instant("SETTINGS.roles_list"),
                "icon"  : "fas fa-users",
            },
            {
                "id"    : "custom-fields",
                "label" : this.translate.instant("SETTINGS.custom_fields"),
                "icon"  : "fas fa-code",
            },
            {
                "id"    : "version-update",
                "label" : this.translate.instant("SETTINGS.version_and_update"),
                "icon"  : "fas fa-sync",
            },
            {
                "id"    : "about-us",
                "label" : this.translate.instant("SETTINGS.abouts_us"),
                "icon"  : "fas fa-address-card",
            }
        ],
        "splitter" : [
            {
                "id"    : "separator",
                "label" : this.translate.instant("SETTINGS.document_separator"),
                "icon"  : "fas fa-qrcode",
            },
            {
                "id"    : "document-type",
                "label" : this.translate.instant("SETTINGS.document_type"),
                "icon"  : "fas fa-file",
            },
            {
                "id"    : "connector",
                "label" : this.translate.instant("SETTINGS.connector_EDM"),
                "icon"  : "fas fa-link",
            }
        ]
    }

    constructor(
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        private translate: TranslateService,
        private routerExtService: LastUrlService,
        private localeStorageService: LocalStorageService
    ) { }

    ngOnInit(): void {
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        let lastUrl = this.routerExtService.getPreviousUrl()
        if (lastUrl.includes('role/') || lastUrl == '/' || lastUrl.includes('profile/')){
            let selectedSettings = this.localeStorageService.get('selectedSettings')
            let selectedParentSettings = this.localeStorageService.get('selectedParentSettings')
            if (selectedSettings)
                this.selectedSetting = selectedSettings

            if (selectedParentSettings)
                this.selectedParentSetting = selectedParentSettings
        }else{
            this.localeStorageService.remove('selectedSettings')
            this.localeStorageService.remove('selectedParentSettings')
        }
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }

    changeSetting(settingId: string, settingParentId: string) {
        this.selectedSetting = settingId;
        this.selectedParentSetting = settingParentId
        this.localeStorageService.save('selectedSettings', settingId)
        this.localeStorageService.save('selectedParentSettings',settingParentId)
    }
}
