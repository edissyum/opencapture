import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../services/notifications/notifications.service";
import {SettingsService} from "../../../../../services/settings.service";
import {PrivilegesService} from "../../../../../services/privileges.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../../../../../services/auth.service";
import {LastUrlService} from "../../../../../services/last-url.service";
import {LocalStorageService} from "../../../../../services/local-storage.service";
import {API_URL} from "../../../../env";
import {catchError, finalize, tap} from "rxjs/operators";
import {of} from "rxjs";
import {Sort} from "@angular/material/sort";
import {ConfirmDialogComponent} from "../../../../../services/confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-output-list',
    templateUrl: './outputs-list.component.html',
    styleUrls: ['./outputs-list.component.scss']
})
export class OutputsListComponent implements OnInit {
    headers         : HttpHeaders   = this.authService.headers;
    columnsToDisplay: string[]      = ['id', 'output_label', 'output_type_id', 'actions'];
    loading         : boolean       = true;
    outputs         : any           = [];
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
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localeStorageService: LocalStorageService,
    ) {}


    ngOnInit(): void {
        this.serviceSettings.init();
        // If we came from anoter route than profile or settings panel, reset saved settings before launch loadUsers function
        let lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl.includes('outputs/') || lastUrl == '/') {
            if (this.localeStorageService.get('outputsPageIndex'))
                this.pageIndex = parseInt(<string>this.localeStorageService.get('outputsPageIndex'))
            this.offset = this.pageSize * (this.pageIndex);
        } else
            this.localeStorageService.remove('outputsPageIndex')
        this.loadOutputs()
    }

    loadOutputs(): void {
        this.http.get(API_URL + '/ws/outputs/list?limit=' + this.pageSize + '&offset=' + this.offset, {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.outputs[0]) this.total = data.outputs[0].total;
                this.outputs = data.outputs;
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
        this.localeStorageService.save('outputsPageIndex', event.pageIndex);
        this.loadOutputs();
    }

    deleteConfirmDialog(output_id: number, output: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                confirmTitle: this.translate.instant('GLOBAL.confirm'),
                confirmText: this.translate.instant('OUTPUT.confirm_delete', {"output": output}),
                confirmButton: this.translate.instant('GLOBAL.delete'),
                confirmButtonColor: "warn",
                cancelButton: this.translate.instant('GLOBAL.cancel'),
            },
            width: "600px",
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteOutput(output_id);
            }
        });
    }

    deleteOutput(output_id: number) {
        if (output_id !== undefined) {
            this.http.delete(API_URL + '/ws/outputs/delete/' + output_id, {headers: this.authService.headers}).pipe(
                tap(() => {
                    this.loadOutputs();
                }),
                catchError((err: any) => {
                    console.debug(err);
                    this.notify.handleErrors(err);
                    return of(false);
                })
            ).subscribe();
        }
    }

    sortData(sort: Sort) {
        let data = this.outputs.slice();
        if (!sort.active || sort.direction === '') {
            this.outputs = data;
            return;
        }

        this.outputs = data.sort((a: any, b: any) => {
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
