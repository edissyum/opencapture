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
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, UserRoundPlus } from "lucide-react";

import { useUser } from "../../../../services/hooks/useUser";
import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../../../services/hooks/ConfirmDialog";

import Input from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { Table } from "../../../../components/list/Table";
import { showToast } from "../../../../components/ToastProvider";

export function SettingsGeneralRoles() {
    const { get, del } = axiosApiCall();
    const { user, loadingUser } = useUser();
    const navigate = useNavigate();

    const [roles, setRoles] = useState([]);
    const [totalRoles, setTotalRoles] = useState(0);
    const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 16,
        page: 0,
        sortField: null as string | null,
        sortOrder: null as 1 | -1 | null
    });

    const columns = [
        { id: 'id', field: 'id', header: '', sortable: true, className: 'w-16' },
        { id: 'label_short', field: 'label_short', sortable: true, header: t('ROLES.label_short') },
        { id: 'label', field: 'label', header: t('GLOBAL.label'), sortable: true }
    ];

    const actions: any = [
        {
            label: <span className='critical'>{ t('ROLES.delete_roles') }</span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const getActionsLine = () => [
        {
            label: <span className='critical'>{ t('ROLES.delete_roles') }</span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    useEffect(() => {
        if (loadingRoles || loadingUser) return;
        setLoadingRoles(true);

        const fetchRoles = async () => {
            try {
                const response = await get(`/roles/list/user/${user.id}`, {
                    params: {
                        offset: lazyParams.first,
                        limit: lazyParams.rows,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null,
                        search: searchTerm,
                    }
                });
                setTotalRoles(response.roles[0]?.total || 0);
                setRoles(response.roles);
            } catch (error) {
                console.error('Error while fetching roles :', error);
            } finally {
                setLoadingRoles(false);
            }
        }
        fetchRoles().then();
    }, [lazyParams, searchTerm, user, loadingUser]);

    const refresh = () => {
        setTimeout(() => {
            setSelectedRoles([]);
            setTotalRoles(0);
            setLazyParams({ ...lazyParams, first: 0 });
        });
    }

    const handleDelete = () => {
        if (selectedRoles.length === 0) return;

        showConfirmDialog({
            title: t('ROLES.delete_role', { count: selectedRoles.length }),
            message: t('ROLES.confirm_delete_role', { count: selectedRoles.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await deleteRoles(selectedRoles.map((user: any) => user.id));
                refresh();
            },
            onCancel: () => {
                setSelectedRoles([]);
            }
        });
    }
    const deleteRoles = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/roles/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('ROLES.role_deleted', { count: selectedRoles.length }), 'success');
                }
            } catch (err) {
                console.error("Erreur suppression du rôle :", err);
            }
        }
    }

    return (
        <div className="p-6 bg-(--bg-secondary) h-full w-full flex flex-col flex-1">
            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    <span>
                        { t('ROLES.roles', { count: totalRoles }) } ({ totalRoles || 0 })
                    </span>
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height='h-10' autoFocus
                       value={ searchTerm } placeholder={ t('ROLES.search') } onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Button
                        size='sm'
                        variant="bg_white"
                        className='p-2 px-3'
                        onClick={ () => navigate('/settings/general/roles/create') }>
                        <UserRoundPlus size={ 16 }/> { t('ROLES.add_role') }
                    </Button>
                </span>
            </div>
            <Table
                baseLink="/settings/general/roles/edit/"
                data={ roles }
                height="h-[40vh]"
                actions={ actions }
                pagination={ true }
                columns={ columns }
                loading={ loadingRoles }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                actionsLine={ getActionsLine }
                selectedRows={ selectedRoles }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ totalRoles || 0 }
                rowsPerPageOptions={ [
                            { "value": 4, "label": "4" },
                            { "value": 8, "label": "8" },
                            { "value": 16, "label": "16" },
                            { "value": 32, "label": "32" }
                        ] }
                emptyMessage={ t("ROLES.no_role") }
                paginatorLeftText={ t('ROLES.selected', { count: selectedRoles.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedRoles(rows) }
            />
        </div>
    );
}