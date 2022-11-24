/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Essaid MEGHELLET <essaid.meghellet@edissyum.com>*/

import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../../../services/auth.service";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../services/settings.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { environment } from "../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { FormBuilder, FormControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";

@Component({
  selector: 'app-login-methods',
  templateUrl: './login-methods.component.html',
  styleUrls: ['./login-methods.component.scss']
})
export class LoginMethodsComponent implements OnInit {
    loading                 : boolean   = true;
    isSaveBtnDisabled       : boolean   = true;
    isLaunchBtnDisabled     : boolean   = false;
    isLinear                : boolean   = false;
    showPassword            : boolean   = false;
    isLdapChecked           : boolean   = false;
    isDefaultChecked        : boolean   = false;
    connexionServerStatus   : boolean   = false;
    synchroUsersStatus      : boolean   = false;
    label                   : any[]     = [
        marker ('LOGIN-METHODS.ldap'),
        marker ('LOGIN-METHODS.default'),
    ];
    loginMethods      : any[]     = [
        {
            login_method_name : '',
            enabled :''
        }
    ];
    connectionFormGroup     : any[]     = [
        {
            id: 'typeAD',
            label: this.translate.instant('LOGIN-METHODS.typeAD'),
            type: 'select',
            control: new FormControl(),
            values: ['openLDAP', 'adLDAP'],
            required: true,
        },
        {
            id: 'host',
            label: this.translate.instant('LOGIN-METHODS.host'),
            type: 'text',
            control: new FormControl(),
            required: true,
            hint:'Ex : ldap://192.168.10.180'
        },
        {
            id: 'port',
            label: this.translate.instant('LOGIN-METHODS.port'),
            type: 'text',
            control: new FormControl(),
            required: true,
            hint:'Ex : 389'
        },
        {
            id: 'loginAdmin',
            label: this.translate.instant('LOGIN-METHODS.login_admin'),
            type: 'text',
            control: new FormControl(),
            required: true,
            hint:'Ex : admin'
        },
        {
            id: 'passwordAdmin',
            label: this.translate.instant('LOGIN-METHODS.password_admin'),
            type: 'password',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'baseDN',
            label: this.translate.instant('LOGIN-METHODS.base_dn'),
            type: 'text',
            control: new FormControl(),
            required: true,
            hint:'Ex : dc=edissyum,dc=com'
        },
        {
            id: 'prefix',
            label: this.translate.instant('LOGIN-METHODS.prefix'),
            type: 'text',
            values: [],
            control: new FormControl(),
            required: false,
            hint:'Ex : edissyum'
        },
        {
            id: 'suffix',
            label: this.translate.instant('LOGIN-METHODS.suffix'),
            type: 'text',
            values: [],
            control: new FormControl(),
            required: false,
            hint:'Ex : @domaine-edisslab.com'
        }

    ];
    synchroparamsFormGroup  : any[]     = [
        {
            id: 'attributSourceUser',
            label: this.translate.instant('LOGIN-METHODS.source_user_attribute'),
            type: 'text',
            values: [],
            control: new FormControl(),
            required: true,
            hint:'Ex : uid'
        },
        {
            id: 'classObject',
            label: this.translate.instant('LOGIN-METHODS.class_Object'),
            type: 'text',
            control: new FormControl(),
            required: true,
            hint:'Ex : posixAccount'
        },
        {
            id: 'classUser',
            label: this.translate.instant('LOGIN-METHODS.class_user'),
            type: 'text',
            values: [],
            control: new FormControl(),
            required: true,
            hint:'Ex : objectClass'
        },
        {
            id: 'attributFirstName',
            label: this.translate.instant('LOGIN-METHODS.first_name_attribute'),
            type: 'text',
            control: new FormControl(),
            required: true,
            hint:'Ex : givenname'
        },
        {
            id: 'attributLastName',
            label: this.translate.instant('LOGIN-METHODS.last_name_attribute'),
            type: 'text',
            values: [],
            control: new FormControl(),
            required: true,
             hint:'Ex : sn'
        },
        {
            id: 'usersDN',
            label: this.translate.instant('LOGIN-METHODS.usersDN'),
            type: 'text',
            values: [],
            control: new FormControl(),
            required: true,
            hint:'Ex : cn=employes,ou=utilisateurs,dc=edissyum,dc=com'
        },
        {
            id: 'attributRoleDefault',
            label: this.translate.instant('LOGIN-METHODS.role_default'),
            type: 'select',
            values: [],
            control: new FormControl(),
            required: true,
            hint:'Ex : Utilisateur'
        }

    ];

    constructor(
        public router: Router,
        private http: HttpClient,
        private authService: AuthService,
        private _formBuilder: FormBuilder,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        this.http.get(environment['url'] + '/ws/auth/retrieveLoginMethodName').pipe(
            tap((data: any) => {
                this.loginMethods = data.login_methods;
                for ( const login_method_name of this.loginMethods ) {
                    if (login_method_name['method_name'] === 'default') {
                        this.isDefaultChecked = !!login_method_name['enabled'];
                    }
                    if (login_method_name['method_name'] === 'ldap') {
                        this.isLdapChecked = !!login_method_name['enabled'];
                    }
                }
            }),
            catchError ((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of (false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/roles/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.synchroparamsFormGroup.forEach((element:any) => {
                    if (element.id === 'attributRoleDefault') {
                        element.values = data.roles;
                    }
                });

                this.http.get(environment['url'] + '/ws/auth/retrieveLdapConfigurations', {headers: this.authService.headers}).pipe(
                    tap((data: any) => {
                        const configs : any = data.ldap_configurations;
                        this.connectionFormGroup.forEach(element => {
                            for (const config of configs) {
                                if (element.type !== 'password') {
                                    element.control.setValue(config.data[element.id]);
                                }
                            }
                        });
                        this.synchroparamsFormGroup.forEach(element => {
                            for (const config of configs) {
                                element.control.setValue(config.data[element.id]);
                            }
                        });
                    }),
                    finalize(() => this.loading = false),
                    catchError ((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of (false);
                    })
                ).subscribe();
            }),
            catchError ((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of (false);
            })
        ).subscribe();
    }

    updateTypeAd(event: any, id: any) {
        if  (event.isUserInput) {
            let required = true;
            if (id === 'typeAD' && event.source.value === 'adLDAP') {
                required = false;
            }
            this.connectionFormGroup.forEach((element: any) => {
                if (element.id === 'baseDN') {
                    element.required = required;
                }
            });
        }
    }

    changedDefaultMethod(loginMethodName: any): void {
        if (!this.isDefaultChecked) {
            this.enableLoginMethod(loginMethodName);
        } else if (this.isDefaultChecked) {
            this.disableLoginMethod(loginMethodName);
        }
    }

    changedLdapMethod(loginMethodName: any): void {
        if (!this.isLdapChecked) {
            this.isLdapChecked = true;
        } else if (this.isLdapChecked) {
            this.disableLoginMethod(loginMethodName);
        }
    }

    isValidConnexionForm() {
        let state = true;
        this.connectionFormGroup.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }

    isValidSynchronizationForm() {
        let state = true;
        this.connectionFormGroup.forEach(element => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }

    disableLoginMethod(loginMethodName: any): void {
        this.http.post(environment['url'] + '/ws/auth/disableLoginMethodName', loginMethodName, {headers: this.authService.headers}).pipe(
            tap(() => {
                if (loginMethodName['method_name'] === 'default') {
                    this.isDefaultChecked = false;
                }
                if (loginMethodName['method_name'] === 'ldap') {
                    this.isLdapChecked = false;
                }
                this.notify.success(this.translate.instant('LOGIN-METHODS.login_method_disabled'));
            }),
            catchError ((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of (false);
            })
        ).subscribe();
    }

    enableLoginMethod(loginMethodName: any): void {
        this.http.post(environment['url'] + '/ws/auth/enableLoginMethodName',loginMethodName, {headers: this.authService.headers}).pipe(
            tap(() => {
                if (loginMethodName['method_name'] === 'default') {
                    this.isDefaultChecked = true;
                }
                this.notify.success(this.translate.instant('LOGIN-METHODS.login_method_enabled'));
            }),
            catchError ((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of (false);
            })
        ).subscribe();
    }

    checkLdapConnexion(): void {
        if (this.isValidConnexionForm()) {
            const server_data : any = {};
            this.connectionFormGroup.forEach(element => {
                server_data[element.id] = element.control.value;
            });
            this.http.post(environment['url'] + '/ws/auth/connectionLdap', server_data,{headers: this.authService.headers}).pipe(
            tap(() => {
                this.connexionServerStatus = true;
                this.notify.success(this.translate.instant('LOGIN-METHODS.server_ldap_connection'));
            }),
            catchError ((err: any) => {
                this.isSaveBtnDisabled = true;
                this.connexionServerStatus = false;
                console.debug(err);
                this.notify.handleErrors(err);
                return of (false);
            })
        ).subscribe();
        }
    }

    ldapSynchronization(): void {
        this.isLaunchBtnDisabled = true;
        if (this.isValidSynchronizationForm() && this.isValidConnexionForm()) {
            const synchronizationData : any = {};
            this.connectionFormGroup.forEach(element => {
                synchronizationData[element.id] = element.control.value;
            });
             this.synchroparamsFormGroup.forEach(element => {
                synchronizationData[element.id] = element.control.value;
            });
            this.http.post(environment['url'] + '/ws/auth/ldapSynchronization', synchronizationData, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.isSaveBtnDisabled = false;
                this.isLaunchBtnDisabled = false;
                this.synchroUsersStatus = true;
                this.notify.success(this.translate.instant('LOGIN-METHODS.result_synchronization_operation', {'users_added':data['create_users'],'users_updated':data['update_users'],'users_disabled':data['disabled_users']}));
            }),
            catchError ((err: any) => {
                this.isSaveBtnDisabled = true;
                this.isLaunchBtnDisabled = false;
                this.synchroUsersStatus = false;
                console.debug(err);
                this.notify.handleErrors(err);
                return of (false);
            })
        ).subscribe();
        }
    }

    saveLoginMethodConfigs(): void {
        if (this.isValidSynchronizationForm() && this.isValidConnexionForm()) {
            if (this.connexionServerStatus && this.synchroUsersStatus) {
                const methodDataToSave : any = {};
                this.connectionFormGroup.forEach(element => {
                    methodDataToSave[element.id] = element.control.value;
                });
                 this.synchroparamsFormGroup.forEach(element => {
                    methodDataToSave[element.id] = element.control.value;
                });
                this.http.post(environment['url'] + '/ws/auth/saveLoginMethodConfigs', methodDataToSave, {headers: this.authService.headers}).pipe(
                    tap(() => {
                        this.isLdapChecked = true;
                        this.notify.success(this.translate.instant('LOGIN-METHODS.save_ldap_infos_success'));
                    }),
                    catchError ((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of (false);
                    })
                ).subscribe();
            }
        } else {
            this.isSaveBtnDisabled = true;
        }
    }
}
