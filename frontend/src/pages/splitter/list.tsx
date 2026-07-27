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
import {
    Briefcase,
    ChevronDown,
    CircleCheckBig,
    Combine,
    Eye,
    FileText,
    Filter,
    LayoutGrid,
    LayoutTemplate,
    Package,
    Paperclip,
    Rows3,
    Trash2,
    X
} from "lucide-react";
import DOMPurify from "dompurify";
import { RadioButton } from "primereact/radiobutton";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";
import { usePersistentState } from "../../services/hooks/usePersistentState";

import Input from "../../components/Input";
import { Button } from "../../components/Button";
import { Grid } from "../../components/list/Grid";
import { Table } from "../../components/list/Table";
import { Select } from "../../components/Select.tsx";
import { Thumbnail } from "../../components/Thumbnail";
import { showToast } from "../../components/ToastProvider";
import MultiSelectInput from "../../components/MultiSelect";

export function SplitterListPage() {
    const { user, loadingUser } = useUser();
    const { get, post, put } = axiosApiCall();

    const [showMerge, setShowMerge] = useState(false);
    const [selectedPrincipalBatchId, setSelectedPrincipalBatchId] = useState('');

    const [view, setView] = usePersistentState<'list' | 'grid'>('selectedView', 'list');
    const [displayFilters, setDisplayFilters] = useState(false);
    const [filtersChanged, setFiltersChanged] = useState(false);

    const [listTimes, setListTimes] = useState([
        { 'id': 'today', 'label': t('GLOBAL.today'), 'totals': 0 },
        { 'id': 'yesterday', 'label': t('GLOBAL.yesterday'), 'totals': 0 },
        { 'id': 'older', 'label': t('GLOBAL.older'), 'totals': 0 }
    ]);
    const [open, setOpen] = useState({
        forms: false,
        status: true,
        batches: true,
        customers: false
    });

    const [listForms, setListForms] = useState<any>([]);
    const [listStatuses, setListStatuses] = useState<any>([]);
    const [listCustomers, setListCustomers] = useState<any>([]);

    const [selectedCustomers, setSelectedCustomers] = usePersistentState<any>('selectedCustomersSplitter', []);
    const [selectedForm, setSelectedForm] = usePersistentState<string>('selectedFormSplitter', '');
    const [selectedTime, setSelectedTime] = usePersistentState<string>('selectedTimeSplitter', '');
    const [selectedStatus, setSelectedStatus] = usePersistentState<string>('selectedStatusSplitter', 'NEW');

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const [batches, setBatches] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBatches, setSelectedBatches] = useState<any[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(true);
    const [totalBatches, setTotalBatches] = useState<number>(0);

    const [lazyParams, setLazyParams] = usePersistentState<{
        first: number;
        rows: number;
        page: number;
        sortField: string | null;
        sortOrder: 1 | -1 | null;
    }>('splitterListLazyParams', {
            first: 0,
            rows: 16,
            page: 0,
            sortField: null,
            sortOrder: null
        }
    );
    const [hovered, setHovered] = useState<string | null>(null);

    const getActionsLine: any = () => [
        {
            label: <span className='critical'>{ t('SPLITTER.delete_batch') } </span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const actions: any = [
        {
            label: t('SPLITTER.delete_batches'),
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDelete()
        },
        {
            label: t('GLOBAL.merge'),
            icon: <Combine size={ 16 }/>,
            command: () => setShowMerge(true),
            disabled: selectedBatches.length < 2
        }
    ];

    const columns: any = [
        {
            id: 'id',
            header: view == 'grid' ? t('SPLITTER.id') : '',
            field: 'id',
            sortable: true,
            className: 'max-w-14! w-14!'
        },
        {
            id: 'filename',
            header: t('VERIFIER.filename'),
            className: 'truncate-data w-md! max-w-md!',
            body: (item: any) => (
                <span className="font-semibold" title={ item['subject'] ? item['subject'] : item['file_name'] }>
                    { item['subject'] ? item['subject'] : item['file_name'] }
                </span>
            )
        },
        {
            id: 'creation_date',
            header: t('VERIFIER.creation_date'),
            sortable: true,
            field: 'batch_date'
        },
        { id: 'form_label', header: t('VERIFIER.form'), field: 'form_label' },
        {
            id: 'nb_pages',
            header: '',
            className: 'max-w-16! w-16! p-2!',
            body: (item: any) => (
                <div className='flex gap-1 justify-end'>
                    <div className='flex justify-center items-center text-(--color-primary) gap-0.5'
                         data-tooltip-id="tooltip" data-tooltip-content={ t('SPLITTER.nb_documents') }>
                        <span>{ item.documents_count }</span>
                        <FileText size={ 15 }/>
                    </div>
                    { item.attachments_count > 0 && (
                        <div className='flex justify-center items-center text-(--color-primary) gap-0.5'
                             data-tooltip-id="tooltip" data-tooltip-content={ t('VERIFIER.nb_attachments') }>
                            <span>{ item.attachments_count }</span>
                            <Paperclip size={ 15 }/>
                        </div>
                    ) }
                </div>
            )
        },
        {
            id: 'thumbnail',
            header: '',
            className: 'max-w-14! w-14! ml-0.5 cursor-default!',
            body: (item: any) => (
                <div onMouseEnter={ () => setHovered(item) } onMouseLeave={ () => setHovered(null) }>
                    <Eye/>
                </div>
            )
        }
    ];

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Fetch form list
    useEffect(() => {
        if (!user || loadingUser) return;

        const fetchForms = async () => {
            const res = await get(`/forms/splitter/list`) || [];
            setListForms(res.forms || []);
        }
        fetchForms().then();
    }, [user, loadingUser]);

    // Fetch customer list
    useEffect(() => {
        if (listForms.length === 0) return;

        const fetchCustomers = async () => {
            const res = await get(`/accounts/customers/list/splitter/${ user.id }`);
            let customers = [{ id: 0, name: t('ACCOUNTS.no_customer_associated') }];
            customers = customers.concat(res.customers || []);
            setListCustomers(customers);
        }

        fetchCustomers().then();
    }, [listForms]);

    // Fetch batches
    useEffect(() => {
        async function retrieveBatches() {
            if (!user || loadingUser) return;
            setLoadingBatches(true);

            try {
                const res = await post('/splitter/batches/list', {
                    user_id: user.id,
                    time: selectedTime,
                    form_id: selectedForm,
                    status: selectedStatus,
                    limit: lazyParams.rows,
                    offset: lazyParams.first,
                    search: searchTerm || null,
                    filter: lazyParams.sortField,
                    allowedCustomers: selectedCustomers ? selectedCustomers : null,
                    order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                }) || [];

                setTotalBatches(res.count);
                setBatches(res.batches);
            } catch (err) {
                console.error("Erreur récupération des lots :", err);
                setBatches([]);
            } finally {
                setLoadingBatches(false);
            }
        }

        retrieveBatches().then();
    }, [listForms, lazyParams, debouncedSearchTerm, selectedStatus, selectedTime, selectedForm, selectedCustomers]);

    // Fetch totals per filters
    useEffect(() => {
        async function retrieveTotals() {
            if (!user || loadingUser || loadingBatches) return;

            try {
                const res = await post('/splitter/batches/filters/totals', {
                    user_id: user.id,
                    time: selectedTime,
                    form_id: selectedForm,
                    status: selectedStatus,
                    search: debouncedSearchTerm || null,
                    allowedCustomers: selectedCustomers ? selectedCustomers : null
                }) || {};

                setListTimes((prevTimes) => prevTimes.map((time) => ({
                    ...time,
                    totals: res.totals.times[time.id] || 0
                })));
                setListStatuses(res.totals.status || []);
            } catch (err) {
                console.error("Error retrieving filters counts  :", err);
                setTotalBatches(0);
            }
        }

        retrieveTotals().then();
    }, [loadingBatches]);

    const handleDelete = async () => {
        if (selectedBatches.length === 0) return;

        showConfirmDialog({
            title: t('SPLITTER.delete_batch'),
            message: t('SPLITTER.confirm_delete_batch', { count: selectedBatches.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await deleteDocuments(selectedBatches.map(doc => doc.id));
                setSelectedBatches([]);
                setTotalBatches(0);
                setLazyParams({ ...lazyParams, first: 0 });
            },
            onCancel: () => {
                setSelectedBatches([]);
            }
        })
    }

    const deleteDocuments = async (ids: string[]) => {
        try {
            await put('/splitter/deleteBatches', { ids: ids });
        } catch (err) {
            console.error("Erreur suppression des lots :", err);
        }
    }

    const handleMerge = async () => {
        if (selectedBatches.length < 2) return;

        try {
            const batchesToMerge = selectedBatches.filter(batch => batch.id !== selectedPrincipalBatchId).map(batch => batch.id);
            await post(`/splitter/merge/${ selectedPrincipalBatchId }`, { batches: batchesToMerge });
            showToast(t('SPLITTER.batches_merged'), 'success');
            setShowMerge(false);
            setSelectedBatches([]);
            setTotalBatches(0);
            setLazyParams({ ...lazyParams, first: 0 });
        } catch (err) {
            console.error("Erreur lors de la fusion des lots :", err);
        }
    }

    const handleResetFilters = () => {
        setSelectedCustomers([]);
        setSelectedTime('');
        setSelectedForm('');
        setSelectedStatus('NEW');
    }

    // Check if filters have changed
    useEffect(() => {
        const isFiltersChanged = selectedCustomers.length > 0 || selectedTime !== '' || selectedForm !== '' || selectedStatus !== 'NEW';
        setFiltersChanged(isFiltersChanged);
    }, [selectedCustomers, selectedTime, selectedForm, selectedStatus]);

    return (
        <div className='flex h-full w-full overflow-hidden'>
            <div className={ `h-full shrink-0 transition-all border-r-2 border-(--border-secondary) pb-10
                            ${ displayFilters ? "w-[350px] opacity-100" : "w-0 opacity-0 z-0" } bg-(--bg-primary)` }>
                <div className='border-b border-(--border-secondary) p-4 flex items-center justify-between gap-2'>
                    <h1 className='text-2xl font-bold'>
                        { t('VERIFIER.filters') }
                    </h1>
                    <span className='cursor-pointer text-(--text-secondary) hover:text-(--color-primary) whitespace-nowrap'
                          onClick={ handleResetFilters }>
                        { t('VERIFIER.erase_filters') }
                    </span>
                </div>
                <div className='flex flex-col h-full overflow-y-auto'>
                    <div className={ `${ open.batches ? 'bg-(--bg-secondary)' : '' } border-b border-(--border-secondary)` }>
                        <div className="p-4 cursor-pointer flex items-center justify-between"
                             onClick={ () => setOpen({ ...open, batches: !open.batches }) }>
                            <div className="flex items-center gap-2">
                                <Package className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold'>{ t('GLOBAL.batches') }</h3>
                            </div>
                            <ChevronDown
                                size={ 18 }
                                className={ `transition-transform ${ open.batches ? "rotate-180" : "" }` }/>
                        </div>

                        { open.batches && (
                            <div className='flex flex-col p-4 pt-0'>
                                { listTimes.map((time) => (
                                    <div className='flex items-center text-(--text-secondary)' key={ time.id }>
                                        <RadioButton
                                            inputId={ time.id } checked={ selectedTime === time.id }
                                            className='mr-1 scale-80'
                                            value={ time.id }
                                            onChange={ (e) => {
                                                setSelectedTime(e.value);
                                            } }>
                                        </RadioButton>
                                        <label htmlFor={ time.id } key={ time.id } className='cursor-pointer whitespace-nowrap'>
                                            { time.label } ({ time.totals || 0 })
                                        </label>
                                    </div>
                                )) }
                            </div>
                        ) }
                    </div>
                    <div className={ `${ open.status ? 'bg-(--bg-secondary)' : '' } border-b border-(--border-secondary)` }>
                        <div className="p-4 cursor-pointer flex items-center justify-between"
                             onClick={ () => setOpen({ ...open, status: !open.status }) }>
                            <div className="flex items-center gap-2">
                                <CircleCheckBig className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold'>{ t('GLOBAL.status') }</h3>
                            </div>
                            <ChevronDown
                                size={ 18 }
                                className={ `transition-transform ${ open.status ? "rotate-180" : "" }` }/>
                        </div>

                        { open.status && (
                            <div className='flex flex-col p-4 pt-0'>
                                { Object.keys(listStatuses).map((key: any) => (
                                    <div className='flex items-center text-(--text-secondary)' key={ key }>
                                        <RadioButton
                                            inputId={ key }
                                            checked={ selectedStatus === listStatuses[key]?.id }
                                            className='mr-1 scale-80'
                                            value={ key }
                                            onChange={ (e) => {
                                                setSelectedStatus(listStatuses[e.value]?.id);
                                            } }>
                                        </RadioButton>
                                        <label htmlFor={ key } key={ key } className='cursor-pointer whitespace-nowrap'>
                                            { listStatuses[key]?.label } ({ listStatuses[key]?.total || 0 })
                                        </label>
                                    </div>
                                )) }
                            </div>
                        ) }
                    </div>
                    <div className={ `${ open.customers ? 'bg-(--bg-secondary)' : '' } border-b border-(--border-secondary)` }>
                        <div className="p-4 cursor-pointer flex items-center justify-between"
                             onClick={ () => setOpen({ ...open, customers: !open.customers }) }>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <Briefcase className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold'>{ t('ACCOUNTS.customers_list') }</h3>
                            </div>
                            <ChevronDown size={ 18 }
                                         className={ `transition-transform ${ open.customers ? "rotate-180" : "" }` }/>
                        </div>

                        { open.customers && (
                            <div className='p-4 pt-0'>
                                <MultiSelectInput
                                    optionValue="id"
                                    optionLabel="name"
                                    id="customers_select"
                                    options={ listCustomers }
                                    value={ selectedCustomers?.map(Number) ?? [] }
                                    placeholder={ t('ACCOUNTS.search_customers') }
                                    onChange={ (e) => {
                                        setSelectedCustomers(e.value);
                                    } }
                                />
                            </div>
                        ) }
                    </div>
                    <div className={ `${ open.forms ? 'bg-(--bg-secondary)' : '' } border-b border-(--border-secondary)` }>
                        <div className="p-4 cursor-pointer flex items-center justify-between"
                             onClick={ () => setOpen({ ...open, forms: !open.forms }) }>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <LayoutTemplate className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold'>{ t('GLOBAL.forms') }</h3>
                            </div>
                            <ChevronDown
                                size={ 18 }
                                className={ `transition-transform ${ open.forms ? "rotate-180" : "" }` }/>
                        </div>

                        { open.forms && (
                            <div className='p-4 pt-0'>
                                <Select
                                    id="search_form"
                                    value={ selectedForm.toString() }
                                    placeholder={ t('VERIFIER.search_form') }
                                    options={ listForms.map((form: any) => ({
                                        label: form.label,
                                        value: form.id.toString()
                                    })) }
                                    onChange={ (value) => setSelectedForm(value.toString()) }
                                    className="w-full mb-2"
                                />
                            </div>
                        ) }
                    </div>
                </div>
            </div>

            { hovered && (
                <Thumbnail module={ 'splitter' } document_info={ hovered } open={ true }/>
            ) }

            { showMerge && (
                <>
                    <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
                         onClick={ () => setShowMerge(false) }/>
                    <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                    min-w-[32vw] h-3/4 max-h-screen border border-(--border-secondary)
                                    rounded-lg bg-(--bg-primary) flex flex-col">
                        <div className='py-6 flex flex-col gap-4 h-full'>
                            <div className='px-6 flex items-center'>
                                <h2 className='mb-0!'>{ t('SPLITTER.merge_batch') }</h2>
                                <div className='ml-auto cursor-pointer text-(--text-secondary)'
                                     onClick={ () => setShowMerge(false) }>
                                    <X/>
                                </div>
                            </div>
                            <p className='px-6 text-(--text-secondary)'
                               dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(t('SPLITTER.merge_batch_details')) } }/>

                            <div className='px-6 mt-2 h-full overflow-y-auto'>
                                { selectedBatches.map((batch) => (
                                    <div key={ batch.id } onClick={ () => setSelectedPrincipalBatchId(batch.id) }
                                         className={ `w-full cursor-pointer p-4 border border-(--border-secondary) rounded-lg mb-2
                                                      hover:border-(--color-primary) hover:bg-(--bg-selected) transition-colors
                                                      ${ selectedPrincipalBatchId === batch.id && 'bg-(--bg-selected) border-(--color-primary)' }` }>
                                        <div className='flex items-center gap-4'>
                                            <RadioButton
                                                inputId={ batch.id }
                                                value={ selectedPrincipalBatchId }
                                                checked={ selectedPrincipalBatchId === batch.id }
                                                onChange={ () => {
                                                    setSelectedPrincipalBatchId(batch.id);
                                                } }
                                            />
                                            <div className='flex flex-col gap-0.5'>
                                                <div className='font-semibold text-sm'>
                                                    { batch.file_name }
                                                </div>
                                                <div className='text-(--text-secondary) text-sm'>
                                                    { batch.id } | { batch.batch_date }
                                                </div>
                                            </div>
                                            <div className='ml-auto'>
                                                <div
                                                    className='text-(--text-secondary) bg-(--bg-secondary) px-2 py-1 rounded-xl text-sm'>
                                                    <span>{ batch.documents_count } { t('SPLITTER.documents', { count: batch.documents_count }) }</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) }
                            </div>
                            <div className='flex justify-end items-center gap-4 px-6'>
                                <Button variant={ "no_bg" } onClick={ () => setShowMerge(false) }>
                                    { t('GLOBAL.cancel') }
                                </Button>
                                <Button onClick={ handleMerge } disabled={ !selectedPrincipalBatchId }>
                                    { t('GLOBAL.merge') }
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            ) }

            <div className='p-6 h-full w-full flex flex-col flex-1 z-10'>
                <div className='flex items-center gap-6 mb-4'>
                    <Button variant='bg_white_rounded' icon={
                                filtersChanged && !displayFilters ?
                                <Filter fill={ 'var(--color-primary)' } stroke={ 'var(--color-primary)' } size={ 14 }/> :
                                <Filter size={ 14 }/>
                            }
                            onClick={ () => setDisplayFilters(!displayFilters) }>
                        { t('VERIFIER.filters') }
                    </Button>
                    <span className='flex items-center gap-1'>
                        <FileText size={ 16 }/>
                        <span>
                            { t('SPLITTER.batches', { count: totalBatches }) } ({ totalBatches || 0 })
                        </span>
                    </span>
                    <Input id="search" type="text" name="search" className='bg-(--bg-primary) w-80' height='h-10' autoFocus
                           value={ searchTerm } placeholder={ t('GLOBAL.search') } onChange={ (e) => setSearchTerm(e.target.value) }/>
                    <span className='ml-auto text-(--text-secondary) flex cursor-pointer'>
                        <span data-tooltip-id="tooltip" data-tooltip-content={ t('GLOBAL.list') }
                              onClick={ () => setView('list') }
                              className={ `${ view == 'list' ? "bg-(--bg-selected) border-(--border-primary)/50 text-(--color-primary)" : "bg-white border-(--border-secondary)" } flex justify-center items-center size-10 rounded-l-md dark:bg-(--bg-secondary) border` }>
                            <Rows3 size={ 20 }/>
                        </span>
                        <span data-tooltip-id="tooltip" data-tooltip-content={ t('GLOBAL.grid') }
                              onClick={ () => setView('grid') }
                              className={ `${ view == 'grid' ? "bg-(--bg-selected) border-(--border-primary)/50 text-(--color-primary)" : "bg-white border-(--border-secondary)" } flex justify-center items-center size-10 rounded-r-md dark:bg-(--bg-secondary) border` }>
                            <LayoutGrid size={ 20 }/>
                        </span>
                    </span>
                </div>
                { view === 'list' && (
                    <Table
                        baseLink="/splitter/viewer/"
                        data={ batches }
                        actions={ actions }
                        pagination={ true }
                        columns={ columns }
                        lazyParams={ lazyParams }
                        checkboxSelection={ true }
                        loading={ loadingBatches }
                        actionsLine={ getActionsLine }
                        rowsPerPage={ lazyParams.rows }
                        skeletonRows={ lazyParams.rows }
                        selectedRows={ selectedBatches }
                        totalRecords={ totalBatches || 0 }
                        rowsPerPageOptions={ [4, 8, 16, 32] }
                        emptyMessage={ t("SPLITTER.no_batches") }
                        paginatorLeftText={ t('SPLITTER.batch_selected', { count: selectedBatches.length }) }
                        onLazyParamsChange={ setLazyParams }
                        onSelectionChange={ (rows) => setSelectedBatches(rows) }
                    />
                ) }
                { view === 'grid' && (
                    <Grid
                        baseLink="/splitter/viewer/"
                        data={ batches }
                        module="splitter"
                        actions={ actions }
                        pagination={ true }
                        columns={ columns }
                        lazyParams={ lazyParams }
                        loading={ loadingBatches }
                        actionsLine={ getActionsLine }
                        rowsPerPage={ lazyParams.rows }
                        skeletonRows={ lazyParams.rows }
                        selectedRows={ selectedBatches }
                        totalRecords={ totalBatches || 0 }
                        rowsPerPageOptions={ [4, 8, 16, 32] }
                        emptyMessage={ t("VERIFIER.no_documents") }
                        paginatorLeftText={ t('VERIFIER.document_selected', { count: selectedBatches.length }) }
                        onLazyParamsChange={ setLazyParams }
                        onSelectionChange={ (rows) => setSelectedBatches(rows) }
                    />
                ) }
            </div>
        </div>
    )
        ;
}