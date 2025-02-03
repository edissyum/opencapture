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

 @dev : Nathan Cheval <nathan.cheval@outlook.fr>
 @dev : Oussama Brich <oussama.brich@edissyum.com>  */

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormBuilder, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../../services/auth.service";
import { UserService } from "../../../../../services/user.service";
import { _, TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { environment } from  "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { PrivilegesService } from "../../../../../services/privileges.service";

@Component({
    selector: 'app-update',
    templateUrl: './update-role.component.html',
    styleUrls: ['./update-role.component.scss'],
    standalone: false
})
export class UpdateRoleComponent implements OnInit {
    headers         : HttpHeaders = this.authService.headers;
    loading         : boolean   = true;
    roleId          : any;
    role            : any;
    roles           : any[]     = [];
    assignRoles     : any[]     = [];
    privileges      : any;
    rolePrivileges  : any;
    roleForm        : any[]     = [
        {
            id: 'label_short',
            label: this.translate.instant('HEADER.label_short'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'label',
            label: this.translate.instant('HEADER.label'),
            type: 'text',
            control: new FormControl(),
            required: true
        },
        {
            id: 'enabled',
            label: this.translate.instant('ROLE.enable'),
            type: 'checkbox',
            control: new FormControl(),
            required: true
        },
        {
            id: 'default_route',
            label: this.translate.instant('ROLE.default_route'),
            type: 'list',
            options: [
                {value: '/home', label: this.translate.instant('GLOBAL.home')},
                {value: '/upload', label: this.translate.instant('GLOBAL.upload')},
                {value: '/splitter/list', label: this.translate.instant('HEADER.splitter_list')},
                {value: '/verifier/list', label: this.translate.instant('HEADER.verifier_list')}
            ],
            control: new FormControl(),
            required: false
        }
    ];

    // Only used to get translation available while running the extract-translations
    parentLabel = [
        _('PRIVILEGES.general'),
        _('PRIVILEGES.administration'),
        _('PRIVILEGES.verifier'),
        _('PRIVILEGES.splitter'),
        _('PRIVILEGES.accounts')
    ];
    privilegesLabel = [
        _('MONITORING.verifier'),
        _('MONITORING.splitter'),
        _('PRIVILEGES.access_verifier'),
        _('PRIVILEGES.access_splitter'),
        _('PRIVILEGES.settings'),
        _('PRIVILEGES.upload'),
        _('PRIVILEGES.users_list'),
        _('PRIVILEGES.add_user'),
        _('PRIVILEGES.update_user'),
        _('PRIVILEGES.roles_list'),
        _('PRIVILEGES.add_role'),
        _('PRIVILEGES.update_role'),
        _('PRIVILEGES.version_update'),
        _('PRIVILEGES.custom_fields'),
        _('PRIVILEGES.custom_fields_advanced'),
        _('PRIVILEGES.forms_list'),
        _('PRIVILEGES.customers_list'),
        _('PRIVILEGES.suppliers_list'),
        _('PRIVILEGES.create_supplier'),
        _('PRIVILEGES.update_supplier'),
        _('PRIVILEGES.change_language'),
        _('PRIVILEGES.form_builder'),
        _('PRIVILEGES.export_suppliers'),
        _('PRIVILEGES.import_suppliers'),
        _('PRIVILEGES.history'),
        _('PRIVILEGES.add_output'),
        _('PRIVILEGES.add_form'),
        _('PRIVILEGES.update_output'),
        _('PRIVILEGES.position_mask_list'),
        _('PRIVILEGES.update_form'),
        _('PRIVILEGES.outputs_list'),
        _('PRIVILEGES.add_position_mask'),
        _('PRIVILEGES.update_position_mask'),
        _('PRIVILEGES.create_customer'),
        _('PRIVILEGES.update_customer'),
        _('PRIVILEGES.document_type_splitter'),
        _('PRIVILEGES.separator_splitter'),
        _('PRIVILEGES.update_output_splitter'),
        _('PRIVILEGES.add_output_splitter'),
        _('PRIVILEGES.outputs_list_splitter'),
        _('PRIVILEGES.update_form_splitter'),
        _('PRIVILEGES.add_form_splitter'),
        _('PRIVILEGES.forms_list_splitter'),
        _('PRIVILEGES.statistics'),
        _('PRIVILEGES.configurations'),
        _('PRIVILEGES.docservers'),
        _('PRIVILEGES.regex'),
        _('PRIVILEGES.update_document_type'),
        _('PRIVILEGES.add_document_type'),
        _('PRIVILEGES.login_methods'),
        _('PRIVILEGES.verifier_settings'),
        _('PRIVILEGES.mailcollect'),
        _('PRIVILEGES.user_quota'),
        _('PRIVILEGES.list_ai_model'),
        _('PRIVILEGES.list_ai_model_splitter'),
        _('PRIVILEGES.create_ai_model'),
        _('PRIVILEGES.create_ai_model_splitter'),
        _('PRIVILEGES.update_ai_model'),
        _('PRIVILEGES.update_ai_model_splitter'),
        _('PRIVILEGES.update_status'),
        _('PRIVILEGES.update_status_splitter'),
        _('PRIVILEGES.access_config'),
        _('PRIVILEGES.monitoring'),
        _('PRIVILEGES.verifier_display'),
        _('PRIVILEGES.workflows_list'),
        _('PRIVILEGES.add_workflow'),
        _('PRIVILEGES.update_workflow'),
        _('PRIVILEGES.workflows_list_splitter'),
        _('PRIVILEGES.add_workflow_splitter'),
        _('PRIVILEGES.update_workflow_splitter'),
        _('PRIVILEGES.generate_auth_token'),
        _('PRIVILEGES.update_login_top_message'),
        _('PRIVILEGES.update_login_bottom_message'),
        _('PRIVILEGES.attachments_list_splitter'),
        _('PRIVILEGES.attachments_list_verifier'),
        _('PRIVILEGES.upload_attachments_verifier'),
        _('PRIVILEGES.upload_attachments_splitter')
    ];
    // End translation
    constructor(
        public router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {
    }

    ngOnInit() {
        this.serviceSettings.init();
        this.roleId = this.route.snapshot.params['id'];
        this.userService.user   = this.userService.getUserFromLocal();

        this.http.get(environment['url'] + '/ws/roles/getById/' + this.roleId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.role = data;
                this.assignRoles = data['assign_roles'];
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
                this.notify.handleErrors(err, '/settings/general/roles');
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

        this.http.get(environment['url'] + '/ws/roles/list/user/' + this.userService.user.id, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.roles.forEach((element: any) => {
                    if (element.editable) {
                        this.roles.push(element);
                    }
                });
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
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
            const role: any = {
                'assign_roles': this.assignRoles
            };
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
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();

            this.http.put(environment['url'] + '/ws/roles/updatePrivilege/' + this.roleId, {'privileges': rolePrivileges}, {headers: this.authService.headers},
            ).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('ROLE.updated'));
                    this.router.navigate(['/settings/general/roles/']).then();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
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

    updateAssignRoles(role: any) {
        if (this.assignRoles.includes(role.id)) {
            const index = this.assignRoles.indexOf(role.id, 0);
            this.assignRoles.splice(index, 1);
        }
        else {
            this.assignRoles.push(role.id);
        }
    }

    selectAllAssignRoles(check: boolean) {
        this.assignRoles = [];
        if (check) {
            this.roles.forEach((element: any) => {
                this.assignRoles.push(element.id);
            });
        }
    }
}
