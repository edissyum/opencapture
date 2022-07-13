/** This file is part of Open-Capture for Invoices.

 Open-Capture for Invoices is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan CHEVAL <nathan.cheval@edissyum.com> */

import { Component } from '@angular/core';
import {environment} from  "../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../services/auth.service";
import {NotificationService} from "../../services/notifications/notifications.service";
import {SettingsService} from "../../services/settings.service";
import {TranslateService} from "@ngx-translate/core";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.scss']
})

export class StatisticsComponent {
    currentData         : any = [];
    loading             : boolean = false;
    options             : any = [
        {
            'id': 'verifier_documents_validated_per_user',
            'label': this.translate.instant('STATISTICS.verifier_documents_validated_per_user'),
            'function': 'this.getUsersProcessDocument',
            'data': []
        },
        {
            'id': 'verifier_documents_validated_per_form',
            'label': this.translate.instant('STATISTICS.verifier_documents_validated_per_form'),
            'function': 'this.getFormsProcessDocument',
            'data': []
        }
    ];
    diagramTypes        : any = [
        {
            'id': 'vertical-bar',
            'label': marker('STATISTICS.diagram_vertical_bar'),
            'logo': 'fa-chart-column'
        },
        {
            'id': 'pie-chart',
            'label': marker('STATISTICS.diagram_pie_chart'),
            'logo': 'fa-chart-pie'
        },
        {
            'id': 'pie-grid',
            'label': marker('STATISTICS.diagram_pie_grid'),
            'logo': 'fa-grip'
        },

    ];
    selectedStatistic   : any;
    selectedDiagramType : string = 'vertical-bar';

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
    ) {}

    getFormsProcessDocument(cpt: number) {
        this.http.get(environment['url'] + '/ws/forms/list?module=verifier', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.forms.forEach((form: any) => {
                    this.http.post(environment['url'] + '/ws/verifier/invoices/list',
                        {'status': 'END', 'form_id': form.id}, {headers: this.authService.headers})
                    .pipe(
                        tap((data: any) => {
                            this.options[cpt].data.push({
                                'name': form.label + '(' + form.module + ')',
                                'value': data.total
                            });
                            this.currentData = this.options[cpt].data;
                        }),
                        finalize(() => this.loading = false),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe();
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    getUsersProcessDocument(cpt: number) {
        this.http.get(environment['url'] + '/ws/users/list_full', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.http.get(environment['url'] + '/ws/history/list?submodule=invoice_validated', {headers: this.authService.headers}).pipe(
                    tap((submodules: any) => {
                        data.users.forEach((user: any) => {
                            let historyCpt = 0;
                            submodules.history.forEach((_submodule: any) => {
                                if (user.id === _submodule.user_id) {
                                    historyCpt += 1;
                                }
                            });
                            this.options[cpt].data.push({
                                'name': user.lastname + ' ' + user.firstname,
                                'value': historyCpt
                            });
                            this.currentData = this.options[cpt].data;
                        });
                    }),
                    finalize(() => this.loading = false),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    changeStatistic(event: any) {
        if (event.value) {
            this.options.forEach((option: any, cpt: number) => {
                if (option.id === event.value) {
                    this.selectedStatistic = option;
                    if (option.data.length === 0) {
                        this.currentData = [];
                        this.loading = true;
                        eval(option['function'] + '(' + cpt + ')');
                    }
                    else {
                        this.currentData = option.data;
                    }
                }
            });
        }
    }

    changeDiagramType(event: any) {
        if (event.value) {
            this.diagramTypes.forEach((option: any) => {
                if (option.id === event.value) {
                    this.selectedDiagramType = option.id;
                }
            });
        }
    }
}
