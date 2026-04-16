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
import { FileCheckCorner, FileLock, FileSearchCorner, FileSymlink, FileXCorner, Trash, X } from "lucide-react";

import Input from "../../Input";
import { Button } from "../../Button";
import { Loader } from "../../loader/Loader";
import { showToast } from "../../ToastProvider";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";

export function UpdateStatus({ module }: { module: 'verifier' | 'splitter' }) {
    const { post, put } = axiosApiCall();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [statuses, setStatuses] = useState<any[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>('');

    const [icons, _] = useState<any>([
        {
            'id': 'NEW',
            'icon': <FileCheckCorner/>
        },
        {
            'id': 'END',
            'icon': <FileLock/>
        },
        {
            'id': 'ERR',
            'icon': <FileXCorner/>
        },
        {
            'id': 'DEL',
            'icon': <Trash/>
        },
        {
            'id': 'WAIT_THIRD_PARTY',
            'icon': <FileSearchCorner/>
        },
        {
            'id': 'MERG',
            'icon': <FileSymlink/>
        }
    ]);

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
            setUpdating(true);
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
        } finally {
            setUpdating(false);
        }
    }

    if (loading) return <Loader/>;

    return (
        <div className="p-6">
            <h1 className="text-md font-bold">{ t('UPDATE-STATUS.new_status') }</h1>
            <div className='flex gap-4 mt-2 w-4/5 grid-cols-5'>
                { statuses.map((status) => (
                    <div key={ status.id }
                         onClick={ () => setSelectedStatus(status.id) }
                         className={ `w-full border border-(--border-secondary) hover:border-(--border-primary) transition-colors
                             rounded-lg py-4 cursor-pointer flex flex-col items-center text-center justify-center gap-2
                             ${ selectedStatus === status.id ? 'bg-(--bg-selected) border-(--border-primary)! text-(--color-primary)' : 'text-(--text-secondary)' } ` }
                    >
                        { icons.find((icon: any) => icon.id === status.id)?.icon }
                        <p className='text-md font-semibold min-w-32'>{ status.label }</p>
                    </div>
                )) }
            </div>

            <h1 className="text-md font-bold mt-6 mb-2">{ t('UPDATE-STATUS.id_documents') }</h1>
            <div className='w-4/5'>
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
                    { updating ? t('GLOBAL.updating') : t('UPDATE-STATUS.update') }
                </Button>
            </div>
        </div>
    );
}