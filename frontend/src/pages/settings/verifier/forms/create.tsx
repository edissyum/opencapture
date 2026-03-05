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
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { SettingsVerifierFormsDetails } from "./details";
import { showToast } from "../../../../components/ToastProvider";
import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";

export function SettingsVerifierFormsCreate() {
    const { post } = axiosApiCall();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formSettings, setFormSettings] = useState<any>({
        label: undefined,
        default_form: false,
        outputs: [],
        module: 'verifier',
        settings: {
            allow_learning: false
        }
    });

    const handleCreate = async () => {
        setIsSubmitting(true);

        try {
            const newForm = await post(`forms/verifier/create`, formSettings);

            navigate(`/settings/verifier/forms/edit/${ newForm.id }`, { replace: true });

            showToast(t('FORMS.form_created'), 'success');
            setIsSubmitting(false);
        } catch (error) {
            setIsSubmitting(false);
            console.error("Error creating form settings:", error);
        }
    };

    return (
        <SettingsVerifierFormsDetails
            submit={ handleCreate }
            isSubmitting={ isSubmitting }
            formSettings={ formSettings }
            setFormSettings={ setFormSettings }
            submitLabel={ t('FORMS.create_new_form') }
            submitLabelLoading={ t('GLOBAL.creating') }
        />
    );
}