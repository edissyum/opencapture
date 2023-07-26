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
import { LocalStorageService } from "../../../services/local-storage.service";
import { environment } from  "../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { NotificationService } from "../../../services/notifications/notifications.service";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import { LastUrlService } from "../../../services/last-url.service";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { FlatTreeControl } from "@angular/cdk/tree";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { UserService } from "../../../services/user.service";
import { ConfirmDialogComponent } from "../../../services/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { ConfigService } from "../../../services/config.service";
import { FormControl } from "@angular/forms";

interface AccountsNode {
    name: string
    id: number
    parent_id: any
    supplier_id: any
    purchase_or_sale: any
    count: number
    display: boolean
    children: any
}

interface FlatNode {
    expandable: boolean
    name: string
    id: number
    parent_id: any
    supplier_id: any
    purchase_or_sale: any
    display: boolean
    count: number
    level: number
    children: any
}

@Component({
    selector: 'app-verifier-list',
    templateUrl: './verifier-list.component.html',
    styleUrls: ['./verifier-list.component.scss'],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } }
    ]
})
export class VerifierListComponent implements OnInit {
    loading                 : boolean           = true;
    loadingCustomers        : boolean           = true;
    status                  : any[]             = [];
    forms                   : any[]             = [
        {'id' : '', "label": this.translate.instant('VERIFIER.all_forms')},
        {'id' : 'no_form', "label": this.translate.instant('VERIFIER.no_form')}
    ];
    filteredForms           : any[]             = [];
    config                  : any;
    currentForm             : any               = '';
    currentStatus           : string            = 'NEW';
    currentTime             : string            = 'today';
    batchList               : any[]             = [
        {
            'id': 'today',
            'label': marker('BATCH.today')
        },
        {
            'id': 'yesterday',
            'label': marker('BATCH.yesterday')
        },
        {
            'id': 'older',
            'label': marker('BATCH.older')
        }
    ];
    pageSize                : number            = 16;
    pageIndex               : number            = 0;
    pageSizeOptions         : any []            = [4, 8, 12, 16, 24, 48];
    total                   : number            = 0;
    totals                  : any               = {};
    customersList           : any               = {};
    offset                  : number            = 0;
    selectedTab             : number            = 0;
    documents               : any []            = [];
    allowedCustomers        : any []            = [];
    allowedSuppliers        : any []            = [];
    purchaseOrSale          : string            = '';
    search                  : string            = '';
    TREE_DATA               : AccountsNode[]    = [];
    expanded                : boolean           = false;
    documentToDeleteSelected : boolean          = false;
    totalChecked            : number            = 0;
    customerFilterEmpty     : boolean           = false;
    customerFilter        = new FormControl('');
    customerFilterEnabled   : boolean           = false;

    private _transformer = (node: AccountsNode, level: number) => ({
        expandable: !!node.children && node.children.length > 0,
        name: node.name,
        supplier_id: node.supplier_id,
        id: node.id,
        parent_id: node.parent_id,
        purchase_or_sale: node.purchase_or_sale,
        display: node.display,
        count: node.count,
        level: level,
        children: node.children
    });

    treeControl = new FlatTreeControl<FlatNode>(
        node => node.level, node => node.expandable);

    treeFlattener = new MatTreeFlattener(
        this._transformer, node => node.level, node => node.expandable, node => node.children);

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    constructor(
        private http: HttpClient,
        private dialog: MatDialog,
        private sanitizer: DomSanitizer,
        private authService: AuthService,
        private userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        private configService: ConfigService,
        private routerExtService: LastUrlService,
        private localStorageService: LocalStorageService
    ) {}

    hasChild = (_: number, node: FlatNode) => node.expandable;
    isLevelOne = (_: number, node: FlatNode) => node.level === 1;
    isLevelTwo = (_: number, node: FlatNode) => node.level === 2;
    isNotLevelOne = (_: number, node: FlatNode) => node.level !== 1;

