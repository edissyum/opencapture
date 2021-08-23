import {Component, OnInit, ViewChild} from '@angular/core';
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
declare var $: any;

interface accountsNode {
    name: string;
    id: number;
    parent_id: any;
    supplier_id: any;
    purchase_or_sale: any;
    number: number,
    display: boolean,
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
    loading         : boolean           = true
    status          : any[]             = []
    currentStatus   : string            = 'NEW'
    currentTime     : string            = 'today'
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
    ]
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
    expanded        : boolean           = false
    invoiceToDeleteSelected : boolean   = false
    totalChecked    : number            = 0

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
        private authService: AuthService,
        private userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        private routerExtService: LastUrlService,
        private localeStorageService: LocalStorageService
    ) {}

    hasChild = (_: number, node: flatNode) => node.expandable;
    isLevelOne = (_: number, node: flatNode) => node.level === 1;
    isLevelTwo = (_: number, node: flatNode) => node.level === 2;
    isNotLevelOne = (_: number, node: flatNode) => node.level !== 1;

    async ngOnInit() {
        marker('VERIFIER.nb_pages') // Needed to get the translation in the JSON file
        marker('VERIFIER.reset_invoice_list') // Needed to get the translation in the JSON file
        marker('VERIFIER.expand_all') // Needed to get the translation in the JSON file
        marker('VERIFIER.collapse_all') // Needed to get the translation in the JSON file
        marker('VERIFIER.select_all') // Needed to get the translation in the JSON file
        marker('VERIFIER.unselect_all') // Needed to get the translation in the JSON file

        this.localeStorageService.save('splitter_or_verifier', 'verifier')
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('verifier/') && !lastUrl.includes('settings') || lastUrl == '/' || lastUrl == '/upload') {
            if (this.localeStorageService.get('invoicesPageIndex'))
                this.pageIndex = parseInt(<string>this.localeStorageService.get('invoicesPageIndex'))
            if (this.localeStorageService.get('invoicesTimeIndex')) {
                this.selectedTab = parseInt(<string>this.localeStorageService.get('invoicesTimeIndex'))
                this.currentTime = this.batchList[this.selectedTab].id
            }
            this.offset = this.pageSize * (this.pageIndex);
        } else {
            this.localeStorageService.remove('invoicesPageIndex')
            this.localeStorageService.remove('invoicesTimeIndex')
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

    loadCustomers() {
        this.TREE_DATA = []
        this.http.get(API_URL + '/ws/accounts/customers/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                let customers = data.customers;
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
                    this.total = data.total
                    this.invoices = data.invoices;
                }

                /*
                * Starting from here, we fill the customers tree
                */
                // let customersToKeep: any = [];
                let customersPurchaseToKeep : any = [];
                let customersSaleToKeep : any = [];
                this.allowedCustomers.forEach((customer: any) => {
                    this.invoices.forEach((invoice:any) => {
                        if (invoice.purchase_or_sale == 'purchase' && !customersPurchaseToKeep.includes(customer))
                            customersPurchaseToKeep.push(customer)
                        if (invoice.purchase_or_sale == 'sale' && !customersSaleToKeep.includes(customer))
                            customersSaleToKeep.push(customer)
                    })
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
                        if (data.id == customer1) {
                            let childExists = false
                            this.TREE_DATA[index].children.forEach((child: any) => {
                                if (child.id == 0)
                                    childExists = true
                            })
                            if (!childExists) {
                                this.TREE_DATA[index].children.push(
                                    {name: this.translate.instant('UPLOAD.sale_invoice'), id: 0, display: true, number: 0, children: []},
                                )
                                this.createChildren('sale', 0, index)
                            }
                        }
                    })
                    customersPurchaseToKeep.forEach((customer2: any) => {
                        if (data.id == customer2) {
                            if (this.TREE_DATA[index]) {
                                let childExists = false
                                this.TREE_DATA[index].children.forEach((child: any) => {
                                    if (child.id == 1)
                                        childExists = true
                                })
                                if (!childExists) {
                                    this.TREE_DATA[index].children.push(
                                        {name: this.translate.instant('UPLOAD.purchase_invoice'), id: 1, display: true, number: 0, children: []},
                                    )
                                    this.createChildren('purchase', 1, index)
                                }
                            }
                        }
                    })
                });
                this.dataSource.data = this.TREE_DATA;
            }),
            finalize(() => {this.loading = false}),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    fillChildren(parent_id: any , parent: any, child_name: any, supplier_name: any, supplier_id: any, id: any, purchase_or_sale: any) {
        let child_name_exists = false;
        parent.forEach((child: any) => {
            if (child.name == child_name) {
                child_name_exists = true;
                child.number = child.number + 1;
            }
        })

        if (!child_name_exists) {
            parent.push({
                name: supplier_name,
                supplier_id: supplier_id,
                id: id,
                parent_id: parent_id,
                purchase_or_sale: purchase_or_sale,
                number: 1,
                display: true
            });
        }
    }

    createChildren(purchase_or_sale: any, id: any, index: any) {
        this.TREE_DATA[index].children.forEach((child: any, child_index: any) => {
            if (child.id == id) {
                this.invoices.forEach((invoice: any) => {
                    if (this.TREE_DATA[index].id == invoice.customer_id && invoice.purchase_or_sale == purchase_or_sale) {
                        if(invoice.supplier_id) {
                            this.fillChildren(this.TREE_DATA[index].id, this.TREE_DATA[index].children[child_index].children, invoice.supplier_name, invoice.supplier_name, invoice.supplier_id, invoice.id, purchase_or_sale)
                        }else {
                            this.fillChildren(this.TREE_DATA[index].id, this.TREE_DATA[index].children[child_index].children, invoice.supplier_name, 'Fournisseur inconnu', invoice.supplier_id, invoice.id, purchase_or_sale)
                        }
                        this.TREE_DATA[index].children[child_index].number = this.TREE_DATA[index].children[child_index].number + 1
                        this.TREE_DATA[index].number = this.TREE_DATA[index].number + 1
                    }
                })
            }
        })
    }

    loadInvoicePerCustomer(node: any) {
        let parent_id = node.parent_id;
        let supplier_id = node.supplier_id;
        let purchase_or_sale = node.purchase_or_sale;
        this.TREE_DATA.forEach((element: any) => {
            if (element.id == parent_id) {
                let customer_id = element.id;
                this.allowedCustomers = [customer_id];
                this.allowedSuppliers = [supplier_id];
                this.purchaseOrSale = purchase_or_sale;
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
        this.resetPaginator();
        this.loadCustomers();
    }

    selectOrUnselectAllInvoices(event: any) {
        let label = event.srcElement.textContent
        this.invoiceToDeleteSelected = !this.invoiceToDeleteSelected;
        let checkboxList = $(".checkBox_list")
        checkboxList.each((cpt: any) => {
            checkboxList[cpt].checked = label == this.translate.instant('VERIFIER.select_all');
        });
        this.totalChecked = $('input.checkBox_list:checked').length;
    }

    deleteAllInvoices() {
        this.loading = true;
        let checkboxList = $(".checkBox_list");
        checkboxList.each((cpt: any) => {
            let invoice_id = checkboxList[cpt].id.split('_')[0];
            this.deleteInvoice(invoice_id, true);
        });
        this.notify.success('VERIFIER.all_invoices_deleted');
        this.loadCustomers();
    }

    deleteInvoice(invoice_id: number, batch_delete = false) {
        this.http.delete(API_URL + '/ws/verifier/invoices/delete/' + invoice_id, {headers: this.authService.headers}).pipe(
            tap(() => {
                if (!batch_delete) this.loadCustomers();
                this.notify.success('VERIFIER.invoice_deleted');
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

    deleteConfirmDialog(invoice_id: number) {
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
                this.deleteInvoice(invoice_id)
            }
        });
    }

    deleteAllConfirmDialog() {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data:{
                confirmTitle        : this.translate.instant('GLOBAL.confirm'),
                confirmText         : this.translate.instant('VERIFIER.confirm_delete_all_invoices'),
                confirmButton       : this.translate.instant('VERIFIER.delete_all'),
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
        this.selectedTab = event.index;
        this.localeStorageService.save('invoicesTimeIndex', this.selectedTab);
        this.currentTime = this.batchList[this.selectedTab].id;
        this.loadInvoices();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
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
        this.expanded = !this.expanded
        /*
        * mat-tree-node.child are clicked twice to be sure they will be close at the second click
         */
        $('mat-tree-node.child').click()
        $('mat-tree-node.parent').click()
        $('mat-tree-node.child').click()
    }
}
