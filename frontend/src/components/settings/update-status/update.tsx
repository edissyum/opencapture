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
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import Input from "../../Input";
import { Button } from "../../Button";
import { Loader } from "../../loader/Loader";
import { showToast } from "../../ToastProvider";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";

export function UpdateStatus({ module }: { module: 'verifier' | 'splitter' }) {
    const { post, put } = axiosApiCall();
    const [loading, setLoading] = useState(true);

    const [statuses, setStatuses] = useState<any[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    const [identifier, setIdentifier] = useState<string>('');
    const [identifierList, setIdentifierList] = useState<string[]>([]);

    // Fetch statuses
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await post(`/status/${ module }/list`, {});
                setStatuses(response.status);
            } catch (error) {
                console.error(`Failed to fetch ${ module } status:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus().then();
    }, []);

    const handleUpdate = async () => {
        try {
            await put(`/${ module }/status`, {
                ids: identifierList,
                status: selectedStatus
            });
            setIdentifierList([]);
            setSelectedStatus('');
            if (module === 'verifier') {
                showToast(t('UPDATE-STATUS.update_success_verifier'), 'success');
            } else {
                showToast(t('UPDATE-STATUS.update_success_splitter'), 'success');

            }
        } catch (error) {
            console.error(`Failed to update ${ module } status:`, error);
        }
    }

    if (loading) return <Loader/>;

    return (
        <div className="p-6">
            <h1 className="text-md font-bold">{ t('UPDATE-STATUS.new_status') }</h1>
            <div className='flex gap-4 mt-6'>
                { statuses.map((status) => (
                    <div key={ status.id }
                         onClick={ () => setSelectedStatus(status.id) }
                         className={ `border-2 border-(--border-secondary) hover:border-(--border-primary) transition-colors
                             rounded-lg px-8 py-3 cursor-pointer flex items-center justify-center gap-4
                             ${ selectedStatus === status.id ? 'bg-(--bg-selected) border-(--border-primary)!' : '' } ` }>
                        <p className='text-lg font-semibold'>{ status.label }</p>
                    </div>
                )) }
            </div>

            <h1 className="text-md font-bold mt-6 mb-4">{ t('UPDATE-STATUS.id_documents') }</h1>
            <div>
                <Input id="identifier-input"
                       value={ identifier }
                       onChange={ (e) => {
                           if (/^\d*$/.test(e.target.value)) {
                               setIdentifier(e.target.value)
                           }
                       } }
                       placeholder={ t('UPDATE-STATUS.id_placeholder') }
                       onKeyDown={ (e) => {
                           if ((e.key === 'Enter' || e.key === ',') && identifier.trim() !== '') {
                               if (!identifierList.includes(identifier.trim())) {
                                   setIdentifierList([...identifierList, identifier.trim()]);
                               }
                               setIdentifier('');
                           }
                       } }
                />
                <div className='flex flex-wrap gap-2'>
                    { identifierList.map((id) => (
                        <div key={ id }
                             className='bg-(--color-primary)/10 text-(--text-primary) rounded-sm px-2 py-1 border-0 flex items-center'>
                            <span>{ id }</span>
                            <X size={ 16 } className='text-(--color-primary) cursor-pointer ml-2'
                               onClick={ () => setIdentifierList(identifierList.filter((item) => item !== id)) }/>
                        </div>
                    )) }
                </div>

                <Button className='mt-4'
                        disabled={ selectedStatus === '' || identifierList.length === 0 }
                        onClick={ handleUpdate }>
                    { t('UPDATE-STATUS.update') }
                </Button>
            </div>
        </div>
    )
        ;
};