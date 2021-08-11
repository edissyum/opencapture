import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {UserService} from "../../../../../services/user.service";
import {FormBuilder, FormControl} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {LastUrlService} from "../../../../../services/last-url.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {LocalStorageService} from "../../../../../services/local-storage.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";

@Component({
    selector: 'app-output-create',
    templateUrl: './create-output.component.html',
    styleUrls: ['./create-output.component.scss']
})
export class CreateOutputComponent implements OnInit {
    loading             : boolean       = true
    outputsTypes        : any[]         = [];
    outputForm          : any[]         = [
        {
            id: 'output_type_id',
            label: this.translate.instant('HEADER.output_type'),
            type: 'select',
            control: new FormControl(),
            required: true,
            values: this.outputsTypes
        },
        {
            id: 'output_label',
            label: this.translate.instant('HEADER.label'),
            type: 'text',
            control: new FormControl(),
            required: true,
        }
    ];

    constructor(
        public router: Router,
        private http: HttpClient,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
    ) {}

    ngOnInit(): void {
        this.http.get(API_URL + '/ws/outputs/getOutputsTypes', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.outputsTypes = data.outputs_types;
            }),
            finalize(() => {this.loading = false}),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                this.router.navigate(['/settings/verifier/outputs']).then()
                return of(false);
            })
        ).subscribe();
    }

    isValidForm(form: any) {
        let state = true;
        form.forEach((element: any) => {
            if ((element.control.status !== 'DISABLED' && element.control.status !== 'VALID') || element.control.value == null) {
                state = false;
            }
            element.control.markAsTouched();
        });
        return state;
    }

    createOutput() {
        if (this.isValidForm(this.outputForm)) {
            let output_type_id = this.getValueFromForm(this.outputForm, 'output_type_id');
            let output_label = this.getValueFromForm(this.outputForm, 'output_label');
            this.http.post(API_URL + '/ws/outputs/create',
                {'args': {
                    'output_type_id': output_type_id,
                    'output_label': output_label,
                }}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    this.notify.success(this.translate.instant('OUTPUT.created'));
                    this.router.navigate(['/settings/verifier/outputs/update/' + data.id]);
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/settings/verifier/outputs');
                    return of(false);
                })
            ).subscribe();
        }
    }

    getValueFromForm(form: any, field_id: any) {
        let value = '';
        form.forEach((element: any) => {
            if (field_id == element.id) {
                value = element.control.value;
            }
        });
        return value;
    }

    getErrorMessage(field: any, form: any) {
        let error = undefined;
        form.forEach((element: any) => {
            if (element.id == field) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        })
        return error
    }

}