    async ngOnInit() {
        if (!this.authService.headersExists) {
            this.authService.generateHeaders();
        }

        if (!this.userService.user) {
            this.userService.user = this.userService.getUserFromLocal();
        }

        marker('VERIFIER.nb_pages'); // Needed to get the translation in the JSON file
        marker('VERIFIER.expand_all'); // Needed to get the translation in the JSON file
        marker('VERIFIER.collapse_all'); // Needed to get the translation in the JSON file
        marker('VERIFIER.select_all'); // Needed to get the translation in the JSON file
        marker('VERIFIER.unselect_all'); // Needed to get the translation in the JSON file
        marker('VERIFIER.documents_settings'); // Needed to get the translation in the JSON file
        this.localStorageService.save('splitter_or_verifier', 'verifier');
        this.removeLockByUserId(this.userService.user.username);
        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('verifier/') && !lastUrl.includes('settings') || lastUrl === '/' || lastUrl === '/upload') {
            if (this.localStorageService.get('documentsPageIndex'))
                this.pageIndex = parseInt(this.localStorageService.get('documentsPageIndex') as string);
            if (this.localStorageService.get('documentsTimeIndex')) {
                this.selectedTab = parseInt(this.localStorageService.get('documentsTimeIndex') as string);
                this.currentTime = this.batchList[this.selectedTab].id;
            }
            this.offset = this.pageSize * (this.pageIndex);
        } else {
            this.localStorageService.remove('documentsPageIndex');
            this.localStorageService.remove('documentsTimeIndex');
        }

