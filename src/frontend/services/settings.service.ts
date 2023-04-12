/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Router } from "@angular/router";
import { Injectable } from '@angular/core';
import { AuthService } from "./auth.service";
import { Title } from "@angular/platform-browser";
import { LastUrlService } from "./last-url.service";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageService } from "./local-storage.service";

@Injectable({
    providedIn: 'root'
})

export class SettingsService {
    selectedSetting         : any       = "configurations";
    selectedParentSetting   : any       = "general";
    minimizeSideNav         : boolean   = false;
    settingsParent          : any[]     = [
        {
            "id": "general",
            "label": this.translate.instant("SETTINGS.general"),
            "icon": 'fa-globe',
            "opened": false
        },
        {
            "id": "verifier",
            "label": this.translate.instant("SETTINGS.verifier"),
            "icon": 'fa-certificate',
            "opened": false
        },
        {
            "id": "splitter",
            "label": this.translate.instant("SETTINGS.splitter"),
            "icon": 'fa-arrows-split-up-and-left',
            "opened": false
        },
    ];
    settings                : any       = {
        "general": [
            {
                "id"        : "configurations",
                "label"     : this.translate.instant("SETTINGS.configurations"),
                "icon"      : "fa-solid fa-sliders",
                "route"     : '/settings/general/configurations',
                "privilege" : "configurations"
            },
            {
                "id"        : "docservers",
                "label"     : this.translate.instant("SETTINGS.docservers"),
                "icon"      : "fa-solid fa-hard-drive",
                "route"     : '/settings/general/docservers',
                "privilege" : "docservers"
            },
            {
                "id"        : "regex",
                "label"     : this.translate.instant("SETTINGS.regex"),
                "icon"      : "fa-solid fa-star-of-life",
                "route"     : '/settings/general/regex',
                "privilege" : "regex"
            },
            {
                "id"        : "mailcollect",
                "label"     : this.translate.instant("SETTINGS.mailcollect"),
                "icon"      : "fa-solid fa-inbox",
                "route"     : '/settings/general/mailcollect',
                "privilege" : "mailcollect"
            },
            {
                "id"        : "users",
                "label"     : this.translate.instant("SETTINGS.users_list"),
                "icon"      : "fa-solid fa-user",
                "route"     : '/settings/general/users',
                "privilege" : "users_list",
                "actions"   : [
                    {
                        "id"        : 'add_user',
                        "label"     : this.translate.instant("USER.create_user"),
                        "route"     : "/settings/general/users/new",
                        "privilege" : "add_user",
                        "icon"      : "fa-solid fa-plus"
                    },
                    {
                        "id"                : 'update_user',
                        "label"             : this.translate.instant("USER.update"),
                        "route"             : "/settings/general/users/update/",
                        "icon"              : "fa-solid fa-edit",
                        "privilege"         : "update_user",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "user-quota",
                "label"     : this.translate.instant("SETTINGS.user_quota"),
                "icon"      : "fa-solid fa-user-gear",
                "route"     : '/settings/general/user-quota',
                "privilege" : "user_quota"
            },
            {
                "id"        : "roles",
                "label"     : this.translate.instant("SETTINGS.roles_list"),
                "icon"      : "fa-solid fa-users",
                "route"     : "/settings/general/roles",
                "privilege" : "roles_list",
                "actions"   : [
                    {
                        "id"        : "add_role",
                        "label"     : this.translate.instant("ROLE.create_role"),
                        "route"     : "/settings/general/roles/new",
                        "privilege" : "add_role",
                        "icon"      : "fa-solid fa-plus"
                    },
                    {
                        "id"                : 'update_role',
                        "label"             : this.translate.instant("ROLE.update"),
                        "route"             : "/settings/general/roles/update/",
                        "icon"              : "fa-solid fa-edit",
                        "privilege"         : "update_role",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "custom-fields",
                "label"     : this.translate.instant("SETTINGS.custom_fields"),
                "route"     : "/settings/general/custom-fields",
                "icon"      : "fa-solid fa-code",
                "privilege" : "custom_fields"
            },
            {
                "id"        : "login-methods",
                "label"     : this.translate.instant("SETTINGS.login_methods"),
                "icon"      : "fa-solid fa-right-to-bracket",
                "route"     : "/settings/general/login-methods",
                "privilege" : "login_methods"
            },
            {
                "id"        : "about-us",
                "label"     : this.translate.instant("SETTINGS.abouts_us"),
                "icon"      : "fa-solid fa-address-card",
                "route"     : "/settings/general/about-us"
            }
        ],
        "verifier": [
            {
                "id"        : "verifier_display",
                "label"     : this.translate.instant("SETTINGS.verifier_display"),
                "icon"      : "fa-solid fa-display",
                "route"     : "/settings/verifier/display",
                "privilege" : "verifier_display"
            },
            {
                "id"        : "workflow_builder",
                "label"     : this.translate.instant("SETTINGS.list_workflows"),
                "icon"      : "fa-solid fa-diagram-next",
                "route"     : "/settings/verifier/workflows",
                "privilege" : "workflows_list",
                "actions"   : [
                    {
                        "id"        : "add_workflow",
                        "label"     : this.translate.instant("SETTINGS.workflow_builder"),
                        "route"     : "/settings/verifier/workflows/builder/new",
                        "privilege" : "add_workflow",
                        "icon"      : "fa-solid fa-tools"
                    },
                    {
                        "id"                : "update_workflonw",
                        "label"             : this.translate.instant("SETTINGS.workflow_update"),
                        "route"             : "/settings/verifier/workflows/builder/edit/",
                        "privilege"         : "update_workflow",
                        "icon"              : "fa-solid fa-hammer",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "form_builder",
                "label"     : this.translate.instant("SETTINGS.list_forms"),
                "icon"      : "fa-brands fa-wpforms",
                "route"     : "/settings/verifier/forms",
                "privilege" : "forms_list",
                "actions"   : [
                    {
                        "id"        : "add_form",
                        "label"     : this.translate.instant("SETTINGS.form_builder"),
                        "route"     : "/settings/verifier/forms/builder/new",
                        "privilege" : "add_form",
                        "icon"      : "fa-solid fa-tools"
                    },
                    {
                        "id"                : "update_form",
                        "label"             : this.translate.instant("SETTINGS.form_update"),
                        "route"             : "/settings/verifier/forms/builder/edit/",
                        "privilege"         : "update_form",
                        "icon"              : "fa-solid fa-hammer",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "input_settings",
                "label"     : this.translate.instant("FORMS.input_settings"),
                "icon"      : "fa-solid fa-sign-in-alt",
                "route"     : "/settings/verifier/inputs",
                "privilege" : "inputs_list",
                "actions"   : [
                    {
                        "id"        : "add_form",
                        "label"     : this.translate.instant("SETTINGS.add_input"),
                        "route"     : "/settings/verifier/inputs/new",
                        "privilege" : "add_input",
                        "icon"      : "fa-solid fa-plus"
                    },
                    {
                        "id"                : "update_form",
                        "label"             : this.translate.instant("SETTINGS.update_input"),
                        "route"             : "/settings/verifier/inputs/update/",
                        "privilege"         : "update_input",
                        "icon"              : "fa-solid fa-edit",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "output_settings",
                "label"     : this.translate.instant("FORMS.output_settings"),
                "icon"      : "fa-solid fa-sign-out-alt",
                "route"     : "/settings/verifier/outputs",
                "privilege" : "outputs_list",
                "actions"   : [
                    {
                        "id"        : "add_form",
                        "label"     : this.translate.instant("SETTINGS.add_output"),
                        "route"     : "/settings/verifier/outputs/new",
                        "privilege" : "add_output",
                        "icon"      : "fa-solid fa-plus"
                    },
                    {
                        "id"                : "update_form",
                        "label"             : this.translate.instant("SETTINGS.update_output"),
                        "route"             : "/settings/verifier/outputs/update/",
                        "privilege"         : "update_output",
                        "icon"              : "fa-solid fa-edit",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "position_mask_builder",
                "label"     : this.translate.instant("SETTINGS.list_positions_mask"),
                "icon"      : "fa-solid fa-map-marker-alt",
                "route"     : "/settings/verifier/positions-mask",
                "privilege" : "position_mask_list",
                "actions"   : [
                    {
                        "id"        : "add_position_mask",
                        "label"     : this.translate.instant("SETTINGS.positions_mask_builder"),
                        "route"     : "/settings/verifier/positions-mask/create",
                        "privilege" : "add_position_mask",
                        "icon"      : "fa-solid fa-tools"
                    },
                    {
                        "id"                : "update_position_mask",
                        "label"             : this.translate.instant("SETTINGS.positions_mask_update"),
                        "route"             : "/settings/verifier/positions-mask/update/",
                        "privilege"         : "update_position_mask",
                        "icon"              : "fa-solid fa-hammer",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "artificial-intelligence",
                "label"     : this.translate.instant("SETTINGS.artificial_intelligence"),
                "icon"      : "fa-solid fa-microchip",
                "route"     : "/settings/verifier/ai",
                "privilege" : "list_ai_model",
                "actions"   : [
                    {
                        "id"        : "verifier_add_model",
                        "label"     : this.translate.instant("ARTIFICIAL-INTELLIGENCE.add_model"),
                        "route"     : "/settings/verifier/ai/create",
                        "privilege" : "create_ai_model",
                        "icon"      : "fa-solid fa-plus"
                    },
                    {
                        "id"                : "verifier_update_model",
                        "label"             : this.translate.instant("ARTIFICIAL-INTELLIGENCE.update_model"),
                        "route"             : "/settings/verifier/ai/update/",
                        "privilege"         : "update_ai_model",
                        "icon"              : "fa-solid fa-edit",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "verifier_status_update",
                "label"     : this.translate.instant("SETTINGS.status_update"),
                "icon"      : "fa-solid fa-flag",
                "route"     : "/settings/verifier/status-update",
                "privilege" : "update_status"
            }
        ],
        "splitter": [
            {
                "id"        : "splitter_form_builder",
                "label"     : this.translate.instant("SETTINGS.list_forms"),
                "icon"      : "fa-brands fa-wpforms",
                "route"     : "/settings/splitter/forms",
                "privilege" : "forms_list_splitter",
                "actions"   : [
                    {
                        "id"        : "splitter_add_form",
                        "label"     : this.translate.instant("SETTINGS.form_builder"),
                        "route"     : "/settings/splitter/forms/builder/new",
                        "privilege" : "add_form",
                        "icon"      : "fa-solid fa-tools"
                    },
                    {
                        "id"                : "splitter_update_form",
                        "label"             : this.translate.instant("SETTINGS.form_update"),
                        "route"             : "/settings/splitter/forms/builder/edit/",
                        "privilege"         : "update_form",
                        "icon"              : "fa-solid fa-hammer",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "splitter_input_settings",
                "label"     : this.translate.instant("FORMS.input_settings"),
                "icon"      : "fa-solid fa-sign-in-alt",
                "route"     : "/settings/splitter/inputs",
                "privilege" : "inputs_list_splitter",
                "actions"   : [
                    {
                        "id"        : "splitter_add_input",
                        "label"     : this.translate.instant("SETTINGS.add_input"),
                        "route"     : "/settings/splitter/inputs/new",
                        "privilege" : "splitter_add_input",
                        "icon"      : "fa-solid fa-plus"
                    },
                    {
                        "id"                : "splitter_update_input",
                        "label"             : this.translate.instant("SETTINGS.update_input"),
                        "route"             : "/settings/splitter/inputs/update/",
                        "privilege"         : "update_input",
                        "icon"              : "fa-solid fa-edit",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "splitter_output_settings",
                "label"     : this.translate.instant("FORMS.output_settings"),
                "icon"      : "fa-solid fa-sign-out-alt",
                "route"     : "/settings/splitter/outputs",
                "privilege" : "outputs_list_splitter",
                "actions"   : [
                    {
                        "id"        : "splitter_add_output",
                        "label"     : this.translate.instant("SETTINGS.add_output"),
                        "route"     : "/settings/splitter/outputs/new",
                        "privilege" : "add_output_splitter",
                        "icon"      : "fa-solid fa-plus"
                    },
                    {
                        "id"                : "splitter_update_output",
                        "label"             : this.translate.instant("SETTINGS.update_output"),
                        "route"             : "/settings/splitter/outputs/update/",
                        "privilege"         : "update_output_splitter",
                        "icon"              : "fa-solid fa-edit",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "separator",
                "label"     : this.translate.instant("SETTINGS.document_separator"),
                "icon"      : "fa-solid fa-qrcode",
                "route"     : "/settings/splitter/separator",
                "privilege" : "separator_splitter"
            },
            {
                "id"        : "document-type",
                "label"     : this.translate.instant("SETTINGS.document_type"),
                "icon"      : "fa-solid fa-file",
                "route"     : "/settings/splitter/document-type",
                "privilege" : "document_type_splitter",
                "actions"   : [
                    {
                        "id"        : "splitter_add_doc_type",
                        "label"     : this.translate.instant("SETTINGS.add_doc_type"),
                        "route"     : "/settings/splitter/document-type/new",
                        "privilege" : "add_document_type",
                        "icon"      : "fa-solid fa-plus"
                    },
                    {
                        "id"        : "splitter_add_folder_doc_type",
                        "label"     : this.translate.instant("SETTINGS.add_doc_type_folder"),
                        "route"     : "/settings/splitter/document-type/create-folder",
                        "privilege" : "add_document_type",
                        "icon"      : "fa-solid fa-folder-plus",
                    },
                    {
                        "id"                : "splitter_update_doc_type",
                        "label"             : this.translate.instant("SETTINGS.update_doc_type"),
                        "route"             : "/settings/splitter/document-type/update/",
                        "privilege"         : "update_document_type",
                        "icon"              : "fa-solid fa-edit",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "artificial-intelligence",
                "label"     : this.translate.instant("SETTINGS.artificial_intelligence"),
                "icon"      : "fa-solid fa-microchip",
                "route"     : "/settings/splitter/ai",
                "privilege" : "list_ai_model",
                "actions"   : [
                    {
                        "id"        : "splitter_add_model",
                        "label"     : this.translate.instant("ARTIFICIAL-INTELLIGENCE.add_model"),
                        "route"     : "/settings/splitter/ai/create",
                        "privilege" : "create_ai_model",
                        "icon"      : "fa-solid fa-plus"
                    },
                    {
                        "id"                : "splitter_update_model",
                        "label"             : this.translate.instant("ARTIFICIAL-INTELLIGENCE.update_model"),
                        "route"             : "/settings/splitter/ai/update/",
                        "privilege"         : "update_ai_model",
                        "icon"              : "fa-solid fa-edit",
                        "showOnlyIfActive"  : true
                    }
                ]
            },
            {
                "id"        : "splitter_status_update",
                "label"     : this.translate.instant("SETTINGS.status_update"),
                "icon"      : "fa-solid fa-flag",
                "route"     : "/settings/splitter/status-update",
                "privilege" : "update_status"
            }
        ]
    };

    constructor(
        private router: Router,
        private titleService: Title,
        private authService: AuthService,
        private translate: TranslateService,
        private routerExtService: LastUrlService,
        private localStorage: LocalStorageService
    ) {}

    init() {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        const selectedParentSetting = this.localStorage.get('selectedParentSettings');
        const selectedSetting = this.localStorage.get('selectedSettings');

        onresize = () => {
            this.minimizeSideNav = window.innerWidth < 1500;
        };

        if (selectedSetting) {
            this.setSelectedSettings(selectedSetting);
        }
        if (selectedParentSetting) {
            this.setSelectedParentSettings(selectedParentSetting);
        }

        if (selectedParentSetting == null && selectedSetting == null) {
            let foundSettings = false;
            this.settingsParent.forEach((parent: any) => {
                if (this.router.url.includes(parent['id'])) {
                    foundSettings = true;
                    this.setSelectedParentSettings(parent['id']);
                }
            });

            if (!foundSettings) {
                this.setSelectedParentSettings('general');
                this.setSelectedSettings('about-us');
            }
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
}
