import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { AppMaterialModule } from '../app/app-material.module';
import { CustomSnackbarComponent, NotificationService } from './notifications/notifications.service';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { LastUrlService } from './last-url.service';

@NgModule({
    imports: [
        AppMaterialModule,
        CommonModule
    ],
    declarations: [
        CustomSnackbarComponent,
        ConfirmDialogComponent,
    ],
    exports: [],
    entryComponents: [
        CustomSnackbarComponent,
        ConfirmDialogComponent
    ],
    providers: [NotificationService, LastUrlService]
})
export class ServicesModule { }
