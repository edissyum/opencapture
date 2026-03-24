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
import { useNavigate } from "react-router-dom";
import { CirclePause, FileText, Trash2, UserRoundPlus } from "lucide-react";


import Input from "../../components/Input";
import { Button } from "../../components/Button";
import { Table } from "../../components/list/Table";
import { showToast } from "../../components/ToastProvider";

import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";

export function SuppliersList() {
    const { get, del } = axiosApiCall();

    const navigate = useNavigate();

    const [suppliers, setSuppliers] = useState([]);
    const [totalSuppliers, setTotalSuppliers] = useState(0);
    const [selectedSuppliers, setSelectedSuppliers] = useState<any[]>([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 16,
        page: 0,
        sortField: null as string | null,
        sortOrder: null as 1 | -1 | null,
    });

    const columns = [
        { id: 'id', field: 'id', header: '', sortable: true },
        { id: 'name', field: 'name', sortable: true, header: t('ACCOUNTS.name') },
        { id: 'vat_number', field: 'vat_number', header: t('ACCOUNTS.vat_number') }
    ];

    const actions: any = [
        {
            label: t('ACCOUNTS.reinit_positions', { 'count': selectedSuppliers.length }),
            icon: <CirclePause className='mr-1' size={ 16 }/>,
            command: () => handleReinitPositions()
        },
        {
            label: <span
                className='critical'>{ t('ACCOUNTS.delete_supplier', { 'count': selectedSuppliers.length }) }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const getActionsLine = (row: any) => [
        {
            label: t('ACCOUNTS.reinit_positions'),
            icon: <CirclePause className='mr-1' size={ 16 }/>,
            visible: row?.enabled,
            command: () => handleReinitPositions()
        },
        {
            label: <span className='critical'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    // Fetch suppliers
    useEffect(() => {
        if (loadingSuppliers) return;
        setLoadingSuppliers(true);

        const fetchSuppliers = async () => {
            try {
                const response = await get('/accounts/suppliers/list', {
                    params: {
                        offset: lazyParams.first,
                        limit: lazyParams.rows,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null,
                        search: searchTerm,
                    }
                });
                setTotalSuppliers(response.suppliers[0]?.total || 0);
                setSuppliers(response.suppliers);
            } catch (error) {
                console.error('Error while fetching suppliers :', error);
            } finally {
                setLoadingSuppliers(false);
            }
        }
        fetchSuppliers().then();
    }, [lazyParams, searchTerm]);

    const refresh = () => {
        setTimeout(() => {
            setSelectedSuppliers([]);
            setTotalSuppliers(0);
            setLazyParams({ ...lazyParams, first: 0 });
        });
    }

    const handleDelete = () => {
        if (selectedSuppliers.length === 0) return;

        showConfirmDialog({
            title: t('ACCOUNTS.delete_supplier', { count: selectedSuppliers.length }),
            message: t('ACCOUNTS.confirm_delete_supplier', { count: selectedSuppliers.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await deleteSuppliers(selectedSuppliers.map((supplier: any) => supplier.id));
                refresh();
            },
            onCancel: () => {
                setSelectedSuppliers([]);
            }
        });
    }
    const deleteSuppliers = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/accounts/suppliers/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('ACCOUNTS.supplier_deleted', { count: selectedSuppliers.length }), 'success');
                }
            } catch (err) {
                console.error("Error deleting supplier with id " + id, err);
            }
        }
    }

    const handleReinitPositions = () => {
        if (selectedSuppliers.length === 0) return;

        showConfirmDialog({
            title: t('ACCOUNTS.reinit_positions'),
            message: t('ACCOUNTS.confirm_reinit_supplier_position'),
            hint: t('GLOBAL.action_irreversible'),
            confirmText: t('GLOBAL.reinit'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await reinitPositionsSuppliers(selectedSuppliers.map((supplier: any) => supplier.id));
                refresh();
            },
            onCancel: () => {
                setSelectedSuppliers([]);
            }
        });
    }
    const reinitPositionsSuppliers = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/accounts/suppliers/deletePositions/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('ACCOUNTS.supplier_position_reinit', { count: selectedSuppliers.length }), 'success');
                }
            } catch (err) {
                console.error("Error deleting supplier position with id " + id, err);
            }
        }
    }

    return (
        <div className="p-6 bg-(--bg-secondary) h-full w-full flex flex-col flex-1">
            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    <span>
                        { t('ACCOUNTS.suppliers_list') } ({ totalSuppliers || 0 })
                    </span>
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height={ 'h-10' }
                       value={ searchTerm } placeholder={ t('GLOBAL.search') } noMarginBottom={ true }
                       onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Button
                        size='sm'
                        variant="bg_white"
                        className='p-2 px-3 border'
                        onClick={ () => navigate('/suppliers/create') }>
                        <UserRoundPlus size={ 16 } className="mr-2"/> { t('ACCOUNTS.add_supplier') }
                    </Button>
                </span>
            </div>
            <Table
                baseLink="/suppliers/edit/"
                data={ suppliers }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                loading={ loadingSuppliers }
                actionsLine={ getActionsLine }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                selectedRows={ selectedSuppliers }
                totalRecords={ totalSuppliers || 0 }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("ACCOUNTS.no_suppliers") }
                paginatorLeftText={ t('ACCOUNTS.selected', { count: selectedSuppliers.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedSuppliers(rows) }
            />
        </div>
    );
}