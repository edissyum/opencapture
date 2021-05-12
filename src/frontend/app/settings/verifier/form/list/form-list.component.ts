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
import {ConfirmDialogComponent} from "../../../../../services/confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";

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
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        public userService: UserService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
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

        this.loadForms()
    }

    onPageChange(event: any){
        this.pageSize = event.pageSize
        this.offset = this.pageSize * (event.pageIndex)
        this.localeStorageService.save('formsPageIndex', event.pageIndex)
        this.loadForms()
    }

    loadForms(): void {
        this.loading = true
        this.http.get(API_URL + '/ws/forms/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.total = data.forms[0].total
                this.forms = data.forms;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    deleteConfirmDialog(form_id: number, form: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('FORMS.confirm_delete', {"form": form}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.deleteForm(form_id)
            }
        });
    }

    disableConfirmDialog(form_id: number, form: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('FORMS.confirm_disable', {"form": form}),
                confirmButton       : this.translate.instant('GLOBAL.disable'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.disableForm(form_id)
            }
        });
    }

    enableConfirmDialog(form_id: number, form: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('FORMS.confirm_enable', {"form": form}),
                confirmButton       : this.translate.instant('GLOBAL.enable'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result){
                this.enableForm(form_id)
            }
        });
    }

    deleteForm(form_id: number){
        if (form_id !== undefined){
            this.http.delete(API_URL + '/ws/forms/delete/' + form_id, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadForms()
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe()
        }
    }

    disableForm(form_id: number){
        if (form_id !== undefined){
            this.http.put(API_URL + '/ws/forms/disable/' + form_id, null, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadForms()
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe()
        }
    }

    enableForm(forms_id: number){
        if (forms_id !== undefined){
            this.http.put(API_URL + '/ws/forms/enable/' + forms_id, null, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadForms()
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe()
        }
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
