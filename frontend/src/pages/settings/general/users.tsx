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

import Input from "../../../components/Input";
import { Button } from "../../../components/Button";
import { Table } from "../../../components/list/Table";
import { showToast } from "../../../components/ToastProvider";

export function SettingsGeneralUsers() {
    const { get, put, del } = axiosApiCall();

    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
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
        {
            id: 'username',
            field: 'username',
            sortable: true,
            header: t('USERS.username'),
            className: 'max-w-[20rem] w-[20rem]'
        },
        { id: 'lastname', field: 'lastname', header: t('USERS.lastname'), sortable: true },
        { id: 'firstname', field: 'firstname', header: t('USERS.firstname'), sortable: true },
        { id: 'role', field: 'label', header: t('USERS.role') },
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

    const actions: any = [
        {
            label: t('USERS.enable_users'),
            icon: <CirclePause className='mr-1' size={ 16 }/>,
            command: () => handleEnable()
        },
        {
            label: t('USERS.disable_users'),
            icon: <CirclePause className='mr-1' size={ 16 }/>,
            command: () => handleDisable()
        },
        {
            label: <span className='critical'>{ t('USERS.delete_users') }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ]

    useEffect(() => {
        if (loadingUsers) return;
        setLoadingUsers(true);

        const fetchUsers = async () => {
            try {
                const response = await get('/users/list', {
                    params: {
                        offset: lazyParams.first,
                        limit: lazyParams.rows,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null,
                        search: searchTerm,
                    }
                });
                setTotalUsers(response.users[0]?.total || 0);
                setUsers(response.users);
            } catch (error) {
                console.error('Erreur de récupération des utilisateurs :', error);
            } finally {
                setLoadingUsers(false);
            }
        }
        fetchUsers().then();
    }, [lazyParams, searchTerm]);

    const refresh = () => {
        setTimeout(() => {
            setSelectedUsers([]);
            setTotalUsers(0);
            setLazyParams({ ...lazyParams, first: 0 });
        });
    }

    const handleDisable = () => {
        if (selectedUsers.length === 0) return;

        showConfirmDialog({
            icon: <CircleQuestionMark/>,
            title: t('USERS.disable_user', { count: selectedUsers.length }),
            message: t('USERS.confirm_disable_user', { count: selectedUsers.length }),
            confirmText: t('GLOBAL.disable'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await disableUsers(selectedUsers.map((user: any) => user.id));
                refresh();
            },
            onCancel: () => {
                setSelectedUsers([]);
            }
        })
    }
    const disableUsers = async (ids: string[]) => {
        ids.forEach((id) => {
            try {
                put(`/users/disable/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('USERS.user_disabled', { count: selectedUsers.length }), 'success');
                }
            } catch (err) {
                console.error("Erreur désactivation de l'utilisateur :", err);
            }
        });
    }

    const handleEnable = () => {
        if (selectedUsers.length === 0) return;

        showConfirmDialog({
            icon: <CircleQuestionMark/>,
            title: t('USERS.enable_user', { count: selectedUsers.length }),
            message: t('USERS.confirm_enable_user', { count: selectedUsers.length }),
            confirmText: t('GLOBAL.enable'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await enableUsers(selectedUsers.map((user: any) => user.id));
                refresh();
            },
            onCancel: () => {
                setSelectedUsers([]);
            }
        })
    }
    const enableUsers = async (ids: string[]) => {
        ids.forEach((id) => {
            try {
                put(`/users/enable/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('USERS.user_enabled', { count: selectedUsers.length }), 'success');
                }
            } catch (err) {
                console.error("Erreur activation de l'utilisateur :", err);
            }
        });
    }

    const handleDelete = () => {
        if (selectedUsers.length === 0) return;

        showConfirmDialog({
            icon: <CircleQuestionMark/>,
            title: t('USERS.delete_user', { count: selectedUsers.length }),
            message: t('USERS.confirm_delete_user', { count: selectedUsers.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await deleteUsers(selectedUsers.map((user: any) => user.id));
                refresh();
            },
            onCancel: () => {
                setSelectedUsers([]);
            }
        });
    }
    const deleteUsers = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/users/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('USERS.user_deleted', { count: selectedUsers.length }), 'success');
                }
            } catch (err) {
                console.error("Erreur suppression de l'utilisateur :", err);
            }
        }
    }

    return (
        <div className="p-8 bg-(--bg-secondary) h-full">
            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    <span>
                        { t('USERS.users', { count: totalUsers }) } ({ totalUsers || 0 })
                    </span>
                </span>
                <span>
                    <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height={ 'h-10' }
                           value={ searchTerm } placeholder={ t('USERS.search') } no_margin_bottom={ true }
                           onChange={ (e) => setSearchTerm(e.target.value) }/>
                </span>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Button
                        size={ 'sm' }
                        variant={ "no_bg_border" }
                        className='p-2 px-3 border-2 border-(--border-secondary)'>
                        <UserRoundPlus size={ 16 } className="mr-2"/> { t('USERS.add_user') }
                    </Button>
                </span>
            </div>
            <Table
                baseLink="/settings/general/users/"
                data={ users }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                menuModel={ actions }
                loading={ loadingUsers }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                selectedRows={ selectedUsers }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ totalUsers || 0 }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("USERS.no_user") }
                paginatorLeftText={ t('USERS.selected', { count: selectedUsers.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedUsers(rows) }
            />
        </div>
    );
}