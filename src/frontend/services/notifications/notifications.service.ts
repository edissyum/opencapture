/** This file is part of Open-Capture for Invoices.

 Open-Capture for Invoices is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { MatSnackBar } from '@angular/material/snack-bar';
import { Injectable, Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from  "../../app/env";

@Component({
    selector: 'custom-snackbar',
    templateUrl: 'notification.service.html',
    styleUrls: ['notification.service.scss'],
})
export class CustomSnackbarComponent {
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }

    dismiss() {
        this.data.close();
    }
}

@Injectable()
export class NotificationService {
    constructor(
        public translate: TranslateService,
        private router: Router,
        public snackBar: MatSnackBar)
    { }

    success(message: string, _duration?: number) {
        const duration = _duration ? this.getMessageDuration(message, _duration):
            this.getMessageDuration(message, 2000);
        const snackBar = this.snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: duration,
            panelClass: ['success-snackbar', 'mt-20', 'mr-3'],
            verticalPosition : 'top',
            horizontalPosition: 'right',
            data: { message: message, icon: 'info-circle', close: () => {snackBar.dismiss();} }
        });
    }

    error(message: string, url: any = null) {
        const duration = this.getMessageDuration(message, 8000);
        const snackBar = this.snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: duration,
            panelClass: ['error-snackbar', 'mt-20', 'mr-3'],
            verticalPosition : 'top',
            horizontalPosition: 'right',
            data: { url: url, message: message, icon: 'exclamation-triangle', close: () => {snackBar.dismiss();} }
        });
    }

    handleErrors(err: any, route='') {
        if (err.status === 0 && err.statusText === 'Unknown Error') {
            const message = '<b>' + this.translate.instant('ERROR.connection_failed') + '</b> : ' +
                this.translate.instant('ERROR.is_server_up', {server: environment['url']});
            if (this.router.url !== '/login') {
                this.router.navigate(['/500']).then(() => {
                    this.error(message);
                });
            } else {
                this.error(message);
            }
        } else if (err.error !== undefined) {
            if (err.error.errors !== undefined) {
                if (err.error.message === 'missing_custom_or_file_doesnt_exists') {
                    this.error('<b>' + this.translate.instant('ERROR.configuration_error') + '</b> : ' + this.translate.instant('ERROR.is_custom_present_and_file_exists'));
                } else if (err.error.message === 'bad_or_missing_database_informations') {
                    this.error('<b>' + this.translate.instant('ERROR.database_error') + '</b> : ' + this.translate.instant('ERROR.bad_or_missing_database_informations'));
                } else if (err.error.message === 'missing_secret_key') {
                    this.error('<b>' + this.translate.instant('ERROR.configuration_error') + '</b> : ' + this.translate.instant('ERROR.missing_secret_key'));
                } else {
                    this.error('<b>' + err.error.errors + '</b> : ' + err.error.message, err.url);
                }
                if (err.status === 403 || err.status === 404) {
                    this.router.navigate(['/login']).then();
                }
                else if (err.error.errors === this.translate.instant('ERROR.jwt_error')) {
                    this.router.navigate(['/logout']).then();
                }
            } else if (err.error.exception !== undefined)
                this.error(err.error.exception[0].message, err.url);
            else if (err.error.error !== undefined) {
                if (err.error.error[0] !== undefined)
                    this.error(err.error.error[0].message, err.url);
                else
                    this.error(err.error.error.message, err.url);
            } else
                this.error(`${err.status} : ${err.statusText}`, err.url);
        } else {
            this.error(err);
        }

        if (route) {
            this.router.navigate([route]).then();
        }
    }

    getMessageDuration(message: string, minimumDuration: number) {
        const duration = (message.length / 25) * 1000;
        const maxDuration = 10000;
        if (duration < minimumDuration) {
            return minimumDuration;
        } else if (duration > maxDuration) {
            return maxDuration;
        }
        return duration;
    }
}
