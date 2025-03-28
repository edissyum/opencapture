/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Component, OnInit } from '@angular/core';
import { SettingsService } from "../../../../services/settings.service";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "../../../../services/auth.service";
import { _, TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { PrivilegesService } from "../../../../services/privileges.service";
import { environment } from "../../../env";
import { catchError, finalize, map, startWith, tap } from "rxjs/operators";
import { of } from "rxjs";
import { FormControl } from '@angular/forms';
import { Sort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../../../services/confirm-dialog/confirm-dialog.component";

@Component({
    selector: 'app-mailcollect',
    templateUrl: './mailcollect.component.html',
    styleUrls: ['./mailcollect.component.scss'],
    standalone: false
})

export class MailCollectComponent implements OnInit {
    headers             : HttpHeaders   = this.authService.headers;
    loading             : boolean       = true;
    folderLoading       : boolean       = false;
    processLoading      : boolean       = false;
    loadingProcessName  : boolean       = false;
    formValid           : { [key: string]: boolean; } = {};
    allVerifierWorkflows: any           = [];
    allSplitterWorkflows: any           = [];
    processesMail       : any           = [];
    allprocessesMail    : any           = [];
    processes           : any           = [];
    pageSize            : number        = 10;
    pageIndex           : number        = 0;
    total               : number        = 0;
    offset              : number        = 0;
    selectedIndex       : number        = 0;
    search              : string        = '';
    defaultProcessData  : any           = [
        {
            id: 'verifier_insert_body_as_doc',
            unit: 'verifier',
            control: new FormControl(false),
            label: _('MAILCOLLECT.insert_body_as_doc'),
            hint: _('MAILCOLLECT.insert_body_as_doc_hint'),
            type: 'boolean',
            required: false
        },
        {
            id: 'splitter_insert_body_as_doc',
            unit: 'splitter',
            control: new FormControl(false),
            label: _('MAILCOLLECT.insert_body_as_doc'),
            hint: _('MAILCOLLECT.insert_body_as_doc_hint'),
            type: 'boolean',
            required: false
        },
        {
            id: 'name',
            control: new FormControl()
        },
        {
            id: 'secured_connection',
            unit: 'general',
            control: new FormControl(true),
            label: _('MAILCOLLECT.secured_connection'),
            type: 'boolean',
            required: false
        },
        {
            id: 'options',
            unit: 'general',
            control: new FormControl(),
            label: _('MAILCOLLECT.methods'),
            type: 'select',
            required: true,
            values: [
                {
                    id: 'imap',
                    label: _('MAILCOLLECT.imap'),
                    "options": {
                        "hostname"  : {
                            id: 'hostname',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl(),
                            label: _('MAILCOLLECT.hostname'),
                            type: 'text',
                            required: true
                        },
                        "port"      : {
                            id: 'port',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl(),
                            label: _('MAILCOLLECT.port'),
                            type: 'number',
                            required: true
                        },
                        "login"     : {
                            id: 'login',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl(),
                            label: _('FORMATS.email'),
                            type: 'text',
                            required: true
                        },
                        "password"  : {
                            id: 'password',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl(),
                            label: _('USER.password'),
                            type: 'password',
                            required: true
                        }
                    }
                },
                {
                    id: 'graphql',
                    label: _('MAILCOLLECT.graphql'),
                    "options": {
                        "grant_type"    : {
                            id: 'grant_type',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl('client_credentials'),
                            label: _('MAILCOLLECT.grant_type'),
                            type: 'text',
                            required: true
                        },
                        "scope"         : {
                            id: 'scope',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl('https://graph.microsoft.com/.default'),
                            label: _('MAILCOLLECT.scope'),
                            type: 'text',
                            required: true
                        },
                        "users_url"     : {
                            id: 'users_url',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl('https://graph.microsoft.com/v1.0/users'),
                            label: _('MAILCOLLECT.users_url'),
                            type: 'text',
                            required: true
                        },
                        "message_url"   : {
                            id: 'message_url',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl('https://graph.microsoft.com/v1.0/me/messages'),
                            label: _('MAILCOLLECT.message_url'),
                            type: 'text',
                            required: true
                        },
                        "get_token_url" : {
                            id: 'get_token_url',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl("https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"),
                            label: _('MAILCOLLECT.get_token_url'),
                            type: 'text',
                            required: true
                        },
                        "client_secret" : {
                            id: 'client_secret',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl(),
                            label: _('MAILCOLLECT.secret'),
                            type: 'text',
                            required: true
                        },
                        "tenant_id"     : {
                            id: 'tenant_id',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl(),
                            label: _('MAILCOLLECT.tenant_id'),
                            type: 'text',
                            required: true
                        },
                        "client_id"     : {
                            id: 'client_id',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl(),
                            label: _('MAILCOLLECT.client_id'),
                            type: 'text',
                            required: true
                        }
                    }
                },
                {
                    id: 'oauth',
                    label: _('MAILCOLLECT.oauth'),
                    "options": {
                        "hostname"  : {
                            id: 'hostname',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl('outlook.office365.com'),
                            label: _('MAILCOLLECT.hostname'),
                            type: 'text',
                            required: true
                        },
                        "login"     : {
                            id: 'login',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl(),
                            label: _('FORMATS.email'),
                            type: 'text',
                            required: true
                        },
                        "scopes"    : {
                            id: 'scopes',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl('https://outlook.office.com/.default'),
                            label: _('MAILCOLLECT.scopes'),
                            type: 'text',
                            required: true
                        },
                        "authority" : {
                            id: 'authority',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl('https://login.microsoftonline.com/'),
                            label: _('MAILCOLLECT.authority'),
                            type: 'text',
                            required: true
                        },
                        "secret"    : {
                            id: 'secret',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl(),
                            label: _('MAILCOLLECT.secret'),
                            type: 'text',
                            required: true
                        },
                        "tenant_id" : {
                            id: 'tenant_id',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl(),
                            label: _('MAILCOLLECT.tenant_id'),
                            type: 'text',
                            required: true
                        },
                        "client_id" : {
                            id: 'client_id',
                            fromMethod: true,
                            unit: 'general',
                            control: new FormControl(),
                            label: _('MAILCOLLECT.client_id'),
                            type: 'text',
                            required: true
                        }
                    }
                }
            ]
        },
        {
            id: 'enabled',
            control: new FormControl(),
            disabled: true,
            type: 'boolean',
            required: false
        },
        {
            id: 'verifier_workflow_id',
            unit: 'verifier',
            control: new FormControl(),
            label: _('WORKFLOW.id'),
            type: 'autocomplete',
            required: false
        },
        {
            id: 'is_splitter',
            unit: 'splitter',
            control: new FormControl(false),
            label: _('MAILCOLLECT.is_splitter'),
            type: 'boolean',
            required: false
        },
        {
            id: 'splitter_workflow_id',
            unit: 'splitter',
            control: new FormControl(''),
            label: _('MAILCOLLECT.splitter_workflow_id'),
            type: 'autocomplete',
            required: false
        },
        {
            id: 'folder_to_crawl',
            unit: 'folders',
            hint: _('MAILCOLLECT.load_folders_first'),
            control: new FormControl(),
            label: _('MAILCOLLECT.folder_to_crawl'),
            type: 'autocomplete',
            required: true
        },
        {
            id: 'folder_destination',
            unit: 'folders',
            hint: _('MAILCOLLECT.load_folders_first'),
            control: new FormControl(),
            label: _('MAILCOLLECT.folder_destination'),
            type: 'autocomplete',
            required: true
        },
        {
            id: 'folder_trash',
            unit: 'folders',
            hint: _('MAILCOLLECT.load_folders_first'),
            control: new FormControl(),
            label: _('MAILCOLLECT.folder_trash'),
            type: 'autocomplete',
            required: false
        },
        {
            id: 'action_after_process',
            unit: 'folders',
            control: new FormControl(''),
            label: _('MAILCOLLECT.action_after_process'),
            type: 'select',
            values: [
                {
                    id: 'move',
                    label: _('MAILCOLLECT.move')
                },
                {
                    id: 'delete',
                    label: _('MAILCOLLECT.delete')
                },
                {
                    id: 'none',
                    label: _('MAILCOLLECT.none')
                }
            ],
            required: true
        }
    ];
    toHighlight         : string        = '';
    folders             : any[]         = [];
    units               : any           = [
        {
            id: 'general',
            label: _('MAILCOLLECT.general')
        },
        {
            id: 'folders',
            label: _('MAILCOLLECT.folders')
        },
        {
            id: 'verifier',
            label: _('MAILCOLLECT.verifier')
        },
        {
            id: 'splitter',
            label: _('MAILCOLLECT.splitter')
        }
    ];

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
    ) { }

    ngOnInit(): void {
        this.serviceSettings.init();

        this.http.get(environment['url'] + '/ws/workflows/verifier/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allVerifierWorkflows = data.workflows;
                this.defaultProcessData.forEach((element: any) => {
                    if (element.id === 'verifier_workflow_id') {
                        element.values = element.control.valueChanges.pipe(
                            startWith(''),
                            map(option => option ? this._filter(option, this.allVerifierWorkflows) : this.allVerifierWorkflows)
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

        this.http.get(environment['url'] + '/ws/workflows/splitter/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.allSplitterWorkflows = data.workflows;
                this.defaultProcessData.forEach((element: any) => {
                    if (element.id === 'splitter_workflow_id') {
                        element.values = element.control.valueChanges.pipe(
                            startWith(''),
                            map(option => option ? this._filter(option, this.allSplitterWorkflows) : this.allSplitterWorkflows)
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

    processIsEnabled(process: any) {
        let enabled = false;
        process.forEach((element: any) => {
            if (element.id === 'enabled') {
                enabled = element.control.value;
            }
        });
        return enabled;
    }

    updateProcessName(process: any, new_process_name: any, updateDatabase: boolean = true) {
        if (new_process_name) {
            this.loadingProcessName = true;
            this.formValid[new_process_name] = false;
            let oldProcessName = '';
            process.forEach((element: any) => {
                if (element.id === 'name') {
                    oldProcessName = element.control.value;
                    element.control.setValue(new_process_name);
                }
            });
            if (updateDatabase && oldProcessName) {
                this.http.post(environment['url'] + '/ws/mailcollect/updateProcessName/' + oldProcessName, {"name": new_process_name}, {headers: this.authService.headers}).pipe(
                    tap(() => {
                        this.notify.success(this.translate.instant('MAILCOLLECT.process_name_updated'));
                    }),
                    finalize(() => {
                        this.loadingProcessName = false;
                        process.edit_name = false;
                    }),
                    catchError((err: any) => {
                        console.debug(err);
                        this.notify.handleErrors(err);
                        return of(false);
                    })
                ).subscribe();
            }
        }
    }

    displayFn(option: any) {
        if (option) {
            return option.name ? option.name : option.label ? option.label : option.input_label;
        }
        return '';
    }

    addProcess() {
        const newProcess: any = [];
        this.defaultProcessData.forEach((process_default: any) => {
            newProcess.push(process_default);
        });
        this.processes.push(newProcess);
    }

    loadProcess() {
        this.processes = [];
        this.http.get(environment['url'] + '/ws/mailcollect/getProcesses', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                data.processes.forEach((process: any) => {
                    const newProcess: any = [];
                    let method_enabled = 'imap';
                    this.defaultProcessData.forEach((process_default: any) => {
                        Object.keys(process).forEach((element: any) => {
                            if (element === process_default.id) {
                                let value = process[element];
                                if (element === 'name') {
                                    this.formValid[value] = true;
                                } else if (element === 'verifier_workflow_id') {
                                    for (let i = 0; i < this.allVerifierWorkflows.length; i++) {
                                        if (this.allVerifierWorkflows[i].workflow_id === process[element]) {
                                            value = this.allVerifierWorkflows[i];
                                        }
                                    }
                                } else if (element === 'splitter_workflow_id') {
                                    for (let i = 0; i < this.allSplitterWorkflows.length; i++) {
                                        if (this.allSplitterWorkflows[i].workflow_id === process[element]) {
                                            value = this.allSplitterWorkflows[i];
                                        }
                                    }
                                } else if (element === 'folder_trash' || element === 'folder_to_crawl' || element === 'folder_destination') {
                                    value = {id: process[element], label: process[element]};
                                } else if (element === 'options') {
                                    value = process['method'];
                                    method_enabled = process['method'];
                                    Array.from(Object.keys(process_default.values)).forEach((cpt: any) => {
                                        if (process_default.values[cpt].id == method_enabled) {
                                            Array.from(Object.keys(process_default.values[cpt].options)).forEach((option: any) => {
                                                let value = process_default.values[cpt].options[option];
                                                if (process[element][option]) {
                                                    value.control.setValue(process[element][option]);
                                                }
                                            })
                                        }
                                    });
                                }
                                process_default.control.setValue(value);
                                newProcess.push(process_default);
                            }
                        });
                    });
                    newProcess.exists = true;
                    this.resetDefaultData();
                    this.processes.push(newProcess);
                    this.changeMethod(method_enabled, newProcess);
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

    resetDefaultData() {
        this.defaultProcessData = [
            {
                id: 'verifier_insert_body_as_doc',
                unit: 'verifier',
                control: new FormControl(false),
                label: _('MAILCOLLECT.insert_body_as_doc'),
                hint: _('MAILCOLLECT.insert_body_as_doc_hint'),
                type: 'boolean',
                required: false
            },
            {
                id: 'splitter_insert_body_as_doc',
                unit: 'splitter',
                control: new FormControl(false),
                label: _('MAILCOLLECT.insert_body_as_doc'),
                hint: _('MAILCOLLECT.insert_body_as_doc_hint'),
                type: 'boolean',
                required: false
            },
            {
                id: 'name',
                control: new FormControl()
            },
            {
                id: 'secured_connection',
                unit: 'general',
                control: new FormControl(true),
                label: _('MAILCOLLECT.secured_connection'),
                type: 'boolean',
                required: false
            },
            {
                id: 'options',
                unit: 'general',
                control: new FormControl(),
                label: _('MAILCOLLECT.methods'),
                type: 'select',
                required: true,
                values: [
                    {
                        id: 'imap',
                        label: _('MAILCOLLECT.imap'),
                        "options": {
                            "hostname"  : {
                                id: 'hostname',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl(),
                                label: _('MAILCOLLECT.hostname'),
                                type: 'text',
                                required: true
                            },
                            "port"      : {
                                id: 'port',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl(),
                                label: _('MAILCOLLECT.port'),
                                type: 'number',
                                required: true
                            },
                            "login"     : {
                                id: 'login',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl(),
                                label: _('FORMATS.email'),
                                type: 'text',
                                required: true
                            },
                            "password"  : {
                                id: 'password',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl(),
                                label: _('USER.password'),
                                type: 'password',
                                required: true
                            }
                        }
                    },
                    {
                        id: 'graphql',
                        label: _('MAILCOLLECT.graphql'),
                        "options": {
                            "grant_type"    : {
                                id: 'grant_type',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl('client_credentials'),
                                label: _('MAILCOLLECT.grant_type'),
                                type: 'text',
                                required: true
                            },
                            "scope"         : {
                                id: 'scope',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl('https://graph.microsoft.com/.default'),
                                label: _('MAILCOLLECT.scope'),
                                type: 'text',
                                required: true
                            },
                            "users_url"     : {
                                id: 'users_url',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl('https://graph.microsoft.com/v1.0/users'),
                                label: _('MAILCOLLECT.users_url'),
                                type: 'text',
                                required: true
                            },
                            "message_url"   : {
                                id: 'message_url',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl('https://graph.microsoft.com/v1.0/me/messages'),
                                label: _('MAILCOLLECT.message_url'),
                                type: 'text',
                                required: true
                            },
                            "get_token_url" : {
                                id: 'get_token_url',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl("https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"),
                                label: _('MAILCOLLECT.get_token_url'),
                                type: 'text',
                                required: true
                            },
                            "client_secret" : {
                                id: 'client_secret',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl(),
                                label: _('MAILCOLLECT.secret'),
                                type: 'text',
                                required: true
                            },
                            "tenant_id"     : {
                                id: 'tenant_id',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl(),
                                label: _('MAILCOLLECT.tenant_id'),
                                type: 'text',
                                required: true
                            },
                            "client_id"     : {
                                id: 'client_id',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl(),
                                label: _('MAILCOLLECT.client_id'),
                                type: 'text',
                                required: true
                            }
                        }
                    },
                    {
                        id: 'oauth',
                        label: _('MAILCOLLECT.oauth'),
                        "options": {
                            "hostname"  : {
                                id: 'hostname',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl('outlook.office365.com'),
                                label: _('MAILCOLLECT.hostname'),
                                type: 'text',
                                required: true
                            },
                            "login"     : {
                                id: 'login',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl(),
                                label: _('FORMATS.email'),
                                type: 'text',
                                required: true
                            },
                            "scopes"    : {
                                id: 'scopes',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl('https://outlook.office.com/.default'),
                                label: _('MAILCOLLECT.scopes'),
                                type: 'text',
                                required: true
                            },
                            "authority" : {
                                id: 'authority',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl('https://login.microsoftonline.com/'),
                                label: _('MAILCOLLECT.authority'),
                                type: 'text',
                                required: true
                            },
                            "secret"    : {
                                id: 'secret',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl(),
                                label: _('MAILCOLLECT.secret'),
                                type: 'text',
                                required: true
                            },
                            "tenant_id" : {
                                id: 'tenant_id',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl(),
                                label: _('MAILCOLLECT.tenant_id'),
                                type: 'text',
                                required: true
                            },
                            "client_id" : {
                                id: 'client_id',
                                fromMethod: true,
                                unit: 'general',
                                control: new FormControl(),
                                label: _('MAILCOLLECT.client_id'),
                                type: 'text',
                                required: true
                            }
                        }
                    }
                ]
            },
            {
                id: 'enabled',
                control: new FormControl(),
                disabled: true,
                type: 'boolean',
                required: false
            },
            {
                id: 'verifier_workflow_id',
                unit: 'verifier',
                control: new FormControl(),
                label: _('WORKFLOW.id'),
                type: 'autocomplete',
                required: false
            },
            {
                id: 'is_splitter',
                unit: 'splitter',
                control: new FormControl(false),
                label: _('MAILCOLLECT.is_splitter'),
                type: 'boolean',
                required: false
            },
            {
                id: 'splitter_workflow_id',
                unit: 'splitter',
                control: new FormControl(''),
                label: _('MAILCOLLECT.splitter_workflow_id'),
                type: 'autocomplete',
                required: false
            },
            {
                id: 'folder_to_crawl',
                unit: 'folders',
                hint: _('MAILCOLLECT.load_folders_first'),
                control: new FormControl(),
                label: _('MAILCOLLECT.folder_to_crawl'),
                type: 'autocomplete',
                required: true
            },
            {
                id: 'folder_destination',
                unit: 'folders',
                hint: _('MAILCOLLECT.load_folders_first'),
                control: new FormControl(),
                label: _('MAILCOLLECT.folder_destination'),
                type: 'autocomplete',
                required: true
            },
            {
                id: 'folder_trash',
                unit: 'folders',
                hint: _('MAILCOLLECT.load_folders_first'),
                control: new FormControl(),
                label: _('MAILCOLLECT.folder_trash'),
                type: 'autocomplete',
                required: false
            },
            {
                id: 'action_after_process',
                unit: 'folders',
                control: new FormControl(''),
                label: _('MAILCOLLECT.action_after_process'),
                type: 'select',
                values: [
                    {
                        id: 'move',
                        label: _('MAILCOLLECT.move')
                    },
                    {
                        id: 'delete',
                        label: _('MAILCOLLECT.delete')
                    },
                    {
                        id: 'none',
                        label: _('MAILCOLLECT.none')
                    }
                ],
                required: true
            }
        ];

        this.defaultProcessData.forEach((element: any) => {
            if (element.id === 'splitter_workflow_id') {
                element.values = element.control.valueChanges.pipe(
                    startWith(''),
                    map(option => option ? this._filter(option, this.allSplitterWorkflows) : this.allSplitterWorkflows)
                );
            }
            if (element.id === 'verifier_workflow_id') {
                element.values = element.control.valueChanges.pipe(
                    startWith(''),
                    map(option => option ? this._filter(option, this.allVerifierWorkflows) : this.allVerifierWorkflows)
                );
            }
        });
    }

    getNameOfProcess(process: any) {
        let name = '';
        process.forEach((element: any) => {
            if (element.id === 'name' && element.control.value) {
                name = element.control.value;
            }
        });
        return name;
    }

    createProcess(process: any) {
        if (!this.getNameOfProcess(process)) {
            this.notify.error(this.translate.instant('MAILCOLLECT.process_name_mandatory'));
            return;
        }

        if (this.isValidForm(process)) {
            const data: any = {};
            process.forEach((element: any) => {
                if (['name', 'verifier_workflow_id', 'verifier_workflow_id', 'splitter_workflow_id', 'folder_to_crawl',
                    'folder_destination', 'folder_trash', 'action_after_process'].includes(element.id)) {
                    if (element.id.includes('folder_')) {
                        data[element.id] = element.control.value && element.control.value.id ? element.control.value.id : null;
                    } else if (element.id.includes('_workflow_id')) {
                        data[element.id] = element.control.value ? element.control.value.workflow_id : null;
                    } else {
                        data[element.id] = element.control && element.control.value ? element.control.value : null;
                    }
                } else if (element.id === 'options') {
                    let methodOptions: any = {};
                    this.defaultProcessData.forEach((data: any) => {
                        if (data.id === 'options') {
                            const method = data.values.find((x: { id: any; }) => x.id == element.control.value).options;
                            Array.from(Object.keys(method)).forEach((value: any) => {
                                methodOptions[value] = process.find((element: any) => element.id === value).control.value;
                            })
                        }
                    });
                    data['options'] = methodOptions;
                    data['method'] = element.control.value;
                }
            });

            this.http.post(environment['url'] + '/ws/mailcollect/createProcess', data, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.notify.success(this.translate.instant('MAILCOLLECT.process_created'));
                }),
                finalize(() => this.processLoading = false),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    duplicateConfirmDialog(process: any) {
        const processName = this.getNameOfProcess(process);
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('MAILCOLLECT.confirm_duplicate_process', {"process": processName}),
                confirmButton       : this.translate.instant('GLOBAL.confirm'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.duplicateProcess(process);
            }
        });
    }

    duplicateProcess(process: any) {
        this.addProcess();
        this.processes[this.processes.length - 1].forEach((element: any) => {
            process.forEach((element_child: any ) => {
                if (element.id === element_child.id && element.id !== 'name') {
                    element.control.setValue(element_child.control.value);
                }
            });
        });
    }

    disableConfirmDialog(process: any) {
        const processName = this.getNameOfProcess(process);
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('MAILCOLLECT.confirm_disable_process', {"process": processName}),
                confirmButton       : this.translate.instant('GLOBAL.disable'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.disableProcess(processName);
            }
        });
    }

    disableProcess(processName: string) {
        this.http.put(environment['url'] + '/ws/mailcollect/disableProcess/' + processName, {}, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.selectedIndex = 1;
                this.loadProcess();
                setTimeout(() => {
                    this.selectedIndex = 0;
                }, 200);
                this.notify.success(this.translate.instant('MAILCOLLECT.process_disabled'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    enableConfirmDialog(process: any) {
        const processName = this.getNameOfProcess(process);
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('MAILCOLLECT.confirm_enable_process', {"process": processName}),
                confirmButton       : this.translate.instant('GLOBAL.enable'),
                confirmButtonColor  : "green",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.enableProcess(processName);
            }
        });
    }

    enableProcess(processName: string) {
        this.http.put(environment['url'] + '/ws/mailcollect/enableProcess/' + processName, {}, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.selectedIndex = 1;
                this.loadProcess();
                setTimeout(() => {
                    this.selectedIndex = 0;
                }, 200);
                this.notify.success(this.translate.instant('MAILCOLLECT.process_enabled'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    deleteConfirmDialog(process: any) {
        const processName = this.getNameOfProcess(process);
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('MAILCOLLECT.confirm_delete_process', {"process": processName}),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteProcess(processName);
            }
        });
    }

    deleteProcess(processName: string) {
        this.http.delete(environment['url'] + '/ws/mailcollect/deleteProcess/' + processName, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.selectedIndex = 1;
                this.loadProcess();
                setTimeout(() => {
                    this.selectedIndex = 0;
                }, 300);
                this.notify.success(this.translate.instant('MAILCOLLECT.process_deleted'));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    updateProcess(process: any) {
        if (this.isValidForm(process)) {
            this.processLoading = true;

            const data: any = {};
            process.forEach((element: any) => {
                if (['name', 'verifier_workflow_id', 'verifier_workflow_id', 'splitter_workflow_id', 'folder_to_crawl',
                    'folder_destination', 'folder_trash', 'action_after_process'].includes(element.id)) {
                    if (element.id.includes('folder_')) {
                        data[element.id] = element.control.value && element.control.value.id ? element.control.value.id : null;
                    } else if (element.id.includes('_workflow_id')) {
                        data[element.id] = element.control.value ? element.control.value.workflow_id : null;
                    } else {
                        data[element.id] = element.control && element.control.value ? element.control.value : null;
                    }
                } else if (element.id === 'options') {
                    let methodOptions: any = {};
                    this.defaultProcessData.forEach((data: any) => {
                        if (data.id === 'options') {
                            const method = data.values.find((x: { id: any; }) => x.id == element.control.value).options;
                            Array.from(Object.keys(method)).forEach((value: any) => {
                                methodOptions[value] = process.find((element: any) => element.id === value).control.value;
                            })
                        }
                    });
                    data['options'] = methodOptions;
                    data['method'] = element.control.value;
                }
            });

            this.http.post(environment['url'] + '/ws/mailcollect/updateProcess/' + data['name'], data, {headers: this.authService.headers}).pipe(
                tap(() => {
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
    }

    retrieveFolders(process: any) {
        this.formValid[this.getNameOfProcess(process)] = false;
        this.folderLoading = true;
        let data: any = {}
        process.forEach((element: any) => {
            if (element.id === 'options') {
                data['method'] = element.control.value;
                const options = element.values.find((x: { id: any; }) => x.id == data['method']).options;
                Array.from(Object.keys(options)).forEach((value: any) => {
                    data[value] = options[value].control.value;
                });
            }
            if (element.id === 'secured_connection') {
                data['secured_connection'] = element.control.value;
            }
        });

        if (data) {
            this.http.post(environment['url'] + '/ws/mailcollect/retrieveFolders', data, {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    data.forEach((element: any) => {
                        this.folders.push({'id': element, 'label': element});
                    });

                    process.forEach((element: any) => {
                        if (element.id === 'folder_trash' || element.id === 'folder_to_crawl' || element.id === 'folder_destination') {
                            element.values = element.control.valueChanges.pipe(
                                startWith(''),
                                map(option => option ? this._filter(option, this.folders) : this.folders)
                            );
                        }
                    });
                    this.notify.success(this.translate.instant('MAILCOLLECT.folders_updated'));
                    this.formValid[this.getNameOfProcess(process)] = true;
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
            return array.filter((option: any) => option['label'].toLowerCase().indexOf(filterValue) !== -1);
        } else {
            return array;
        }
    }

    isValidForm(process: any, notify: boolean = true, event: any = null) {
        let state = true;

        process.forEach((element: any) => {
            if (element.control.status !== 'DISABLED' && element.control.status !== 'VALID') {
                state = false;
            }
            element.control.markAsTouched();
        });

        if (!state && notify) {
            this.notify.error(this.translate.instant('ERROR.form_not_valid'));
        } else {
            this.formValid[this.getNameOfProcess(process)] = true;
        }

        if (event && event.source.id == 'options') {
            const tmp_process = process.filter((element: any) => !element.fromMethod);
            const process_name = this.getNameOfProcess(tmp_process);

            this.processes.forEach((old_process: any, index: number) => {
                const name = this.getNameOfProcess(old_process);
                if (name === process_name) {
                    this.processes[index] = this.changeMethod(event.value, tmp_process);
                    if (process.exists) {
                        this.processes[index].exists = true;
                    }
                }
            })
        }

        return state;
    }

    changeMethod(method_id: any, process: any) {
        const methods = process.find((element: any) => element.id === 'options').values;
        const method = methods.find((element: any) => element.id === method_id);

        Array.from(Object.keys(method.options)).forEach((element: any) => {
            process.push(method.options[element]);
        });
        return process;
    }

    getErrorMessage(field: any, process: any) {
        let error: any;
        process.forEach((element: any) => {
            if (element.id === field) {
                if (element.required) {
                    error = this.translate.instant('AUTH.field_required');
                    this.formValid[this.getNameOfProcess(process)] = false;
                }
            }
        });
        return error;
    }
}
