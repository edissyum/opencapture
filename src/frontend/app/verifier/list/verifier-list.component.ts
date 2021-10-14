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

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import {Component, OnInit} from '@angular/core';
import { LocalStorageService } from "../../../services/local-storage.service";
import { API_URL } from "../../env";
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
import {ConfirmDialogComponent} from "../../../services/confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {DomSanitizer} from "@angular/platform-browser";
import {ConfigService} from "../../../services/config.service";
import {HistoryService} from "../../../services/history.service";
declare var $: any;

interface accountsNode {
    name: string;
    id: number;
    parent_id: any;
    supplier_id: any;
    purchase_or_sale: any;
    number: number;
    display: boolean;
    children: any;
}

interface flatNode {
    expandable: boolean;
    name: string;
    id: number;
    parent_id: any;
    supplier_id: any;
    purchase_or_sale: any;
    display: boolean;
    number: number;
    level: number;
    children: any;
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
    loading         : boolean           = true;
    status          : any[]             = [];
    config          : any;
    currentStatus   : string            = 'NEW';
    currentTime     : string            = 'today';
    batchList       : any[]             = [
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
    pageSize        : number            = 16;
    pageIndex       : number            = 0;
    pageSizeOptions : any []            = [4, 8, 16, 24, 48];
    total           : number            = 0;
    offset          : number            = 0;
    selectedTab     : number            = 0;
    invoices        : any []            = [];
    allowedCustomers: any []            = [];
    allowedSuppliers: any []            = [];
    purchaseOrSale  : string            = '';
    search          : string            = '';
    TREE_DATA       : accountsNode[]    = [];
    expanded        : boolean           = false;
    invoiceToDeleteSelected : boolean   = false;
    totalChecked    : number            = 0;

    private _transformer = (node: accountsNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            supplier_id: node.supplier_id,
            id: node.id,
            parent_id: node.parent_id,
            purchase_or_sale: node.purchase_or_sale,
            display: node.display,
            number: node.number,
            level: level,
            children: node.children
        };
    }

    treeControl = new FlatTreeControl<flatNode>(
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
        private localeStorageService: LocalStorageService
    ) {}

    hasChild = (_: number, node: flatNode) => node.expandable;
    isLevelOne = (_: number, node: flatNode) => node.level === 1;
    isLevelTwo = (_: number, node: flatNode) => node.level === 2;
    isNotLevelOne = (_: number, node: flatNode) => node.level !== 1;

    async ngOnInit() {
        marker('VERIFIER.nb_pages'); // Needed to get the translation in the JSON file
        marker('VERIFIER.expand_all'); // Needed to get the translation in the JSON file
        marker('VERIFIER.collapse_all'); // Needed to get the translation in the JSON file
        marker('VERIFIER.select_all'); // Needed to get the translation in the JSON file
        marker('VERIFIER.unselect_all'); // Needed to get the translation in the JSON file
        this.config = this.configService.getConfig();
        this.localeStorageService.save('splitter_or_verifier', 'verifier');
        this.removeLockByUserId(this.userService.user.username);
        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('verifier/') && !lastUrl.includes('settings') || lastUrl === '/' || lastUrl === '/upload') {
            if (this.localeStorageService.get('invoicesPageIndex'))
                this.pageIndex = parseInt(this.localeStorageService.get('invoicesPageIndex') as string);
            if (this.localeStorageService.get('invoicesTimeIndex')) {
                this.selectedTab = parseInt(this.localeStorageService.get('invoicesTimeIndex') as string);
                this.currentTime = this.batchList[this.selectedTab].id;
            }
            this.offset = this.pageSize * (this.pageIndex);
        } else {
            this.localeStorageService.remove('invoicesPageIndex');
            this.localeStorageService.remove('invoicesTimeIndex');
        }

        this.http.get(API_URL + '/ws/status/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.status = data.status;
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
        this.loadCustomers();
    }

