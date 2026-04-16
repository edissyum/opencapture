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
import { CircleAlert, Copy } from "lucide-react";

import Input from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { Dropdown } from "../../../../components/Dropdown";
import { showToast } from "../../../../components/ToastProvider";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";

export const SettingsGeneralTokenAuth = () => {
    const { get, post } = axiosApiCall();

    const [users, setUsers] = useState<any[]>([]);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const [token, setToken] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [tokenExpiration, setTokenExpiration] = useState<number>(7);

    // Fetch webservice users
    useEffect(() => {
        const fetchWebserviceUsers = async () => {
            try {
                const response = await get('/users/list?mode=webservice');
                if (response.users) {
                    setUsers(response.users);
                }
            } catch (error) {
                console.error('Error fetching webservice users:', error);
            }
        }

        fetchWebserviceUsers().then();
    }, []);

    const handleGenerateAuthToken = async () => {
        if (!selectedUser) return;

        setLoadingSubmit(true);

        try {
            const response = await post('/auth/generateAuthToken', {
                username: selectedUser.username,
                expiration: tokenExpiration
            });

            if (response.token) {
                setToken(response.token);
            }
        } catch (error) {
            console.error('Error generating auth token:', error);
        } finally {
            setLoadingSubmit(false);
        }
    }

    return (
        <div className="p-6 bg-(--bg-secondary) h-full flex flex-col gap-4">
            <h2>{ t('SECURITY.token_details') }</h2>

            <div className='w-1/3 flex flex-col gap-6'>
                <Dropdown id='token-user-dropdown' filter value={ selectedUser } options={ users }
                          label={ t('SECURITY.token_user') } labelFusion={ true } required noMarginBottom={ true }
                          onChange={ (e) => {
                              setSelectedUser(e.target.value)
                          } }/>

                <Input label={ t('SECURITY.token_expiration') } labelFusion={ true }
                       value={ tokenExpiration } required noMarginBottom={ true }
                       onChange={ (e: any) => {
                           setTokenExpiration(e.target.value)
                       } }/>

                <Button onClick={ handleGenerateAuthToken } disabled={ loadingSubmit || !selectedUser }>
                    { loadingSubmit ? t('SECURITY.token_generation') : t('SECURITY.generate_token') }
                </Button>
            </div>

            { token && (
                <div className='w-full bg-(--bg-selected) p-4 rounded-lg flex flex-col gap-4 border border-(--border-primary)'>
                    <div className='flex items-center gap-3'>
                        <div className='bg-(--color-primary) p-2 rounded-lg'>
                            <CircleAlert className="text-white" size={ 28 }/>
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-(--color-primary) font-semibold'>{ t('SECURITY.token_generated') }</span>
                            <span className='text-(--text-secondary)'>{ t('SECURITY.token_generated_details') }</span>
                        </div>
                    </div>
                    <div className='flex gap-4'>
                        <div className='bg-(--color-primary)/20 p-2 rounded-lg font-semibold text-(--color-primary) break-all'>
                            { token }
                        </div>
                        <div className='flex justify-end items-center cursor-pointer rounded-lg'>
                            <div className='bg-(--bg-secondary) p-2 rounded-lg' data-tooltip-id='tooltip'
                                 data-tooltip-content={ t('SECURITY.copy_token') }
                                 onClick={ () => {
                                     "use client";
                                     navigator.clipboard.writeText(token);
                                     showToast(t('SECURITY.token_copied'), 'success');
                                 } }>
                                <Copy size={ 20 } className="text-(--text-primary)"/>
                            </div>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
}