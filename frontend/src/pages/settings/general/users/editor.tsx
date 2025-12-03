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
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../../components/Button";
import { useUser } from "../../../../services/hooks/useUser";
import { showToast } from "../../../../components/ToastProvider";
import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { DynamicForm } from "../../../../components/form/DynamicForm.tsx";
import { emptyToUndefined } from "../../../../services/zod.tsx";
import { zodResolver } from "@hookform/resolvers/zod";

export function SettingsGeneralUserEditor() {
    const { get, put, post } = axiosApiCall();
    const navigate = useNavigate();
    const { user: loggedUser, loadingUser } = useUser();

    const [user, setUser] = useState<any>({});
    const [roles, setRoles] = useState<any[]>([]);
    const { userId } = useParams<{ userId: any }>();

    const connectionModes = [
        { id: 'standard', label: t('USERS.standard') },
        { id: 'webservice', label: t('USERS.webservice') }
    ];

    const detailsSchema = z.object({
        username: z.string().min(3).describe(JSON.stringify({
            component: "input",
            type: "text",
            required: true,
            disabled: !!userId,
            label: t("USERS.username")
        })),
        lastname: z.string().min(1).describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("USERS.lastname")
        })),
        firstname: z.string().min(1).describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("USERS.firstname")
        })),
        email: emptyToUndefined(z.email().optional()).describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("USERS.email")
        }))
    });

    const securitySchema = z.object({
        password: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "password",
            label: t("USERS.password")
        })),
        passwordCheck: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "password",
            label: t("USERS.password_check")
        })),
        role: z.number().describe(JSON.stringify({
            component: "dropdown",
            type: "password",
            options: roles.map((role: any) => ({
                value: role.id,
                label: role.label
            })),
            label: t("USERS.password")
        })),
        mode: z.enum(['standard', 'webservice']).describe(JSON.stringify({
            component: "dropdown",
            type: "password",
            options: connectionModes.map((role: any) => ({
                value: role.id,
                label: role.label
            })),
            label: t("USERS.password")
        }))
    });

    const { control, watch, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(detailsSchema),
        defaultValues: {
            username: "",
            firstname: "",
            lastname: "",
            email: ""
        },
        mode: "onChange"
    });

    const formData = watch();

    const [loading, setLoading] = useState<boolean>(false);

    // Fetch roles for role dropdown
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

        fetchRoles().then();
    }, [loadingUser]);

    // Fetch user data if editing an existing user
    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const response = await get(`/users/getById/${ userId }`);
                setUser(response);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUser().then();
    }, [userId]);

    // Fill form when user data is loaded
    useEffect(() => {
        if (Object.keys(user).length === 0) return;

        Object.entries(user).forEach(([key, value]: any) => {
            setValue(key, value);
        });
    }, [user]);

    const handleCreate = async () => {
        setLoading(true);

        // try {
        //     await post(`/roles/create`, role);
        //     showToast(t('ROLES.create_success'), 'success');
        //     navigate('/settings/general/roles');
        //     setLoading(false);
        // } catch (error) {
        //     setLoading(false);
        //     console.error('Error creating role:', error);
        // }
    }

    const handleUpdate: any = async (data: FormData) => {
        if (errors && Object.keys(errors).length > 0) return;

        setLoading(true);

        try {
            await put(`/users/update/${ userId }`, data);
            showToast(t('USERS.update_success'), 'success');
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error updating user:', error);
        }
    }

    return (
        <div className="p-8 bg-(--bg-secondary) h-full overflow-y-auto">
            <div className='flex items-center gap-1 text-(--text-secondary) cursor-pointer mb-4'
                 onClick={ () => navigate('/settings/general/users') }>
                <ArrowLeft/>
                { t('USERS.list') }
            </div>
            <h1 className="text-xl font-bold mb-4">
                { userId ? t('USERS.editing') : t('USERS.new_user') }
            </h1>
            <h1 className="text-lg font-semibold mb-4">
                { t('ROLES.details') }
            </h1>
            <div className='w-1/3 flex flex-col gap-4 my-6'>
                <DynamicForm
                    schema={ detailsSchema }
                    control={ control }
                    labelFusion={ true }
                    errors={ errors }
                    formData={ formData }
                />
            </div>

            <h1 className="text-lg font-semibold mb-4">
                { t('USERS.security') }
            </h1>

            <div className='w-1/3'>
                <DynamicForm
                    schema={ securitySchema }
                    control={ control }
                    labelFusion={ true }
                    errors={ errors }
                    formData={ formData }
                />
            </div>

            {/*
            <div className='w-1/3'>
                <Controller
                    control={ control }
                    name='password'
                    render={ ({ field }) => (
                        <Input id='password' value={ field.value }
                               disabled={ !userId } type='password'
                               onChange={ (e) => {
                                   field.onChange(e.target.value)
                               } }
                               label={ t('SMTP.password') } autoComplete='new-password'
                               error={ errors.password?.message }/>
                    ) }
                />

                <Controller
                    control={ control }
                    name='passwordCheck'
                    render={ ({ field }) => (
                        <Input id='passwordCheck' value={ field.value }
                               disabled={ !userId } type='password'
                               onChange={ (e) => {
                                   field.onChange(e.target.value)
                               } }
                               label={ t('USERS.password_check') } autoComplete='new-password'
                               error={ errors.passwordCheck?.message }/>
                    ) }
                />

                <Controller
                    name="role"
                    control={ control }
                    render={ ({ field }) => (
                        <FloatLabel>
                            <Dropdown
                                filter
                                id="folder_to_crawl"
                                value={ field.value }
                                options={ roles.map((role: any) => ({
                                    value: role.id,
                                    label: role.label
                                })) }
                                onChange={ (e) => field.onChange(e.value) }
                                className="w-full"
                            />
                            <label htmlFor="role">{ t("USERS.role") }</label>
                        </FloatLabel>
                    ) }
                />

                <Controller
                    name="mode"
                    control={ control }
                    render={ ({ field }) => (
                        <FloatLabel className="mt-5">
                            <Dropdown
                                filter
                                id="mode"
                                value={ field.value }
                                options={ connectionModes.map((role: any) => ({
                                    value: role.id,
                                    label: role.label
                                })) }
                                onChange={ (e) => field.onChange(e.value) }
                                className="w-full"
                            />
                            <label htmlFor="mode">{ t("USERS.mode") }</label>
                        </FloatLabel>
                    ) }
                />
            </div>
            */ }
            <div className="mt-12">
                { userId ? (
                    <Button onClick={ handleSubmit(handleUpdate) }
                            disabled={ loading || Object.keys(errors).length > 0 }>
                        { loading ? t('USERS.updating') : t('USERS.update_user') }
                    </Button>
                ) : (
                    <Button onClick={ handleCreate } disabled={ loading || Object.keys(errors).length > 0 }>
                        { loading ? t('USERS.creating') : t('USERS.create_user') }
                    </Button>
                ) }
            </div>
        </div>
    );
}