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
import { showConfirmDialogWithInput } from "../../../services/hooks/ConfirmDialogWithInput";

export function WorkflowsList({ module }: { module: string }) {
    const { get, post, del } = axiosApiCall();

    const [workflows, setWorkflows] = useState([]);
    const [totalWorkflows, setTotalWorkflows] = useState(0);
    const [selectedWorkflows, setSelectedWorkflows] = useState<any[]>([]);
    const [loadingWorkflows, setLoadingWorkflows] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = usePersistentState<{
        first: number;
        rows: number;
        page: number;
        sortField: string | null;
        sortOrder: 1 | -1 | null;
    }>(`workflowsList${module}LazyParams`, {
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
            icon: <Copy size={ 16 }/>,
            command: () => handleDuplicate()
        },
        {
            label: <span className='critical'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const actions: any = [
        {
            label: <span className='critical'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const columns = [
        { id: 'id', field: 'id', header: '', sortable: true, className: 'max-w-10! w-10!' },
        { id: 'workflow_id', field: 'workflow_id', header: t('ROLES.label_short') },
        { id: 'label', field: 'label', header: t('GLOBAL.label'), sortable: true }
    ];

    // Fetch workflows
    useEffect(() => {
        if (loadingWorkflows) return;
        setLoadingWorkflows(true);

        const fetchWorkflows = async () => {
            try {
                const response = await get(`/workflows/${ module }/list`, {
                    params: {
                        limit: lazyParams.rows,
                        offset: lazyParams.first,
                        search: debouncedSearchTerm,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                    }
                });
                setTotalWorkflows(response.workflows[0].total || 0);
                setWorkflows(response.workflows);
            } catch (error) {
                console.error('Error fetching workflows :', error);
            } finally {
                setLoadingWorkflows(false);
            }
        }
        fetchWorkflows().then();
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
            setSelectedWorkflows([]);
            setTotalWorkflows(0);
            setLazyParams({ ...lazyParams, first: 0 });
        });
    }

    const handleDuplicate = () => {
        if (selectedWorkflows.length === 0) return;

        showConfirmDialogWithInput({
            label: t('WORKFLOWS.new_short_label'),
            title: t('WORKFLOWS.duplicate_workflow'),
            message: t('WORKFLOWS.confirm_duplicate_workflow', { name: selectedWorkflows[0].label }),
            confirmText: t('GLOBAL.duplicate'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async (value) => {
                if (!value) {
                    showToast(t('WORKFLOWS.short_label_required'), 'error');
                    return;
                }

                await duplicateWorkflows(selectedWorkflows[0].id, value);
                refresh();
            },
            onCancel: () => {
                setSelectedWorkflows([]);
            }
        });
    }
    const duplicateWorkflows = async (id: number, value: string) => {
        try {
            await post(`/workflows/duplicate/${ id }`, { workflow_label_short: value });
            showToast(t('WORKFLOWS.workflows_duplicated', { count: selectedWorkflows.length }), 'success');
        } catch (err) {
            console.error("Error while duplicating workflow :", err);
        }
    }

    const handleDelete = () => {
        if (setSelectedWorkflows.length === 0) return;

        showConfirmDialog({
            title: t('WORKFLOWS.delete_workflows', { count: selectedWorkflows.length }),
            message: t('WORKFLOWS.confirm_delete_workflows', { count: selectedWorkflows.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await deleteWorkflows(selectedWorkflows.map((form: any) => form.id));
                refresh();
            },
            onCancel: () => {
                setSelectedWorkflows([]);
            }
        });
    }
    const deleteWorkflows = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/workflows/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('WORKFLOWS.workflow_deleted', { count: selectedWorkflows.length }), 'success');
                }
            } catch (err) {
                console.error("Error while deleting workflow :", err);
            }
        }
    }

    return (
        <div className="p-6 bg-(--bg-secondary) flex flex-col h-full">
            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    { t('SETTINGS.workflows', { count: totalWorkflows }) } ({ totalWorkflows || 0 })
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height={ 'h-10' }
                       value={ searchTerm } placeholder={ t('GLOBAL.search') } noMarginBottom={ true }
                       onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Link to={ `/settings/${ module }/workflows/create` }>
                        <Button size='sm' className='p-2 border' variant="bg_white">
                            <Plus size={ 14 } className="mr-1"/> { t('SETTINGS.add_workflow') }
                        </Button>
                    </Link>
                </span>
            </div>
            <Table
                baseLink={ `/settings/${ module }/workflows/edit/` }
                data={ workflows }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                loading={ loadingWorkflows }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                actionsLine={ getActionsLine }
                selectedRows={ selectedWorkflows }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ totalWorkflows || 0 }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("WORKFLOWS.no_workflows") }
                paginatorLeftText={ t('WORKFLOWS.selected', { count: selectedWorkflows.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedWorkflows(rows) }
            />
        </div>
    );
}