        this.http.get(environment['url'] + '/ws/status/verifier/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.status = data.status;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        setTimeout(() => {
            this.loadForms();
            this.loadCustomers();
        }, 100);
    }

    loadForms() {
        this.http.get(environment['url'] + '/ws/forms/verifier/list?totals=true&status=' + this.currentStatus + '&user_id=' + this.userService.user.id + '&time=' + this.currentTime, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.filteredForms = [];
                this.forms = [
                    {'id' : '', "label": this.translate.instant('VERIFIER.all_forms')},
                    {'id' : 'no_form', "label": this.translate.instant('VERIFIER.no_form')}
                ];
                data.forms.forEach((form: any) => {
                    this.forms.push(form);
                    this.filteredForms.push(form);
                });
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    removeLockByUserId(userId: any) {
        this.http.put(environment['url'] + '/ws/verifier/documents/removeLockByUserId/' + userId, {}, {headers: this.authService.headers}).pipe(
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadCustomers() {
        this.TREE_DATA = [];
        this.TREE_DATA.push({
            name: this.translate.instant('ACCOUNTS.customer_not_specified'),
            id: 0,
            parent_id: '',
            supplier_id: '',
            purchase_or_sale: '',
            display: true,
            count: 0,
            children: []
        });
        this.allowedCustomers.push(0); // 0 is used if for some reasons no customer was recover by OC process
        this.http.get(environment['url'] + '/ws/verifier/customersCount/' + this.userService.user.id + '/' + this.currentStatus + '/' + this.currentTime, {headers: this.authService.headers}).pipe(
            tap((customers_count: any) => {
                this.customersList = customers_count;
                this.customersList.forEach((customer_count: any) => {
                    this.allowedCustomers.push(customer_count.customer_id);
                    const node : any = {
                        name: customer_count.name ? customer_count.name : this.translate.instant('ACCOUNTS.customer_not_specified'),
                        id: customer_count.customer_id,
                        parent_id: '',
                        supplier_id: '',
                        purchase_or_sale: '',
                        display: true,
                        count: customer_count.total,
                        children: [
                            {name: this.translate.instant('UPLOAD.sale_invoice'), id: 0, display: true, count: 0, children: []},
                            {name: this.translate.instant('UPLOAD.purchase_invoice'), id: 1, display: true, count: 0, children: []}
                        ]
                    };

                    customer_count['suppliers']['sale']!.forEach((supplier: any) => {
                        node['children'][0]['count'] += supplier.total;
                        node['children'][0]['children'].push({
                            name: supplier.name ? supplier.name : this.translate.instant('ACCOUNTS.supplier_unknow'),
                            supplier_id: supplier.supplier_id,
                            parent_id: customer_count.customer_id,
                            purchase_or_sale: 'sale',
                            count: supplier.total,
                            display: true
                        });
                    });
                    customer_count['suppliers']['purchase'].forEach((supplier: any) => {
                        node['children'][1]['count'] += supplier.total;
                        node['children'][1]['children'].push({
                            name: supplier.name ? supplier.name : this.translate.instant('ACCOUNTS.supplier_unknow'),
                            supplier_id: supplier.supplier_id,
                            parent_id: customer_count.customer_id,
                            purchase_or_sale: 'purchase',
                            count: supplier.total,
                            display: true
                        });
                    });
                    this.TREE_DATA.push(node);
                });
                this.dataSource.data = this.TREE_DATA;
                this.filterCustomers();
                this.loadDocuments().then();
            }),
            finalize(() => this.loadingCustomers = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    async loadDocuments(loading = true) {
        this.documentToDeleteSelected = false;
        this.totalChecked = 0;
        if (loading) {
            this.documents = [];
            this.loading = true;
        }
        this.loadingCustomers = true;
        this.loadForms();
        let url = environment['url'] + '/ws/verifier/documents/totals/' + this.currentStatus + '/' + this.userService.user.id;
        if (this.currentForm !== '') {
            url = environment['url'] + '/ws/verifier/documents/totals/' + this.currentStatus + '/' + this.userService.user.id + '/' + this.currentForm;
        }
        this.http.get(url, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.totals = data.totals;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        this.http.post(environment['url'] + '/ws/verifier/documents/list',
            {
                'allowedCustomers': this.allowedCustomers, 'status': this.currentStatus, 'limit': this.pageSize,
                'allowedSuppliers': this.allowedSuppliers, 'form_id': this.currentForm, 'time': this.currentTime,
                'offset': this.offset, 'search': this.search, 'purchaseOrSale': this.purchaseOrSale
            },
            {headers: this.authService.headers}
        ).pipe(
            tap((data: any) => {
                if (data) {
                    if (data.documents.length !== 0) this.total = data.total;
                    else if (this.pageIndex !== 0) {
                        this.pageIndex = this.pageIndex - 1;
                        this.offset = this.pageSize * (this.pageIndex);
                        this.loadDocuments();
                    }
                    this.documents = data.documents;
                    this.documents.forEach((document: any) => {
                        if (document.document_id) {
                            document['datas'].document_id = document.document_id;
                        }
                        if (!document.thumb.includes('data:image/jpeg;base64')) {
                            document.thumb = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64, ' + document.thumb);
                        }
                        if (document.form_label === null || document.form_label === '' || document.form_label === undefined) {
                            document.form_label = this.translate.instant('VERIFIER.no_form');
                        }
                        if (!document.form_id) {
                            document.display = {
                                "subtitles": [
                                    {"id": "invoice_number", "label": "FACTURATION.invoice_number"},
                                    {"id": "document_date", "label": "FACTURATION.document_date"},
                                    {"id": "date", "label": "VERIFIER.register_date"},
                                    {"id": "original_filename", "label": "VERIFIER.original_file"},
                                    {"id": "form_label", "label": "ACCOUNTS.form"}
                                ]
                            };
                        } else {
                            this.forms.forEach((form: any) =>  {
                                if (form.id === document.form_id) {
                                    if (form.settings.display) {
                                        document.display = form.settings.display;
                                    }
                                }
                            });
                        }

                        if (!document.display) {
                            document.display = {
                                "subtitles": [
                                    {"id": "invoice_number", "label": "FACTURATION.invoice_number"},
                                    {"id": "document_date", "label": "FACTURATION.document_date"},
                                    {"id": "date", "label": "VERIFIER.register_date"},
                                    {"id": "original_filename", "label": "VERIFIER.original_file"},
                                    {"id": "form_label", "label": "VERIFIER.form"}
                                ]
                            };
                        }

                        const document_display_tmp = document.display.subtitles;
                        document.display = {'subtitles': []};
                        document_display_tmp.forEach((subtitle: any) => {
                            let subtitle_data = '';
                            if (document['datas'].hasOwnProperty(subtitle.id)) {
                                subtitle_data = document['datas'][subtitle.id];
                            } else if (document.hasOwnProperty(subtitle.id)) {
                                subtitle_data = document[subtitle.id];
                            }

                            document.display.subtitles.push({
                                'id': subtitle.id,
                                'label': subtitle.label,
                                'data': subtitle_data
                            });
                        });
                    });
                }
            }),
            finalize(() => {
                this.loading = false;
                this.loadingCustomers = false;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    resetSearchCustomer() {
        this.customerFilter.setValue('');
        this.filterCustomers();
    }

    filterCustomers() {
        const tmpData = this.dataSource.data;
        this.customerFilterEmpty = false;
        let customerMatch = false;
        tmpData.forEach((element: any) => {
            if (element.name.toLowerCase().includes(this.customerFilter.value!.toLowerCase())) {
                element.display = true;
                customerMatch = true;
            } else {
                element.display = false;
            }
        });
        if (!customerMatch) this.customerFilterEmpty = true;
        this.dataSource.data = tmpData;
    }

    changeCustomer(customerId: number, documentId: number) {
        this.loading = true;
        this.loadingCustomers = true;
        this.http.put(environment['url'] + '/ws/verifier/documents/' + documentId + '/update',
            {'args': {"customer_id": customerId}},
            {headers: this.authService.headers}).pipe(
                finalize(() => {
                    this.resetDocuments();
                    this.notify.success(this.translate.instant('VERIFIER.customer_changed_successfully'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
        ).subscribe();
    }

    changeDocumentForm(formId: number, documentId: number) {
        this.loading = true;
        this.loadingCustomers = true;
        this.http.put(environment['url'] + '/ws/verifier/documents/' + documentId + '/update',
            {'args': {"form_id": formId}},
            {headers: this.authService.headers}).pipe(
                finalize(() => {
                    this.resetDocuments();
                    this.notify.success(this.translate.instant('VERIFIER.form_changed'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
        ).subscribe();
    }

    loadDocumentPerCustomer(node: any) {
        const parentId = node.parent_id;
        const supplierId = node.supplier_id;
        const purchaseOrSale = node.purchase_or_sale;
        this.TREE_DATA.forEach((element: any) => {
            if (element.id === parentId) {
                const customerId = element.id;
                this.customerFilterEnabled = true;
                this.allowedCustomers = [customerId];
                this.allowedSuppliers = [supplierId];
                this.purchaseOrSale = purchaseOrSale;
                this.resetPaginator();
                this.loadDocuments().then();
            }
        });
    }

    resetDocuments() {
        this.search = '';
        this.loading = true;
        this.currentForm = '';
        this.purchaseOrSale = '';
        this.loadingCustomers = true;
        this.allowedCustomers = [];
        this.allowedSuppliers = [];
        this.customerFilterEnabled = false;
        this.loadCustomers();
        this.resetPaginator();
        this.resetSearchCustomer();
    }

    selectOrUnselectAllDocuments(event: any) {
        const label = event.srcElement.textContent;
        this.documentToDeleteSelected = !this.documentToDeleteSelected;
        const checkboxList = document.getElementsByClassName('checkBox_list');
        Array.from(checkboxList).forEach((element: any) => {
            element.checked = (label === this.translate.instant('VERIFIER.select_all'));
        });
        this.totalChecked = document.querySelectorAll('.checkBox_list:checked').length;
    }

    deleteAllDocuments() {
        this.loading = true;
        this.loadingCustomers = true;
        const checkboxList = document.querySelectorAll('.checkBox_list:checked');
        Array.from(checkboxList).forEach((element: any) => {
            const documentId = element.id.split('_')[0];
            this.deleteDocument(documentId, true);
        });
        this.notify.success(this.translate.instant('VERIFIER.all_documents_checked_deleted'));
        this.loadCustomers();
    }

    deleteDocument(documentId: number, batchDelete = false) {
        this.http.delete(environment['url'] + '/ws/verifier/documents/delete/' + documentId, {headers: this.authService.headers}).pipe(
            tap(() => {
                if (!batchDelete) {
                    this.loadCustomers();
                    this.notify.success(this.translate.instant('VERIFIER.documents_deleted'));
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    checkCheckedDocuments() {
        this.totalChecked = document.querySelectorAll('.checkBox_list:checked').length;
        this.documentToDeleteSelected = this.totalChecked !== 0;
    }

    deleteConfirmDialog(documentId: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('VERIFIER.confirm_delete_document'),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loading = true;
                this.loadingCustomers = true;
                this.deleteDocument(documentId);
            }
        });
    }

    displayDocumentLocked(lockedBy: any) {
        this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('VERIFIER.document_locked'),
                confirmText         : this.translate.instant('VERIFIER.document_locked_by', {'locked_by': lockedBy}),
                confirmButton       : this.translate.instant('GLOBAL.confirm'),
                confirmButtonColor  : "warn"
            },
            width: "600px"
        });
    }

    deleteAllConfirmDialog() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('VERIFIER.confirm_delete_all_documents'),
                confirmButton       : this.translate.instant('GLOBAL.delete_all_checked'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteAllDocuments();
            }
        });
    }

    changeStatus(event: any) {
        this.currentStatus = event.value;
        this.resetPaginator();
        this.loadCustomers();
        this.loadDocuments().then();
    }

    changeForm(event: any) {
        this.currentForm = event.value;
        this.resetPaginator();
        this.loadCustomers();
        this.loadDocuments().then();
    }

    onTabChange(event: any) {
        this.search = '';
        this.selectedTab = event.index;
        this.localStorageService.save('documentsTimeIndex', this.selectedTab);
        this.currentTime = this.batchList[this.selectedTab].id;
        this.resetPaginator();
        this.loadCustomers();
        this.loadDocuments().then();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.pageIndex = event.pageIndex;
        this.localStorageService.save('documentsPageIndex', event.pageIndex);
        this.loadDocuments().then();
    }

    searchDocument(event: any) {
        this.search = event.target.value;
        this.loadDocuments(false).then();
    }

    resetPaginator() {
        this.total = 0;
        this.offset = 0;
        this.pageIndex = 0;
        this.localStorageService.save('documentsPageIndex', this.pageIndex);
    }

    expandAll() {
        if (!this.expanded) this.treeControl.expandAll();
        else this.treeControl.collapseAll();
        this.expanded = !this.expanded;
    }
}
