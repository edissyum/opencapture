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

import Input from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { Table } from "../../../../components/list/Table";
import { showToast } from "../../../../components/ToastProvider";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../../../services/hooks/ConfirmDialog";
import { usePersistentState } from "../../../../services/hooks/usePersistentState";

export function SettingsVerifierAiLLMList() {
    const { get, del } = axiosApiCall();

    const [aiLlm, setAiLlm] = useState([]);
    const [totalAiLlm, setTotalAiLlm] = useState(0);
    const [selectedAiLlm, setSelectedAiLlm] = useState<any[]>([]);
    const [loadingAiLlm, setLoadingAiLlm] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = usePersistentState<{
        first: number;
        rows: number;
        page: number;
        sortField: string | null;
        sortOrder: 1 | -1 | null;
    }>(`aiLlmListVerifierLazyParams`, {
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
        { id: 'name', field: 'name', header: t('GLOBAL.label'), sortable: true },
        { id: 'provider', field: 'provider', header: t('AI-LLM.provider'), sortable: true },
        {
            id: 'url', field: 'url', header: t('AI-LLM.url'), className: 'max-w-[40rem]',
            body: (row: any) => (
                <span className="block truncate max-w-[40rem] whitespace-nowrap">
                    { row.url }
                </span>
            )
        }
    ];

    // Fetch ai llm list
    useEffect(() => {
        if (loadingAiLlm) return;
        setLoadingAiLlm(true);

        const fetchAiLlm = async () => {
            try {
                const response = await get(`/ai/llm/list`, {
                    params: {
                        limit: lazyParams.rows,
                        offset: lazyParams.first,
                        search: debouncedSearchTerm,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                    }
                });

                setTotalAiLlm(response.llm_models[0].total || 0);
                setAiLlm(response.llm_models);
            } catch (error) {
                console.error('Error fetching ai llm models :', error);
            } finally {
                setLoadingAiLlm(false);
            }
        }
        fetchAiLlm().then();
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
            setSelectedAiLlm([]);
            setTotalAiLlm(0);
            setLazyParams({ ...lazyParams, first: 0 });
        });
    }

    const handleDelete = () => {
        if (setSelectedAiLlm.length === 0) return;

        showConfirmDialog({
            title: t('AI-LLM.delete_model', { count: selectedAiLlm.length }),
            message: t('AI-LLM.confirm_delete_model', { count: selectedAiLlm.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await deleteAiLlmModels(selectedAiLlm.map((form: any) => form.id));
                refresh();
            },
            onCancel: () => {
                setSelectedAiLlm([]);
            }
        });
    }
    const deleteAiLlmModels = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/ai/llm/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('AI-LLM.model_deleted', { count: selectedAiLlm.length }), 'success');
                }
            } catch (err) {
                console.error("Error while deleting ai llm models :", err);
            }
        }
    }

    return (
        <div className="p-6 bg-(--bg-secondary) flex flex-col h-full">
            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    { t('SETTINGS.ai_llm', { count: totalAiLlm }) } ({ totalAiLlm || 0 })
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height={ 'h-10' }
                       value={ searchTerm } placeholder={ t('GLOBAL.search') } noMarginBottom={ true }
                       onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Link to={ `/settings/verifier/ai-llm/create` }>
                        <Button size='sm' className='p-2 border' variant="bg_white">
                            <Plus size={ 14 } className="mr-1"/> { t('AI-LLM.add_model') }
                        </Button>
                    </Link>
                </span>
            </div>
            <Table
                baseLink={ `/settings/verifier/ai-llm/edit/` }
                data={ aiLlm }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                loading={ loadingAiLlm }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                actionsLine={ getActionsLine }
                selectedRows={ selectedAiLlm }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ totalAiLlm || 0 }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("AI-LLM.no_models") }
                paginatorLeftText={ t('AI-LLM.selected', { count: selectedAiLlm.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedAiLlm(rows) }
            />
        </div>
    );
}