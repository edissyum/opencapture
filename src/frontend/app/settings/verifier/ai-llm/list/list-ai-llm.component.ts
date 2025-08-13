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
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "../../../../../services/user.service";
import { AuthService } from "../../../../../services/auth.service";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "../../../../../services/notifications/notifications.service";
import { SettingsService } from "../../../../../services/settings.service";
import { PrivilegesService } from "../../../../../services/privileges.service";
import { SessionStorageService } from "../../../../../services/session-storage.service";
import { environment } from "../../../../env";
import { catchError, finalize, tap } from "rxjs/operators";
import { of } from "rxjs";
import { Sort } from "@angular/material/sort";
import { ConfirmDialogComponent } from "../../../../../services/confirm-dialog/confirm-dialog.component";

@Component({
    selector: 'app-ai-llm-list',
    templateUrl: './list-ai-llm.component.html',
    styleUrl: './list-ai-llm.component.scss',
    standalone: false
})
export class AiLLMListComponent implements OnInit {
    headers         : HttpHeaders   = this.authService.headers;
    columnsToDisplay: string[]      = ['id', 'name', 'provider', 'url', 'actions'];
    loading         : boolean       = true;
    llm_models      : any           = [];
    pageSize        : number        = 10;
    pageIndex       : number        = 0;
    total           : number        = 0;
    offset          : number        = 0;

    constructor(
        public router: Router,
        private http: HttpClient,
        private dialog: MatDialog,
        public userService: UserService,
        private authService: AuthService,
        public translate: TranslateService,
        private notify: NotificationService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService,
        private sessionStorageService: SessionStorageService
    ) {}

    ngOnInit(): void {
        this.serviceSettings.init();
        if (this.sessionStorageService.get('aiLLMPageIndex')) {
            this.pageIndex = parseInt(this.sessionStorageService.get('aiLLMPageIndex') as string);
        }
        this.offset = this.pageSize * (this.pageIndex);
        this.loadAiLLMModel();
    }

    loadAiLLMModel() {
        this.http.get(environment['url'] + '/ws/ai/llm/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.llm_models[0]) {
                    this.total = data.llm_models[0].total;
                } else if (this.pageIndex !== 0) {
                    this.pageIndex = this.pageIndex - 1;
                    this.offset = this.pageSize * (this.pageIndex);
                    this.loadAiLLMModel();
                }
                this.llm_models = data.llm_models;
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    deleteConfirmDialog(llmModelId: number, llmModel: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('AI-LLM.confirm_delete', {"llm_model": llmModel}),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel')
            },
            width: "600px"
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteAiLLMModel(llmModelId);
            }
        });
    }

    deleteAiLLMModel(llmModelId: number) {
        this.loading = true;
        this.http.delete(environment['url'] + '/ws/ai/llm/delete/' + llmModelId, {headers: this.authService.headers}).pipe(
            tap(() => {
                this.notify.success(this.translate.instant('AI-LLM.delete_success'));
                this.loadAiLLMModel();
            }),
            finalize(() => this.loading = false),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    onPageChange(event: any) {
        this.pageSize = event.pageSize;
        this.offset = this.pageSize * (event.pageIndex);
        this.pageIndex = event.pageIndex;
        this.sessionStorageService.save('aiLLMPageIndex', event.pageIndex);
        this.loadAiLLMModel();
    }

    sortData(sort: Sort) {
        const data = this.llm_models.slice();
        if (!sort.active || sort.direction === '') {
            this.llm_models = data;
            return;
        }

        this.llm_models = data.sort((a: any, b: any) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'id': return this.compare(a.id, b.id, isAsc);
                case 'label_short': return this.compare(a.label_short, b.label_short, isAsc);
                case 'label': return this.compare(a.label, b.label, isAsc);
                default:
                    return 0;
            }
        });
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
