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

import {MatPaginatorIntl} from "@angular/material/paginator";
import {Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {API_URL} from "./env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {NotificationService} from "../services/notifications/notifications.service";
import {HttpClient} from "@angular/common/http";
import {LocaleService} from "../services/locale.service";

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
    constructor(
        private http: HttpClient,
        private notify: NotificationService,
        private translate: TranslateService,
        private localeService: LocaleService,
    ) {
        super();
        this.getAndInitTranslations();
    }

    getAndInitTranslations() {
        if (this.localeService.currentLang === undefined) {
            this.http.get(API_URL + '/ws/i18n/getCurrentLang').pipe(
                tap((data: any) => {
                    this.translate.use(data.lang);
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
        }else {
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
        }
    }

    getRangeLabel = (page: number, pageSize: number, length: number) =>  {
        if (length === 0 || pageSize === 0) { return '0 ' + this.translate.instant('PAGINATOR.of') + ` ${length}`; }

        length = Math.max(length, 0);

        const startIndex = page * pageSize;

        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length):
                startIndex + pageSize;

        const nbPage = Math.ceil(length / pageSize);
        return ` ${startIndex + 1} - ${endIndex} ` + this.translate.instant('PAGINATOR.on') + ` ${length} ` + ' | ' +
            this.translate.instant('PAGINATOR.page') + ` ${page + 1} / ${nbPage}`;
    }
}