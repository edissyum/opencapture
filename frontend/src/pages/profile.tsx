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

import { z } from "zod";
import { t } from "i18next";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { USER_KEY, useUser } from "../services/hooks/useUser";
import { AxiosApiCall } from "../services/hooks/AxiosApiCall";
import { usePasswordRules } from "../services/hooks/usePasswordRules";

import { Button } from "../components/Button";
import { showToast } from "../components/ToastProvider";
import { DynamicForm } from "../components/form/DynamicForm";

export default function ProfilePage() {
    const { get, put } = AxiosApiCall();
    const { user, loadingUser } = useUser();
    const { verifyPassword } = usePasswordRules();
    const [loading, setLoading] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const [disablePassword, setDisablePassword] = useState(false);

    // Fetch login method
    useEffect(() => {
        if (!user) return;

        const fetchLoginMethod = async () => {
            try {
                const res = await get('/auth/getEnabledLoginMethod');
                if (res.login_method_name) {
                    setDisablePassword(res.login_method_name[0].method_name !== 'default');
                }
            } catch (error) {
                console.error('Error fetching login method:', error);
            }
        };

        fetchLoginMethod().then();
    }, [user]);

    const schemaDetails = z.object({
        lastname: z.string().min(1).describe(JSON.stringify({
            component: "input",
            required: true,
            type: "text",
            label: t("USERS.lastname")
        })),
        firstname: z.string().min(1).describe(JSON.stringify({
            component: "input",
            required: true,
            type: "text",
            label: t("USERS.firstname")
        })),
        email: z.string().optional().describe(JSON.stringify({
            component: "input",
            required: false,
            type: "text",
            label: t("USERS.email")
        })),
        password: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "password",
            show: !disablePassword,
            label: t("USERS.password")
        })),
        password_check: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "password",
            show: !disablePassword,
            label: t("USERS.password_check")
        })),
    });

    const { control, watch, setValue, handleSubmit, clearErrors, setError, formState: { errors } } = useForm({
        resolver: zodResolver(schemaDetails),
        mode: "onChange",
        defaultValues: {
            lastname: "",
            firstname: "",
            email: "",
            password: "",
            password_check: ""
        },
    });

    const password: any = watch("password");
    const passwordCheck: any = watch("password_check");

    // Validate password and password check fields
    useEffect(() => {
        if (!password) {
            clearErrors("password");
            clearErrors("password_check");
            return;
        }

        const errorMessage = verifyPassword(password);
        if (errorMessage) {
            setTimeout(() => {
                setError("password", { message: errorMessage });
            }, 0);
        } else {
            clearErrors("password");
        }

        if (password !== passwordCheck) {
            setError("password_check", {
                message: t("USERS.password_mismatch")
            });

            setError("password", {
                message: t("USERS.password_mismatch")
            });
        } else {
            clearErrors("password");
            clearErrors("password_check");
        }
    }, [password, passwordCheck]);

    // Retrieve user profile information and display it
    useEffect(() => {
        if (!user) return;

        const fetchUserProfile = async () => {
            try {
                const res = await get(`/users/profile/${ user.id }/${ user.id }`);
                setValue('lastname', res.lastname || "");
                setValue('firstname', res.firstname || "");
                setValue('email', res.email || "");
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchUserProfile().then();
    }, [loadingUser, user]);

    const handleUpdateProfile = async (data: any) => {
        if (errors && Object.keys(errors).length > 0) return;

        setLoadingSubmit(true);
        if (disablePassword || (!data.password && !data.password_check)) {
            delete data.password;
            delete data.password_check;
        }

        try {
            await put(`/users/update/${ user.id }`, data);
            showToast(t('PROFILE.update_success'));
            sessionStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...data }));
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast(t('PROFILE.update_error'), 'error');
        } finally {
            setLoadingSubmit(false);
        }
    }

    if (!user) return;

    return (
        <div className="p-6 flex flex-col gap-6">
            <h3 className="text-xl font-bold">{ t('PROFILE.details') }</h3>
            <div className='w-1/3'>
                <DynamicForm schema={ schemaDetails } errors={ errors } control={ control }/>
            </div>

            <Button onClick={ handleSubmit(handleUpdateProfile) }
                disabled={ loading || loadingSubmit || Object.keys(errors).length > 0 }>
                { loadingSubmit ? t('GLOBAL.updating') : t('PROFILE.update_profile') }
            </Button>
        </div>
    );
}