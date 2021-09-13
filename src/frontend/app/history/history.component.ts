import { Component, OnInit } from '@angular/core';
import {SettingsService} from "../../services/settings.service";
import {TranslateService} from "@ngx-translate/core";
import {FormControl} from "@angular/forms";
import {API_URL} from "../env";
import {catchError, finalize, map, startWith, tap} from "rxjs/operators";
import {Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../services/auth.service";
import {NotificationService} from "../../services/notifications/notifications.service";
import {Sort} from "@angular/material/sort";
import { DatePipe } from '@angular/common';
import * as moment from "moment";

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    providers: [DatePipe]
})
export class HistoryComponent implements OnInit {
    filteredUsers   : Observable<any> | undefined;
    columnsToDisplay: string[] = ['id', 'history_module', 'history_submodule', 'history_date', 'user_info', 'history_desc', 'user_ip'];
    loading         : boolean  = true;
    toHighlight     : string   = '';
    pageSize        : number   = 10;
    pageIndex       : number   = 0;
    total           : number   = 0;
    offset          : number   = 0;
    history         : any;
    form            : any[]    = [
        {
            'id': 'user_id',
            'type': 'autocomplete',
            'label': this.translate.instant('HISTORY.user'),
            'control': new FormControl(),
            'values': []
        },
        {
            'id': 'module',
            'label': this.translate.instant('HISTORY.module'),
            'type': 'select',
            'control': new FormControl(),
            'values': [
                {
                    'id': 'general',
                    'label': this.translate.instant('HISTORY.general')
                },
                {
                    'id': 'verifier',
                    'label': this.translate.instant('HOME.verifier')
                },
                {
                    'id': 'splitter',
                    'label': this.translate.instant('HOME.splitter')
                }
            ]
        },
        {
            'id': 'submodule',
            'type': 'select',
            'label': this.translate.instant('HISTORY.submodule'),
            'control': new FormControl(),
            'values': []
        },
    ];

    constructor(
        private http: HttpClient,
        private datePipe: DatePipe,
        private authService: AuthService,
        private notify: NotificationService,
        private translate: TranslateService,
        public serviceSettings: SettingsService,
    ) {}

    private _filter(value: any, array: any) {
        if (typeof value === 'string') {
            this.toHighlight = value;
            const filterValue = value.toLowerCase();
            return array.filter((option: any) => option.value.toLowerCase().indexOf(filterValue) !== -1);
        }else {
            return array;
        }
    }

    ngOnInit(): void {
        this.http.get(API_URL + '/ws/users/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.form.forEach((element: any) => {
                    if (element.id === 'user_id') {
                        this.filteredUsers = element.control.valueChanges
                            .pipe(
                                startWith(''),
                                map(option => option ? this._filter(option, data.users) : data.users)
                            );
                    } else if (element.id === 'submodule') {
                        this.http.get(API_URL + '/ws/history/submodules', {headers: this.authService.headers}).pipe(
                            tap((data: any) => {
                                element.values = data['history'];
                            }),
                            catchError((err: any) => {
                                console.debug(err);
                                this.notify.handleErrors(err);
                                return of(false);
                            })
                        ).subscribe();
                    }
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        this.loadHistory();
    }

    loadHistory() {
        this.http.get(API_URL + '/ws/history/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.history[0]) this.total = data.history[0].total;
                this.history = data.history;
                this.form.forEach((element: any) => {
                    if (element.id === 'module') {
                        element.values.forEach((module: any) => {
                            this.history.forEach((history: any) => {
                                if (history.history_module === module.id) {
                                    history.history_module = this.translate.instant(module.label);
                                }
                            });
                        });
                    }
                });

                this.history.forEach((element: any) => {
                    const format = moment().localeData().longDateFormat('L');
                    element.history_date = this.datePipe.transform(element.history_date, format + ' ' + this.translate.instant('GLOBAL.at') + ' HH:MM');
                });
            }),
            finalize(() => {this.loading = false;}),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.loadHistory();
    }

    displayFn(option: any) {
        return option ? option.lastname + ' ' + option.firstname + ' (' + option.username + ')' : '';
    }

    sortData(sort: Sort) {
        const data = this.history.slice();
        if(!sort.active || sort.direction === '') {
            this.history = data;
            return;
        }

        this.history = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'history_module': return this.compare(a.history_module, b.history_module, isAsc);
                case 'history_submodule': return this.compare(a.history_submodule, b.history_submodule, isAsc);
                case 'history_date': return this.compare(a.history_date, b.history_date, isAsc);
                case 'user_info': return this.compare(a.user_info, b.user_info, isAsc);
                case 'history_desc': return this.compare(a.history_desc, b.history_desc, isAsc);
                case 'user_ip': return this.compare(a.user_ip, b.user_ip, isAsc);
                default: return 0;
            }
        });
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
