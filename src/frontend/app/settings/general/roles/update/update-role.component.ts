import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {FormBuilder, FormControl} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../../services/auth.service";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";

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
    parent_label = [
        marker('PRIVILEGES.general'),
        marker('PRIVILEGES.administration'),
        marker('PRIVILEGES.verifier'),
        marker('PRIVILEGES.splitter'),
        marker('PRIVILEGES.accounts')
    ]
    privileges_label = [
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
        marker('PRIVILEGES.change_language')
    ]
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
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {
    }

    ngOnInit() {
        this.serviceSettings.init()
        this.roleId = this.route.snapshot.params['id'];

        this.http.get(API_URL + '/ws/roles/getById/' + this.roleId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.role = data;
                for (let field in data) {
                    if (data.hasOwnProperty(field)) {
                        this.roleForm.forEach(element => {
                            if (element.id == field) {
                                element.control.setValue(data[field]);
                            }
                        });
                    }
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/general/roles']).then()
                return of(false);
            })
        ).subscribe()

        this.http.get(API_URL + '/ws/privileges/getbyRoleId/' + this.roleId, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.rolePrivileges = data
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err, '/settings/general/roles');
                return of(false);
            })
        ).subscribe()

        this.http.get(API_URL + '/ws/privileges/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.privileges = data
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err, '/settings/general/roles');
                return of(false);
            })
        ).subscribe()
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

            let role_privileges: any[] = []
            this.privileges['privileges'].forEach((element: any) => {
                this.rolePrivileges.forEach((element2: any) => {
                    if (element['label'] == element2) {
                        role_privileges.push(element['id'])
                    }
                })
            })

            this.http.put(API_URL + '/ws/roles/update/' + this.roleId, {'args': role}, {headers: this.authService.headers},
            ).pipe(
                catchError((err: any) => {
                    console.debug(err)
                    this.notify.handleErrors(err, '/settings/general/roles/');
                    return of(false);
                })
            ).subscribe();

            this.http.put(API_URL + '/ws/roles/updatePrivilege/' + this.roleId, {'privileges': role_privileges}, {headers: this.authService.headers},
            ).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('ROLE.updated'))
                    this.router.navigate(['/settings/general/roles/'])
                }),
                catchError((err: any) => {
                    console.debug(err)
                    this.notify.handleErrors(err, '/settings/general/roles/');
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessage(field: any) {
        let error = undefined;
        this.roleForm.forEach(element => {
            if (element.id == field) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        })
        return error
    }

    hasPrivilege(privilege_id: number) {
        let found = false
        this.rolePrivileges.forEach((element: any) => {
            if (privilege_id == element) {
                found = true
            }
        })
        return found
    }

    getChildsByParent(parent: any) {
        let data: any[] = []
        this.privileges['privileges'].forEach((element: any) => {
            if (parent == element['parent']) {
                data.push(element['label'])
            }
        })
        return data
    }

    changePrivilege(event: any) {
        let privilege = event.source.name
        let checked = event.checked
        if (!checked) {
            this.rolePrivileges.forEach((element: any) => {
                if (privilege == element) {
                    let index = this.rolePrivileges.indexOf(privilege, 0)
                    this.rolePrivileges.splice(index, 1)
                }
            })
        }else{
            this.rolePrivileges.push(privilege)
        }
    }
}
