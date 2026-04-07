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
import { InputSwitch } from "primereact/inputswitch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Accordion, AccordionTab } from "primereact/accordion";

import { getPrivilegesParent } from "./helpers";

import { Button } from "../../../../components/Button";
import { showToast } from "../../../../components/ToastProvider";
import { DynamicForm } from "../../../../components/form/DynamicForm";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";

export function SettingsGeneralRoleEditor() {
    const { get, put, post } = axiosApiCall();
    const navigate = useNavigate();
    const { roleId } = useParams<{ roleId: any }>();

    const privilegeClasses = 'flex items-center gap-2 border border-(--border-primary) rounded-md p-2 bg-(--bg-selected)';

    const [role, setRole] = useState<any>({});
    const [privileges, setPrivileges] = useState<any>({});
    const [rolePrivileges, setRolePrivileges] = useState<any>([]);

    const [loading, setLoading] = useState<boolean>(false);

    const routes = [
        { value: '/home', label: t('GLOBAL.home') },
        { value: '/upload', label: t('GLOBAL.upload') }
    ]

    const schema = z.object({
        enabled: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("ROLES.enabled")
        })),
        label_short: z.string(t('ROLES.label_short_mandatory')).min(3).describe(JSON.stringify({
            component: "input",
            type: "text",
            required: true,
            disabled: !!roleId,
            label: t("ROLES.label_short")
        })),
        label: z.string(t('ROLES.label_mandatory')).min(1, t('ROLES.label_mandatory')).describe(JSON.stringify({
            component: "input",
            required: true,
            type: "text",
            label: t("ROLES.role_label")
        }))
    });

    const routesSchema = z.object({
        default_route: z.string().optional().describe(JSON.stringify({
            component: "radio_box",
            options: routes,
            label: t("ROLES.default_route")
        }))
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema.extend(routesSchema.shape)),
        defaultValues: {},
        mode: "onChange"
    });

    // Fetch role data if editing an existing role
    useEffect(() => {
        if (!roleId) return;

        const fetchRole = async () => {
            try {
                const response = await get(`/roles/getById/${ roleId }`);
                setRole(response);
            } catch (error) {
                console.error('Error fetching role data :', error);
            }
        };

        fetchRole().then();
    }, [roleId]);

    // Fetch privileges for role
    useEffect(() => {
        if (!roleId) return;

        const fetchRolePrivileges = async () => {
            try {
                const response = await get(`/privileges/getbyRoleId/${ roleId }`);
                setRolePrivileges(response);
            } catch (error) {
                console.error('Error fetching role privileges :', error);
            }
        };

        fetchRolePrivileges().then();
    }, [roleId]);

    // Fetch privileges
    useEffect(() => {
        const fetchPrivileges = async () => {
            try {
                const response = await get(`/privileges/list`);
                setPrivileges(response.privileges);
            } catch (error) {
                console.error('Error fetching privileges :', error);
            }
        };

        fetchPrivileges().then();
    }, []);

    // Fill form when user data is loaded
    useEffect(() => {
        if (Object.keys(role).length === 0) return;

        Object.entries(role).forEach(([key, value]: any) => {
            setValue(key, value);
        });
    }, [role]);

    const handleCreate: any = async (data: FormData) => {
        setLoading(true);

        try {
            await post(`/roles/create`, data);
            showToast(t('ROLES.create_success'), 'success');
            navigate('/settings/general/roles');
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error creating role :', error);
        }
    }

    const handleUpdate: any = async (data: FormData) => {
        setLoading(true);

        try {
            await put(`/roles/update/${ roleId }`, data);

            const privilegesIds = rolePrivileges ? rolePrivileges.map((label: any) => {
                const privilege: any = Object.values(privileges).find((p: any) => p.label === label);
                return privilege ? privilege.id : null;
            }).filter((id: any) => id !== null) : [];

            await put(`/roles/updatePrivilege/${ roleId }`, { privileges: privilegesIds });

            showToast(t('ROLES.update_success'), 'success');
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error updating role :', error);
        }
    }

    const handleTogglePrivilege = (e: any, privilege: any) => {
        const isChecked = e.value;
        setRolePrivileges((prev: any) => {
            if (isChecked) {
                return [...prev, privilege.label];
            } else {
                return prev.filter((p: any) => p !== privilege.label);
            }
        });
    }

    return (
        <div className="p-6 bg-(--bg-secondary) h-full flex flex-col gap-4 overflow-y-auto">
            <div className='flex flex-col gap-4'>
                <h1 className="text-xl font-bold">
                    { roleId ? t('ROLES.editing') : t('ROLES.new_role') }
                </h1>
                <h1 className="text-lg font-semibold">
                    { t('ROLES.details') }
                </h1>
                <div className='w-1/3'>
                    <DynamicForm schema={ schema } errors={ errors } control={ control } labelFusion={ true }/>
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <h1 className="text-lg font-semibold">
                    { t('ROLES.default_route') }
                </h1>
                <div className='w-1/3'>
                    <DynamicForm schema={ routesSchema } errors={ errors } control={ control } labelFusion={ true }/>
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <h1 className="text-lg font-semibold">
                    { t('ROLES.permissions') }
                </h1>

                { privileges && Object.keys(privileges).length > 0 && (
                    <Accordion multiple activeIndex={ [0, 1, 2, 3, 4] } className='accordionRoles'>
                        { getPrivilegesParent().map((parent: any) => (
                            <AccordionTab header={
                                <div className='flex items-center gap-2'>
                                    <div className='bg-(--bg-secondary) p-2 rounded-md'>
                                        { parent.icon }
                                    </div>
                                    { parent.name }
                                </div>
                            }>
                                <div className='p-4 grid grid-cols-4 gap-4'>
                                    { Object.values(privileges).filter((privilege: any) => privilege.parent === parent.id).map((privilege: any) => (
                                        <div key={ privilege.id } className={ privilegeClasses }>
                                            <InputSwitch
                                                inputId={ privilege.label }
                                                checked={ rolePrivileges?.includes(privilege.label) }
                                                onChange={ (e: any) => handleTogglePrivilege(e, privilege) }
                                            />

                                            <label htmlFor={ privilege.label } className='cursor-pointer'>
                                                { t(`PRIVILEGES.${ privilege.label }`) }
                                            </label>
                                        </div>
                                    )) }
                                </div>
                            </AccordionTab>
                        )) }
                    </Accordion>
                ) }
            </div>

            <div className="mt-4">
                { roleId ? (
                    <Button onClick={ handleSubmit(handleUpdate) }
                            disabled={ loading || Object.keys(errors).length > 0 }>
                        { loading ? t('GLOBAL.updating') : t('ROLES.update_role') }
                    </Button>
                ) : (
                    <Button onClick={ handleSubmit(handleCreate) }
                            disabled={ loading || Object.keys(errors).length > 0 }>
                        { loading ? t('GLOBAL.creating') : t('ROLES.create_role') }
                    </Button>
                ) }
            </div>
        </div>
    );
}