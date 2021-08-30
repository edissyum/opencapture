import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../../../../services/user.service";
import {AuthService} from "../../../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, map, startWith, tap} from "rxjs/operators";
import {Observable, of} from "rxjs";

@Component({
    selector: 'create-positions-mask',
    templateUrl: './create-positions-mask.component.html',
    styleUrls: ['./create-positions-mask.component.scss']
})
export class CreatePositionsMaskComponent implements OnInit {
    loading             : boolean       = true
    suppliers           : any       = [];
    filteredOptions     : Observable<any> | undefined;
    form                : any       = {
        'label': {
            'control': new FormControl(),
        },
        'supplier_id': {
            'control': new FormControl(),
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
        public privilegesService: PrivilegesService,
    ) {}

    ngOnInit(): void {
        this.http.get(API_URL + '/ws/accounts/suppliers/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.suppliers = this.sortArrayAlphab(data.suppliers);
                this.filteredOptions = this.form['supplier_id'].control.valueChanges
                    .pipe(
                        startWith(''),
                        map(option => option ? this._filter(option) : this.suppliers.slice())
                    );
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    isValidForm(form: any) {
        let state = true;
        for (let key in form) {
            if ((form[key].control.status !== 'DISABLED' && form[key].control.status !== 'VALID') || form[key].control.value == null) {
                state = false;
            }
            form[key].control.markAsTouched();
        };
        return state;
    }

    createPositionsMask() {
        if (this.isValidForm(this.form)) {
            let label = this.form['label'].control.value;
            let supplier_name = this.form['supplier_id'].control.value;
            let supplier_id = '';
            this.suppliers.forEach((element: any) => {
                if (element.name == supplier_name) {
                    supplier_id = element.id
                }
            });
            this.http.post(API_URL + '/ws/positions_masks/add',
                {'args': {
                        'label': label,
                        'supplier_id': supplier_id,
                    }}, {headers: this.authService.headers},
            ).pipe(
                tap((data: any) => {
                    console.log(data)
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
        let error = undefined;
        form.forEach((element: any) => {
            if (element.id == field) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }

    sortArrayAlphab(array: any) {
        return array.sort(function (a:any, b:any) {
            let x = a.name.toUpperCase(),
                y = b.name.toUpperCase();
            return x == y ? 0 : x > y ? 1 : -1;
        });
    }

    private _filter(value: any) {
        if (typeof value == 'string') {
            this.toHighlight = value;
            const filterValue = value.toLowerCase();
            return this.suppliers.filter((option: any) => option.name.toLowerCase().indexOf(filterValue) !== -1);
        }else {
            return this.suppliers;
        }
    }

}
