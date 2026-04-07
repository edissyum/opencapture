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
import { CirclePause, FileText, Trash2, UserRoundPlus } from "lucide-react";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../../../services/hooks/ConfirmDialog";

import Input from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { Table } from "../../../../components/list/Table";
import { useUser } from "../../../../services/hooks/useUser";
import { showToast } from "../../../../components/ToastProvider";

export function SettingsGeneralRoles() {
    const navigate = useNavigate();
    const { user, loadingUser } = useUser();
    const { get, put, del } = axiosApiCall();

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
        { id: 'id', field: 'id', header: '', sortable: true, className: 'max-w-10! w-10!' },
        { id: 'label_short', field: 'label_short', sortable: true, header: t('ROLES.label_short'), className: 'max-w-[12rem] w-[12rem]' },
        { id: 'label', field: 'label', header: t('GLOBAL.label'), sortable: true },
        {
            id: 'status',
            header: t('GLOBAL.status'),
            body: (row: any) => (
                <span
                    className={ `px-2 py-1 rounded-lg text-xs font-medium 
                        ${ row.enabled ? 'bg-(--bg-success) text-(--text-success)' : 'bg-(--bg-error) text-(--text-error)' }` }>
                    { row.enabled ? t('USERS.active') : t('USERS.inactive') }
                </span>
            ),
            className: 'max-w-[8rem] w-[8rem]'
        }
    ];

    const actions: any = [
        {
            label: t('ROLES.enable_roles'),
            icon: <CirclePause size={ 16 }/>,
            command: () => handleEnable()
        },
        {
            label: t('ROLES.disable_roles'),
            icon: <CirclePause size={ 16 }/>,
            command: () => handleDisable()
        },
        {
            label: <span className='critical'>{ t('ROLES.delete_roles') }</span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const getActionsLine = (row: any) => [
        {
            label: t('ROLES.enable_roles'),
            visible: !row?.enabled,
            icon: <CirclePause size={ 16 }/>,
            command: () => handleEnable()
        },
        {
            label: t('ROLES.disable_roles'),
            visible: row?.enabled,
            icon: <CirclePause size={ 16 }/>,
            command: () => handleDisable()
        },
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

    const handleDisable = () => {
        if (selectedRoles.length === 0) return;

        showConfirmDialog({
            title: t('ROLES.disable_role', { count: selectedRoles.length }),
            message: t('ROLES.confirm_disable_role', { count: selectedRoles.length }),
            confirmText: t('GLOBAL.disable'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await disableRoles(selectedRoles.map((user:any) => user.id))
                refresh();
            },
            onCancel: () => {
                setSelectedRoles([]);
            }
        })
    }
    const disableRoles = async (ids: string[]) => {
        ids.forEach((id) => {
            try {
                put(`/roles/disable/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('ROLES.role_disabled', { count: selectedRoles.length }), 'success');
                }
            } catch (err) {
                console.error("Erreur désactivation du rôle :", err);
            }
        });
    }

    const handleEnable = () => {
        if (selectedRoles.length === 0) return;

        showConfirmDialog({
            title: t('ROLES.enable_role', { count: selectedRoles.length }),
            message: t('ROLES.confirm_enable_role', { count: selectedRoles.length }),
            confirmText: t('GLOBAL.enable'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await enableRoles(selectedRoles.map((user:any) => user.id));
                refresh();
            },
            onCancel: () => {
                setSelectedRoles([]);
            }
        })
    }
    const enableRoles = async (ids: string[]) => {
        ids.forEach((id) => {
            try {
                put(`/roles/enable/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('ROLES.role_enabled', { count: selectedRoles.length }), 'success');
                }
            } catch (err) {
                console.error("Erreur activation du rôle :", err);
            }
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
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height={ 'h-10' }
                       value={ searchTerm } placeholder={ t('ROLES.search') } noMarginBottom={ true }
                       onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Button
                        size='sm'
                        variant="bg_white"
                        className='p-2 px-3'
                        onClick={ () => navigate('/settings/general/roles/create') }>
                        <UserRoundPlus size={ 16 } className="mr-2"/> { t('ROLES.add_role') }
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
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("ROLES.no_role") }
                paginatorLeftText={ t('ROLES.selected', { count: selectedRoles.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedRoles(rows) }
            />
        </div>
    );
}