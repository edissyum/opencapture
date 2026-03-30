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
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../../../../components/Button";
import { useUser } from "../../../../services/hooks/useUser";
import { showToast } from "../../../../components/ToastProvider";
import { DynamicForm } from "../../../../components/form/DynamicForm";
import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";

export function SettingsGeneralUserEditor() {
    const { get, put, post } = axiosApiCall();
    const navigate = useNavigate();
    const { user: loggedUser, loadingUser } = useUser();

    const { userId } = useParams<{ userId: any }>();

    const [user, setUser] = useState<any>({});
    const [roles, setRoles] = useState<any[]>([]);
    const [forms, setForms] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);

    const connectionModes = [
        { id: 'standard', label: t('USERS.standard') },
        { id: 'webservice', label: t('USERS.webservice') }
    ];

    const detailsSchema = z.object({
        username: z.string(t('USERS.username_mandatory')).min(3).describe(JSON.stringify({
            component: "input",
            type: "text",
            required: true,
            disabled: !!userId,
            label: t("USERS.username")
        })),
        lastname: z.string().min(1).optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("USERS.lastname")
        })),
        firstname: z.string().min(1).optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("USERS.firstname")
        })),
        email: z.email(t('USERS.email_mandatory')).describe(JSON.stringify({
            component: "input",
            required: true,
            type: "text",
            label: t("USERS.email")
        }))
    });

    const securitySchema = z.object({
        password: userId
            ? z.string().optional().describe(JSON.stringify({
                component: "input",
                required: false,
                type: "password",
                label: t("USERS.password")
            }))
            : z.string(t('USERS.password_mandatory')).describe(JSON.stringify({
                component: "input",
                required: true,
                type: "password",
                label: t("USERS.password")
            })),
        password_check: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "password",
            label: t("USERS.password_check")
        })),
        role: z.number().describe(JSON.stringify({
            component: "dropdown",
            options: roles.map((role: any) => ({
                value: role.id,
                label: role.label
            })),
            label: t("USERS.role")
        })),
        mode: z.enum(['standard', 'webservice']).describe(JSON.stringify({
            component: "dropdown",
            required: true,
            options: connectionModes.map((role: any) => ({
                value: role.id,
                label: role.label
            })),
            label: t("USERS.mode")
        }))
    });

    const settingsSchema = z.object({
        forms: z.array(z.number()).describe(JSON.stringify({
            component: "multi_select",
            options: forms.map((form: any) => ({
                value: form.id,
                label: form.label
            })),
            label: t("USERS.forms")
        })),
        customers: z.array(z.number()).describe(JSON.stringify({
            component: "multi_select",
            required: true,
            options: customers.map((cutomers: any) => ({
                value: cutomers.id,
                label: cutomers.name
            })),
            label: t("USERS.customers")
        }))
    });

    const { control, watch, setValue, setError, clearErrors, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(detailsSchema.extend(securitySchema.shape).extend(settingsSchema.shape)),
        defaultValues: {},
        mode: "onChange"
    });

    const [loading, setLoading] = useState<boolean>(false);

    // Fetch roles, forms and customers
    useEffect(() => {
        if (loadingUser) return;

        const fetchRoles = async () => {
            try {
                const response = await get(`/roles/list/user/${ loggedUser.id }`);
                setRoles(response.roles);
            } catch (error) {
                console.error('Error fetching roles :', error);
            }
        };

        const fetchVerifierForms = async () => {
            try {
                const response = await get(`/forms/verifier/list`) || [];
                setForms((prevForms) => ([...prevForms, ...response.forms]));
            } catch (error) {
                console.error('Error fetching verifier forms :', error);
            }
        };

        const fetchSplitterForms = async () => {
            try {
                const response = await get(`/forms/splitter/list`) || [];
                setForms((prevForms) => ([...prevForms, ...response.forms]));
            } catch (error) {
                console.error('Error fetching splitter forms :', error);
            }
        };

        const fetchCustomers = async () => {
            try {
                const response = await get(`/accounts/customers/list`) || [];
                setCustomers(response.customers);
            } catch (error) {
                console.error('Error fetching customers :', error);
            }
        }

        fetchRoles().then();
        fetchVerifierForms().then();
        fetchSplitterForms().then();
        fetchCustomers().then();
    }, [loadingUser]);

    // Fetch user data if editing an existing user
    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const response = await get(`/users/getById/${ userId }`);
                setUser(response);
            } catch (error) {
                console.error('Error fetching user data :', error);
            }
        };

        fetchUser().then(async () => {
            // Also fetch forms and customers associated with the user
            const response_forms = await get(`/users/getFormsByUserId/${ userId }`);
            setUser((prevUser: any) => ({
                ...prevUser,
                forms: response_forms
            }));

            const response_customers = await get(`/users/getCustomersByUserId/${ userId }`);
            setUser((prevUser: any) => ({
                ...prevUser,
                customers: response_customers
            }));
        });
    }, [userId]);

    // Fill form when user data is loaded
    useEffect(() => {
        if (Object.keys(user).length === 0) return;

        Object.entries(user).forEach(([key, value]: any) => {
            setValue(key, value);
        });
    }, [user]);

    const handleCreate: any = async (data: FormData) => {
        if (errors && Object.keys(errors).length > 0) return;
        setLoading(true);

        try {
            await post(`/users/create`, data);
            showToast(t('ROLES.create_success'), 'success');
            navigate('/settings/general/users');
        } catch (error) {
            console.error('Error creating user :', error);
        } finally {
            setLoading(false);
        }
    }

    const handleUpdate: any = async (data: FormData) => {
        if (errors && Object.keys(errors).length > 0) return;

        setLoading(true);
        try {
            await put(`/users/update/${ userId }`, data);
            showToast(t('USERS.update_success'), 'success');
        } catch (error) {
            console.error('Error updating user :', error);
        } finally {
            setLoading(false);
        }
    }

    const password = watch("password");
    const passwordCheck = watch("password_check");

    useEffect(() => {
        if (password !== passwordCheck) {
            setError("password_check", {
                message: t("USERS.password_mismatch")
            });

            setError("password", {
                message: t("USERS.password_mismatch")
            });
        } else {
            clearErrors("password_check");
            clearErrors("password");
        }
    }, [password, passwordCheck]);

    return (
        <div className="p-6 bg-(--bg-secondary) h-full overflow-y-auto">
            <div className='w-1/3 flex flex-col gap-4'>
                <>
                    <h1 className="text-xl font-bold ">
                        { userId ? t('USERS.editing') : t('USERS.new_user') }
                    </h1>

                    <h1 className="text-lg font-semibold ">
                        { t('ROLES.details') }
                    </h1>

                    <DynamicForm errors={ errors } control={ control } labelFusion={ true } schema={ detailsSchema } gap={ 2 }/>
                </>

                <>
                    <h1 className="text-lg font-semibold">
                        { t('USERS.security') }
                    </h1>

                    <DynamicForm errors={ errors } control={ control } labelFusion={ true } schema={ securitySchema } gap={ 2 }/>

                </>

                <>
                    <h1 className="text-lg font-semibold">
                        { t('USERS.settings') }
                    </h1>

                    <DynamicForm errors={ errors } control={ control } labelFusion={ true } schema={ settingsSchema } gap={ 2 }/>
                </>

                <div className="w-fit">
                    { userId ? (
                        <Button onClick={ handleSubmit(handleUpdate) }
                                disabled={ loading || Object.keys(errors).length > 0 }>
                            { loading ? t('GLOBAL.updating') : t('USERS.update_user') }
                        </Button>
                    ) : (
                        <Button onClick={ handleSubmit(handleCreate) }
                                disabled={ loading || Object.keys(errors).length > 0 }>
                            { loading ? t('GLOBAL.creating') : t('USERS.create_user') }
                        </Button>
                    ) }
                </div>
            </div>
        </div>
    );
}