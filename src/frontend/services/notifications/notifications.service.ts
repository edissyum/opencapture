import { MatSnackBar } from '@angular/material/snack-bar';
import { Injectable, Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

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

    constructor(public translate: TranslateService, private router: Router, public snackBar: MatSnackBar) {
    }
    success(message: string) {
        const duration = this.getMessageDuration(message, 2000);
        const snackBar = this.snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: duration,
            panelClass: ['success-snackbar', 'mt-16'],
            verticalPosition : 'top',
            horizontalPosition: 'right',
            data: { message: message, icon: 'info-circle', close: () => {snackBar.dismiss()} }
        });
    }

    error(message: string, url: any = null) {
        const duration = this.getMessageDuration(message, 4000);
        const snackBar = this.snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: duration,
            panelClass: ['error-snackbar', 'mt-16'],
            verticalPosition : 'top',
            horizontalPosition: 'right',
            data: { url: url, message: message, icon: 'exclamation-triangle', close: () => {snackBar.dismiss()} }
        });
    }

    handleErrors(err: any) {
        if (err.status === 0 && err.statusText === 'Unknown Error') {
            let message = this.translate.instant('ERROR.connection_failed')
            if(err.statusText !== undefined)
                message += ' : ' + err.statusText
            this.error(message);
        } else {
            if (err.error !== undefined) {
                if (err.error.errors !== undefined) {
                    this.error(err.error.errors + ' : ' + err.error.message, err.url);
                    if (err.status === 403 || err.status === 404) {
                        this.router.navigate(['/home']);
                    }
                } else if (err.error.exception !== undefined) {
                    this.error(err.error.exception[0].message, err.url);
                } else if (err.error.error !== undefined) {
                    if (err.error.error[0] !== undefined) {
                        this.error(err.error.error[0].message, err.url);
                    } else {
                        this.error(err.error.error.message, err.url);
                    }
                } else {
                    this.error(`${err.status} : ${err.statusText}`, err.url);
                }
            } else {
                this.error(err);
            }
        }
    }

    handleSoftErrors(err: any) {
        console.log(err);
        if (err.error !== undefined) {
            if (err.error.errors !== undefined) {
                this.error(err.error.errors, err.url);
            } else if (err.error.exception !== undefined) {
                this.error(err.error.exception[0].message, err.url);
            } else if (err.error.error !== undefined) {
                if (err.error.error[0] !== undefined) {
                    this.error(err.error.error[0].message, err.url);
                } else {
                    this.error(err.error.error.message, err.url);
                }
            } else {
                this.error(`${err.status} : ${err.statusText}`, err.url);
            }
        } else {
            this.error(err);
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
