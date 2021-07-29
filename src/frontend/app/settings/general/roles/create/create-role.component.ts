import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";

@Component({
    selector: 'app-create',
    templateUrl: './create-role.component.html',
    styleUrls: ['./create-role.component.scss']
})
export class CreateRoleComponent implements OnInit {
    loading : boolean = true;
    privileges: any;
    rolePrivileges: any[] = [];
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
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {
    }

    ngOnInit() {
        this.serviceSettings.init()

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
        let state = true
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

            this.http.post(API_URL + '/ws/roles/create', {'args': role}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    let newRoleId = data.id
                    this.http.put(API_URL + '/ws/roles/updatePrivilege/' + newRoleId, {'privileges': role_privileges}, {headers: this.authService.headers},
                    ).pipe(
                        tap(() => {
                            this.notify.success(this.translate.instant('ROLE.created'))
                            this.router.navigate(['/settings/general/roles/'])
                        }),
                        catchError((err: any) => {
                            console.debug(err)
                            // this.notify.handleErrors(err, '/settings/general/roles/');
                            return of(false);
                        })
                    ).subscribe();
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
        if (this.rolePrivileges) {
            this.rolePrivileges.forEach((element: any) => {
                if (privilege_id == element) {
                    found = true
                }
            })
        }
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
