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

export function SettingsVerifierPositionsMasksList() {
    const { get, del } = axiosApiCall();

    const [positionsMasks, setPositionsMasks] = useState([]);
    const [totalPositionsMasks, setTotalPositionsMasks] = useState(0);
    const [selectedPositionsMasks, setSelectedPositionsMasks] = useState<any[]>([]);
    const [loadingPositionsMasks, setLoadingPositionsMasks] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = usePersistentState<{
        first: number;
        rows: number;
        page: number;
        sortField: string | null;
        sortOrder: 1 | -1 | null;
    }>(`positionsMasksListVerifierLazyParams`, {
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
        { id: 'label', field: 'label', header: t('GLOBAL.label'), sortable: true },
        { id: 'supplier_name', field: 'supplier_name', header: t('ACCOUNTS.supplier_name'), sortable: true },
        { id: 'form_label', field: 'form_label', header: t('VERIFIER.form'), sortable: true },
    ];

    // Fetch positions masks list and suppliers
    useEffect(() => {
        if (loadingPositionsMasks) return;
        setLoadingPositionsMasks(true);

        const fetchPositionsMasks = async () => {
            try {
                const response = await get(`/positions_masks/list`, {
                    params: {
                        limit: lazyParams.rows,
                        offset: lazyParams.first,
                        search: debouncedSearchTerm,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                    }
                });

                setTotalPositionsMasks(response.positions_masks[0]?.total || 0);
                setPositionsMasks(response.positions_masks);
            } catch (error) {
                console.error('Error fetching positions masks :', error);
            } finally {
                setLoadingPositionsMasks(false);
            }
        }

        fetchPositionsMasks().then();
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
            setSelectedPositionsMasks([]);
            setTotalPositionsMasks(0);
            setLazyParams({ ...lazyParams, first: 0 });
        });
    }

    const handleDelete = () => {
        if (setSelectedPositionsMasks.length === 0) return;

        showConfirmDialog({
            title: t('POSITIONS-MASKS.delete_model', { count: selectedPositionsMasks.length }),
            message: t('POSITIONS-MASKS.confirm_delete_model', { count: selectedPositionsMasks.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await deletepositionsMasksModels(selectedPositionsMasks.map((form: any) => form.id));
                refresh();
            },
            onCancel: () => {
                setSelectedPositionsMasks([]);
            }
        });
    }
    const deletepositionsMasksModels = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/positions_masks/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('POSITIONS-MASKS.deleted', { count: selectedPositionsMasks.length }), 'success');
                }
            } catch (err) {
                console.error("Error while deleting positions masks :", err);
            }
        }
    }

    return (
        <div className="p-6 bg-(--bg-secondary) flex flex-col h-full">
            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    { t('SETTINGS.positions-masks', { count: totalPositionsMasks }) } ({ totalPositionsMasks || 0 })
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height={ 'h-10' }
                       value={ searchTerm } placeholder={ t('GLOBAL.search') } noMarginBottom={ true }
                       onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Link to={ `/settings/verifier/positions-masks/create` }>
                        <Button size='sm' className='p-2 border' variant="bg_white">
                            <Plus size={ 14 } className="mr-1"/> { t('POSITIONS-MASKS.add_model') }
                        </Button>
                    </Link>
                </span>
            </div>
            <Table
                baseLink={ `/settings/verifier/positions-masks/edit/` }
                data={ positionsMasks }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                loading={ loadingPositionsMasks }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                actionsLine={ getActionsLine }
                selectedRows={ selectedPositionsMasks }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ totalPositionsMasks || 0 }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("POSITIONS-MASKS.no_positions_masks") }
                paginatorLeftText={ t('POSITIONS-MASKS.selected', { count: selectedPositionsMasks.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedPositionsMasks(rows) }
            />
        </div>
    );
}