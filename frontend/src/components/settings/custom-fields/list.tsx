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
import { FileText, Plus, Trash2 } from "lucide-react";

import Input from "../../Input";
import { Button } from "../../Button";
import { Table } from "../../list/Table";
import { showToast } from "../../ToastProvider";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../../services/hooks/ConfirmDialog";

export function CustomFieldsList({ module }: { module: string }) {
    const { get, del } = axiosApiCall();

    const [customFields, setCustomFields] = useState([]);
    const [totalCustomFields, setTotalCustomFields] = useState(0);
    const [selectedCustomFields, setSelectedCustomFields] = useState<any[]>([]);
    const [loadingCustomFields, setLoadingCustomFields] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 16,
        page: 0,
        sortField: null as string | null,
        sortOrder: null as 1 | -1 | null,
    });
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const getActionsLine = () => [
        {
            label: <span className='critical'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const actions: any = [
        {
            label: <span className='critical'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const columns = [
        { id: 'id', field: 'id', header: '', sortable: true, className: 'max-w-10! w-10!' },
        { id: 'label', field: 'label', header: t('GLOBAL.label'), sortable: true },
        { id: 'label_short', field: 'label_short', header: t('ROLES.label_short') },
        {
            id: 'type', field: 'type', header: t('CUSTOM-FIELDS.type'), body: (row: any) => (
                <span className={ `px-2 py-1 rounded-lg text-xs font-medium` }>
                    { row.type === 'text' && t('CUSTOM-FIELDS.type_text') }
                    { row.type === 'select' && t('CUSTOM-FIELDS.type_select') }
                    { row.type === 'regex' && t('CUSTOM-FIELDS.type_regex') }
                    { row.type === 'date' && t('CUSTOM-FIELDS.type_date') }
                    { row.type === 'textarea' && t('CUSTOM-FIELDS.type_textarea') }
                    { row.type === 'checkbox' && t('CUSTOM-FIELDS.type_checkbox') }
                </span>
            )
        }
    ];

    // Fetch custom fields
    useEffect(() => {
        if (loadingCustomFields) return;
        setLoadingCustomFields(true);

        const fetchCustomFields = async () => {
            try {
                const response = await get(`/customFields/list?module=${ module }`, {
                    params: {
                        limit: lazyParams.rows,
                        offset: lazyParams.first,
                        search: debouncedSearchTerm,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                    }
                });
                setTotalCustomFields(response.customFields[0].total || 0);
                setCustomFields(response.customFields);
            } catch (error) {
                console.error('Error fetching custom fields :', error);
            } finally {
                setLoadingCustomFields(false);
            }
        }
        fetchCustomFields().then();
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
            setSelectedCustomFields([]);
            setTotalCustomFields(0);
            setLazyParams({ ...lazyParams, first: 0 });
        });
    }

    const handleDelete = () => {
        if (selectedCustomFields.length === 0) return;

        showConfirmDialog({
            title: t('CUSTOM-FIELDS.delete_custom_fields', { count: selectedCustomFields.length }),
            message: t('CUSTOM-FIELDS.confirm_delete_custom_fields', { count: selectedCustomFields.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await deleteForms(selectedCustomFields.map((form: any) => form.id));
                refresh();
            },
            onCancel: () => {
                setSelectedCustomFields([]);
            }
        });
    }
    const deleteForms = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/customFields/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('CUSTOM-FIELDS.custom_field_deleted', { count: selectedCustomFields.length }), 'success');
                }
            } catch (err) {
                console.error("Error while deleting custom field :", err);
            }
        }
    }

    return (
        <div className="p-8 bg-(--bg-secondary) flex flex-col h-full">
            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    { t('VERIFIER.custom_fields', { count: totalCustomFields }) } ({ totalCustomFields || 0 })
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height={ 'h-10' }
                       value={ searchTerm } placeholder={ t('USERS.search') } noMarginBottom={ true }
                       onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Link to={ `/settings/${ module }/custom-fields/create` }>
                        <Button size={ 'sm' }
                                className='p-2 border'
                                variant={ "no_bg_border" }>
                            <Plus size={ 14 } className="mr-1"/> { t('CUSTOM-FIELDS.add_custom_field') }
                        </Button>
                    </Link>
                </span>
            </div>
            <Table
                baseLink={ `/settings/${ module }/custom-fields/edit/` }
                data={ customFields }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                loading={ loadingCustomFields }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                actionsLine={ getActionsLine }
                selectedRows={ selectedCustomFields }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ totalCustomFields || 0 }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("CUSTOM-FIELDS.no_custom_fields") }
                paginatorLeftText={ t('CUSTOM-FIELDS.selected', { count: selectedCustomFields.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedCustomFields(rows) }
            />
        </div>
    );
}