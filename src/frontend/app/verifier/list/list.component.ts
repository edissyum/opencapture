import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from "../../../services/local-storage.service";
import {API_URL} from "../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {NotificationService} from "../../../services/notifications/notifications.service";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
import {LastUrlService} from "../../../services/last-url.service";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from "@angular/material/form-field";

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    providers: [
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' } },
    ]
})
export class VerifierListComponent implements OnInit {
    loading         : boolean   = true
    status          : any[]     = []
    currentStatus   : string    = 'NEW'
    currentTime     : string    = 'today'
    batchList       : any[]     = [
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
    pageSize        : number    = 16;
    pageIndex       : number    = 0;
    total           : number    = 0;
    offset          : number    = 0;
    invoices        : any []    = [];

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        private routerExtService: LastUrlService,
        private localeStorageService: LocalStorageService

    ) {}

    ngOnInit(): void {
        this.localeStorageService.save('splitter_or_verifier', 'verifier')
        let lastUrl = this.routerExtService.getPreviousUrl()
        if (lastUrl.includes('verifier/') && !lastUrl.includes('settings') || lastUrl == '/' || lastUrl == '/upload'){
            if (this.localeStorageService.get('invoicesPageIndex'))
                this.pageIndex = parseInt(<string>this.localeStorageService.get('invoicesPageIndex'))
            this.offset = this.pageSize * (this.pageIndex)
        }else
            this.localeStorageService.remove('invoicesPageIndex')

        this.http.get(API_URL + '/ws/status/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.status = data.status
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()

        this.loadInvoices()
    }

    loadInvoices(){
        this.http.post(API_URL + '/ws/verifier/invoices/list',
            {'status': this.currentStatus, 'time': this.currentTime, 'limit': this.pageSize, 'offset': this.offset},
            {headers: this.authService.headers}
        ).pipe(
            tap((data: any) => {
                this.total = data.total
                this.invoices = data.invoices
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    changeStatus(event: any){
        this.currentStatus = event.value
        this.loadInvoices()
    }

    changeTab(event: any){
        this.loading = true
        let selectedIndex = event.index
        this.currentTime = this.batchList[selectedIndex].id
        this.loadInvoices()
        setTimeout(() => {this.loading = false}, 1000)
    }

    onPageChange(event: any){
        this.pageSize = event.pageSize
        this.offset = this.pageSize * (event.pageIndex)
        this.localeStorageService.save('invoicesPageIndex', event.pageIndex)
        this.loadInvoices()
    }

}
