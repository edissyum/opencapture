import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
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
    roleForm: any[] = [
        {
            id: 'label',
            label: marker('ROLE.label'),
            type: 'text',
            control: new FormControl(),
            required: true,
        },
        {
            id: 'label_short',
            label: marker('ROLE.label_short'),
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
        private translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService
    ) {
    }

    ngOnInit(): void {
        this.serviceSettings.init()
        this.roleId = this.route.snapshot.params['id'];

        this.http.get(API_URL + '/ws/roles/getById/' + this.roleId, {headers: this.headers}).pipe(
            tap((data: any) => {
                this.role = data;
                for (let field in data) {
                    if (data.hasOwnProperty(field)) {
                        this.roleForm.forEach(element => {
                            if (element.id == field) {
                                element.control.value = data[field];
                            }
                        });
                    }
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/general/roles'])
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

        }
    }

    getErrorMessage(field: any) {
        let error = undefined;
        this.roleForm.forEach(element => {
            if (element.id == field)
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
        })
        return error
    }

}
