/** This file is part of Open-Capture for Invoices.

 Open-Capture for Invoices is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import {Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {LocalStorageService} from "./local-storage.service";
import {LastUrlService} from "./last-url.service";
import {Title} from "@angular/platform-browser";
import {Router} from "@angular/router";

@Injectable({
    providedIn: 'root'
})

export class SettingsService {
    isMenuOpen: boolean = true;
    selectedSetting: any = "configurations";
    selectedParentSetting: any = "general";
    settingsParent: any[] = [
        {
            "id": "general",
            "label": this.translate.instant("SETTINGS.general"),
            "opened": false
        },
        {
            "id": "verifier",
            "label": this.translate.instant("SETTINGS.verifier"),
            "opened": false
        },
        {
            "id": "splitter",
            "label": this.translate.instant("SETTINGS.splitter"),
            "opened": false
        },
    ];
    settings: any = {
        "general": [
            {
                "id"        : "configurations",
                "label"     : this.translate.instant("SETTINGS.configurations"),
                "icon"      : "fas fa-sliders",
                "route"     : '/settings/general/configurations',
                "privilege" : "configurations",
            },
            {
                "id"        : "users",
                "label"     : this.translate.instant("SETTINGS.users_list"),
                "icon"      : "fas fa-user",
                "route"     : '/settings/general/users',
                "privilege" : "users_list",
                "actions"   : [
                    {
                        "id"        : 'add_user',
                        "label"     : this.translate.instant("USER.create_user"),
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
                        "label"     : this.translate.instant("ROLE.create_role"),
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
                "route"     : "/settings/general/about-us"
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
            {
                "id"        : "position_mask_builder",
                "label"     : this.translate.instant("SETTINGS.list_positions_mask"),
                "icon"      : "fas fa-map-marker-alt",
                "route"     : "/settings/verifier/positions-mask",
                "actions"   : [
                    {
                        "id"        : "add_position_mask",
                        "label"     : this.translate.instant("SETTINGS.positions_mask_builder"),
                        "route"     : "/settings/verifier/positions-mask/create",
                        "privilege" : "add_position_mask",
                        "icon"      : "fas fa-tools"
                    },
                    {
                        "id"                : "update_position_mask",
                        "label"             : this.translate.instant("SETTINGS.positions_mask_update"),
                        "route"             : "/settings/verifier/positions-mask/update/",
                        "privilege"         : "update_position_mask",
                        "icon"              : "fas fa-hammer",
                        "showOnlyIfActive"  : true
                    }
                ]
            }
        ],
        "splitter": [
            {
                "id"        : "splitter_form_builder",
                "label"     : this.translate.instant("SETTINGS.list_forms"),
                "icon"      : "fab fa-wpforms",
                "route"     : "/settings/splitter/forms",
                "actions"   : [
                    {
                        "id"        : "splitter_add_form",
                        "label"     : this.translate.instant("SETTINGS.form_builder"),
                        "route"     : "/settings/splitter/forms/builder/new",
                        "privilege" : "add_form",
                        "icon"      : "fas fa-tools"
                    },
                    {
                        "id"                : "splitter_update_form",
                        "label"             : this.translate.instant("SETTINGS.form_update"),
                        "route"             : "/settings/splitter/forms/builder/edit/",
                        "privilege"         : "update_form",
                        "icon"              : "fas fa-hammer",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "splitter_input_settings",
                "label"     : this.translate.instant("FORMS.input_settings"),
                "icon"      : "fas fa-sign-in-alt",
                "route"     : "/settings/splitter/inputs",
                "actions"   : [
                    {
                        "id"        : "splitter_add_input",
                        "label"     : this.translate.instant("SETTINGS.add_input"),
                        "route"     : "/settings/splitter/inputs/new",
                        "privilege" : "splitter_add_input",
                        "icon"      : "fas fa-plus"
                    },
                    {
                        "id"                : "splitter_update_input",
                        "label"             : this.translate.instant("SETTINGS.update_input"),
                        "route"             : "/settings/splitter/inputs/update/",
                        "privilege"         : "update_input",
                        "icon"              : "fas fa-edit",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "splitter_output_settings",
                "label"     : this.translate.instant("FORMS.output_settings"),
                "icon"      : "fas fa-sign-out-alt",
                "route"     : "/settings/splitter/outputs",
                "actions"   : [
                    {
                        "id"        : "splitter_add_output",
                        "label"     : this.translate.instant("SETTINGS.add_output"),
                        "route"     : "/settings/splitter/outputs/new",
                        "privilege" : "add_output",
                        "icon"      : "fas fa-plus"
                    },
                    {
                        "id"                : "splitter_update_output",
                        "label"             : this.translate.instant("SETTINGS.update_output"),
                        "route"             : "/settings/splitter/outputs/update/",
                        "privilege"         : "update_output",
                        "icon"              : "fas fa-edit",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"    : "separator",
                "label" : this.translate.instant("SETTINGS.document_separator"),
                "icon"  : "fas fa-qrcode",
                "route" : "/settings/splitter/separator",
            },
            {
                "id"        : "document-type",
                "label"     : this.translate.instant("SETTINGS.document_type"),
                "icon"      : "fas fa-file",
                "route"     : "/settings/splitter/documentType",
                "actions"   : [
                    {
                        "id"        : "splitter_add_doc_type",
                        "label"     : this.translate.instant("SETTINGS.add_doc_type"),
                        "route"     : "/settings/splitter/documentType/new",
                        "privilege" : "add_output",
                        "icon"      : "fas fa-plus"
                    },
                    {
                        "id"        : "splitter_add_folder_doc_type",
                        "label"     : this.translate.instant("SETTINGS.add_doc_type_folder"),
                        "route"     : "/settings/splitter/documentType/createFolder",
                        "privilege" : "update_output",
                        "icon"      : "fas fa-folder-plus",
                    },
                    {
                        "id"                : "splitter_update_doc_type",
                        "label"             : this.translate.instant("SETTINGS.update_doc_type"),
                        "route"             : "/settings/splitter/documentType/update/",
                        "privilege"         : "update_output",
                        "icon"              : "fas fa-edit",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
        ]
    };

    constructor(
        private router: Router,
        private titleService: Title,
        private translate: TranslateService,
        private routerExtService: LastUrlService,
        private localStorage: LocalStorageService
    ) {}

    init() {
        const selectedParentSetting = this.localStorage.get('selectedParentSettings');
        const selectedSetting = this.localStorage.get('selectedSettings');

        if (selectedSetting)
            this.setSelectedSettings(selectedSetting);
        if (selectedParentSetting)
            this.setSelectedParentSettings(selectedParentSetting);

        if (selectedParentSetting == null && selectedSetting == null) {
            this.settingsParent.forEach((parent: any) => {
                if (this.router.url.includes(parent['id'])) {
                    this.setSelectedParentSettings(parent['id']);
                }
            });
        }

        this.closeOtherParent('', this.selectedParentSetting);
    }

    getTitle() {
        let title = this.titleService.getTitle();
        title = title.split(' - ')[0];
        return title;
    }

    changeSetting(settingId: string, settingParentId: string) {
        this.setSelectedSettings(settingId);
        this.setSelectedParentSettings(settingParentId);
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

    getSettingsParent() {
        return this.settingsParent;
    }

    closeOtherParent(url: any, parentId: any) {
        this.settingsParent.forEach((parent: any) => {
            parent.opened = parentId === parent['id'];
        });
    }

    getSettings() {
        return this.settings;
    }

    getSettingsAction(parentId: any, settingId: any) {
        let actions: any;
        this.settings[parentId].forEach((element: any) => {
            if (element['id'] === settingId && element['actions']) {
                actions = element['actions'];
            }
        });
        return actions;
    }

    setSelectedSettings(value: string) {
        this.selectedSetting = value;
        this.localStorage.save('selectedSettings', value);
    }

    setSelectedParentSettings(value: string) {
        this.selectedParentSetting = value;
        this.localStorage.save('selectedParentSettings', value);
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }
}
