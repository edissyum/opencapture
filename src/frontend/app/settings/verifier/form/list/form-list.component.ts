import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../../../services/auth.service";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {LastUrlService} from "../../../../../services/last-url.service";
import {LocalStorageService} from "../../../../../services/local-storage.service";
import {Sort} from "@angular/material/sort";

@Component({
    selector: 'app-list',
    templateUrl: './form-list.component.html',
    styleUrls: ['./form-list.component.scss']
})
export class FormListComponent implements OnInit {
    loading: boolean            = true
    columnsToDisplay: string[]  = ['id', 'label', 'default', 'enabled', 'actions'];
    pageSize : number           = 10;
    pageIndex: number           = 0;
    total: number               = 0;
    offset: number              = 0;
    forms : any                 = [];

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
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localeStorageService: LocalStorageService,
    ) {
    }

    ngOnInit(): void {
        this.serviceSettings.init()
        let lastUrl = this.routerExtService.getPreviousUrl()
        if (lastUrl.includes('settings/verifier/forms') || lastUrl == '/'){
            if (this.localeStorageService.get('formsPageIndex'))
                this.pageIndex = parseInt(<string>this.localeStorageService.get('formsPageIndex'))
            this.offset = this.pageSize * (this.pageIndex)
        }else
            this.localeStorageService.remove('formsPageIndex')

        this.http.get(API_URL + '/ws/forms/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.forms = data.roles
                this.loadforms()
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    onPageChange(event: any){
        this.pageSize = event.pageSize
        this.offset = this.pageSize * (event.pageIndex)
        this.localeStorageService.save('formsPageIndex', event.pageIndex)
        this.loadforms()
    }

    loadforms(): void{
        this.http.get(API_URL + '/ws/forms/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.total = data.forms[0].total
                this.forms = data.forms;
                console.log(this.forms)
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    sortData(sort: Sort){
        let data = this.forms.slice()
        if(!sort.active || sort.direction === ''){
            this.forms = data
            return;
        }

        this.forms = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'label': return this.compare(a.label, b.label, isAsc);
                case 'default': return this.compare(a.default, b.default, isAsc);
                case 'enabled': return this.compare(a.enabled, b.enabled, isAsc);
                default: return 0;
            }
        });

    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

}
