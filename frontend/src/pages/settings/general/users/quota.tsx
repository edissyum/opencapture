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

import Input from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { Loader } from "../../../../components/loader/Loader";
import { InputSwitch } from "../../../../components/InputSwitch";
import { showToast } from "../../../../components/ToastProvider";
import MultiSelectInput from "../../../../components/MultiSelect";

import { AxiosApiCall } from "../../../../services/hooks/AxiosApiCall";

export function SettingsGeneralUserQuota() {
    const { get, put } = AxiosApiCall();

    const [loading, setLoading] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const [users, setUsers] = useState<any[]>([]);
    const [userQuota, setUserQuota] = useState<any>({});

    // Fetch user quota data
    useEffect(() => {
        const fetchUserQuota = async () => {
            try {
                const response = await get('/config/getConfiguration/userQuota');
                if (response.configuration.length === 1) {
                    setUserQuota(response.configuration[0].data.value);
                }
            } catch (error) {
                console.error('Error fetching user quota:', error);
            } finally {
                setLoading(false);
            }
        };
        const fetchUsers = async () => {
            try {
                const response = await get('/users/list');
                if (response.users) {
                    setUsers(response.users);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers().then();
        fetchUserQuota().then();
    }, []);

    const handleSubmit = async () => {
        setLoadingSubmit(true);
        try {
            await put('config/updateConfiguration/userQuota', { value: userQuota });
            showToast(t('USERS.user_quota_updated'), 'success');
        } catch (error) {
            console.error('Error updating user quota:', error);
        } finally {
            setLoadingSubmit(false);
        }
    }

    if (loading) return <Loader/>;

    return (
        <div className="p-6 h-full flex flex-col gap-4">
            <h2>{ t('SETTINGS.user_quota') }</h2>
            <div className='flex flex-col gap-6'>
                <div className='flex items-center gap-2'>
                    <InputSwitch
                        id='userQuotaEnabled'
                        checked={ userQuota.enabled }
                        label={ t('USERS.user_quota_enable') }
                        onChange={ (value) => setUserQuota({ ...userQuota, enabled: value }) }
                    />
                </div>
                <div className='w-1/3'>
                    <Input label={ t('USERS.user_quota_number') } type='number'
                        value={ userQuota.number } disabled={ !userQuota.enabled } required
                        onChange={ (e) => setUserQuota({ ...userQuota, number: e.target.value }) }/>
                </div>

                <MultiSelectInput
                    id='userQuotaExcludedUsers'
                    value={ userQuota.users_filtered } label={ t('USERS.excluded_users') }
                    optionLabel="label" optionValue="label" options={ users.map((user) => ({ label: user.username, value: user.id })) }
                    onChange={ (e) => setUserQuota({ ...userQuota, users_filtered: e.value }) }
                    disabled={ !userQuota.enabled } className="w-1/3"/>

                <div className='w-1/3'>
                    <Input label={ t('USERS.user_quota_email_dest') } type='email'
                        value={ userQuota.email_dest } disabled={ !userQuota.enabled }
                        onChange={ (e) => setUserQuota({ ...userQuota, email_dest: e.target.value }) }/>
                </div>
            </div>

            <Button onClick={ handleSubmit } disabled={ loadingSubmit || userQuota.enabled && !userQuota.number }>
                { loadingSubmit ? t('GLOBAL.saving') : t('GLOBAL.save_settings') }
            </Button>
        </div>
    );
}