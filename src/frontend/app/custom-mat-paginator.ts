import {MatPaginatorIntl} from "@angular/material/paginator";
import {Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {API_URL} from "./env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {NotificationService} from "../services/notifications/notifications.service";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
    constructor(
        private http: HttpClient,
        private notify: NotificationService,
        private translate: TranslateService
    ) {
        super();
        this.getAndInitTranslations();
    }

    getAndInitTranslations() {
        this.http.get(API_URL + '/ws/i18n/getCurrentLang').pipe(
            tap((data: any) => {
                this.translate.use(data.lang)
                this.translate.get('PAGINATOR.items_per_page').subscribe((translated: string) => {
                    this.itemsPerPageLabel = translated;
                });
                this.translate.get('PAGINATOR.next_page').subscribe((translated: string) => {
                    this.nextPageLabel = translated;
                });
                this.translate.get('PAGINATOR.first_page').subscribe((translated: string) => {
                    this.firstPageLabel = translated;
                });
                this.translate.get('PAGINATOR.last_page').subscribe((translated: string) => {
                    this.lastPageLabel = translated;
                });
                this.translate.get('PAGINATOR.previous_page').subscribe((translated: string) => {
                    this.previousPageLabel = translated;
                });
                this.changes.next();
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    getRangeLabel = (page: number, pageSize: number, length: number) =>  {
        if (length == 0 || pageSize == 0) { return '0 ' + this.translate.instant('PAGINATOR.of') + ` ${length}`; }

        length = Math.max(length, 0);

        const startIndex = page * pageSize;

        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length):
                startIndex + pageSize;

        const nbPage = Math.ceil(length / pageSize);
        return this.translate.instant('PAGINATOR.display') + ' ' + this.translate.instant('PAGINATOR.of') + ' ' +
            ` ${startIndex + 1} - ${endIndex} ` + this.translate.instant('PAGINATOR.on') + ` ${length} ` + '  |  ' +
            this.translate.instant('PAGINATOR.page') + ` ${page + 1} / ${nbPage}`;
    }
}