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
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { CirclePause, Copy, FileText, Plus, Trash2 } from "lucide-react";

import Input from "../../Input";
import { Button } from "../../Button";
import { Table } from "../../list/Table";
import { showToast } from "../../ToastProvider";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../../services/hooks/ConfirmDialog";
import { usePersistentState } from "../../../services/hooks/usePersistentState";

export function FormsList({ module }: { module: string }) {
    const { get, put, del, post } = axiosApiCall();

    const [forms, setForms] = useState([]);
    const [totalForms, setTotalForms] = useState(0);
    const [selectedForms, setSelectedForms] = useState<any[]>([]);
    const [loadingForms, setLoadingForms] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = usePersistentState<{
        first: number;
        rows: number;
        page: number;
        sortField: string | null;
        sortOrder: 1 | -1 | null;
    }>('formsListLazyParams', {
            first: 0,
            rows: 16,
            page: 0,
            sortField: null,
            sortOrder: null
        }
    );
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const columns = [
        { id: 'id', field: 'id', header: '', className: 'max-w-10! w-10!' },
        { id: 'label', field: 'label', header: t('GLOBAL.label') },
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
        }
    ];

    const getActionsLine = (row: any) => [
        {
            label: t('FORMS.enable_forms'),
            visible: !row?.enabled,
            icon: <CirclePause className='mr-1' size={ 16 }/>,
            command: () => handleEnable()
        },
        {
            label: t('FORMS.disable_forms'),
            visible: row?.enabled,
            icon: <CirclePause className='mr-1' size={ 16 }/>,
            command: () => handleDisable()
        },
        {
            label: t('FORMS.duplicate_forms'),
            icon: <Copy className='mr-1' size={ 16 }/>,
            command: () => handleDuplicate()
        },
        {
            label: <span className='critical'>{ t('FORMS.delete_forms') }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const actions: any = [
        {
            label: t('FORMS.enable_forms'),
            icon: <CirclePause className='mr-1' size={ 16 }/>,
            command: () => handleEnable()
        },
        {
            label: t('FORMS.disable_forms'),
            icon: <CirclePause className='mr-1' size={ 16 }/>,
            command: () => handleDisable()
        },
        {
            label: <span className='critical'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    // Fetch forms
    useEffect(() => {
        if (loadingForms) return;
        setLoadingForms(true);

        const fetchForms = async () => {
            try {
                const response = await get(`/forms/${ module }/list`, {
                    params: {
                        limit: lazyParams.rows,
                        offset: lazyParams.first,
                        search: debouncedSearchTerm,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                    }
                });
                setTotalForms(response.forms[0].total || 0);
                setForms(response.forms);
            } catch (error) {
                console.error('Error fetching forms :', error);
            } finally {
                setLoadingForms(false);
            }
        }
        fetchForms().then();
    }, [lazyParams, debouncedSearchTerm]);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

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
            title: t('FORMS.disable_form', { count: selectedForms.length }),
            message: t('FORMS.confirm_disable_form', { count: selectedForms.length }),
            confirmText: t('GLOBAL.disable'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await disableForms(selectedForms.map((form: any) => form.id));
                refresh();
            },
            onCancel: () => {
                setSelectedForms([]);
            }
        })
    }
    const disableForms = async (ids: string[]) => {
        ids.forEach((id) => {
            try {
                put(`/forms/${ module }/disable/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('FORMS.form_disabled', { count: selectedForms.length }), 'success');
                }
            } catch (err) {
                console.error("Error disabling form :", err);
            }
        });
    }

    const handleEnable = () => {
        if (selectedForms.length === 0) return;

        showConfirmDialog({
            title: t('FORMS.enable_form', { count: selectedForms.length }),
            message: t('FORMS.confirm_enable_form', { count: selectedForms.length }),
            confirmText: t('GLOBAL.enable'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await enableForms(selectedForms.map((form: any) => form.id));
                refresh();
            },
            onCancel: () => {
                setSelectedForms([]);
            }
        })
    }
    const enableForms = async (ids: string[]) => {
        ids.forEach((id) => {
            try {
                put(`/forms/${ module }/enable/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('FORMS.form_enabled', { count: selectedForms.length }), 'success');
                }
            } catch (err) {
                console.error("Error enabling form :", err);
            }
        });
    }

    const handleDelete = () => {
        if (selectedForms.length === 0) return;

        showConfirmDialog({
            title: t('FORMS.delete_form', { count: selectedForms.length }),
            message: t('FORMS.confirm_delete_form', { count: selectedForms.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await deleteForms(selectedForms.map((form: any) => form.id));
                refresh();
            },
            onCancel: () => {
                setSelectedForms([]);
            }
        });
    }
    const deleteForms = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/forms/${ module }/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('FORMS.form_deleted', { count: selectedForms.length }), 'success');
                }
            } catch (err) {
                console.error("Error while deleting form :", err);
            }
        }
    }

    const handleDuplicate = () => {
        if (selectedForms.length === 0) return;

        showConfirmDialog({
            title: t('FORMS.duplicate_form', { count: selectedForms.length }),
            message: t('FORMS.confirm_duplicate_form', { count: selectedForms.length }),
            confirmText: t('GLOBAL.duplicate'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await duplicateForms(selectedForms.map((form: any) => form.id));
                refresh();
            },
            onCancel: () => {
                setSelectedForms([]);
            }
        });
    }
    const duplicateForms = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await post(`/forms/${ module }/duplicate/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('FORMS.form_duplicated', { count: selectedForms.length }), 'success');
                }
            } catch (err) {
                console.error("Error while duplicating form :", err);
            }
        }
    }

    return (
        <div className="p-8 bg-(--bg-secondary) flex flex-col h-full">
            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    <span>
                        { t('SETTINGS.forms', { count: totalForms }) } ({ totalForms || 0 })
                    </span>
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height={ 'h-10' }
                       value={ searchTerm } placeholder={ t('USERS.search') } noMarginBottom={ true }
                       onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Link to={ `/settings/${ module }/forms/create` }>
                        <Button size={ 'sm' }
                                className='p-2 border'
                                variant={ "no_bg_border" }>
                            <Plus size={ 14 } className="mr-1"/> { t('FORMS.add_form') }
                        </Button>
                    </Link>
                </span>
            </div>
            <Table
                baseLink={ `/settings/${ module }/forms/edit/` }
                data={ forms }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                loading={ loadingForms }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                actionsLine={ getActionsLine }
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