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

 @dev : Nathan CHEVAL <nathan.cheval@edissyum.com> */

import { t } from "i18next";
import { useEffect, useState } from "react";

import { axiosApiCall } from "./axiosApiCall";

export function usePasswordRules() {
    const { get, loading, error } = axiosApiCall();
    const [passwordRules, setPasswordRules] = useState<any>({});

    // Fetch password rules
    useEffect(() => {
        const fetchPasswordRules = async () => {
            try {
                const data = await get(`config/getConfigurationNoAuth/passwordRules`);
                if (data && data.configuration[0] && data.configuration[0].data.value) {
                    setPasswordRules(data.configuration[0].data.value);
                }
            } catch (error) {
                console.error("Failed to fetch password rules : ", error);
            }
        };

        fetchPasswordRules().then();
    }, []);

    const verifyPassword = (password: string) => {
        let errorMessage = "";

        if (passwordRules.minLength && password.length < passwordRules.minLength) {
            errorMessage = t(`SECURITY.minLengthError`, { minLength: passwordRules.minLength });
        } else if (passwordRules.uppercaseMandatory && !/[A-Z]/.test(password)) {
            errorMessage = t(`SECURITY.uppercaseMandatoryError`);
        } else if (passwordRules.specialCharMandatory && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errorMessage = t(`SECURITY.specialCharMandatoryError`);
        } else if (passwordRules.numberMandatory && !/\d/.test(password)) {
            errorMessage = t(`SECURITY.numberMandatoryError`);
        }

        return errorMessage;
    }

    return { verifyPassword, loading, error };
}