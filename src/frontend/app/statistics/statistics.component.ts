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

 @dev : Nathan CHEVAL <nathan.cheval@outlook.fr> */

import { of } from "rxjs";
import { environment } from  "../env";
import moment from "moment/moment";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from '@angular/core';
import { _, TranslateService } from "@ngx-translate/core";
import { AuthService } from "../../services/auth.service";
import { catchError, finalize, tap } from "rxjs/operators";
import { SettingsService } from "../../services/settings.service";
import { NotificationService } from "../../services/notifications/notifications.service";

@Component({
    selector: 'app-statistics',
    templateUrl: './statistics.component.html',
    styleUrls: ['./statistics.component.scss'],
    standalone: false
})

export class StatisticsComponent implements OnInit {
    currentData         : any = [];
    loading             : boolean = true;
    options             : any = [
        {
            'id': 'verifier_batches_validated_per_user',
            'label': this.translate.instant('STATISTICS.verifier_batches_validated_per_user'),
            'function': 'getUsersProcessBatches',
            'module': 'verifier',
            'data': [],
            'total': 0
        },
        {
            'id': 'verifier_batches_validated_per_form',
            'label': this.translate.instant('STATISTICS.verifier_batches_validated_per_form'),
            'function': 'getFormsProcessBatches',
            'module': 'verifier',
            'data': [],
            'total': 0
        },
        {
            'id': 'verifier_batches_uploaded_per_worklow',
            'label': this.translate.instant('STATISTICS.verifier_batches_uploaded_per_worklow'),
            'function': 'getWorkflowUploadedBatchesVerifier',
            'module': 'verifier',
            'data': [],
            'total': 0
        },
        {
            'id': 'verifier_batches_uploaded_per_user',
            'label': this.translate.instant('STATISTICS.verifier_batches_uploaded_per_user'),
            'function': 'getUserUploadedBatchesVerifier',
            'module': 'verifier',
            'data': [],
            'total': 0
        },
        {
            'id': 'verifier_batches_uploaded_per_month',
            'label': this.translate.instant('STATISTICS.verifier_batches_uploaded_per_month'),
            'function': 'getBatchesUploadedByMonthVerifier',
            'module': 'verifier',
            'data': [],
            'total': 0
        },
        {
            'id': 'verifier_batches_uploaded_per_year',
            'label': this.translate.instant('STATISTICS.verifier_batches_uploaded_per_year'),
            'function': 'getBatchesUploadedByYearVerifier',
            'module': 'verifier',
            'data': [],
            'total': 0
        },
        {
            'id': 'splitter_documents_processed_per_worklow',
            'label': this.translate.instant('STATISTICS.splitter_documents_processed_per_worklow'),
            'function': 'getWorkflowProcessedDocumentSplitter',
            'module': 'splitter',
            'data': [],
            'total': 0
        },
        {
            'id': 'splitter_documents_processed_per_user',
            'label': this.translate.instant('STATISTICS.splitter_documents_processed_per_user'),
            'function': 'getUserProcessedDocumentSlitter',
            'module': 'splitter',
            'data': [],
            'total': 0
        },
        {
            'id': 'splitter_documents_processed_per_month',
            'label': this.translate.instant('STATISTICS.splitter_documents_processed_per_month'),
            'function': 'getDocumentsProcessedByMonthSplitter',
            'module': 'splitter',
            'data': [],
            'total': 0
        },
        {
            'id': 'splitter_documents_processed_per_year',
            'label': this.translate.instant('STATISTICS.splitter_documents_processed_per_year'),
            'function': 'getDocumentsProcessedByYearSplitter',
            'module': 'splitter',
            'data': [],
            'total': 0
        },
        {
            'id': 'splitter_batches_uploaded_per_month',
            'label': this.translate.instant('STATISTICS.splitter_batches_uploaded_per_month'),
            'function': 'getBatchesUploadedByMonthSplitter',
            'module': 'splitter',
            'data': [],
            'total': 0
        },
        {
            'id': 'splitter_batches_uploaded_per_year',
            'label': this.translate.instant('STATISTICS.splitter_batches_uploaded_per_year'),
            'function': 'getBatchesUploadedByYearSplitter',
            'module': 'splitter',
            'data': [],
            'total': 0
        },
    ];
    diagramTypes        : any = [
        {
            'id': 'vertical-bar',
            'label': _('STATISTICS.diagram_vertical_bar'),
            'logo': 'fa-chart-column'
        },
        {
            'id': 'pie-chart',
            'label': _('STATISTICS.diagram_pie_chart'),
            'logo': 'fa-chart-pie'
        },
        {
            'id': 'pie-grid',
            'label': _('STATISTICS.diagram_pie_grid'),
            'logo': 'fa-grip'
        }

    ];
    modules             : any = [
        {
            'id': 'verifier',
            'label': this.translate.instant('MONITORING.verifier')
        },
        {
            'id': 'splitter',
            'label': this.translate.instant('MONITORING.splitter')
        }
    ];
    optionsByModule     : any;
    selectedStatistic   : any;
    availableYears      : any[]  = [];
    disableYear         : boolean = false;
    selectedModule      : string = 'verifier';
    selectedDiagramType : string = 'vertical-bar';
    selectedYear        : string = moment().format('Y');

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService
    ) {}

    ngOnInit(): void {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }
        this.optionsByModule = this.options.filter((option: any) => option.module === this.selectedModule);

        this.http.get(environment['url'] + '/ws/history/getAvailableYears', {headers: this.authService.headers}).pipe(
            tap((years: any) => {
                years.years.forEach((year: any) => {
                    this.availableYears.push(year.year);
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

    getBatchesUploadedByMonthVerifier(cpt: number) {
        this.http.get(environment['url'] + '/ws/history/list?module=verifier&submodule=upload_file&year=' + this.selectedYear, {headers: this.authService.headers}).pipe(
            tap((submodules: any) => {
                const historyCpt: any = {};
                moment.months().forEach((month: any) => {
                    historyCpt[month] = 0;
                });
                submodules.history.forEach((_submodule: any) => {
                    const format = moment().localeData().longDateFormat('L');
                    const value: any = moment(_submodule.date, format);
                    const month = value.format('MMMM');
                    historyCpt[month] += 1;
                    this.options[cpt].total += 1;
                });
                Object.keys(historyCpt).forEach((month: any) => {
                    this.options[cpt].data.push({
                        'name': month + ' ' + this.selectedYear,
                        'value': historyCpt[month]
                    });
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
    }

    getBatchesUploadedByYearVerifier(cpt: number) {
        this.http.get(environment['url'] + '/ws/history/list?module=verifier&submodule=upload_file', {headers: this.authService.headers}).pipe(
            tap((submodules: any) => {
                this.disableYear = true;
                const historyCpt: any = {};
                submodules.history.forEach((_submodule: any) => {
                    const format = moment().localeData().longDateFormat('L');
                    const value: any = moment(_submodule.date, format);
                    const year = value.format('YYYY');
                    if (!historyCpt[year]) {
                        historyCpt[year] = 0;
                    }
                    historyCpt[year] += 1;
                    this.options[cpt].total += 1;
                });

                Object.keys(historyCpt).forEach((year: any) => {
                    this.options[cpt].data.push({
                        'name': year,
                        'value': historyCpt[year]
                    });
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
    }

    getDocumentsProcessedByYearSplitter(cpt: number) {
        this.http.get(environment['url'] + '/ws/history/list?module=splitter&submodule=create_document', {headers: this.authService.headers}).pipe(
            tap((submodules: any) => {
                this.disableYear = true;
                const historyCpt: any = {};
                submodules.history.forEach((_submodule: any) => {
                    const format = moment().localeData().longDateFormat('L');
                    const value: any = moment(_submodule.date, format);
                    const year = value.format('YYYY');
                    if (!historyCpt[year]) {
                        historyCpt[year] = 0;
                    }
                    historyCpt[year] += 1;
                    this.options[cpt].total += 1;
                });

                Object.keys(historyCpt).forEach((year: any) => {
                    this.options[cpt].data.push({
                        'name': year,
                        'value': historyCpt[year]
                    });
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
    }

    getBatchesUploadedByYearSplitter(cpt: number) {
        this.http.get(environment['url'] + '/ws/history/list?module=splitter&submodule=upload_file', {headers: this.authService.headers}).pipe(
            tap((submodules: any) => {
                this.disableYear = true;
                const historyCpt: any = {};
                submodules.history.forEach((_submodule: any) => {
                    const format = moment().localeData().longDateFormat('L');
                    const value: any = moment(_submodule.date, format);
                    const year = value.format('YYYY');
                    if (!historyCpt[year]) {
                        historyCpt[year] = 0;
                    }
                    historyCpt[year] += 1;
                    this.options[cpt].total += 1;
                });

                Object.keys(historyCpt).forEach((year: any) => {
                    this.options[cpt].data.push({
                        'name': year,
                        'value': historyCpt[year]
                    });
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
    }

    getDocumentsProcessedByMonthSplitter(cpt: number) {
        this.http.get(environment['url'] + '/ws/history/list?module=splitter&submodule=create_document&year=' + this.selectedYear, {headers: this.authService.headers}).pipe(
            tap((submodules: any) => {
                const historyCpt: any = {};
                moment.months().forEach((month: any) => {
                    historyCpt[month] = 0;
                });
                submodules.history.forEach((_submodule: any) => {
                    const format = moment().localeData().longDateFormat('L');
                    const value: any = moment(_submodule.date, format);
                    const month = value.format('MMMM');
                    historyCpt[month] += 1;
                    this.options[cpt].total += 1;
                });
                Object.keys(historyCpt).forEach((month: any) => {
                    this.options[cpt].data.push({
                        'name': month + ' ' + this.selectedYear,
                        'value': historyCpt[month]
                    });
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
    }

    getBatchesUploadedByMonthSplitter(cpt: number) {
        this.http.get(environment['url'] + '/ws/history/list?module=splitter&submodule=upload_file&year=' + this.selectedYear, {headers: this.authService.headers}).pipe(
            tap((submodules: any) => {
                const historyCpt: any = {};
                moment.months().forEach((month: any) => {
                    historyCpt[month] = 0;
                });
                submodules.history.forEach((_submodule: any) => {
                    const format = moment().localeData().longDateFormat('L');
                    const value: any = moment(_submodule.date, format);
                    const month = value.format('MMMM');
                    historyCpt[month] += 1;
                    this.options[cpt].total += 1;
                });
                Object.keys(historyCpt).forEach((month: any) => {
                    this.options[cpt].data.push({
                        'name': month + ' ' + this.selectedYear,
                        'value': historyCpt[month]
                    });
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
    }

    getUserUploadedBatchesVerifier(cpt: number) {
        this.http.get(environment['url'] + '/ws/users/list_full', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.http.get(environment['url'] + '/ws/history/list?submodule=upload_file&module=verifier&year=' + this.selectedYear, {headers: this.authService.headers}).pipe(
                    tap((submodules: any) => {
                        data.users[data.users.length - 1] = {'id': 0, 'lastname': 'Upload', 'firstname': 'API'};
                        data.users.forEach((user: any) => {
                            let historyCpt = 0;
                            submodules.history.forEach((_submodule: any) => {
                                if (user.id === _submodule.user_id) {
                                    historyCpt += 1;
                                    this.options[cpt].total += 1;
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

    getUserProcessedDocumentSlitter(cpt: number) {
        this.http.get(environment['url'] + '/ws/users/list_full', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.http.get(environment['url'] + '/ws/history/list?submodule=create_document&module=splitter&year=' + this.selectedYear, {headers: this.authService.headers}).pipe(
                    tap((submodules: any) => {
                        data.users[data.users.length - 1] = {'id': 0, 'lastname': 'Upload', 'firstname': 'API'};
                        data.users.forEach((user: any) => {
                            let historyCpt = 0;
                            submodules.history.forEach((_submodule: any) => {
                                if (user.id === _submodule.user_id) {
                                    historyCpt += 1;
                                    this.options[cpt].total += 1;
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

    getWorkflowUploadedBatchesVerifier(cpt: number) {
        this.http.get(environment['url'] + '/ws/workflows/verifier/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.http.get(environment['url'] + '/ws/history/list?submodule=upload_file&module=verifier&year=' + this.selectedYear, {headers: this.authService.headers}).pipe(
                    tap((submodules: any) => {
                        data.workflows.forEach((workflow: any) => {
                            let historyCpt = 0;
                            submodules.history.forEach((_submodule: any) => {
                                if (workflow.workflow_id === _submodule.workflow_id) {
                                    historyCpt += 1;
                                    this.options[cpt].total += 1;
                                }
                            });
                            this.options[cpt].data.push({
                                'name': workflow.label,
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

    getWorkflowProcessedDocumentSplitter(cpt: number) {
        this.http.get(environment['url'] + '/ws/workflows/splitter/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.http.get(environment['url'] + '/ws/history/list?submodule=create_document&module=splitter&year=' + this.selectedYear, {headers: this.authService.headers}).pipe(
                    tap((submodules: any) => {
                        data.workflows.forEach((workflow: any) => {
                            let historyCpt = 0;
                            submodules.history.forEach((_submodule: any) => {
                                if (workflow.workflow_id === _submodule.workflow_id) {
                                    historyCpt += 1;
                                    this.options[cpt].total += 1;
                                }
                            });
                            this.options[cpt].data.push({
                                'name': workflow.label,
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

    getFormsProcessBatches(cpt: number) {
        this.http.get(environment['url'] + '/ws/forms/verifier/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.http.post(environment['url'] + '/ws/verifier/documents/list', {'status': 'END'}, {headers: this.authService.headers})
                .pipe(
                    tap((documents: any) => {
                        data.forms.forEach((form: any) => {
                            let historyCpt = 0;
                            documents.documents.forEach((document: any) => {
                                const format = moment().localeData().longDateFormat('L');
                                const value: any = moment(document.date, format);

                                if (form.id === document.form_id && value.format('YYYY') === this.selectedYear) {
                                    historyCpt += 1;
                                    this.options[cpt].total += 1;
                                }
                            });
                            this.options[cpt].data.push({
                                'name': form.label + ' (' + form.module + ')',
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

    getUsersProcessBatches(cpt: number) {
        this.http.get(environment['url'] + '/ws/users/list_full', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.http.get(environment['url'] + '/ws/history/list?submodule=document_validated&year=' + this.selectedYear, {headers: this.authService.headers}).pipe(
                    tap((submodules: any) => {
                        data.users.forEach((user: any) => {
                            let historyCpt = 0;
                            submodules.history.forEach((_submodule: any) => {
                                if (user.id === _submodule.user_id) {
                                    historyCpt += 1;
                                    this.options[cpt].total += 1;
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

    changeStatistic(event: any, reset=false) {
        this.disableYear = false;
        if (event.value) {
            this.options.forEach((option: any, cpt: number) => {
                if (option.id === event.value) {
                    this.selectedStatistic = option;
                    if (reset) {
                        option.data = [];
                    }

                    if (option.data.length === 0) {
                        this.currentData = [];
                        this.loading = true;
                        // @ts-ignore
                        this[option.function](cpt);
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

    changeModule(event: any) {
        this.selectedModule = event.value;
        this.optionsByModule = this.options.filter((option: any) => option.module === this.selectedModule);
    }

    changeYear(event: any) {
        this.selectedYear = event.value;
        this.changeStatistic({value: this.selectedStatistic.id}, true);
    }
}
