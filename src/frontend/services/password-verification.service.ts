/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { of } from "rxjs";
import { environment } from "../app/env";
import { Injectable } from '@angular/core';
import { AuthService } from "./auth.service";
import { catchError, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { NotificationService } from "./notifications/notifications.service";

@Injectable({
    providedIn: 'root'
})
export class PasswordVerificationService {
    minLengthEnabled : boolean = false;
    passwordRules    : any     = {
        minLength: 0,
        uppercaseMandatory: false,
        specialCharMandatory: false,
        numberMandatory: false
    };

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private translate: TranslateService,
        private notify: NotificationService
    ) {
        this.http.get(environment['url'] + '/ws/config/getConfiguration/passwordRules', {headers: this.authService.headers}).pipe(
            tap((data: any) => {
                if (data.configuration[0] && data.configuration[0].data.value) {
                    this.passwordRules = data.configuration[0].data.value;
                    if (this.passwordRules.minLength > 0) {
                        this.minLengthEnabled = true;
                    }
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe();
    }

    checkPasswordValidityUnique(userFields: any) {
        const password = userFields.filter((element: any) => element.id === 'new_password')[0];
        const passwordError = this.verifyRules(password.control.value);

        if (passwordError !== '') password.control.setErrors({"message": passwordError});
        else password.control.setErrors(null);
    }

    checkPasswordValidity(userFields: any) {
        const password = userFields.filter((element: any) => element.id === 'password')[0];
        const passwordCheck = userFields.filter((element: any) => element.id === 'password_check')[0];
        const passwordError = this.verifyRules(password.control.value);
        const passwordCheckError = this.verifyRules(passwordCheck.control.value);

        if (passwordError !== '') password.control.setErrors({"message": passwordError});
        else password.control.setErrors(null);

        if (passwordCheckError !== '') passwordCheck.control.setErrors({"message": passwordCheckError});
        else passwordCheck.control.setErrors(null);

        if (passwordError === '' && passwordCheckError === '') {
            const mismatch = this.checkPasswordConfirmation(password.control.value, passwordCheck.control.value);
            if (mismatch) {
                password.control.setErrors({"message": mismatch});
                passwordCheck.control.setErrors({"message": mismatch});
            }
        }
    }

    verifyRules(password: string) {
        let errorMessage = '';
        if (password) {
            if (!password.match(/[A-Z]/g) && this.passwordRules.uppercaseMandatory) {
                errorMessage = this.translate.instant('AUTH.password_uppercase_mandatory');
            } else if (!password.match(/[0-9]/g) && this.passwordRules.numberMandatory) {
                errorMessage = this.translate.instant('AUTH.password_number_mandatory');
            } else if (!password.match(/[^A-Za-z0-9]/g) && this.passwordRules.specialCharMandatory) {
                errorMessage = this.translate.instant('AUTH.password_special_char_mandatory');
            } else if (password.length < this.passwordRules.minLength && this.passwordRules.minLength !== 0) {
                errorMessage = this.translate.instant('AUTH.password_min_length', {"min": this.passwordRules.minLength});
            }
        }
        return errorMessage;
    }

    checkPasswordConfirmation(password: any, passwordCheck: any) {
        let errorMessage;
        if (password && passwordCheck && password !== passwordCheck) {
            errorMessage = this.translate.instant('USER.password_mismatch');
        } else {
            errorMessage = '';
        }
        return errorMessage;
    }
}
