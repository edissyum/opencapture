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
import { Check, FileText, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";

import Input from "../../Input";
import { Button } from "../../Button";
import { Table } from "../../list/Table";
import { Loader } from "../../loader/Loader";
import { showToast } from "../../ToastProvider";
import UploadDropzone from "../../upload/Dropzone";


import { axiosApiCall } from "../../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../../services/hooks/ConfirmDialog";
import { usePersistentState } from "../../../services/hooks/usePersistentState";

export function AiDoctypesList({ module }: { module: string }) {
    const { get, post, del } = axiosApiCall();

    const [outputs, setAiDoctypes] = useState([]);
    const [totalAiDoctypes, setTotalAiDoctypes] = useState(0);
    const [selectedAiDoctypes, setSelectedAiDoctypes] = useState<any[]>([]);
    const [loadingAiDoctypes, setLoadingAiDoctypes] = useState(false);

    const [testingModel, setTestingModel] = useState(false);
    const [testingModelLoading, setTestingModelLoading] = useState(false);
    const [testingModelResult, setTestingModelResult] = useState<any>(null);
    const [testingModelFile, setTestingModelFile] = useState<File | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = usePersistentState<{
        first: number;
        rows: number;
        page: number;
        sortField: string | null;
        sortOrder: 1 | -1 | null;
    }>(`aiDoctypesList${ module }LazyParams`, {
            first: 0,
            rows: 16,
            page: 0,
            sortField: null,
            sortOrder: null
        }
    );
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const getActionsLine: any = () => [
        {
            label: <span className='critical'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDelete()
        },
        {
            label: t('AI-DOCTYPES.test_model'),
            icon: <Sparkles size={ 16 }/>,
            command: () => {
                setTestingModel(true)
                setTestingModelFile(null);
            }
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
        { id: 'id', field: 'id', header: '', sortable: true, className: 'w-16!' },
        { id: 'model_label', field: 'model_label', header: t('GLOBAL.label'), sortable: true },
        { id: 'accuracy_score', field: 'accuracy_score', header: t('AI-DOCTYPES.accuracy_score') },
        { id: 'min_proba', field: 'min_proba', header: t('AI-DOCTYPES.min_proba') },
        {
            id: 'percentage',
            field: 'percentage',
            header: t('AI-DOCTYPES.percentage'),
            body: (row: any) => (
                <span className="block truncate max-w-[40rem] whitespace-nowrap">
                    { row?.percentage?.replace('%', '').replace('.0', '').trim() == '100' ? (
                        <Check data-tooltip-id='tooltip' data-tooltip-content={ t('AI-DOCTYPES.end') }/>
                    ) : (
                        <div className='flex items-center gap-1'>
                            <Loader2 className="animate-spin "/>
                            { row?.percentage ? row?.percentage : '0 %' }
                        </div>
                    ) }
                </span>
            )
        }
    ];

    // Fetch ai doctypes
    useEffect(() => {
        if (loadingAiDoctypes) return;
        setLoadingAiDoctypes(true);

        const fetchAiDoctypes = async () => {
            try {
                const response = await get(`/ai/${ module }/list`, {
                    params: {
                        limit: lazyParams.rows,
                        offset: lazyParams.first,
                        search: debouncedSearchTerm,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                    }
                });
                if (response.models && response.models.length > 0) {
                    setTotalAiDoctypes(response.models[0].total || 0);
                    setAiDoctypes(response.models);
                } else {
                    setTotalAiDoctypes(0);
                    setAiDoctypes([]);
                }
            } catch (error) {
                console.error('Error fetching ai doctypes :', error);
            } finally {
                setLoadingAiDoctypes(false);
            }
        }
        fetchAiDoctypes().then();
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
            setSelectedAiDoctypes([]);
            setTotalAiDoctypes(0);
            setLazyParams({ ...lazyParams, first: 0 });
        });
    }

    const handleDelete = () => {
        if (setSelectedAiDoctypes.length === 0) return;

        showConfirmDialog({
            title: t('AI-DOCTYPES.delete_ai_doctypes', { count: selectedAiDoctypes.length }),
            message: t('AI-DOCTYPES.confirm_delete_ai_doctypes', { count: selectedAiDoctypes.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await deleteAiDoctypes(selectedAiDoctypes.map((form: any) => form.id));
                refresh();
            },
            onCancel: () => {
                setSelectedAiDoctypes([]);
            }
        });
    }
    const deleteAiDoctypes = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/ai/${ module }/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('AI-DOCTYPES.model_deleted', { count: selectedAiDoctypes.length }), 'success');
                }
            } catch (err) {
                console.error("Error while deleting ai doctypes :", err);
            }
        }
    }

    const handleTestModel = async (file: File) => {
        if (setSelectedAiDoctypes.length !== 1) return;

        setTestingModelFile(file);
        setTestingModelLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await post(`/ai/${ module }/testModel/${ selectedAiDoctypes[0].id }`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (res) {
                setTestingModelResult(res);
            }

        } catch (err) {
            console.error("Error while testing model :", err);
        } finally {
            setTestingModelLoading(false);
        }
    }

    return (
        <div className="p-6 bg-(--bg-secondary) flex flex-col h-full">
            { testingModel && (
                <div>
                    <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                         onClick={ () => setTestingModel(false) }/>
                    <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl
                                    outline-none shadow-none bg-(--bg-primary) text-(--text-secondary) w-1/2
                                    border border-(--border-secondary) hover:border hover:border-(--text-secondary)">
                        <div className="p-6 flex flex-col gap-2">
                            <h3 className="font-semibold text-(--text-primary)">{ t('AI-DOCTYPES.test_model') }</h3>
                            <p className='text-(--text-secondary)'>{ t('AI-DOCTYPES.test_model_desc') }</p>
                            <div className="absolute top-6 right-6 cursor-pointer"
                                 onClick={ () => setTestingModel(false) }>
                                { <X size={ 18 }/> }
                            </div>
                            <UploadDropzone
                                maxFiles={ 1 }
                                showPreview={ false }
                                maxSize={ 10 * 1024 * 1024 }
                                className="bg-(--bg-primary) mt-4"
                                accept={ { "application/*": [".pdf"] } }
                                onFilesAccepted={ (files: File[]) => handleTestModel(files[0]) }
                            />
                            { testingModelFile && (
                                <div>
                                    { testingModelLoading ? (
                                        <Loader/>
                                    ) : (
                                        <div className="mt-4 p-4 bg-(--bg-secondary) rounded-xl">
                                            <h4 className="font-semibold mb-2">{ t('AI-DOCTYPES.test_model_result') }</h4>
                                            { testingModelResult && (
                                                <div className="space-y-2">
                                                    <p>
                                                        { t('VERIFIER.filename') } : <strong>{ testingModelResult[0] }</strong>
                                                    </p>
                                                    <p>
                                                        { t('AI-DOCTYPES.prediction') } : <strong>{ testingModelResult[1] }</strong>
                                                    </p>
                                                    <p>
                                                        { t('AI-DOCTYPES.proba') } : <strong>{ testingModelResult[2] }%</strong>
                                                    </p>
                                                </div>
                                            ) }
                                        </div>
                                    ) }
                                </div>
                            ) }
                        </div>
                    </div>
                </div>
            ) }

            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    { t('SETTINGS.ai_doctypes', { count: totalAiDoctypes }) } ({ totalAiDoctypes || 0 })
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height='h-10' autoFocus
                       value={ searchTerm } placeholder={ t('GLOBAL.search') }
                       onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Link to={ `/settings/${ module }/ai-doctypes/create` }>
                        <Button size='sm' className='p-2 border' variant="bg_white">
                            <Plus size={ 14 }/> { t('AI-DOCTYPES.add_ai_doctype') }
                        </Button>
                    </Link>
                </span>
            </div>
            <Table
                baseLink={ `/settings/${ module }/ai-doctypes/edit/` }
                data={ outputs }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                loading={ loadingAiDoctypes }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                actionsLine={ getActionsLine }
                selectedRows={ selectedAiDoctypes }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ totalAiDoctypes || 0 }
                rowsPerPageOptions={ [
                            { "value": 4, "label": "4" },
                            { "value": 8, "label": "8" },
                            { "value": 16, "label": "16" },
                            { "value": 32, "label": "32" }
                        ] }
                emptyMessage={ t("AI-DOCTYPES.no_ai_doctypes") }
                paginatorLeftText={ t('AI-DOCTYPES.selected', { count: selectedAiDoctypes.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedAiDoctypes(rows) }
            />
        </div>
    );
}