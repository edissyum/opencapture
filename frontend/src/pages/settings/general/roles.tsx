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
import { CirclePause, CircleQuestionMark, FileText, Trash2, UserRoundPlus } from "lucide-react";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../../services/hooks/ConfirmDialog";

import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { Table } from "../../../components/list/Table";
import { useUser } from "../../../services/hooks/useUser.tsx";
import { showToast } from "../../../components/ToastProvider.tsx";

export function SettingsGeneralRoles() {
    const { get, put, del } = axiosApiCall();
    const { user, loadingUser } = useUser();

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
        sortOrder: null as 1 | -1 | null,
    });

    const columns = [
        { id: 'id', field: 'id', header: '', sortable: true, className: 'max-w-10! w-10!' },
        { id: 'label_short', field: 'label_short', sortable: true, header: t('ROLES.label_short'), className: 'max-w-[12rem] w-[12rem]' },
        { id: 'label', field: 'label', header: t('ROLES.label'), sortable: true },
        {
            id: 'status',
            header: t('USERS.status'),
            body: (row: any) => (
                <span
                    className={ `px-2 py-1 rounded-lg text-xs font-medium 
                        ${ row.enabled ? 'bg-(--bg-success) text-(--text-success)' : 'bg-(--bg-error) text-(--text-error)' }` }>
                    { row.enabled ? t('USERS.active') : t('USERS.inactive') }
                </span>
            ),
            className: 'max-w-[8rem] w-[8rem]'
        },
    ];

    const actions = [
        {
            label: t('ROLES.enable_roles'),
            icon: <CirclePause className='mr-1' size={ 16 }/>,
            command: () => handleEnable()
        },
        {
            label: t('ROLES.disable_roles'),
            icon: <CirclePause className='mr-1' size={ 16 }/>,
            command: () => handleDisable()
        },
        {
            label: t('ROLES.delete_roles'),
            icon: <Trash2 className='mr-1' size={ 16 }/>,
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
                console.error('Erreur de récupération des utilisteurs :', error);
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
            icon: <CircleQuestionMark/>,
            title: t('ROLES.disable_role', { count: selectedRoles.length }),
            message: t('ROLES.confirm_disable_role', { count: selectedRoles.length }),
            confirmText: t('GLOBAL.yes'),
            cancelText: t('GLOBAL.no'),
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
            icon: <CircleQuestionMark/>,
            title: t('ROLES.enable_role', { count: selectedRoles.length }),
            message: t('ROLES.confirm_enable_role', { count: selectedRoles.length }),
            confirmText: t('GLOBAL.yes'),
            cancelText: t('GLOBAL.no'),
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
            icon: <CircleQuestionMark/>,
            title: t('ROLES.delete_role', { count: selectedRoles.length }),
            message: t('ROLES.confirm_delete_role', { count: selectedRoles.length }),
            confirmText: t('GLOBAL.yes'),
            cancelText: t('GLOBAL.no'),
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
        <div className="p-8 bg-(--bg-secondary) h-full">
            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    <span>
                        { t('ROLES.roles', { count: totalRoles }) } ({ totalRoles || 0 })
                    </span>
                </span>
                <span>
                    <Input id="search" type="text" name="search" className='bg-white dark:bg-(--bg-secondary)'
                           value={ searchTerm } placeholder={ t('ROLES.search') }
                           onChange={ (e) => setSearchTerm(e.target.value) }/>
                </span>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Button
                        size={ 'sm' }
                        variant={ "no_bg_border" }
                        className='p-2 border'>
                        <UserRoundPlus size={ 14 } className="mr-1"/> { t('ROLES.add_role') }
                    </Button>
                </span>
            </div>
            <Table
                baseLink="/settings/general/roles/"
                data={ roles }
                height="h-[30vh]"
                actions={ actions }
                pagination={ true }
                columns={ columns }
                menuModel={ actions }
                loading={ loadingRoles }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
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