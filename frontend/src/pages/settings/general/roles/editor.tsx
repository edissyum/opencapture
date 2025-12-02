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
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { useNavigate, useParams } from "react-router-dom";

import Input from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { RadioBox } from "../../../../components/RadioBox";
import { showToast } from "../../../../components/ToastProvider";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";

export function SettingsGeneralRoleEditor() {
    const { get, put, post } = axiosApiCall();
    const navigate = useNavigate();

    const [role, setRole] = useState<any>({});
    const { roleId } = useParams<{ roleId: any }>();

    const [loading, setLoading] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);

    const routes = [
        { value: '/home', label: t('GLOBAL.home') },
        { value: '/upload', label: t('GLOBAL.upload') }
    ]

    useEffect(() => {
        if (!roleId) return;

        const fetchRole = async () => {
            try {
                const response = await get(`/roles/getById/${ roleId }`);
                setRole(response);
            } catch (error) {
                console.error('Error fetching role data:', error);
            }
        };

        fetchRole().then();
    }, [roleId]);

    useEffect(() => {
        setHasError(!role.label || !role.label_short);
    }, [role]);

    const handleCreate = async () => {
        setLoading(true);

        try {
            await post(`/roles/create`, role);
            showToast(t('ROLES.create_success'), 'success');
            navigate('/settings/general/roles');
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error creating role:', error);
        }
    }

    const handleUpdate = async () => {
        setLoading(true);

        try {
            await put(`/roles/update/${ roleId }`, role);
            showToast(t('ROLES.update_success'), 'success');
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error('Error updating role:', error);
        }
    }

    return (
        <div className="p-8 bg-(--bg-secondary) h-full">
            <div className='flex items-center gap-1 text-(--text-secondary) cursor-pointer mb-4'
                 onClick={ () => navigate('/settings/general/roles') }>
                <ArrowLeft/>
                { t('ROLES.list') }
            </div>
            <h1 className="text-xl font-bold mb-4">
                { roleId ? t('ROLES.editing') : t('ROLES.new_role') }
            </h1>
            <h1 className="text-lg font-semibold mb-4">
                { t('ROLES.details') }
            </h1>
            <div className='w-1/3'>
                <div className='flex items-center mb-6'>
                    <InputSwitch inputId={ 'enabled' } checked={ role.enabled ?? true }
                                 onChange={ (e) => setRole({ ...role, enabled: e.target.value }) }/>
                    <label htmlFor='enabled'>
                        { t('ROLES.enabled') }
                    </label>
                </div>

                <Input value={ role.label_short } required
                       labelFusion={ true }
                       label={ t('ROLES.role_id') }
                       onChange={ (e) => {
                           if (e.target.value.match(/\s/)) {
                               e.target.value = e.target.value.replace(/\s/g, '');
                               }
                           setRole({ ...role, label_short: e.target.value })
                       } }/>
                <Input value={ role.label } required
                       labelFusion={ true }
                       label={ t('ROLES.role_label') }
                       onChange={ (e) => setRole({ ...role, label: e.target.value }) }/>
            </div>

            <h1 className="text-lg font-semibold mb-2">
                { t('ROLES.default_route') }
            </h1>
            <div className='w-1/3 flex gap-2'>
                { routes.map((route) => (
                    <RadioBox
                        key={ route.value }
                        label={ route.label }
                        value={ route.value }
                        checked={ role.default_route === route.value }
                        onChange={ () => {
                            setRole({ ...role, default_route: route.value });
                        } }/>
                )) }
            </div>

            <div className="mt-12">
                { roleId ? (
                    <Button onClick={ handleUpdate } disabled={ loading || hasError }>
                        { loading ? t('ROLES.updating') : t('ROLES.update_role') }
                    </Button>
                ) : (
                    <Button onClick={ handleCreate } disabled={ loading || hasError }>
                        { loading ? t('ROLES.creating') : t('ROLES.create_role') }
                    </Button>
                ) }
            </div>
        </div>
    );
}