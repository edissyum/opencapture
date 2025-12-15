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
    CircleQuestionMark,
    Eye,
    FileText,
    Filter,
    LayoutGrid,
    LayoutTemplate,
    Package,
    Paperclip,
    Rows3,
    Trash2
} from "lucide-react";
import { RadioButton } from "primereact/radiobutton";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";

import Input from "../../components/Input";
import { Button } from "../../components/Button";
import { Grid } from "../../components/list/Grid";
import { Table } from "../../components/list/Table";
import { Dropdown } from "../../components/Dropdown";
import { Thumbnail } from "../../components/Thumbnail";
import MultiSelectInput from "../../components/MultiSelect";

export function SplitterListPage() {
    const { user, loadingUser } = useUser();
    const { get, post, put } = axiosApiCall();

    const [view, setView] = useState<'list' | 'grid'>('list');
    const [displayFilters, setDisplayFilters] = useState(false);
    const [listTimes, setListTimes] = useState([
        { 'id': 'today', 'label': t('GLOBAL.today'), 'totals': 0 },
        { 'id': 'yesterday', 'label': t('GLOBAL.yesterday'), 'totals': 0 },
        { 'id': 'older', 'label': t('GLOBAL.older'), 'totals': 0 }
    ]);
    const [open, setOpen] = useState({
        forms: true,
        status: true,
        batches: true,
        customers: true
    });

    const [listForms, setListForms] = useState<any>([]);
    const [listStatuses, setListStatuses] = useState<any>([]);
    const [listCustomers, setListCustomers] = useState<any>([]);

    const [selectedCustomers, setSelectedCustomers] = useState<any>(null);
    const [selectedForm, setSelectedForm] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    useEffect(() => {
        localStorage.getItem('selectedView');
        if (localStorage.getItem('selectedView') === 'grid') {
            setView('grid');
        }
    }, [view]);

    const handleChangeView = (newView: 'list' | 'grid') => {
        setView(newView);
        localStorage.setItem('selectedView', newView);
    }

    const [selectedStatus, setSelectedStatus] = useState('NEW');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [batches, setBatches] = useState<any[]>([]);
    const [selectedBatches, setSelectedBatches] = useState<any[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const [totalBatches, setTotalBatches] = useState<number | null>(null);

    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 16,
        page: 0,
        sortField: null as string | null,
        sortOrder: null as 1 | -1 | null,
    });
    const [hovered, setHovered] = useState<string | null>(null);

    const getActionsLine = () => [
        {
            label: <span className='critical'>{ t('SPLITTER.delete_batch') } </span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const actions: any = [
        {
            label: t('SPLITTER.delete_batches'),
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
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
            className: 'max-w-md! w-md! truncate-data',
            body: (item: any) => (
                <span className="font-semibold" title={ item['subject'] ? item['subject'] : item['file_name'] }>
                    { item['subject'] ? item['subject'] : item['file_name'] }
                </span>
            )
        },
        {
            id: 'register_date',
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
            className: 'max-w-14! w-14! ml-0.5',
            body: (item: any) => (
                <div onMouseEnter={ () => setHovered(item) } onMouseLeave={ () => setHovered(null) }>
                    <Eye></Eye>
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
        if (loadingBatches) return;

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
            icon: <CircleQuestionMark/>,
            title: t('SPLITTER.delete_batch'),
            message: t('SPLITTER.confirm_delete_batch', { count: selectedBatches.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await deleteDocuments(selectedBatches.map(doc => doc.id));
                setSelectedBatches([]);
                setTotalBatches(null);
                setLazyParams({ ...lazyParams, first: 0 });
            },
            onCancel: () => {
                setSelectedBatches([]);
            }
        })
    }

    const deleteDocuments = async (ids: string[]) => {
        try {
            await put(`/splitter/deleteBatches`, { ids: ids });
        } catch (err) {
            console.error("Erreur suppression des lots :", err);
        }
    }

    const handleResetFilters = () => {
        setSelectedTime(null);
        setSelectedForm(null);
        setSelectedStatus('NEW');
    }

    return (
        <div className='flex h-full w-full overflow-hidden'>
            <div className={ `h-full transition-all duration-200 border-r-2 border-(--border-secondary) 
                            ${ displayFilters ? "w-[400px] opacity-100" : "w-0 opacity-0 z-0" } bg-(--bg-primary)` }>
                <div className='border-b-2 border-(--border-secondary) p-4 flex items-center justify-between'>
                    <h1 className='text-2xl font-bold'>{ t('VERIFIER.filters') }</h1>
                    <span className='cursor-pointer text-(--text-secondary) hover:text-(--color-primary)'
                          onClick={ handleResetFilters }>
                        { t('VERIFIER.erase_filters') }
                    </span>
                </div>
                <div className='p-4 flex flex-col gap-6 h-full overflow-y-auto'>
                    <div>
                        <div className="flex items-center justify-between cursor-pointer mb-2"
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
                            <div className='flex flex-col'>
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
                                        <label htmlFor={ time.id } key={ time.id } className={ `cursor-pointer` }>
                                            { time.label } ({ time.totals || 0 })
                                        </label>
                                    </div>
                                )) }
                            </div>
                        ) }
                    </div>
                    <div className='flex flex-col'>
                        <div className="flex items-center justify-between cursor-pointer mb-2"
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
                            <div className='flex flex-col'>
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
                                        <label htmlFor={ key } key={ key } className={ `cursor-pointer` }>
                                            { listStatuses[key]?.label } ({ listStatuses[key]?.total || 0 })
                                        </label>
                                    </div>
                                )) }
                            </div>
                        ) }
                    </div>
                    <div className='flex flex-col'>
                        <div className="flex items-center justify-between cursor-pointer mb-2"
                             onClick={ () => setOpen({ ...open, customers: !open.customers }) }>
                            <div className="flex items-center gap-2">
                                <Briefcase className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold'>{ t('ACCOUNTS.customers_list') }</h3>
                            </div>
                            <ChevronDown size={ 18 }
                                         className={ `transition-transform ${ open.customers ? "rotate-180" : "" }` }/>
                        </div>

                        { open.customers && (
                            <div className='mt-2'>
                                <MultiSelectInput
                                    optionValue="id"
                                    optionLabel="name"
                                    id="customers_select"
                                    options={ listCustomers }
                                    value={ selectedCustomers?.map(Number) ?? [] }
                                    label={ t('ACCOUNTS.search_customers') }
                                    onChange={ (e) => {
                                        setSelectedCustomers(e.value);
                                    } }
                                />
                            </div>
                        ) }
                    </div>
                    <div className='flex flex-col'>
                        <div className="flex items-center justify-between cursor-pointer mb-2"
                             onClick={ () => setOpen({ ...open, forms: !open.forms }) }>
                            <div className="flex items-center gap-2">
                                <LayoutTemplate className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold'>{ t('GLOBAL.forms') }</h3>
                            </div>
                            <ChevronDown
                                size={ 18 }
                                className={ `transition-transform ${ open.forms ? "rotate-180" : "" }` }/>
                        </div>

                        { open.forms && (
                            <div className='mt-2'>
                                <Dropdown
                                    filter={ true }
                                    id="folder_destination"
                                    value={ selectedForm }
                                    label={ t('VERIFIER.search_form') }
                                    options={ listForms.map((form: any) => ({ label: form.label, value: form.id })) }
                                    onChange={ (e) => setSelectedForm(e.value) }
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

            <div className='p-8 h-full w-full flex flex-col flex-1 z-10'>
                <div className='flex items-center gap-6 mb-4'>
                    <Button icon={ <Filter size={ 14 }/> } onClick={ () => setDisplayFilters(!displayFilters) }
                            className={ `rounded-3xl hover:text-(--color-primary) text-(--text-primary)
                            border-(--border-secondary) p-2.5! bg-(--bg-primary) 
                            ${ displayFilters ? 'bg-(--color-primary) text-white hover:text-white' : 'bg-(--bg-primary) text-(--text-primary)' }` }>
                        { t('VERIFIER.filters') }
                    </Button>
                    <span className='flex items-center gap-1'>
                        <FileText size={ 16 }/>
                        <span>
                            { t('SPLITTER.batches', { count: totalBatches! }) } ({ totalBatches || 0 })
                        </span>
                    </span>
                    <Input id="search" type="text" name="search" className='bg-(--bg-primary) w-80' height='h-10'
                           value={ searchTerm } placeholder={ t('SPLITTER.search') } noMarginBottom={ true }
                           onChange={ (e) => setSearchTerm(e.target.value) }/>
                    <span className='ml-auto text-(--text-secondary) flex cursor-pointer'>
                        <span data-tooltip-id="tooltip" data-tooltip-content={ t('GLOBAL.list') }
                              onClick={ () => handleChangeView('list') }
                              className={ `${ view == 'list' ? "bg-(--color-primary)/20 border-(--border-primary)/50" : "bg-white border-(--border-secondary)" } flex justify-center items-center size-10 rounded-l-md dark:bg-(--bg-secondary) border` }>
                            <Rows3 size={ 20 }/>
                        </span>
                        <span data-tooltip-id="tooltip" data-tooltip-content={ t('GLOBAL.grid') }
                              onClick={ () => handleChangeView('grid') }
                              className={ `${ view == 'grid' ? "bg-(--color-primary)/20 border-(--border-primary)/50" : "bg-white border-(--border-secondary)" } flex justify-center items-center size-10 rounded-r-md dark:bg-(--bg-secondary) border` }>
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
    );
}