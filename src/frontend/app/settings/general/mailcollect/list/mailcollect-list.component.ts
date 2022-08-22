import { Component, OnInit } from '@angular/core';
import { SettingsService } from "../../../../../services/settings.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "../../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { environment } from "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import { FormControl } from '@angular/forms';
import { Sort } from "@angular/material/sort";
import {LocalStorageService} from "../../../../../services/local-storage.service";
import {LastUrlService} from "../../../../../services/last-url.service";
import {ConfirmDialogComponent} from "../../../../../services/confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {HistoryService} from "../../../../../services/history.service";

@Component({
    selector: 'app-mailcollect',
    templateUrl: './mailcollect-list.component.html',
    styleUrls: ['./mailcollect-list.component.scss']
})
export class MailcollectListComponent implements OnInit {
    columnsToDisplay    : string[]      = ['id', 'process_id', 'process_folder_in', 'process_folder_out', 'process_action', 'actions'];
    headers             : HttpHeaders   = this.authService.headers;
    loading             : boolean       = true;
    processesMail       : any           = [];
    allprocessesMail    : any           = [];
    pageSize            : number        = 10;
    pageIndex           : number        = 0;
    total               : number        = 0;
    offset              : number        = 0;
    search              : string        = '';
    globalForm          : any []        = [
        {
            id: 'batchPath',
            control: new FormControl(),
            label: marker('MAILCOLLECT.batch_path'),
            type: 'text',
            required: true,
        },
        {
            id: 'smtpDelay',
            control: new FormControl(),
            label: marker('MAILCOLLECT.smtp_delay'),
            type: 'number',
            required: true,
        },
        {
            id: 'smtpNotifOnError',
            control: new FormControl(),
            label: marker('MAILCOLLECT.smtp_notif_on_error'),
            type: 'boolean',
            required: true,
        },
        {
            id: 'smtpSSL',
            control: new FormControl(),
            label: marker('MAILCOLLECT.smtp_ssl'),
            type: 'boolean',
            required: true,
        },
        {
            id: 'smtpStartTLS',
            control: new FormControl(),
            label: marker('MAILCOLLECT.smtp_starttls'),
            type: 'boolean',
            required: true,
        },
        {
            id: 'smtpHost',
            control: new FormControl(),
            label: marker('MAILCOLLECT.smtp_host'),
            type: 'text',
            required: true,
        },
        {
            id: 'smtpPort',
            control: new FormControl(),
            label: marker('MAILCOLLECT.smtp_port'),
            type: 'text',
            required: true,
        },
        {
            id: 'smtpLogin',
            control: new FormControl(),
            label: marker('MAILCOLLECT.smtp_login'),
            type: 'text',
            required: true,
        },
        {
            id: 'smtpPwd',
            control: new FormControl(),
            label: marker('MAILCOLLECT.smtp_pwd'),
            type: 'password',
            required: true,
        },
        {
            id: 'smtpFromMail',
            control: new FormControl(),
            label: marker('MAILCOLLECT.smtp_from_mail'),
            type: 'text',
            required: true,
        },
        {
            id: 'smtpDestAdminMail',
            control: new FormControl(),
            label: marker('MAILCOLLECT.smtp_dest_admin_mail'),
            type: 'text',
            required: true,
        }
    ];

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        private historyService: HistoryService,
        public serviceSettings: SettingsService,
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localStorageService: LocalStorageService
    ) { }

    ngOnInit(): void {
        this.serviceSettings.init();

        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('settings/general/mailcollect') || lastUrl === '/') {
            if (this.localStorageService.get('mailCollectPageIndex'))
                this.pageIndex = parseInt(this.localStorageService.get('mailCollectPageIndex') as string);
            this.offset = this.pageSize * (this.pageIndex);
        } else
            this.localStorageService.remove('mailCollectPageIndex');

        this.http.get(environment['url'] + '/ws/config/getConfiguration/mailCollectGeneral', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.configuration.length === 1) {
                    Object.keys(data.configuration[0].data.value).forEach((config: any ) => {
                        this.globalForm.forEach((element: any) => {
                            if (element.id === config) {
                                if (data.configuration[0].data.value[config]) {
                                    element.control.setValue(data.configuration[0].data.value[config]);
                                }
                            }
                        });
                    });
                }
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadProcess() {
        console.log('here');
    }

    deleteProcess(processId: number) {
        console.log('heaaa');
    }

    searchProcess(event: any) {
        this.search = event.target.value;
        this.loadProcess();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.pageIndex = event.pageIndex;
        this.localStorageService.save('mailCollectPageIndex', event.pageIndex);
        this.loadProcess();
    }

    sortData(sort: Sort) {
        const data = this.allprocessesMail.slice();
        if (!sort.active || sort.direction === '') {
            this.processesMail = data.splice(0, this.pageSize);
            return;
        }

        this.processesMail = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'docserver_id': return this.compare(a.docserver_id, b.docserver_id, isAsc);
                case 'description': return this.compare(a.description, b.description, isAsc);
                default: return 0;
            }
        });
        this.processesMail = this.processesMail.splice(0, this.pageSize);
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    getErrorMessage(field: any) {
        let error: any;
        this.globalForm.forEach(element => {
            if (element.id === field) {
                if (element.required && !(element.value || element.control.value)) {
                    error = this.translate.instant('AUTH.field_required');
                }
            }
        });
        return error;
    }

    deleteConfirmDialog(processId: number, process: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('MAILCOLLECT.confirm_delete_process', {"process": process}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteProcess(processId);
                this.historyService.addHistory('accounts', 'delete_customer', this.translate.instant('HISTORY-DESC.delete-process-mailcollect', {process: process}));
            }
        });
    }
}