    removeLockByUserId(userId: any) {
        this.http.put(API_URL + '/ws/verifier/invoices/removeLockByUserId/' + userId, {}, {headers: this.authService.headers}).pipe(
            tap(() => {}),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadCustomers() {
        this.TREE_DATA = [];
        this.http.get(API_URL + '/ws/accounts/customers/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                const customers = data.customers;
                this.TREE_DATA.push({
                    name: this.translate.instant('ACCOUNTS.customer_not_specified'),
                    id: 0,
                    parent_id: '',
                    supplier_id: '',
                    purchase_or_sale: '',
                    display: true,
                    number: 0,
                    children: []
                });
                this.allowedCustomers.push(0); // 0 is used if for some reasons no customer was recover by OC process
                customers.forEach((customer: any) => {
                    this.allowedCustomers.push(customer.id);
                    this.TREE_DATA.push({
                        name: customer.name,
                        id: customer.id,
                        parent_id: '',
                        supplier_id: '',
                        purchase_or_sale: '',
                        display: true,
                        number: 0,
                        children: []
                    });
                });
                this.loadInvoices();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    loadInvoices() {
        this.invoiceToDeleteSelected = false;
        this.totalChecked = 0;
        this.loading = true;
        this.invoices = [];
        this.http.post(API_URL + '/ws/verifier/invoices/list',
            {
                'allowedCustomers': this.allowedCustomers, 'status': this.currentStatus, 'allowedSuppliers': this.allowedSuppliers,
                'time': this.currentTime, 'limit': this.pageSize, 'offset': this.offset, 'search': this.search,
                'purchaseOrSale': this.purchaseOrSale
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
                        if (!invoice.thumb.includes('data:image/jpeg;base64'))
                            invoice.thumb = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64, ' + invoice.thumb);
                    });
                }

                /*
                * Starting from here, we fill the customers tree
                */
                const customersPurchaseToKeep : any = [];
                const customersSaleToKeep : any = [];
                this.allowedCustomers.forEach((customer: any) => {
                    this.invoices.forEach((invoice:any) => {
                        if (invoice.purchase_or_sale === 'purchase' && !customersPurchaseToKeep.includes(customer))
                            customersPurchaseToKeep.push(customer);
                        if (invoice.purchase_or_sale === 'sale' && !customersSaleToKeep.includes(customer))
                            customersSaleToKeep.push(customer);
                    });
                });

                /*
                * RESET the TREE DATA before re populate it
                */
                this.TREE_DATA.forEach((data: any, index: number) => {
                    this.TREE_DATA[index].display = true;
                    this.TREE_DATA[index].number = 0;
                    this.TREE_DATA[index].children = [];
                });

                this.TREE_DATA.forEach((data: any, index: number) => {
                    customersSaleToKeep.forEach((customer1: any) => {
                        if (data.id === customer1) {
                            let childExists = false;
                            this.TREE_DATA[index].children.forEach((child: any) => {
                                if (child.id === 0)
                                    childExists = true;
                            });
                            if (!childExists) {
                                this.TREE_DATA[index].children.push(
                                    {name: this.translate.instant('UPLOAD.sale_invoice'), id: 0, display: true, number: 0, children: []},
                                );
                                this.createChildren('sale', 0, index);
                            }
                        }
                    });
                    customersPurchaseToKeep.forEach((customer2: any) => {
                        if (data.id === customer2) {
                            if (this.TREE_DATA[index]) {
                                let childExists = false;
                                this.TREE_DATA[index].children.forEach((child: any) => {
                                    if (child.id === 1)
                                        childExists = true;
                                });
                                if (!childExists) {
                                    this.TREE_DATA[index].children.push(
                                        {name: this.translate.instant('UPLOAD.purchase_invoice'), id: 1, display: true, number: 0, children: []},
                                    );
                                    this.createChildren('purchase', 1, index);
                                }
                            }
                        }
                    });
                });
                this.dataSource.data = this.TREE_DATA;
            }),
            finalize(() => {this.loading = false;}),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    fillChildren(parentId: any , parent: any, childName: any, supplierName: any, supplierId: any, id: any, purchaseOrSale: any) {
        let childNameExists = false;
        parent.forEach((child: any) => {
            if (child.name === childName) {
                childNameExists = true;
                child.number = child.number + 1;
            }
        });

        if (!childNameExists) {
            parent.push({
                name: supplierName,
                supplier_id: supplierId,
                id: id,
                parent_id: parentId,
                purchase_or_sale: purchaseOrSale,
                number: 1,
                display: true
            });
        }
    }

    createChildren(purchaseOrSale: any, id: any, index: any) {
        this.TREE_DATA[index].children.forEach((child: any, childIndex: any) => {
            if (child.id === id) {
                this.invoices.forEach((invoice: any) => {
                    if (this.TREE_DATA[index].id === invoice.customer_id && invoice.purchase_or_sale === purchaseOrSale) {
                        if(invoice.supplier_id) {
                            this.fillChildren(this.TREE_DATA[index].id, this.TREE_DATA[index].children[childIndex].children, invoice.supplier_name, invoice.supplier_name, invoice.supplier_id, invoice.invoice_id, purchaseOrSale);
                        }else {
                            this.fillChildren(this.TREE_DATA[index].id, this.TREE_DATA[index].children[childIndex].children, invoice.supplier_name, this.translate.instant('ACCOUNTS.supplier_unknow'), invoice.supplier_id, invoice.invoice_id, purchaseOrSale);
                        }
                        this.TREE_DATA[index].children[childIndex].number = this.TREE_DATA[index].children[childIndex].number + 1;
                        this.TREE_DATA[index].number = this.TREE_DATA[index].number + 1;
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
        this.allowedCustomers = [];
        this.allowedSuppliers = [];
        this.purchaseOrSale = '';
        this.search = '';
        this.resetPaginator();
        this.loadCustomers();
    }

    selectOrUnselectAllInvoices(event: any) {
        const label = event.srcElement.textContent;
        this.invoiceToDeleteSelected = !this.invoiceToDeleteSelected;
        const checkboxList = $(".checkBox_list");
        checkboxList.each((cpt: any) => {
            checkboxList[cpt].checked = label === this.translate.instant('VERIFIER.select_all');
        });
        this.totalChecked = $('input.checkBox_list:checked').length;
    }

    deleteAllInvoices() {
        this.loading = true;
        const checkboxList = $(".checkBox_list");
        checkboxList.each((cpt: any) => {
            if (checkboxList[cpt].checked) {
                const invoiceId = checkboxList[cpt].id.split('_')[0];
                this.deleteInvoice(invoiceId, true);
            }
        });
        this.notify.success(this.translate.instant('VERIFIER.all_invoices_checked_deleted'));
        this.loadCustomers();
    }

    deleteInvoice(invoiceId: number, batchDelete = false) {
        this.http.delete(API_URL + '/ws/verifier/invoices/delete/' + invoiceId, {headers: this.authService.headers}).pipe(
            tap(() => {
                if (!batchDelete) {
                    this.loadCustomers();
                    this.notify.success(this.translate.instant('VERIFIER.invoices_deleted'));
                }
                this.historyService.addHistory('verifier', 'delete_invoice', this.translate.instant('HISTORY-DESC.delete_invoice', {invoice_id: invoiceId}));
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    checkCheckedInvoices () {
        this.totalChecked = $('input.checkBox_list:checked').length;
        this.invoiceToDeleteSelected = this.totalChecked !== 0;
    }

    deleteConfirmDialog(invoiceId: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('VERIFIER.confirm_delete_invoice'),
                confirmButton       : this.translate.instant('GLOBAL.delete'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this.deleteInvoice(invoiceId);
            }
        });
    }

    displayInvoiceLocked(lockedBy: any) {
        this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('VERIFIER.invoice_locked'),
                confirmText         : this.translate.instant('VERIFIER.invoice_locked_by', {'locked_by': lockedBy}),
                confirmButton       : this.translate.instant('GLOBAL.confirm'),
                confirmButtonColor  : "warn"
            },
            width: "600px",
        });
    }

    deleteAllConfirmDialog() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('VERIFIER.confirm_delete_all_invoices'),
                confirmButton       : this.translate.instant('VERIFIER.delete_all_checked'),
                confirmButtonColor  : "warn",
                cancelButton        : this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if(result) {
                this.deleteAllInvoices();
            }
        });
    }

    changeStatus(event: any) {
        this.currentStatus = event.value;
        this.resetPaginator();
        this.loadInvoices();
    }

    onTabChange(event: any) {
        this.search = '';
        this.selectedTab = event.index;
        this.localeStorageService.save('invoicesTimeIndex', this.selectedTab);
        this.currentTime = this.batchList[this.selectedTab].id;
        this.resetPaginator();
        this.loadInvoices();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.pageIndex = event.pageIndex;
        this.localeStorageService.save('invoicesPageIndex', event.pageIndex);
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
        this.localeStorageService.save('invoicesPageIndex', this.pageIndex);
    }

    expandAll() {
        this.expanded = !this.expanded;
        /*
        * mat-tree-node.child are clicked twice to be sure they will be close at the second click
         */
        $('mat-tree-node.child').click();
        $('mat-tree-node.parent').click();
        $('mat-tree-node.child').click();
    }
}
