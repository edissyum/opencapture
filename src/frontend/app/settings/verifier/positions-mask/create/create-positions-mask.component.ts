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
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../../../../../services/user.service";
import { AuthService } from "../../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { environment } from "../../../../env";
import { catchError, tap } from "rxjs/operators";
import { of } from "rxjs";

@Component({
    selector: 'create-positions-mask',
    templateUrl: './create-positions-mask.component.html',
    styleUrls: ['./create-positions-mask.component.scss']
})
export class CreatePositionsMaskComponent implements OnInit {
    loading             : boolean   = true;
    suppliers           : any       = [];
    forms               : any       = [];
    form                : any       = {
        'label': {
            'control': new FormControl()
        },
        'supplier_id': {
            'control': new FormControl()
        },
        'form_id': {
            'control': new FormControl()
        }
    };
    toHighlight         : string = '';

    constructor(
        public router: Router,
        private http: HttpClient,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) {}

    async ngOnInit(): Promise <void> {
        this.serviceSettings.init();
        this.suppliers = await this.retrieveSuppliers('', 1000);
        this.suppliers = this.suppliers.suppliers;
        console.log(this.suppliers)
        this.forms = await this.retrieveForms();
        this.forms = this.forms.forms;
        this.loading = false;
    }

    async retrieveForms(): Promise<any> {
        return await this.http.get(environment['url'] + '/ws/forms/verifier/list', {headers: this.authService.headers}).toPromise();
    }

    async retrieveSuppliers(name: string = '', limit: number = 0): Promise<any> {
        if (limit == 0) {
            return await this.http.get(environment['url'] + '/ws/accounts/suppliers/list?order=name ASC&name=' + name, {headers: this.authService.headers}).toPromise();
        } else {
            return await this.http.get(environment['url'] + '/ws/accounts/suppliers/list?order=name ASC&limit=' + limit, {headers: this.authService.headers}).toPromise();
        }
    }

    isValidForm(form: any) {
        let state = true;
        for (const key in form) {
            if ((form[key].control.status !== 'DISABLED' && form[key].control.status !== 'VALID') || form[key].control.value == null) {
                state = false;
            }
            form[key].control.markAsTouched();
        }
        return state;
    }

    createPositionsMask() {
        if (this.isValidForm(this.form)) {
            const label = this.form['label'].control.value;
            const supplierName = this.form['supplier_id'].control.value;
            const formId = this.form['form_id'].control.value;
            let supplierId = '';
            this.suppliers.forEach((element: any) => {
                if (element.name === supplierName) {
                    supplierId = element.id;
                }
            });
            this.http.post(environment['url'] + '/ws/positions_masks/add',
                {'args': {
                        'label': label,
                        'supplier_id': supplierId,
                        'form_id': formId
                    }}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    this.notify.success(this.translate.instant('POSITIONS-MASKS.created'));
                    this.router.navigate(['/settings/verifier/positions-mask/update/' + data.id]).then();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err, '/settings/verifier/positions-mask');
                    return of(false);
                })
            ).subscribe();
        }
    }

    getErrorMessage(field: any, form: any) {
        let error : any;
        form.forEach((element: any) => {
            if (element.id === field) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }

    async filterSupplier(value: any) {
        if (!value) {
            this.suppliers = await this.retrieveSuppliers('', 1000);
            this.suppliers = this.suppliers.suppliers;
            return;
        } else if (value.length < 3) {
            return;
        }

        this.toHighlight = value;
        this.suppliers = await this.retrieveSuppliers(value);
        this.suppliers = this.suppliers.suppliers;
    }
}
