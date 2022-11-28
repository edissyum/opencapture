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
import { HistoryService } from "../../../services/history.service";
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
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
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
            'label': marker('BATCH.today'),
        },
        {
            'id': 'yesterday',
            'label': marker('BATCH.yesterday'),
        },
        {
            'id': 'older',
            'label': marker('BATCH.older'),
        }
    ];
    pageSize                : number            = 16;
    pageIndex               : number            = 0;
    pageSizeOptions         : any []            = [4, 8, 12, 16, 24, 48];
    total                   : number            = 0;
    totals                  : any               = {};
    offset                  : number            = 0;
    selectedTab             : number            = 0;
    invoices                : any []            = [];
    allowedCustomers        : any []            = [];
    allowedSuppliers        : any []            = [];
    purchaseOrSale          : string            = '';
    search                  : string            = '';
    TREE_DATA               : AccountsNode[]    = [];
    expanded                : boolean           = false;
    invoiceToDeleteSelected : boolean           = false;
    totalChecked            : number            = 0;
    customerFilterEmpty     : boolean           = false;
    customerFilter                              = new FormControl('');

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
        private historyService: HistoryService,
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
            if (this.localStorageService.get('invoicesPageIndex'))
                this.pageIndex = parseInt(this.localStorageService.get('invoicesPageIndex') as string);
            if (this.localStorageService.get('invoicesTimeIndex')) {
                this.selectedTab = parseInt(this.localStorageService.get('invoicesTimeIndex') as string);
                this.currentTime = this.batchList[this.selectedTab].id;
            }
            this.offset = this.pageSize * (this.pageIndex);
        } else {
            this.localStorageService.remove('invoicesPageIndex');
            this.localStorageService.remove('invoicesTimeIndex');
        }

        this.http.get(environment['url'] + '/ws/status/list?module=verifier', {headers: this.authService.headers}).pipe(
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
        this.http.get(environment['url'] + '/ws/forms/list?module=verifier&totals=true&status=' + this.currentStatus + '&user_id=' + this.userService.user.id + '&time=' + this.currentTime, {headers: this.authService.headers}).pipe(
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
        this.http.put(environment['url'] + '/ws/verifier/invoices/removeLockByUserId/' + userId, {}, {headers: this.authService.headers}).pipe(
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadCustomers() {
        this.TREE_DATA = [];
        this.http.get(environment['url'] + '/ws/accounts/customers/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                const customers = data.customers;
                this.TREE_DATA.push({
                    name: this.translate.instant('ACCOUNTS.customer_not_specified'),
                    id: 0,
                    parent_id: '',
                    supplier_id: '',
                    purchase_or_sale: '',
                    display: true,
                    count: 0,
                    children: [],
                });
                this.allowedCustomers.push(0); // 0 is used if for some reasons no customer was recover by OC process
                this.http.get(environment['url'] + '/ws/users/getCustomersByUserId/' + this.userService.user.id, {headers: this.authService.headers}).pipe(
                    tap((data_customers_by_id: any) => {
                        customers.forEach((customer: any) => {
                            data_customers_by_id.forEach((customer_id: any) => {
                                if (customer_id === customer.id) {
                                    this.allowedCustomers.push(customer.id);
                                    this.TREE_DATA.push({
                                        name: customer.name,
                                        id: customer.id,
                                        parent_id: '',
                                        supplier_id: '',
                                        purchase_or_sale: '',
                                        display: true,
                                        count: 0,
                                        children: [],
                                    });
                                }
                            });
                        });
                        this.loadInvoices().then();
                    }),
                    finalize(() => this.loadingCustomers = false),
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

    async loadInvoices() {
        this.invoiceToDeleteSelected = false;
        this.totalChecked = 0;
        this.loading = true;
        this.loadingCustomers = true;
        this.invoices = [];
        this.loadForms();
        let url = environment['url'] + '/ws/verifier/invoices/totals/' + this.currentStatus + '/' + this.userService.user.id;
        if (this.currentForm !== '') {
            url = environment['url'] + '/ws/verifier/invoices/totals/' + this.currentStatus + '/' + this.userService.user.id + '/' + this.currentForm;
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
        this.http.post(environment['url'] + '/ws/verifier/invoices/list',
            {
                'allowedCustomers': this.allowedCustomers, 'status': this.currentStatus, 'limit': this.pageSize,
                'allowedSuppliers': this.allowedSuppliers, 'form_id': this.currentForm, 'time': this.currentTime,
                'offset': this.offset, 'search': this.search, 'purchaseOrSale': this.purchaseOrSale
            },
            {headers: this.authService.headers}
        ).pipe(
            tap((data: any) => {
                if (data) {
                    if (data.invoices.length !== 0) this.total = data.total;
                    else if (this.pageIndex !== 0) {
                        this.pageIndex = this.pageIndex - 1;
                        this.offset = this.pageSize * (this.pageIndex);
                        this.loadInvoices();
                    }
                    this.invoices = data.invoices;
                    this.invoices.forEach((invoice: any) => {
                        if (!invoice.thumb.includes('data:image/jpeg;base64')) {
                            invoice.thumb = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64, ' + invoice.thumb);
                        }
                        if (invoice.form_label === null || invoice.form_label === '' || invoice.form_label === undefined) {
                            invoice.form_label = this.translate.instant('VERIFIER.no_form');
                        }
                        if (!invoice.form_id) {
                            invoice.display = {
                                "subtitles": [
                                    {"id": "invoice_number", "label": "FACTURATION.invoice_number"},
                                    {"id": "document_date", "label": "FACTURATION.document_date"},
                                    {"id": "date", "label": "VERIFIER.register_date"},
                                    {"id": "original_filename", "label": "VERIFIER.original_file"},
                                    {"id": "form_label", "label": "VERIFIER.form"}
                                ]
                            };
                        } else {
                            this.forms.forEach((form: any) =>  {
                                if (form.id === invoice.form_id) {
                                    if (form.settings.display) {
                                        invoice.display = form.settings.display;
                                    }
                                }
                            });
                        }

                        if (!invoice.display) {
                            invoice.display = {
                                "subtitles": [
                                    {"id": "invoice_number", "label": "FACTURATION.invoice_number"},
                                    {"id": "document_date", "label": "FACTURATION.document_date"},
                                    {"id": "date", "label": "VERIFIER.register_date"},
                                    {"id": "original_filename", "label": "VERIFIER.original_file"},
                                    {"id": "form_label", "label": "VERIFIER.form"}
                                ]
                            };
                        }

                        const invoice_display_tmp = invoice.display.subtitles;
                        invoice.display = {'subtitles': []};
                        invoice_display_tmp.forEach((subtitle: any) => {
                            let subtitle_data = '';
                            if (invoice.datas.hasOwnProperty(subtitle.id)) {
                                subtitle_data = invoice.datas[subtitle.id];
                            } else if (invoice.hasOwnProperty(subtitle.id)) {
                                subtitle_data = invoice[subtitle.id];
                            }

                            invoice.display.subtitles.push({
                                'id': subtitle.id,
                                'label': subtitle.label,
                                'data': subtitle_data
                            });
                        });
                    });
                }

                /*
                * Starting from here, we fill the customers tree
                */
                const customersPurchaseToKeep : any = [];
                const customersSaleToKeep : any = [];
                this.allowedCustomers.forEach((customer: any) => {
                    this.invoices.forEach((invoice:any) => {
                        if (invoice.purchase_or_sale === 'purchase' && !customersPurchaseToKeep.includes(customer)) {
                            customersPurchaseToKeep.push(customer);
                        }
                        if (invoice.purchase_or_sale === 'sale' && !customersSaleToKeep.includes(customer)) {
                            customersSaleToKeep.push(customer);
                        }
                    });
                });

                /*
                * RESET the TREE DATA before re populate it
                */
                this.TREE_DATA.forEach((_data: any, index: number) => {
                    this.TREE_DATA[index].display = true;
                    this.TREE_DATA[index].count = 0;
                    this.TREE_DATA[index].children = [];
                });

                this.TREE_DATA.forEach((_data: any, index: number) => {
                    customersSaleToKeep.forEach((customer1: any) => {
                        if (_data.id === customer1) {
                            let childExists = false;
                            this.TREE_DATA[index].children.forEach((child: any) => {
                                if (child.id === 0) {
                                    childExists = true;
                                }
                            });
                            if (!childExists) {
                                this.TREE_DATA[index].children.push(
                                    {name: this.translate.instant('UPLOAD.sale_invoice'), id: 0, display: true, count: 0, children: []},
                                );
                                this.createChildren('sale', 0, index);
                            }
                        }
                    });
                    customersPurchaseToKeep.forEach((customer2: any) => {
                        if (_data.id === customer2) {
                            if (this.TREE_DATA[index]) {
                                let childExists = false;
                                this.TREE_DATA[index].children.forEach((child: any) => {
                                    if (child.id === 1) {
                                        childExists = true;
                                    }
                                });
                                if (!childExists) {
                                    this.TREE_DATA[index].children.push(
                                        {name: this.translate.instant('UPLOAD.purchase_invoice'), id: 1, display: true, count: 0, children: []},
                                    );
                                    this.createChildren('purchase', 1, index);
                                }
                            }
                        }
                    });
                });
                this.dataSource.data = this.TREE_DATA;
                this.filterCustomers();
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

    fillChildren(parentId: any, parent: any, childName: any, supplierName: any, supplierId: any, id: any, purchaseOrSale: any) {
        let childNameExists = false;
        parent.forEach((child: any) => {
            if (child.name === childName) {
                childNameExists = true;
                child.count = child.count + 1;
            }
        });

        if (!childNameExists) {
            parent.push({
                name: supplierName,
                supplier_id: supplierId,
                id: id,
                parent_id: parentId,
                purchase_or_sale: purchaseOrSale,
                count: 1,
                display: true
            });
        }
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

    changeCustomer(customerId: number, invoiceId: number) {
        this.loading = true;
        this.loadingCustomers = true;
        this.http.put(environment['url'] + '/ws/verifier/invoices/' + invoiceId + '/update',
            {'args': {"customer_id": customerId}},
            {headers: this.authService.headers}).pipe(
                finalize(() => {
                    this.resetInvoices();
                    this.notify.success(this.translate.instant('VERIFIER.customer_changed_successfully'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
        ).subscribe();
    }

    changeInvoiceForm(formId: number, invoiceId: number) {
        this.loading = true;
        this.loadingCustomers = true;
        this.http.put(environment['url'] + '/ws/verifier/invoices/' + invoiceId + '/update',
            {'args': {"form_id": formId}},
            {headers: this.authService.headers}).pipe(
                finalize(() => {
                    this.resetInvoices();
                    this.notify.success(this.translate.instant('VERIFIER.form_changed'));
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
        ).subscribe();
    }

    createChildren(purchaseOrSale: any, id: any, index: any) {
        this.TREE_DATA[index].children.forEach((child: any) => {
            if (child.id === id) {
                this.invoices.forEach((invoice: any) => {
                    if (this.TREE_DATA[index].id === invoice.customer_id && invoice.purchase_or_sale === purchaseOrSale) {
                        if (invoice.supplier_id) {
                            this.fillChildren(this.TREE_DATA[index].id, child.children, invoice.supplier_name, invoice.supplier_name, invoice.supplier_id, invoice.invoice_id, purchaseOrSale);
                        } else {
                            this.fillChildren(this.TREE_DATA[index].id, child.children, invoice.supplier_name, this.translate.instant('ACCOUNTS.supplier_unknow'), invoice.supplier_id, invoice.invoice_id, purchaseOrSale);
                        }
                        child.count = child.count + 1;
                        this.TREE_DATA[index].count = this.TREE_DATA[index].count + 1;
                    }
                });
            }
        });
    }

    loadInvoicePerCustomer(node: any) {
        const parentId = node.parent_id;
        const supplierId = node.supplier_id;
        const purchaseOrSale = node.purchase_or_sale;
        this.TREE_DATA.forEach((element: any) => {
            if (element.id === parentId) {
                const customerId = element.id;
                this.allowedCustomers = [customerId];
                this.allowedSuppliers = [supplierId];
                this.purchaseOrSale = purchaseOrSale;
                this.resetPaginator();
                this.loadInvoices();
            }
        });
    }

    resetInvoices() {
        this.loading = true;
        this.loadingCustomers = true;
        this.allowedCustomers = [];
        this.allowedSuppliers = [];
        this.purchaseOrSale = '';
        this.search = '';
        this.currentForm = '';
        this.resetPaginator();
        this.loadCustomers();
    }

    selectOrUnselectAllInvoices(event: any) {
        const label = event.srcElement.textContent;
        this.invoiceToDeleteSelected = !this.invoiceToDeleteSelected;
        const checkboxList = document.getElementsByClassName('checkBox_list');
        Array.from(checkboxList).forEach((element: any) => {
            element.checked = (label === this.translate.instant('VERIFIER.select_all'));
        });
        this.totalChecked = document.querySelectorAll('.checkBox_list:checked').length;
    }

    deleteAllInvoices() {
        this.loading = true;
        this.loadingCustomers = true;
        const checkboxList = document.querySelectorAll('.checkBox_list:checked');
        Array.from(checkboxList).forEach((element: any) => {
            const invoiceId = element.id.split('_')[0];
            this.deleteInvoice(invoiceId, true);
        });
        this.notify.success(this.translate.instant('VERIFIER.all_documents_checked_deleted'));
        this.loadCustomers();
    }

    deleteInvoice(invoiceId: number, batchDelete = false) {
        this.http.delete(environment['url'] + '/ws/verifier/invoices/delete/' + invoiceId, {headers: this.authService.headers}).pipe(
            tap(() => {
                if (!batchDelete) {
                    this.loadCustomers();
                    this.notify.success(this.translate.instant('VERIFIER.documents_deleted'));
                }
                this.historyService.addHistory('verifier', 'delete_document', this.translate.instant('HISTORY-DESC.delete_document', {document_id: invoiceId}));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    checkCheckedInvoices() {
        this.totalChecked = document.querySelectorAll('.checkBox_list:checked').length;
        this.invoiceToDeleteSelected = this.totalChecked !== 0;
    }

    deleteConfirmDialog(invoiceId: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('VERIFIER.confirm_delete_document'),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loading = true;
                this.loadingCustomers = true;
                this.deleteInvoice(invoiceId);
            }
        });
    }

    displayInvoiceLocked(lockedBy: any) {
        this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('VERIFIER.document_locked'),
                confirmText         : this.translate.instant('VERIFIER.document_locked_by', {'locked_by': lockedBy}),
                confirmButton       : this.translate.instant('GLOBAL.confirm'),
                confirmButtonColor  : "warn"
            },
            width: "600px",
        });
    }

    deleteAllConfirmDialog() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('VERIFIER.confirm_delete_all_documents'),
                confirmButton       : this.translate.instant('GLOBAL.delete_all_checked'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteAllInvoices();
            }
        });
    }

    changeStatus(event: any) {
        this.currentStatus = event.value;
        this.resetPaginator();
        this.loadInvoices();
    }

    changeForm(event: any) {
        this.currentForm = event.value;
        this.resetPaginator();
        this.loadInvoices();
    }

    onTabChange(event: any) {
        this.search = '';
        this.selectedTab = event.index;
        this.localStorageService.save('invoicesTimeIndex', this.selectedTab);
        this.currentTime = this.batchList[this.selectedTab].id;
        this.resetPaginator();
        this.loadInvoices();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.pageIndex = event.pageIndex;
        this.localStorageService.save('invoicesPageIndex', event.pageIndex);
        this.loadInvoices();
    }

    searchInvoice(event: any) {
        this.search = event.target.value;
        this.loadInvoices();
    }

    resetPaginator() {
        this.total = 0;
        this.offset = 0;
        this.pageIndex = 0;
        this.localStorageService.save('invoicesPageIndex', this.pageIndex);
    }

    expandAll() {
        if (!this.expanded) this.treeControl.expandAll();
        else this.treeControl.collapseAll();
        this.expanded = !this.expanded;
    }
}
