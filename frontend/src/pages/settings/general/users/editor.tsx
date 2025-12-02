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
import { useNavigate, useParams } from "react-router-dom";

import Input from "../../../../components/Input";
import { Button } from "../../../../components/Button";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { useUser } from "../../../../services/hooks/useUser.tsx";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { showToast } from "../../../../components/ToastProvider.tsx";

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

    const [loading, setLoading] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);

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

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const response = await get(`/users/getById/${ userId }`);
                setUser(response);
            } catch (error) {
                console.error('Error fetching role data:', error);
            }
        };

        fetchUser().then();
    }, [userId]);

    useEffect(() => {
        setHasError(!user.username);
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

    const handleUpdate = async () => {
        setLoading(true);

        try {
            await put(`/users/update/${ userId }`, user);
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
            <div className='w-1/3'>
                <Input required
                       disabled={ userId }
                       labelFusion={ true }
                       value={ user.username }
                       label={ t('USERS.username') }
                       onChange={ (e) => {
                           if (e.target.value.match(/\s/)) {
                               e.target.value = e.target.value.replace(/\s/g, '');
                           }
                           setUser({ ...user, username: e.target.value })
                       } }
                />

                <Input required
                       labelFusion={ true }
                       value={ user.firstname }
                       label={ t('USERS.firstname') }
                       onChange={ (e) => {
                           if (e.target.value.match(/\s/)) {
                               e.target.value = e.target.value.replace(/\s/g, '');
                           }
                           setUser({ ...user, firstname: e.target.value })
                       } }
                />

                <Input required
                       labelFusion={ true }
                       value={ user.lastname }
                       label={ t('USERS.lastname') }
                       onChange={ (e) => {
                           if (e.target.value.match(/\s/)) {
                               e.target.value = e.target.value.replace(/\s/g, '');
                           }
                           setUser({ ...user, lastname: e.target.value })
                       } }
                />

                <Input labelFusion={ true }
                       value={ user.email }
                       label={ t('USERS.email')}
                       onChange={ (e) => {
                           if (e.target.value.match(/\s/)) {
                               e.target.value = e.target.value.replace(/\s/g, '');
                           }
                           setUser({ ...user, email: e.target.value })
                       } }
                />
            </div>

            <h1 className="text-lg font-semibold mb-4">
                { t('USERS.security') }
            </h1>
            <div className='w-1/3'>
                <Input required
                       autoComplete="off"
                       type={ 'password' }
                       labelFusion={ true }
                       value={ user.password }
                       label={ t('USERS.password') }
                       onChange={ (e) => {
                           if (e.target.value.match(/\s/)) {
                               e.target.value = e.target.value.replace(/\s/g, '');
                           }
                           setUser({ ...user, password: e.target.value })
                       } }
                />

                <Input labelFusion={ true }
                       value={ user.password_check }
                       label={ t('USERS.password_check') }
                       onChange={ (e) => {
                           if (e.target.value.match(/\s/)) {
                               e.target.value = e.target.value.replace(/\s/g, '');
                           }
                           setUser({ ...user, password_check: e.target.value })
                       } }
                />

                <FloatLabel className='w-full z-10'>
                    <Dropdown
                        filter
                        id="role"
                        className="w-full"
                        options={ roles.map((role: any) => ({
                            value: role.id,
                            label: role.label
                        })) }
                        value={ user.role ?? null }
                        onChange={ (e) => setUser({ ...user, role: e.target.value })}
                    />
                    <label htmlFor="role">{ t('USERS.role') }</label>
                </FloatLabel>

                <FloatLabel className='w-full z-10 mt-5'>
                    <Dropdown
                        id="mode"
                        className="w-full"
                        options={ connectionModes.map((role: any) => ({
                            value: role.id,
                            label: role.label
                        })) }
                        value={ user.mode ?? null }
                        onChange={ (e) => setUser({ ...user, mode: e.target.value })}
                    />
                    <label htmlFor="mode">{ t('USERS.mode') }</label>
                </FloatLabel>
            </div>

            <div className="mt-12">
                { userId ? (
                    <Button onClick={ handleUpdate } disabled={ loading || hasError }>
                        { loading ? t('USERS.updating') : t('USERS.update_user') }
                    </Button>
                ) : (
                    <Button onClick={ handleCreate } disabled={ loading || hasError }>
                        { loading ? t('USERS.creating') : t('USERS.create_user') }
                    </Button>
                ) }
            </div>
        </div>
    );
}