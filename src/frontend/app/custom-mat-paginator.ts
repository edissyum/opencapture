import {MatPaginatorIntl} from "@angular/material/paginator";
import {Injectable} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
    constructor(
        private translate: TranslateService
    ) {
        super();
        this.getAndInitTranslations();
    }

    getAndInitTranslations() {
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

    getRangeLabel = (page: number, pageSize: number, length: number) =>  {
        if (length == 0 || pageSize == 0) { return `0 de ${length}`; }

        length = Math.max(length, 0);

        const startIndex = page * pageSize;

        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length):
                startIndex + pageSize;

        const nbPage = Math.ceil(length / pageSize);
        //return `${startIndex + 1} - ${endIndex} / ${length} (${page})`;
        return this.translate.instant('PAGINATOR.page') + ` ${page + 1} / ${nbPage}`;
    }
}