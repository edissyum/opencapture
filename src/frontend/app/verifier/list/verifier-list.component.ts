import { Component, OnInit } from '@angular/core';
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
import { FlatTreeControl} from "@angular/cdk/tree";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import {UserService} from "../../../services/user.service";

interface accountsNode {
    name: string;
    id: number;
    number: number,
    display: boolean,
    children?: accountsNode [];
}

interface flatNode {
    expandable: boolean;
    name: string;
    display: boolean;
    number: number;
    level: number;
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
    total           : number            = 0;
    offset          : number            = 0;
    selectedTab     : number            = 0;
    invoices        : any []            = [];
    allowedCustomers: any []            = [];
    search          : string            = '';
    TREE_DATA       : accountsNode[]    = [];
    private _transformer = (node: accountsNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            display: node.display,
            number: node.number,
            level: level,
        };
    }

    treeControl = new FlatTreeControl<flatNode>(
        node => node.level, node => node.expandable);

    treeFlattener = new MatTreeFlattener(
        this._transformer, node => node.level, node => node.expandable, node => node.children);

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    constructor(
        private http: HttpClient,
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

    ngOnInit(): void {
        marker('VERIFIER.nb_pages') // Needed to get the translation in the JSON file
        this.localeStorageService.save('splitter_or_verifier', 'verifier')
        let lastUrl = this.routerExtService.getPreviousUrl()
        if (lastUrl.includes('verifier/') && !lastUrl.includes('settings') || lastUrl == '/' || lastUrl == '/upload'){
            if (this.localeStorageService.get('invoicesPageIndex'))
                this.pageIndex = parseInt(<string>this.localeStorageService.get('invoicesPageIndex'))
            if (this.localeStorageService.get('invoicesTimeIndex')){
                this.selectedTab = parseInt(<string>this.localeStorageService.get('invoicesTimeIndex'))
                this.currentTime = this.batchList[this.selectedTab].id
            }
            this.offset = this.pageSize * (this.pageIndex)
        }else{
            this.localeStorageService.remove('invoicesPageIndex')
            this.localeStorageService.remove('invoicesTimeIndex')
        }

        this.http.get(API_URL + '/ws/status/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.status = data.status
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()

        this.loadCustomers()
    }

    loadCustomers() {
        let user = this.userService.getUser()
        this.http.get(API_URL + '/ws/accounts/customers/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                let customers = data.customers;
                if (user.privileges == '*'){
                    customers.forEach((customer: any) => {
                        this.allowedCustomers.push(customer.id)
                        this.TREE_DATA.push({
                            name: customer.name,
                            id: customer.id,
                            display: true,
                            number: 0,
                            children: []
                        });
                    });
                    this.loadInvoices();
                }else{
                    this.http.get(API_URL + '/ws/users/getCustomersByUserId/' + user.id, {headers: this.authService.headers}).pipe(
                        tap((data: any) => {
                            data.forEach((id: any) =>{
                                customers.forEach((customer: any) => {
                                    if (customer.id == id) {
                                        this.allowedCustomers.push(customer.id)
                                        this.TREE_DATA.push({
                                            name: customer.name,
                                            id: customer.id,
                                            display: true,
                                            number: 0,
                                            children: []
                                        });
                                    }
                                });
                            });
                            this.loadInvoices();
                        }),
                        catchError((err: any) => {
                            console.debug(err);
                            this.notify.handleErrors(err);
                            return of(false);
                        })
                    ).subscribe()
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    loadInvoices() {
        this.loading = true
        this.http.post(API_URL + '/ws/verifier/invoices/list',
            {'allowedCustomers': this.allowedCustomers, 'status': this.currentStatus, 'time': this.currentTime, 'limit': this.pageSize, 'offset': this.offset, 'search': this.search},
            {headers: this.authService.headers}
        ).pipe(
            tap((data: any) => {
                this.total = data.total;
                this.invoices = data.invoices;
                let customersToKeep: any = [];
                let customersPurchaseToKeep : any = [];
                let customersSaleToKeep : any = [];
                this.allowedCustomers.forEach((customer: any) => {
                    this.invoices.forEach((invoice:any) => {
                        if (invoice.customer_id == customer) {
                            if (!customersToKeep.includes(customer))
                                customersToKeep.push(customer)
                            if (invoice.purchase_or_sale == 'purchase' && !customersPurchaseToKeep.includes(customer))
                                customersPurchaseToKeep.push(customer)
                            if (invoice.purchase_or_sale == 'sale' && !customersSaleToKeep.includes(customer))
                                customersSaleToKeep.push(customer)
                        }
                    })
                })

                let customersToDelete = this.allowedCustomers.filter(function(o1) {
                    return !customersToKeep.some(function(o2: any) {
                        return o1 == o2
                    });
                });
                // RESET the TREE DATA before re populate it
                this.allowedCustomers.forEach((customer: any) => {
                    this.TREE_DATA.forEach((data: any, index: number) => {
                        if (data.id == customer) {
                            this.TREE_DATA[index].display = true
                            this.TREE_DATA[index].children = []
                        }
                    });
                })
                customersToDelete.forEach((customer: any) => {
                    this.TREE_DATA.forEach((data: any, index: number) => {
                        if (data.id == customer) {
                            this.TREE_DATA[index].display = false
                            this.TREE_DATA[index].children = []
                        }
                    });
                })

                this.TREE_DATA.forEach((data: any, index: number) => {
                    customersSaleToKeep.forEach((customer1: any) => {
                        if (data.id == customer1) {
                            let childExists = false
                            // @ts-ignore
                            this.TREE_DATA[index].children.forEach((child: any) => {
                                if (child.id == 0)
                                    childExists = true
                            })
                            if (!childExists) {
                                // @ts-ignore
                                this.TREE_DATA[index].children.push(
                                    {name: this.translate.instant('UPLOAD.sale_invoice'), id: 0, display: true, number: 0, children: []},
                                )
                                // @ts-ignore
                                this.TREE_DATA[index].children.forEach((child: any, child_index) => {
                                    if (child.id == 0) {
                                        this.invoices.forEach((invoice: any) => {
                                            if (this.TREE_DATA[index].id == invoice.customer_id && invoice.purchase_or_sale == 'sale') {
                                                if(invoice.supplier_id) {
                                                    // @ts-ignore
                                                    this.fillChildren(this.TREE_DATA[index].children[child_index].children, invoice.supplier_name, invoice.supplier_name, invoice.id)
                                                }else {
                                                    // @ts-ignore
                                                    this.fillChildren(this.TREE_DATA[index].children[child_index].children, invoice.supplier_name, 'Fournisseur inconnu', invoice.id)
                                                }
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    })
                    customersPurchaseToKeep.forEach((customer2: any) => {
                        if (data.id == customer2) {
                            if (this.TREE_DATA[index]) {
                                let childExists = false
                                // @ts-ignore
                                this.TREE_DATA[index].children.forEach((child: any) => {
                                    if (child.id == 1)
                                        childExists = true
                                })
                                if (!childExists) {
                                    // @ts-ignore
                                    this.TREE_DATA[index].children.push(
                                        {name: this.translate.instant('UPLOAD.purchase_invoice'), id: 1, display: true, number: 0, children: []},
                                    )
                                    // @ts-ignore
                                    this.TREE_DATA[index].children.forEach((child: any, child_index) => {
                                        if (child.id == 1) {
                                            this.invoices.forEach((invoice: any) => {
                                                if (this.TREE_DATA[index].id == invoice.customer_id && invoice.purchase_or_sale == 'purchase') {
                                                    if(invoice.supplier_id) {
                                                        // @ts-ignore
                                                        this.fillChildren(this.TREE_DATA[index].children[child_index].children, invoice.supplier_name, invoice.supplier_name, invoice.id)
                                                    }else {
                                                        // @ts-ignore
                                                        this.fillChildren(this.TREE_DATA[index].children[child_index].children, invoice.supplier_name, 'Fournisseur inconnu', invoice.id)
                                                    }
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                        }
                    })
                })
                console.log(this.TREE_DATA)
                this.dataSource.data = this.TREE_DATA;
            }),
            finalize(() => {console.log('here');this.loading = false}),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    fillChildren(parent: any, child_name: any, name: any, id: any){
        let child_name_exists = false;
        parent.forEach((child: any) => {
            if (child.name == child_name){
                child_name_exists = true;
                child.number = child.number + 1;
            }
        })

        if (!child_name_exists){
            parent.push({
                name: name,
                id: id,
                number: 1,
                display: true
            });
        }
    }

    changeStatus(event: any){
        this.currentStatus = event.value
        this.loadInvoices()
    }

    onTabChange(event: any){
        this.selectedTab = event.index
        this.localeStorageService.save('invoicesTimeIndex', this.selectedTab)
        this.currentTime = this.batchList[this.selectedTab].id
        this.loadInvoices()
    }

    onPageChange(event: any){
        this.pageSize = event.pageSize
        this.offset = this.pageSize * (event.pageIndex)
        this.localeStorageService.save('invoicesPageIndex', event.pageIndex)
        this.loadInvoices()
    }

    searchInvoice(event: any){
        this.search = event.target.value
        this.loadInvoices()
    }

}
