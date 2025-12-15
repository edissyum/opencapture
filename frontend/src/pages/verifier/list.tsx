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
    Building2,
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
    Trash2,
    UsersRound
} from "lucide-react";
import { RadioButton } from "primereact/radiobutton";

import Input from "../../components/Input";
import { Button } from "../../components/Button";
import { Grid } from "../../components/list/Grid";
import { Table } from "../../components/list/Table";
import { Dropdown } from "../../components/Dropdown";
import { Thumbnail } from "../../components/Thumbnail";
import { showToast } from "../../components/ToastProvider";
import MultiSelectInput from "../../components/MultiSelect";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";

export function VerifierListPage() {
    const { user, loadingUser } = useUser();
    const { get, post, del, put } = axiosApiCall();

    const [view, setView] = useState<'list' | 'grid'>('list');
    const [displayFilters, setDisplayFilters] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('selectedView') === 'grid') {
            setView('grid');
        }
    }, [view]);

    const [locale, setLocale] = useState('fr-FR');
    useEffect(() => {
        const storageLocale = localStorage.getItem('selectedLang');
        if (storageLocale === 'fra') {
            setLocale('fr-FR');
        } else if (storageLocale === 'eng') {
            setLocale('en-US');
        } else if (storageLocale === 'spa') {
            setLocale('es-ES');
        }
    }, [locale]);

    const handleChangeView = (newView: 'list' | 'grid') => {
        setView(newView);
        localStorage.setItem('selectedView', newView);
    }

    const [open, setOpen] = useState({
        forms: true,
        status: true,
        batches: true,
        customers: true,
        suppliers: true
    });

    const [listTimes, setListTimes] = useState([
        { 'id': 'today', 'label': t('GLOBAL.today'), 'totals': 0 },
        { 'id': 'yesterday', 'label': t('GLOBAL.yesterday'), 'totals': 0 },
        { 'id': 'older', 'label': t('GLOBAL.older'), 'totals': 0 }
    ]);

    const [listForms, setListForms] = useState<any>([]);
    const [listStatuses, setListStatuses] = useState<any>([]);
    const [listCustomers, setListCustomers] = useState<any>([]);
    const [listSuppliers, setListSuppliers] = useState<any>([]);

    const [selectedCustomers, setSelectedCustomers] = useState<any>(null);
    const [selectedSuppliers, setSelectedSuppliers] = useState<any>([]);
    const [selectedStatus, setSelectedStatus] = useState('NEW');
    const [selectedForm, setSelectedForm] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const [documents, setDocuments] = useState<any[]>([]);
    const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [totalDocuments, setTotalDocuments] = useState<number | null>(null);

    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 16,
        page: 0,
        sortField: null as string | null,
        sortOrder: null as 1 | -1 | null,
    });

    const [hovered, setHovered] = useState<string | null>(null);

    const getActionsLine = (row: any) => [
        {
            label: <span className='critical'>{ t('VERIFIER.delete_document') }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        },
        {
            label: t('VERIFIER.associated_form'),
            icon: <LayoutTemplate className='mr-1' size={ 16 }/>,
            items: Array.isArray(listForms)
                ? listForms.map((form: any) => ({
                    label: (
                        <span
                            className={ row?.form_id === form.id ? "text-(--color-primary) font-semibold" : "" }
                        >
                        { form.label }
                    </span>
                    ),
                    command: () => handleChangeForm(form.id)
                }))
                : []
        },
        {
            label: t('VERIFIER.associated_customer'),
            icon: <UsersRound className='mr-1' size={ 16 }/>,
            items: Array.isArray(listCustomers)
                ? listCustomers.map((customer: any) => ({
                    label: (
                        <span
                            className={ row?.customer_id === customer.id ? "text-(--color-primary) font-semibold" : "" }
                        >
                        { customer.name }
                    </span>
                    ),
                    command: () => handleChangeCustomer(customer.id)
                }))
                : []
        }
    ];

    const actions: any = [
        {
            label: t('VERIFIER.delete_documents'),
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ]

    const columns: any = [
        {
            id: 'id',
            header: view == 'grid' ? t('VERIFIER.id') : '',
            field: 'id',
            sortable: true,
            className: 'max-w-14! w-14!'
        },
        {
            id: 'name',
            header: t('VERIFIER.name'),
            className: 'max-w-md! w-md! truncate-data',
            body: (item: any) => (
                <span className="font-semibold" title={ item.supplier_name }>
                    { item.supplier_name ? item.supplier_name : t('VERIFIER.unkown_supplier') }
                </span>
            )
        },
        {
            id: 'register_date',
            header: t('VERIFIER.creation_date'),
            sortable: true,
            body: (item: any) => (
                new Intl.DateTimeFormat(locale, {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }).format(new Date(item.register_date)).replace(' ', ' ' + t('GLOBAL.at') + ' ').replace(',', '').replaceAll('/', '-')
            )
        },
        { id: 'form_label', header: t('VERIFIER.form'), field: 'form_label' },
        {
            id: 'filename',
            header: t('VERIFIER.filename'),
            className: 'max-w-md! w-md! truncate-data',
            body: (item: any) => (
                <span title={ item.original_filename }>
                    { item.original_filename }
                </span>
            )
        },
        {
            id: 'nb_pages',
            header: '',
            className: 'max-w-16! w-16! p-2!',
            body: (item: any) => (
                <div className='flex gap-1 justify-end'>
                    <div className='flex justify-center items-center text-(--color-primary) gap-0.5'
                         data-tooltip-id="tooltip" data-tooltip-content={ t('VERIFIER.nb_pages') }>
                        <span>{ item.nb_pages }</span>
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
            className: 'max-w-14! w-14!',
            body: (item: any) => (
                <div onMouseEnter={ () => setHovered(item) } onMouseLeave={ () => setHovered(null) }>
                    <Eye></Eye>
                </div>
            )
        }
    ];

    // Fetch form list
    useEffect(() => {
        if (!user || loadingUser) return;

        const fetchForms = async () => {
            const res = await get(`/forms/verifier/list`) || [];
            setListForms(res.forms || []);
        }
        fetchForms().then();
    }, [user, loadingUser]);

    // Fetch customer and third parties list
    useEffect(() => {
        if (listForms.length === 0) return;

        const fetchCustomers = async () => {
            const res = await get(`/accounts/customers/list/verifier/${ user.id }`);
            let customers = [{ id: 0, name: t('ACCOUNTS.no_customer_associated') }];
            customers = customers.concat(res.customers || []);
            setListCustomers(customers);
        }
        const fetchSuppliers = async () => {
            const res = await get(`/accounts/suppliers/list`);
            setListSuppliers(res.suppliers || []);
        }

        fetchSuppliers().then();
        fetchCustomers().then();
    }, [listForms]);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Fetch documents
    useEffect(() => {
        if (loadingDocuments) return;

        async function retrieveDocuments() {
            if (!user || loadingUser) return;
            setLoadingDocuments(true);

            try {
                const res = await post('/verifier/documents/list', {
                    user_id: user.id,
                    time: selectedTime,
                    form_id: selectedForm,
                    status: selectedStatus,
                    limit: lazyParams.rows,
                    offset: lazyParams.first,
                    filter: lazyParams.sortField,
                    search: debouncedSearchTerm || null,
                    allowedCustomers: selectedCustomers ? selectedCustomers : null,
                    allowedSuppliers: selectedSuppliers.length > 0 ? selectedSuppliers : null,
                    order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                }) || [];
                setTotalDocuments(res.total);
                setDocuments(res.documents);
            } catch (err) {
                console.error("Erreur récupération documents :", err);
                setDocuments([]);
            } finally {
                setLoadingDocuments(false);
            }
        }

        retrieveDocuments().then();
    }, [listForms, lazyParams, debouncedSearchTerm, selectedStatus, selectedTime, selectedForm,
        selectedCustomers, selectedSuppliers]);

    // Fetch totals per filters
    useEffect(() => {
        async function retrieveTotals() {
            if (!user || loadingUser || loadingDocuments) return;

            try {
                const res = await post('/verifier/documents/filters/totals', {
                    user_id: user.id,
                    time: selectedTime,
                    form_id: selectedForm,
                    status: selectedStatus,
                    search: debouncedSearchTerm || null,
                    allowedCustomers: selectedCustomers ? selectedCustomers : null,
                    allowedSuppliers: selectedSuppliers.length > 0 ? selectedSuppliers : null,
                }) || {};
                setListTimes((prevTimes) => prevTimes.map((time) => ({
                    ...time,
                    totals: res.totals.times[time.id] || 0
                })));
                setListStatuses(res.totals.status || []);
            } catch (err) {
                console.error("Error retrieving filters counts  :", err);
                setTotalDocuments(0);
            }
        }

        retrieveTotals().then();
    }, [loadingDocuments]);

    const handleChangeForm = async (formId: string) => {
        if (selectedDocuments.length === 0) return;
        if (selectedDocuments.length > 1) {
            showToast(t('VERIFIER.select_single_document_form'), 'error');
        }
        if (selectedDocuments[0].form_id === formId) {
            return;
        }

        setLoadingDocuments(true);
        try {
            await put(`verifier/documents/${ selectedDocuments[0].id }/update`, { "form_id": formId });
            showToast(t('VERIFIER.document_form_changed_success'), 'success');
        } catch (err) {
            console.error("Error changing document form:", err);
        } finally {
            setSelectedDocuments([]);
            setTotalDocuments(null);
            setLazyParams({ ...lazyParams, first: 0 });
        }

    }

    const handleChangeCustomer = async (customerId: string) => {
        if (selectedDocuments.length === 0) return;
        if (selectedDocuments.length > 1) {
            showToast(t('VERIFIER.select_single_document_customer'), 'error');
        }
        if (selectedDocuments[0].customer_id === customerId) {
            return;
        }

        setLoadingDocuments(true);
    }

    const handleDelete = async () => {
        if (selectedDocuments.length === 0) return;

        showConfirmDialog({
            icon: <CircleQuestionMark/>,
            title: t('VERIFIER.delete_document'),
            message: t('VERIFIER.confirm_delete_document', { count: selectedDocuments.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await deleteDocuments(selectedDocuments.map(doc => doc.id));
                setSelectedDocuments([]);
                setTotalDocuments(null);
                setLazyParams({ ...lazyParams, first: 0 });
            },
            onCancel: () => {
                setSelectedDocuments([]);
            }
        })
    }

    const deleteDocuments = async (ids: string[]) => {
        ids.forEach((id) => {
            try {
                del(`/verifier/documents/delete/${ id }`, {});
            } catch (err) {
                console.error("Erreur suppression document :", err);
            }
        });
    }

    const handleResetFilters = () => {
        setSelectedTime(null);
        setSelectedForm(null);
        setSelectedStatus('NEW');
        setSelectedCustomers(null);
        setSelectedSuppliers([]);
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
                                    className="w-full mb-2"
                                    label={ t('VERIFIER.search_form') }
                                    options={ listForms.map((form: any) => ({ label: form.label, value: form.id })) }
                                    onChange={ (e) => setSelectedForm(e.value) }
                                />
                            </div>
                        ) }
                    </div>
                    <div className='flex flex-col'>
                        <div className="flex items-center justify-between cursor-pointer mb-2"
                             onClick={ () => setOpen({ ...open, suppliers: !open.suppliers }) }>
                            <div className="flex items-center gap-2">
                                <Building2 className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold'>{ t('ACCOUNTS.suppliers_list') }</h3>
                            </div>
                            <ChevronDown size={ 18 }
                                         className={ `transition-transform ${ open.suppliers ? "rotate-180" : "" }` }/>
                        </div>

                        { open.suppliers && (
                            <div className='mt-2'>
                                <MultiSelectInput
                                    optionValue="id"
                                    optionLabel="name"
                                    id="suppliers_select"
                                    options={ listSuppliers }
                                    filterBy="name,lastname,firstname"
                                    value={ selectedSuppliers.map(Number) ?? [] }
                                    label={ t('ACCOUNTS.search_suppliers') }
                                    itemTemplate={ (option) => (
                                        <span className='flex items-center gap-0.5'>
                                            { option.name }
                                            <span className='text-(--color-primary)'>
                                                { option.lastname && !option.firstname && (
                                                    <span>({ option.lastname })</span>
                                                ) }

                                                { option.lastname && option.firstname && (
                                                    <span>({ option.lastname } { option.firstname })</span>
                                                ) }
                                            </span>
                                        </span>
                                    ) }
                                    onChange={ (e) => {
                                        setSelectedSuppliers(e.value);
                                    } }
                                />
                            </div>
                        ) }
                    </div>
                </div>
            </div>

            { hovered && (
                <Thumbnail module={ 'verifier' } document_info={ hovered } open={ true }/>
            ) }

            <div className='p-8 h-full w-full flex flex-col flex-1 z-10'>
                <div className='flex items-center gap-6'>
                    <Button icon={ <Filter size={ 14 }/> } onClick={ () => setDisplayFilters(!displayFilters) }
                            className={ `rounded-3xl hover:text-(--color-primary) text-(--text-primary)
                                            border-(--border-secondary) p-2.5! bg-(--bg-primary)
                                            ${ displayFilters ? 'bg-(--color-primary) text-white hover:text-white' : 'bg-(--bg-primary) text-(--text-primary)' }` }>
                        { t('VERIFIER.filters') }
                    </Button>
                    <span className='flex items-center gap-1'>
                        <FileText size={ 16 }/>
                        <span>
                            { t('VERIFIER.documents', { count: totalDocuments! }) } ({ totalDocuments || 0 })
                        </span>
                    </span>
                    <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height='h-10'
                           value={ searchTerm } placeholder={ t('VERIFIER.search') } noMarginBottom={ true }
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

                <div className="mt-4 flex-1 overflow-hidden flex flex-col rounded-lg">
                    { view === 'list' && (
                        <Table
                            baseLink="/verifier/viewer/"
                            data={ documents }
                            pagination={ true }
                            columns={ columns }
                            actions={ actions }
                            lazyParams={ lazyParams }
                            checkboxSelection={ true }
                            actionsLine={ getActionsLine }
                            loading={ loadingDocuments }
                            rowsPerPage={ lazyParams.rows }
                            skeletonRows={ lazyParams.rows }
                            selectedRows={ selectedDocuments }
                            totalRecords={ totalDocuments || 0 }
                            rowsPerPageOptions={ [4, 8, 16, 32] }
                            emptyMessage={ t("VERIFIER.no_documents") }
                            paginatorLeftText={ t('VERIFIER.document_selected', { count: selectedDocuments.length }) }
                            onLazyParamsChange={ setLazyParams }
                            onSelectionChange={ (rows) => setSelectedDocuments(rows) }
                        />
                    ) }
                    { view === 'grid' && (
                        <Grid
                            baseLink="/verifier/viewer/"
                            module="verifier"
                            data={ documents }
                            pagination={ true }
                            columns={ columns }
                            actions={ actions }
                            lazyParams={ lazyParams }
                            loading={ loadingDocuments }
                            actionsLine={ getActionsLine }
                            rowsPerPage={ lazyParams.rows }
                            skeletonRows={ lazyParams.rows }
                            selectedRows={ selectedDocuments }
                            totalRecords={ totalDocuments || 0 }
                            rowsPerPageOptions={ [4, 8, 16, 32] }
                            emptyMessage={ t("VERIFIER.no_documents") }
                            paginatorLeftText={ t('VERIFIER.document_selected', { count: selectedDocuments.length }) }
                            onLazyParamsChange={ setLazyParams }
                            onSelectionChange={ (rows) => setSelectedDocuments(rows) }
                        />
                    ) }
                </div>
            </div>
        </div>
    );
}