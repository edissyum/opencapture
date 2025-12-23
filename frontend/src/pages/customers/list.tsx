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
import { CircleQuestionMark, FileText, Trash2, UserRoundPlus } from "lucide-react";

import Input from "../../components/Input";
import { Button } from "../../components/Button";
import { Table } from "../../components/list/Table";
import { showToast } from "../../components/ToastProvider";

import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";

export function CustomersList() {
    const { get, del } = axiosApiCall();

    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
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
        { id: 'company_number', field: 'company_number', sortable: true, header: t('ACCOUNTS.company_number') },
        { id: 'vat_number', field: 'vat_number', header: t('ACCOUNTS.vat_number') },
        { id: 'module', field: 'module', header: t('MAILCOLLECT.module') }
    ];

    const actions: any = [
        {
            label: <span
                className='critical'>{ t('ACCOUNTS.delete_customer', { 'count': selectedCustomers.length }) }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const getActionsLine = () => [
        {
            label: <span className='critical'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    // Fetch customers
    useEffect(() => {
        if (loadingCustomers) return;
        setLoadingCustomers(true);

        const fetchCustomers = async () => {
            try {
                const response = await get('/accounts/customers/list', {
                    params: {
                        offset: lazyParams.first,
                        limit: lazyParams.rows,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null,
                        search: searchTerm,
                    }
                });
                setTotalCustomers(response.customers[0]?.total || 0);
                setCustomers(response.customers);
            } catch (error) {
                console.error('Error while fetching customers :', error);
            } finally {
                setLoadingCustomers(false);
            }
        }
        fetchCustomers().then();
    }, [lazyParams, searchTerm]);

    const refresh = () => {
        setTimeout(() => {
            setSelectedCustomers([]);
            setTotalCustomers(0);
            setLazyParams({ ...lazyParams, first: 0 });
        });
    }

    const handleDelete = () => {
        if (selectedCustomers.length === 0) return;

        showConfirmDialog({
            icon: <CircleQuestionMark/>,
            title: t('ACCOUNTS.delete_customer', { count: selectedCustomers.length }),
            message: t('ACCOUNTS.confirm_delete_customer', { count: selectedCustomers.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await deleteCustomers(selectedCustomers.map((supplier: any) => supplier.id));
                refresh();
            },
            onCancel: () => {
                setSelectedCustomers([]);
            }
        });
    }
    const deleteCustomers = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/accounts/customers/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('ACCOUNTS.supplier_deleted', { count: selectedCustomers.length }), 'success');
                }
            } catch (err) {
                console.error("Error deleting supplier with id " + id, err);
            }
        }
    }

    return (
        <div className="p-8 bg-(--bg-secondary) h-full w-full flex flex-col flex-1">
            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    <span>
                        { t('ACCOUNTS.suppliers_list') } ({ totalCustomers || 0 })
                    </span>
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height={ 'h-10' }
                       value={ searchTerm } placeholder={ t('USERS.search') } noMarginBottom={ true }
                       onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <Button
                        size={ 'sm' }
                        variant={ "no_bg_border" }
                        className='p-2 px-3 border'
                        onClick={ () => navigate('/suppliers/create') }>
                        <UserRoundPlus size={ 16 } className="mr-2"/> { t('ACCOUNTS.add_supplier') }
                    </Button>
                </span>
            </div>
            <Table
                baseLink="/customers/edit/"
                data={ customers }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                loading={ loadingCustomers }
                actionsLine={ getActionsLine }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                selectedRows={ selectedCustomers }
                totalRecords={ totalCustomers || 0 }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("ACCOUNTS.no_suppliers") }
                paginatorLeftText={ t('ACCOUNTS.selected', { count: selectedCustomers.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedCustomers(rows) }
            />
        </div>
    );
}