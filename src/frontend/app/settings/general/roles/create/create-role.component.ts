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
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormControl } from "@angular/forms";
import { AuthService } from "../../../../../services/auth.service";
import { UserService } from "../../../../../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { environment } from  "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { HistoryService } from "../../../../../services/history.service";

@Component({
    selector: 'app-create',
    templateUrl: './create-role.component.html',
    styleUrls: ['./create-role.component.scss']
})
export class CreateRoleComponent implements OnInit {
    loading : boolean     = true;
    privileges: any;
    rolePrivileges: any[] = [];
    roles : any[]         = [];
    subRoles: any[]       = [];
    roleForm: any[]       = [
        {
            id: 'label',
            label: this.translate.instant('HEADER.label'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'label_short',
            label: this.translate.instant('HEADER.label_short'),
            type: 'text',
            control: new FormControl(),
            required: true,
        }
    ];

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
        public privilegesService: PrivilegesService,
    ) {
    }

    ngOnInit() {
        this.serviceSettings.init();
        this.userService.user   = this.userService.getUserFromLocal();

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
        this.userService.user   = this.userService.getUserFromLocal();

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

            this.http.post(environment['url'] + '/ws/roles/create', {'args': role}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    const newRoleId = data.id;
                    this.http.put(environment['url'] + '/ws/roles/updatePrivilege/' + newRoleId, {'privileges': rolePrivileges}, {headers: this.authService.headers},
                    ).pipe(
                        tap(() => {
                            this.historyService.addHistory('general', 'create_role', this.translate.instant('HISTORY-DESC.create-role', {role: role['label']}));
                            this.notify.success(this.translate.instant('ROLE.created'));
                            this.router.navigate(['/settings/general/roles/']).then();
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err, '/settings/general/roles/');
                            return of(false);
                        })
                    ).subscribe();
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
        if (this.rolePrivileges) {
            this.rolePrivileges.forEach((element: any) => {
                if (privilegeId === element) {
                    found = true;
                }
            });
        }
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

    updateSubRoles(role: any) {
        if (this.subRoles.includes(role.id)) {
            const index = this.subRoles.indexOf(role.id, 0);
            this.subRoles.splice(index, 1);
        }
        else {
            this.subRoles.push(role.id);
        }
    }

    selectAllSubRoles(check: boolean) {
        this.subRoles = [];
        if (check) {
            this.roles.forEach((element: any) => {
                this.subRoles.push(element.id);
            });
        }
    }
}
