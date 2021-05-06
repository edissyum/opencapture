import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {FormBuilder, FormControl} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../../services/auth.service";
import {UserService} from "../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../services/settings.service";
import {API_URL} from "../../../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {PrivilegesService} from "../../../../services/privileges.service";

@Component({
    selector: 'app-update',
    templateUrl: './update-role.component.html',
    styleUrls: ['./update-role.component.scss']
})
export class UpdateRoleComponent implements OnInit {
    headers: HttpHeaders = this.authService.headers;
    roleId: any;
    role: any;
    roles: any[] = [];
    privileges: any;
    rolePrivileges: any;
    roleForm: any[] = [
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
        this.translate.instant('PRIVILEGES.general'),
        this.translate.instant('PRIVILEGES.administration')
    ]

    privileges_label = [
        this.translate.instant('PRIVILEGES.verifier'),
        this.translate.instant('PRIVILEGES.splitter'),
        this.translate.instant('PRIVILEGES.settings'),
        this.translate.instant('PRIVILEGES.upload'),
        this.translate.instant('PRIVILEGES.users_list'),
        this.translate.instant('PRIVILEGES.add_user'),
        this.translate.instant('PRIVILEGES.modify_user'),
        this.translate.instant('PRIVILEGES.roles_list'),
        this.translate.instant('PRIVILEGES.add_role'),
        this.translate.instant('PRIVILEGES.modify_role')
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

        this.http.get(API_URL + '/ws/roles/getById/' + this.roleId, {headers: this.headers}).pipe(
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

        this.http.get(API_URL + '/ws/privileges/getbyRoleId/' + this.roleId, {headers: this.headers}).pipe(
            tap((data: any) => {
                this.rolePrivileges = data
                console.log(this.rolePrivileges)
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err, '/settings/general/roles');
                return of(false);
            })
        ).subscribe()

        this.http.get(API_URL + '/ws/privileges/list', {headers: this.headers}).pipe(
            tap((data: any) => {
                this.privileges = data
                console.log(this.privileges)
            }),
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

            this.http.put(API_URL + '/ws/roles/update/' + this.roleId, {'args': role}, {headers: this.headers},
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
            if (element.id == field){
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        })
        return error
    }

    hasPrivilege(privilege_id: number){
        let found = false
        this.rolePrivileges.forEach((element: any) => {
            if (privilege_id == element){
                found = true
            }
        })
        return found
    }

    getChildsByParent(parent: any){
        let data: any[] = []
        this.privileges['privileges'].forEach((element: any) => {
            if (parent == element['parent']){
                data.push(element['label'])
            }
        })
        return data
    }

    changePrivilege(event: any){
        let privilege = event.source.name
        let checked = event.checked
        console.log(this.rolePrivileges)
        if (!checked){
            this.rolePrivileges.forEach((element: any) => {
                if (privilege == element){
                    let index = this.rolePrivileges.indexOf(privilege, 0)
                    this.rolePrivileges.splice(index, 1)
                }
            })
        }else{
            this.rolePrivileges.push(privilege)
        }
        console.log(this.rolePrivileges)

    }

}
