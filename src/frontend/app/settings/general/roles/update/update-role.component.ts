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

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormBuilder, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../../services/auth.service";
import { UserService } from "../../../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { environment } from  "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import { HistoryService } from "../../../../../services/history.service";

@Component({
    selector: 'app-update',
    templateUrl: './update-role.component.html',
    styleUrls: ['./update-role.component.scss']
})
export class UpdateRoleComponent implements OnInit {
    headers     : HttpHeaders = this.authService.headers;
    loading     : boolean   = true;
    roleId      : any;
    role        : any;
    roles       : any[]     = [];
    privileges  : any;
    rolePrivileges: any;
    roleForm    : any[]     = [
        {
            id: 'label_short',
            label: this.translate.instant('HEADER.label_short'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'label',
            label: this.translate.instant('HEADER.label'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'enabled',
            label: this.translate.instant('ROLE.enable'),
            type: 'checkbox',
            control: new FormControl(),
            required: true,
        }
    ];

    // Only used to get translation available while running the extract-translations
    parentLabel = [
        marker('PRIVILEGES.general'),
        marker('PRIVILEGES.administration'),
        marker('PRIVILEGES.verifier'),
        marker('PRIVILEGES.splitter'),
        marker('PRIVILEGES.accounts')
    ];
    privilegesLabel = [
        marker('MONITORING.verifier'),
        marker('MONITORING.splitter'),
        marker('PRIVILEGES.access_verifier'),
        marker('PRIVILEGES.access_splitter'),
        marker('PRIVILEGES.settings'),
        marker('PRIVILEGES.upload'),
        marker('PRIVILEGES.users_list'),
        marker('PRIVILEGES.add_user'),
        marker('PRIVILEGES.update_user'),
        marker('PRIVILEGES.roles_list'),
        marker('PRIVILEGES.add_role'),
        marker('PRIVILEGES.update_role'),
        marker('PRIVILEGES.version_update'),
        marker('PRIVILEGES.custom_fields'),
        marker('PRIVILEGES.forms_list'),
        marker('PRIVILEGES.customers_list'),
        marker('PRIVILEGES.suppliers_list'),
        marker('PRIVILEGES.create_supplier'),
        marker('PRIVILEGES.update_supplier'),
        marker('PRIVILEGES.change_language'),
        marker('PRIVILEGES.form_builder'),
        marker('PRIVILEGES.export_suppliers'),
        marker('PRIVILEGES.import_suppliers'),
        marker('PRIVILEGES.history'),
        marker('PRIVILEGES.add_output'),
        marker('PRIVILEGES.add_form'),
        marker('PRIVILEGES.update_output'),
        marker('PRIVILEGES.position_mask_list'),
        marker('PRIVILEGES.update_form'),
        marker('PRIVILEGES.outputs_list'),
        marker('PRIVILEGES.add_position_mask'),
        marker('PRIVILEGES.update_position_mask'),
        marker('PRIVILEGES.create_customer'),
        marker('PRIVILEGES.update_customer'),
        marker('PRIVILEGES.document_type_splitter'),
        marker('PRIVILEGES.separator_splitter'),
        marker('PRIVILEGES.update_output_splitter'),
        marker('PRIVILEGES.add_output_splitter'),
        marker('PRIVILEGES.outputs_list_splitter'),
        marker('PRIVILEGES.update_form_splitter'),
        marker('PRIVILEGES.add_form_splitter'),
        marker('PRIVILEGES.forms_list_splitter'),
        marker('PRIVILEGES.statistics'),
        marker('PRIVILEGES.configurations'),
        marker('PRIVILEGES.docservers'),
        marker('PRIVILEGES.regex'),
        marker('PRIVILEGES.update_document_type'),
        marker('PRIVILEGES.add_document_type'),
        marker('PRIVILEGES.login_methods'),
        marker('PRIVILEGES.verifier_settings'),
        marker('PRIVILEGES.mailcollect'),
        marker('PRIVILEGES.user_quota'),
        marker('PRIVILEGES.list_ai_model'),
        marker('PRIVILEGES.list_ai_model_splitter'),
        marker('PRIVILEGES.create_ai_model'),
        marker('PRIVILEGES.create_ai_model_splitter'),
        marker('PRIVILEGES.update_ai_model'),
        marker('PRIVILEGES.update_ai_model_splitter'),
        marker('PRIVILEGES.update_status'),
        marker('PRIVILEGES.update_status_splitter'),
        marker('PRIVILEGES.access_config'),
        marker('PRIVILEGES.monitoring'),
        marker('PRIVILEGES.verifier_display'),
        marker('PRIVILEGES.workflows_list'),
        marker('PRIVILEGES.add_workflow'),
        marker('PRIVILEGES.update_workflow'),
        marker('PRIVILEGES.workflows_list_splitter'),
        marker('PRIVILEGES.add_workflow_splitter'),
        marker('PRIVILEGES.update_workflow_splitter')
    ];
    // End translation
    constructor(
        private http: HttpClient,
        public router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        private historyService: HistoryService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {
    }

    ngOnInit() {
        this.serviceSettings.init();
        this.roleId = this.route.snapshot.params['id'];

        this.http.get(environment['url'] + '/ws/roles/getById/' + this.roleId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.role = data;
                for (const field in data) {
                    if (data.hasOwnProperty(field)) {
                        this.roleForm.forEach(element => {
                            if (element.id === field) {
                                element.control.setValue(data[field]);
                            }
                        });
                    }
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/general/roles']).then();
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/privileges/getbyRoleId/' + this.roleId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.rolePrivileges = data;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err, '/settings/general/roles');
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/privileges/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.privileges = data;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err, '/settings/general/roles');
                return of(false);
            })
        ).subscribe();
    }

    isValidForm() {
        let state = true;
        this.roleForm.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }

    onSubmit() {
        if (this.isValidForm()) {
            const role: any = {};
            this.roleForm.forEach(element => {
                role[element.id] = element.control.value;
            });

            const rolePrivileges: any[] = [];
            this.privileges['privileges'].forEach((element: any) => {
                this.rolePrivileges.forEach((element2: any) => {
                    if (element['label'] === element2) {
                        rolePrivileges.push(element['id']);
                    }
                });
            });

            this.http.put(environment['url'] + '/ws/roles/update/' + this.roleId, {'args': role}, {headers: this.authService.headers},
            ).pipe(
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/settings/general/roles/');
                    return of(false);
                })
            ).subscribe();

            this.http.put(environment['url'] + '/ws/roles/updatePrivilege/' + this.roleId, {'privileges': rolePrivileges}, {headers: this.authService.headers},
            ).pipe(
                tap(() => {
                    this.historyService.addHistory('general', 'update_role', this.translate.instant('HISTORY-DESC.update-role', {role: role['label']}));
                    this.notify.success(this.translate.instant('ROLE.updated'));
                    this.router.navigate(['/settings/general/roles/']).then();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/settings/general/roles/');
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessage(field: any) {
        let error: any;
        this.roleForm.forEach(element => {
            if (element.id === field) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }

    hasPrivilege(privilegeId: number) {
        let found = false;
        this.rolePrivileges.forEach((element: any) => {
            if (privilegeId === element) {
                found = true;
            }
        });
        return found;
    }

    getChildsByParent(parent: any) {
        const data: any[] = [];
        this.privileges['privileges'].forEach((element: any) => {
            if (parent === element['parent']) {
                data.push(element['label']);
            }
        });
        return data;
    }

    changePrivilege(event: any) {
        const privilege = event.source.name;
        const checked = event.checked;
        if (!checked) {
            this.rolePrivileges.forEach((element: any) => {
                if (privilege === element) {
                    const index = this.rolePrivileges.indexOf(privilege, 0);
                    this.rolePrivileges.splice(index, 1);
                }
            });
        } else {
            this.rolePrivileges.push(privilege);
        }
    }
}
