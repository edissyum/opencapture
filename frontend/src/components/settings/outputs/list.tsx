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
import { Copy, FileText, Plus, Trash2 } from "lucide-react";

import Input from "../../Input";
import { Button } from "../../Button";
import { Table } from "../../list/Table";
import { showToast } from "../../ToastProvider";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../../services/hooks/ConfirmDialog";
import { usePersistentState } from "../../../services/hooks/usePersistentState";

export function OutputsList({ module }: { module: string }) {
    const { get, post, del } = axiosApiCall();

    const [outputs, setOutputs] = useState([]);
    const [totalOutputs, setTotalOutputs] = useState(0);
    const [selectedOutputs, setSelectedOutputs] = useState<any[]>([]);
    const [loadingOutputs, setLoadingOutputs] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = usePersistentState<{
        first: number;
        rows: number;
        page: number;
        sortField: string | null;
        sortOrder: 1 | -1 | null;
    }>(`outputsList${module}LazyParams`, {
            first: 0,
            rows: 16,
            page: 0,
            sortField: null,
            sortOrder: null
        }
    );
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const getActionsLine = () => [
        {
            label: t('FORMS.duplicate_forms'),
            icon: <Copy className='mr-1' size={ 16 }/>,
            command: () => handleDuplicate()
        },
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
        { id: 'output_label', field: 'output_label', header: t('GLOBAL.label'), sortable: true },
        { id: 'output_type_id', field: 'output_type_id', header: t('ROLES.label_short'), sortable: true }
    ];

    // Fetch outputs
    useEffect(() => {
        if (loadingOutputs) return;
        setLoadingOutputs(true);

        const fetchOutputs = async () => {
            try {
                const response = await get(`/outputs/${ module }/list`, {
                    params: {
                        limit: lazyParams.rows,
                        offset: lazyParams.first,
                        search: debouncedSearchTerm,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                    }
                });
                setTotalOutputs(response.outputs[0].total || 0);
                setOutputs(response.outputs);
            } catch (error) {
                console.error('Error fetching outputs :', error);
            } finally {
                setLoadingOutputs(false);
            }
        }
        fetchOutputs().then();
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
            setSelectedOutputs([]);
            setTotalOutputs(0);
            setLazyParams({ ...lazyParams, first: 0 });
        });
    }

    const handleDuplicate = () => {
        if (selectedOutputs.length === 0) return;

        showConfirmDialog({
            title: t('OUTPUTS.duplicate_output'),
            message: t('OUTPUTS.confirm_duplicate_output', { name: selectedOutputs[0].output_label }),
            confirmText: t('GLOBAL.duplicate'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await duplicateOutputs(selectedOutputs[0].id);
                refresh();
            },
            onCancel: () => {
                setSelectedOutputs([]);
            }
        });
    }
    const duplicateOutputs = async (id: number) => {
        try {
            await post(`/outputs/duplicate/${ id }`);
            showToast(t('OUTPUTS.outputs_duplicated', { count: selectedOutputs.length }), 'success');
        } catch (err) {
            console.error("Error while duplicating output :", err);
        }
    }

    const handleDelete = () => {
        if (setSelectedOutputs.length === 0) return;

        showConfirmDialog({
            title: t('OUTPUTS.delete_outputs', { count: selectedOutputs.length }),
            message: t('OUTPUTS.confirm_delete_outputs', { count: selectedOutputs.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await deleteOutputs(selectedOutputs.map((form: any) => form.id));
                refresh();
            },
            onCancel: () => {
                setSelectedOutputs([]);
            }
        });
    }
    const deleteOutputs = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/outputs/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('OUTPUTS.output_deleted', { count: selectedOutputs.length }), 'success');
                }
            } catch (err) {
                console.error("Error while deleting output :", err);
            }
        }
    }

    return (
        <div className="p-6 bg-(--bg-secondary) flex flex-col h-full">
            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    { t('SETTINGS.outputs', { count: totalOutputs }) } ({ totalOutputs || 0 })
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height={ 'h-10' }
                       value={ searchTerm } placeholder={ t('GLOBAL.search') } noMarginBottom={ true }
                       onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Link to={ `/settings/${ module }/outputs/create` }>
                        <Button size='sm' className='p-2 border' variant="bg_white">
                            <Plus size={ 14 } className="mr-1"/> { t('OUTPUTS.add_output') }
                        </Button>
                    </Link>
                </span>
            </div>
            <Table
                baseLink={ `/settings/${ module }/outputs/edit/` }
                data={ outputs }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                loading={ loadingOutputs }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                actionsLine={ getActionsLine }
                selectedRows={ selectedOutputs }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ totalOutputs || 0 }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("OUTPUTS.no_outputs") }
                paginatorLeftText={ t('OUTPUTS.selected', { count: selectedOutputs.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedOutputs(rows) }
            />
        </div>
    );
}