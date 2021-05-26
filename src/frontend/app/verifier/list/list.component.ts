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

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class VerifierListComponent implements OnInit {
    loading: boolean = true
    status: any[] = []
    defaultStatus: string = 'NEW'
    batchList: any[] = [
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

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private notify: NotificationService,
        public translate: TranslateService,
        private localeStorageService: LocalStorageService

    ) {}

    ngOnInit(): void {
        this.localeStorageService.save('splitter_or_verifier', 'verifier')
        this.http.get(API_URL + '/ws/status/list', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                this.status = data.status
                console.log(this.status)
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    changeTab(){
        this.loading = true
        setTimeout(() => {this.loading = false}, 1000)
    }


}
