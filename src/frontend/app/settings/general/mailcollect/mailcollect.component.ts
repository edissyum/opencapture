import { Component, OnInit } from '@angular/core';
import { SettingsService } from "../../../../services/settings.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { environment } from "../../../env";
import {catchError, finalize, map, startWith, tap} from "rxjs/operators";
import {Observable, of} from "rxjs";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import { FormControl } from '@angular/forms';
import { Sort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { HistoryService } from "../../../../services/history.service";
import { LastUrlService } from "../../../../services/last-url.service";
import { LocalStorageService } from "../../../../services/local-storage.service";
import { ConfirmDialogComponent } from "../../../../services/confirm-dialog/confirm-dialog.component";

@Component({
    selector: 'app-mailcollect',
    templateUrl: './mailcollect.component.html',
    styleUrls: ['./mailcollect.component.scss']
})

export class MailCollectComponent implements OnInit {
    headers             : HttpHeaders   = this.authService.headers;
    loading             : boolean       = true;
    folderLoading       : boolean       = false;
    processLoading      : boolean       = false;
    allCustomers        : any           = [];
    allForms            : any           = [];
    allSplitterInputs   : any           = [];
    processesMail       : any           = [];
    allprocessesMail    : any           = [];
    pageSize            : number        = 10;
    pageIndex           : number        = 0;
    total               : number        = 0;
    offset              : number        = 0;
    search              : string        = '';
    globalForm          : any[]         = [
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
    processes           : any           = [];
    defaultProcessData  : any           = [
        {
            id: 'name',
            control: new FormControl(),
        },
        {
            id: 'hostname',
            class: 'w-1/4',
            control: new FormControl(),
            label: marker('MAILCOLLECT.hostname'),
            type: 'text',
            required: true,
        },
        {
            id: 'port',
            class: 'w-1/4',
            control: new FormControl(),
            label: marker('MAILCOLLECT.port'),
            type: 'text',
            required: true,
        },
        {
            id: 'login',
            class: 'w-1/4',
            control: new FormControl(),
            label: marker('FORMATS.email'),
            type: 'text',
            required: true,
        },
        {
            id: 'password',
            class: 'w-1/4',
            control: new FormControl(),
            label: marker('USER.password'),
            type: 'password',
            required: true,
        },
        {
            id: 'secured_connection',
            class: 'w-1/5',
            control: new FormControl(),
            label: marker('MAILCOLLECT.secured_connection'),
            type: 'boolean',
            required: true,
        },
        {
            id: 'is_splitter',
            class: 'w-1/5',
            control: new FormControl(false),
            label: marker('MAILCOLLECT.is_splitter'),
            type: 'boolean',
            required: false,
        },
        {
            id: 'splitter_technical_input_id',
            class: 'w-30',
            control: new FormControl(''),
            label: marker('MAILCOLLECT.splitter_technical_input_id'),
            type: 'autocomplete',
            required: false,
        },
        {
            id: 'folder_to_crawl',
            class: 'w-30',
            hint: marker('MAILCOLLECT.load_folders_first'),
            control: new FormControl(),
            label: marker('MAILCOLLECT.folder_to_crawl'),
            type: 'autocomplete',
            required: true,
        },
        {
            id: 'folder_destination',
            class: 'w-1/5',
            hint: marker('MAILCOLLECT.load_folders_first'),
            control: new FormControl(),
            label: marker('MAILCOLLECT.folder_destination'),
            type: 'autocomplete',
            required: true,
        },
        {
            id: 'folder_trash',
            class: 'w-1/5',
            hint: marker('MAILCOLLECT.load_folders_first'),
            control: new FormControl(),
            label: marker('MAILCOLLECT.folder_trash'),
            type: 'autocomplete',
            required: true,
        },
        {
            id: 'action_after_process',
            class: 'w-1/5',
            control: new FormControl(''),
            label: marker('MAILCOLLECT.action_after_process'),
            type: 'select',
            values: ['move', 'delete', 'none'],
            required: true,
        },
        {
            id: 'verifier_customer_id',
            class: 'w-1/5',
            control: new FormControl(),
            label: marker('INPUT.associated_customer'),
            type: 'autocomplete',
            required: false,
        },
        {
            id: 'verifier_form_id',
            class: 'w-1/5',
            control: new FormControl(),
            label: marker('POSITIONS-MASKS.form_associated'),
            type: 'autocomplete',
            required: false,
        }
    ];
    toHighlight         : string        = '';
    folders             : any[]         = [];

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
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/accounts/customers/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allCustomers = data.customers;
                this.defaultProcessData.forEach((element: any) => {
                    if (element.id === 'verifier_customer_id') {
                        element.values = element.control.valueChanges
                            .pipe(
                                startWith(''),
                                map(option => option ? this._filter(option, this.allCustomers) : this.allCustomers)
                            );
                    }
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/forms/list?module=verifier', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allForms = data.forms;
                this.defaultProcessData.forEach((element: any) => {
                    if (element.id === 'verifier_form_id') {
                        element.values = element.control.valueChanges
                            .pipe(
                                startWith(''),
                                map(option => option ? this._filter(option, this.allForms) : this.allForms)
                            );
                    }
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        this.http.get(environment['url'] + '/ws/inputs/list?module=splitter', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allSplitterInputs = data.inputs;
                this.defaultProcessData.forEach((element: any) => {
                    if (element.id === 'splitter_technical_input_id') {
                        element.values = element.control.valueChanges
                            .pipe(
                                startWith(''),
                                map(option => option ? this._filter(option, this.allSplitterInputs) : this.allSplitterInputs)
                            );
                    }
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();

        setTimeout(() => {
            this.loadProcess();
        });
    }

    displayFn(option: any) {
        if (option) return option.name ? option.name : option.label ? option.label : option.input_label;
        return '';
    }

    loadProcess() {
        this.http.get(environment['url'] + '/ws/mailcollect/getProcesses', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.processes.forEach((process: any) => {
                    const new_process: any = [];
                    this.defaultProcessData.forEach((process_default: any) => {
                        Object.keys(process).forEach((element: any) => {
                            if (element === process_default.id) {
                                let value = process[element];
                                if (element === 'verifier_customer_id') {
                                    for (let i = 0; i < this.allCustomers.length; i++) {
                                        if (parseInt(this.allCustomers[i].id) === parseInt(process[element])) {
                                            value = this.allCustomers[i];
                                        }
                                    }
                                } else if (element === 'verifier_form_id') {
                                    for (let i = 0; i < this.allForms.length; i++) {
                                        if (parseInt(this.allForms[i].id) === parseInt(process[element])) {
                                            value = this.allForms[i];
                                        }
                                    }
                                } else if (element === 'splitter_technical_input_id') {
                                    for (let i = 0; i < this.allSplitterInputs.length; i++) {
                                        if (parseInt(this.allSplitterInputs[i].id) === parseInt(process[element])) {
                                            value = this.allSplitterInputs[i];
                                        }
                                    }
                                }
                                process_default.control.setValue(value);
                                new_process.push(process_default);
                            }
                        });
                    });
                    this.processes.push(new_process);
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

    getNameOfProcess(process: any) {
        let name = '';
        process.forEach((element: any) => {
            if (element.id === 'name') {
                name = element.control.value;
            }
        });
        return name;
    }

    deleteProcess(processId: number) {
        console.log('heaaa');
    }

    updateProcess(process: any) {
        this.processLoading = true;

        const data: any = {};
        process.forEach((element: any) => {
            if (element.id !== 'verifier_customer_id' && element.id !== 'verifier_form_id' && element.id !== 'splitter_technical_input_id') {
                data[element.id] = element.control.value;
            } else {
                data[element.id] = element.control.value ? element.control.value.id : null;
            }
        });

        this.http.post(environment['url'] + '/ws/mailcollect/updateProcess/' + data['name'], data, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.notify.success(this.translate.instant('MAILCOLLECT.process_updated'));
            }),
            finalize(() => this.processLoading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    retrieveFolders(process: any) {
        this.folderLoading = true;
        let port = '';
        let login = '';
        let hostname = '';
        let password = '';
        let secured_connection = '';
        process.forEach((element: any) => {
            if (element.id === 'hostname') {
                hostname = element.control.value;
            }
            if (element.id === 'port') {
                port = element.control.value;
            }
            if (element.id === 'secured_connection') {
                secured_connection = element.control.value;
            }
            if (element.id === 'login') {
                login = element.control.value;
            }
            if (element.id === 'password') {
                password = element.control.value;
            }
        });

        if (hostname && login && password) {
            const data = {
                'port': port,
                'login': login,
                'hostname': hostname,
                'password': password,
                'secured_connection': secured_connection
            };

            this.http.post(environment['url'] + '/ws/mailcollect/retrieveFolders', data, {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    this.folders = data;
                    process.forEach((element: any) => {
                        if (element.id === 'folder_trash' || element.id === 'folder_to_crawl' || element.id === 'folder_destination') {
                            element.values = element.control.valueChanges
                                .pipe(
                                    startWith(''),
                                    map(option => option ? this._filter(option, this.folders) : this.folders)
                                );
                        }
                    });
                    this.notify.success(this.translate.instant('MAILCOLLECT.folders_updated'));
                }),
                finalize(() => this.folderLoading = false),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        } else {
            this.folderLoading = false;
        }
    }

    private _filter(value: any, array: any) {
        if (typeof value === 'string') {
            this.toHighlight = value;
            const filterValue = value.toLowerCase();
            return array.filter((option: any) => option.toLowerCase().indexOf(filterValue) !== -1);
        } else {
            return array;
        }
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
