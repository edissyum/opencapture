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

import { Input } from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { Table } from "../../../../components/list/Table";
import { showToast } from "../../../../components/ToastProvider";
import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../../../services/hooks/ConfirmDialog";

export function SettingsVerifierFormsList() {
    const { get, put, del } = axiosApiCall();

    const [forms, setForms] = useState([]);
    const [totalForms, setTotalForms] = useState(0);
    const [selectedForms, setSelectedForms] = useState<any[]>([]);
    const [loadingForms, setLoadingForms] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 16,
        page: 0,
        sortField: null as string | null,
        sortOrder: null as 1 | -1 | null,
    });

    const columns = [
        { id: 'id', field: 'id', header: '', className: 'max-w-10! w-10!' },
        { id: 'label', field: 'label', header: t('FORMS.label') },
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
            label: t('USERS.delete_users'),
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        },
        {
            label: t('USERS.enable_users'),
            icon: <CirclePause className='mr-1' size={ 16 }/>,
            command: () => handleEnable()
        },
        {
            label: t('USERS.disable_users'),
            icon: <CirclePause className='mr-1' size={ 16 }/>,
            command: () => handleDisable()
        }
    ]

    useEffect(() => {
        if (loadingForms) return;
        setLoadingForms(true);

        const fetchForms = async () => {
            try {
                const response = await get('/forms/verifier/list', {
                    params: {
                        offset: lazyParams.first,
                        limit: lazyParams.rows,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null,
                        search: searchTerm,
                    }
                });

                setTotalForms(response.forms[0].total || 0);
                setForms(response.forms);
            } catch (error) {
                console.error('Erreur de récupération des formulaires :', error);
            } finally {
                setLoadingForms(false);
            }
        }
        fetchForms().then();
    }, [lazyParams, searchTerm]);

    const refresh = () => {
        setTimeout(() => {
            setSelectedForms([]);
            setTotalForms(0);
            setLazyParams({ ...lazyParams, first: 0 });
        });
    }

    const handleDisable = () => {
        if (selectedForms.length === 0) return;

        showConfirmDialog({
            icon: <CircleQuestionMark/>,
            title: t('USERS.disable_user', { count: selectedForms.length }),
            message: t('USERS.confirm_disable_user', { count: selectedForms.length }),
            confirmText: t('GLOBAL.disable'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await disableUsers(selectedForms.map((user: any) => user.id));
                refresh();
            },
            onCancel: () => {
                setSelectedForms([]);
            }
        })
    }
    const disableUsers = async (ids: string[]) => {
        ids.forEach((id) => {
            try {
                put(`/users/disable/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('USERS.user_disabled', { count: selectedForms.length }), 'success');
                }
            } catch (err) {
                console.error("Erreur désactivation de l'utilisateur :", err);
            }
        });
    }

    const handleEnable = () => {
        if (selectedForms.length === 0) return;

        showConfirmDialog({
            icon: <CircleQuestionMark/>,
            title: t('USERS.enable_user', { count: selectedForms.length }),
            message: t('USERS.confirm_enable_user', { count: selectedForms.length }),
            confirmText: t('GLOBAL.enable'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await enableUsers(selectedForms.map((user: any) => user.id));
                refresh();
            },
            onCancel: () => {
                setSelectedForms([]);
            }
        })
    }
    const enableUsers = async (ids: string[]) => {
        ids.forEach((id) => {
            try {
                put(`/users/enable/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('USERS.user_enabled', { count: selectedForms.length }), 'success');
                }
            } catch (err) {
                console.error("Erreur activation de l'utilisateur :", err);
            }
        });
    }

    const handleDelete = () => {
        if (selectedForms.length === 0) return;

        showConfirmDialog({
            icon: <CircleQuestionMark/>,
            title: t('USERS.delete_user', { count: selectedForms.length }),
            message: t('USERS.confirm_delete_user', { count: selectedForms.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await deleteUsers(selectedForms.map((user: any) => user.id));
                refresh();
            },
            onCancel: () => {
                setSelectedForms([]);
            }
        });
    }
    const deleteUsers = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/users/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('USERS.user_deleted', { count: selectedForms.length }), 'success');
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
                        { t('SETTINGS.forms', { count: totalForms }) } ({ totalForms || 0 })
                    </span>
                </span>
                <span>
                    <Input id="search" type="text" name="search" className='bg-(--bg-primary)'
                           value={ searchTerm } placeholder={ t('USERS.search') } no_margin_bottom={ true }
                           onChange={ (e) => setSearchTerm(e.target.value) }/>
                </span>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Button
                        size={ 'sm' }
                        variant={ "no_bg_border" }
                        className='p-2 border'>
                        <UserRoundPlus size={ 14 } className="mr-1"/> { t('FORMS.add_form') }
                    </Button>
                </span>
            </div>
            <Table
                baseLink="/settings/verifier/forms/edit/"
                data={ forms }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                menuModel={ actions }
                loading={ loadingForms }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                selectedRows={ selectedForms }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ totalForms || 0 }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("FORMS.no_form") }
                paginatorLeftText={ t('FORMS.selected', { count: selectedForms.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedForms(rows) }
            />
        </div>
    );
}