import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LastUrlService } from './last-url.service';
import { TranslateModule } from "@ngx-translate/core";
import { AppMaterialModule } from '../app/app-material.module';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { CustomSnackbarComponent, NotificationService } from './notifications/notifications.service';

@NgModule({
    imports: [
        AppMaterialModule,
        CommonModule,
        TranslateModule
    ],
    declarations: [
        CustomSnackbarComponent,
        ConfirmDialogComponent,
    ],
    exports: [
    ],
    entryComponents: [
        CustomSnackbarComponent,
        ConfirmDialogComponent,
    ],
    providers: [NotificationService, LastUrlService]
})
export class ServicesModule { }
