import {Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {LocalStorageService} from "./local-storage.service";
import {LastUrlService} from "./last-url.service";
import {Title} from "@angular/platform-browser";

@Injectable({
    providedIn: 'root'
})

export class SettingsService {
    isMenuOpen: boolean = true;
    selectedSetting: string = "users";
    selectedParentSetting: string = "general";
    settingListOpenState: boolean = true;
    settingsParent: any[] = [
        {
            "id": "general",
            "label": this.translate.instant("SETTINGS.general"),
        },
        {
            "id": "verifier",
            "label": this.translate.instant("SETTINGS.verifier"),
        },
        {
            "id": "splitter",
            "label": this.translate.instant("SETTINGS.splitter"),
        },
    ];
    settings: any = {
        "general": [
            {
                "id"        : "users",
                "label"     : this.translate.instant("SETTINGS.users_list"),
                "icon"      : "fas fa-user",
                "route"     : '/settings/general/users',
                "privilege" : "users_list",
                "actions"   : [
                    {
                        "id"        : 'add_user',
                        "label"     : this.translate.instant("USER.add"),
                        "route"     : "/settings/general/users/new",
                        "privilege" : "add_user",
                        "icon"      : "fas fa-plus"
                    },
                    {
                        "id"                : 'update_user',
                        "label"             : this.translate.instant("USER.update"),
                        "route"             : "/settings/general/users/update/",
                        "icon"              : "fas fa-edit",
                        "privilege"         : "update_user",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "roles",
                "label"     : this.translate.instant("SETTINGS.roles_list"),
                "icon"      : "fas fa-users",
                "route"     : "/settings/general/roles",
                "privilege" : "roles_list",
                "actions"   : [
                    {
                        "id"        : "add_role",
                        "label"     : this.translate.instant("ROLE.add"),
                        "route"     : "/settings/general/roles/new",
                        "privilege" : "add_role",
                        "icon"      : "fas fa-plus"
                    },
                    {
                        "id"                : 'update_role',
                        "label"             : this.translate.instant("ROLE.update"),
                        "route"             : "/settings/general/roles/update/",
                        "icon"              : "fas fa-edit",
                        "privilege"         : "update_role",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "custom-fields",
                "label"     : this.translate.instant("SETTINGS.custom_fields"),
                "route"     : "/settings/general/custom-fields",
                "icon"      : "fas fa-code",
                "privilege" : "custom_fields",
            },
            {
                "id"        : "about-us",
                "label"     : this.translate.instant("SETTINGS.abouts_us"),
                "icon"      : "fas fa-address-card",
                "route"     : "/settings/general/about-us",
                "privilege" : "*"
            }
        ],
        "verifier": [
            {
                "id"        : "form_builder",
                "label"     : this.translate.instant("SETTINGS.list_forms"),
                "icon"      : "fab fa-wpforms",
                "route"     : "/settings/verifier/forms",
                "actions"   : [
                    {
                        "id"        : "add_form",
                        "label"     : this.translate.instant("SETTINGS.form_builder"),
                        "route"     : "/settings/verifier/forms/builder/new",
                        "privilege" : "add_form",
                        "icon"      : "fas fa-tools"
                    },
                    {
                        "id"                : "update_form",
                        "label"             : this.translate.instant("SETTINGS.form_update"),
                        "route"             : "/settings/verifier/forms/builder/edit/",
                        "privilege"         : "update_form",
                        "icon"              : "fas fa-hammer",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "input_settings",
                "label"     : this.translate.instant("FORMS.input_settings"),
                "icon"      : "fas fa-sign-in-alt",
                "route"     : "/settings/verifier/inputs",
                "actions"   : [
                    {
                        "id"        : "add_form",
                        "label"     : this.translate.instant("SETTINGS.add_input"),
                        "route"     : "/settings/verifier/inputs/new",
                        "privilege" : "add_input",
                        "icon"      : "fas fa-plus"
                    },
                    {
                        "id"                : "update_form",
                        "label"             : this.translate.instant("SETTINGS.update_input"),
                        "route"             : "/settings/verifier/inputs/update/",
                        "privilege"         : "update_input",
                        "icon"              : "fas fa-edit",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "output_settings",
                "label"     : this.translate.instant("FORMS.output_settings"),
                "icon"      : "fas fa-sign-out-alt",
                "route"     : "/settings/verifier/outputs",
                "actions"   : [
                    {
                        "id"        : "add_form",
                        "label"     : this.translate.instant("SETTINGS.add_output"),
                        "route"     : "/settings/verifier/outputs/new",
                        "privilege" : "add_output",
                        "icon"      : "fas fa-plus"
                    },
                    {
                        "id"                : "update_form",
                        "label"             : this.translate.instant("SETTINGS.update_output"),
                        "route"             : "/settings/verifier/outputs/update/",
                        "privilege"         : "update_output",
                        "icon"              : "fas fa-edit",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
        ],
        "splitter": [
            {
                "id": "separator",
                "label": this.translate.instant("SETTINGS.document_separator"),
                "icon": "fas fa-qrcode",
            },
            {
                "id": "document-type",
                "label": this.translate.instant("SETTINGS.document_type"),
                "icon": "fas fa-file",
            },
            {
                "id": "connector",
                "label": this.translate.instant("SETTINGS.connector_EDM"),
                "icon": "fas fa-link",
            }
        ]
    };
    constructor(
        private titleService: Title,
        private translate: TranslateService,
        private routerExtService: LastUrlService,
        private localeStorageService: LocalStorageService
    ) {}

    init() {
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('roles') || lastUrl == '/' || lastUrl.includes('users')) {
            let selectedSettings = this.localeStorageService.get('selectedSettings')
            let selectedParentSettings = this.localeStorageService.get('selectedParentSettings')
            if (selectedSettings)
                this.setSelectedSettings(selectedSettings)

            if (selectedParentSettings)
                this.setSelectedParentSettings(selectedParentSettings)
        }else{
            this.localeStorageService.remove('selectedSettings')
            this.localeStorageService.remove('selectedParentSettings')
            this.setSelectedSettings("users")
            this.setSelectedParentSettings('general')
        }
    }

    getTitle() {
        let title = this.titleService.getTitle()
        title = title.split(' - ')[0]
        return title
    }

    changeSetting(settingId: string, settingParentId: string) {
        this.setSelectedSettings(settingId)
        this.setSelectedParentSettings(settingParentId)
        this.localeStorageService.save('selectedSettings', settingId)
        this.localeStorageService.save('selectedParentSettings',settingParentId)
    }

    getIsMenuOpen() {
        return this.isMenuOpen;
    }

    getSelectedSetting() {
        return this.selectedSetting;
    }

    getSelectedParentSetting() {
        return this.selectedParentSetting;
    }

    getSettingListOpenState() {
        return this.settingListOpenState;
    }

    getSettingsParent() {
        return this.settingsParent;
    }

    getSettings() {
        return this.settings;
    }

    getSettingsAction(parent_id: any, setting_id: any) {
        let actions = undefined
        this.settings[parent_id].forEach((element: any) => {
            if (element['id'] == setting_id && element['actions']) {
                actions = element['actions']
            }
        })
        return actions
    }

    setSelectedSettings(value: string) {
        this.selectedSetting = value;
    }

    setSelectedParentSettings(value: string) {
        this.selectedParentSetting = value;
    }

    setSettingListOpenState(value: boolean) {
        this.settingListOpenState = value;
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }
}
