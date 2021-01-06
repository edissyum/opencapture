import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { AppMaterialModule } from '../app/app-material.module';
import { CustomSnackbarComponent, NotificationService } from './notifications/notifications.service';

@NgModule({
    imports: [
        AppMaterialModule,
        CommonModule
    ],
    declarations: [
        CustomSnackbarComponent,
    ],
    exports: [],
    entryComponents: [
        CustomSnackbarComponent,
    ],
    providers: [NotificationService]
})
export class ServicesModule { }
