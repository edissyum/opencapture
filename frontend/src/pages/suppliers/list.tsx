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
import { CirclePause, Download, FileText, Trash2, Upload, UserRoundPlus } from "lucide-react";

import Input from "../../components/Input";
import { Button } from "../../components/Button";
import { Table } from "../../components/list/Table";
import { showToast } from "../../components/ToastProvider";
import { hasRequiredPermissions } from "../../components/auth/auth";
import { ImportSpreadSheet } from "../../components/settings/ImportSpreadSheet";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";

export function SuppliersList() {
    const { user } = useUser();
    const { get, post, del } = axiosApiCall();
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
        sortOrder: null as 1 | -1 | null
    });

    const [openImport, setOpenImport] = useState(false);
    const [loadingImport, setLoadingImport] = useState(false);

    const importColumns = ['name', 'lastname', 'firstname', 'civility', 'function', 'vat_number', 'siret',
        'siren', 'duns', 'bic', 'rccm', 'iban', 'email', 'phone', 'address1', 'address2', 'city', 'postal_code', 'country',
        'footer_coherence', 'document_lang', 'default_currency', 'informal_contact'];

    const columns = [
        { id: 'id', field: 'id', header: '', sortable: true },
        { id: 'name', field: 'name', sortable: true, header: t('ACCOUNTS.name') },
        { id: 'lastname', field: 'lastname', sortable: true, header: t('ACCOUNTS.lastname') },
        { id: 'firstname', field: 'firstname', sortable: true, header: t('ACCOUNTS.firstname') },
        { id: 'vat_number', field: 'vat_number', header: t('ACCOUNTS.vat_number') }
    ];

    const actions: any = [
        {
            label: t('ACCOUNTS.reinit_positions', { 'count': selectedSuppliers.length }),
            icon: <CirclePause size={ 16 }/>,
            command: () => handleReinitPositions()
        },
        {
            label: <span
                className='critical'>{ t('GLOBAL.delete', { 'count': selectedSuppliers.length }) }</span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const getActionsLine = (row: any) => [
        {
            label: t('ACCOUNTS.reinit_positions'),
            icon: <CirclePause size={ 16 }/>,
            visible: row?.enabled,
            command: () => handleReinitPositions()
        },
        {
            label: <span className='critical'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    // Fetch suppliers
    useEffect(() => {
        if (loadingSuppliers) return;
        setLoadingSuppliers(true);

        fetchSuppliers().then();
    }, [lazyParams, searchTerm]);

    const fetchSuppliers = async () => {
        try {
            const response = await get('/accounts/suppliers/list', {
                params: {
                    search: searchTerm,
                    limit: lazyParams.rows,
                    offset: lazyParams.first,
                    filter: lazyParams.sortField,
                    order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
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

    const handleExportSuppliers = async () => {
        try {
            await get('/accounts/supplier/fillReferenceFile');
            const res = await get('/accounts/supplier/getReferenceFile');
            const mimeType = res.mimetype;
            const referenceFile = 'data:' + mimeType + ';base64, ' + res.file;
            const link = document.createElement("a");
            link.href = referenceFile;
            link.download = res.filename;
            link.click();

            showToast(t('ACCOUNTS.export_suppliers_success'), 'success');
        } catch (error) {
            console.error('Error while exporting suppliers :', error);
        }
    }

    const handleImportSuppliers = async (formData: any) => {
        if (!formData) return;

        setLoadingImport(true);

        await post('/accounts/supplier/importSuppliers', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        await fetchSuppliers();

        setOpenImport(false);
        setLoadingImport(false);

        showToast(t('ACCOUNTS.import_suppliers_success'), 'success');
    }

    return (
        <div className="p-6 bg-(--bg-secondary) h-full w-full flex flex-col flex-1">
            { openImport && (
                <ImportSpreadSheet
                    columns={ importColumns }
                    loading={ loadingImport }
                    onValidate={ handleImportSuppliers }
                    onClose={ () => setOpenImport(false) }
                    title={ t('ACCOUNTS.import_suppliers') }
                />
            ) }

            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    <span>
                        { t('ACCOUNTS.suppliers_list') } ({ totalSuppliers || 0 })
                    </span>
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height='h-10' autoFocus
                       value={ searchTerm } placeholder={ t('GLOBAL.search') }
                       onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='ml-auto text-(--text-secondary) cursor-pointer'>
                    <div className='flex items-center gap-2'>
                        <Button
                            size='sm'
                            variant="bg_white"
                            className='p-2 px-3 border'
                            onClick={ () => navigate('/suppliers/create') }
                        >
                            <UserRoundPlus size={ 16 }/> { t('ACCOUNTS.add_supplier') }
                        </Button>

                        { hasRequiredPermissions(user, ['export_suppliers']) && (
                            <Button
                                size='sm'
                                variant="bg_white"
                                className='p-2.5 border'
                                onClick={ handleExportSuppliers }
                                data-tooltip-id='tooltip'
                                data-tooltip-content={ t('ACCOUNTS.export_suppliers') }
                            >
                                <Upload size={ 16 }/>
                            </Button>
                        ) }

                        { hasRequiredPermissions(user, ['import_suppliers']) && (
                            <Button
                                size='sm'
                                variant='bg_white'
                                className='p-2.5 border'
                                data-tooltip-id='tooltip'
                                onClick={ () => setOpenImport(true) }
                                data-tooltip-content={ t('ACCOUNTS.import_suppliers') }
                            >
                                <Download size={ 16 }/>
                            </Button>
                        ) }
                    </div>
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
                rowsPerPageOptions={ [
                            { "value": 4, "label": "4" },
                            { "value": 8, "label": "8" },
                            { "value": 16, "label": "16" },
                            { "value": 32, "label": "32" }
                        ] }
                emptyMessage={ t("ACCOUNTS.no_suppliers") }
                paginatorLeftText={ t('ACCOUNTS.selected', { count: selectedSuppliers.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedSuppliers(rows) }
            />
        </div>
    );
}