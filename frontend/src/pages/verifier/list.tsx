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

import Input from "../../components/Input";
import { Button } from "../../components/Button";
import { Grid } from "../../components/list/Grid";
import { Table } from "../../components/list/Table";
import { Thumbnail } from "../../components/Thumbnail";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";
import { Checkbox } from "../../components/Checkbox.tsx";

export function VerifierListPage() {
    const { user, loadingUser } = useUser();
    const { get, post, del } = axiosApiCall();

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

    const handleDisplayFilters = () => {
        setDisplayFilters(!displayFilters);
    }

    const listTimes = {
        'today': t('GLOBAL.today'),
        'yesterday': t('GLOBAL.yesterday'),
        'older': t('GLOBAL.older')
    }
    const [listForms, setListForms] = useState<any>([]);
    const [listStatuses, setListStatuses] = useState<any>([]);

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

    const menuModel: any = [
        {
            label: <span className='critical'>{ t('VERIFIER.delete_document') } </span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
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
            className: 'max-w-16! w-16!',
            body: (item: any) => (
                <div className='flex gap-1'>
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

    // Fetch status list
    useEffect(() => {
        if (listForms.length === 0) return;

        const fetchStatuses = async () => {
            const res = await get(`/status/verifier/list`) || [];
            setListStatuses(res.status || []);
        }
        fetchStatuses().then();
    }, [listForms]);

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
                    search: debouncedSearchTerm || null,
                    filter: lazyParams.sortField,
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
    }, [listStatuses, lazyParams, debouncedSearchTerm, selectedStatus, selectedTime, selectedForm]);

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

    const [open, setOpen] = useState({
        batches: true,
        status: true,
        forms: false,
    });

    return (
        <div className='flex h-full w-full overflow-hidden'>
            <div
                className={ `h-full transition-all duration-200 
                            ${ displayFilters ? "w-[250px] opacity-100" : "w-0 opacity-0" }
                            border-r-2 border-(--border-secondary) bg-(--bg-primary)` }>
                <div className='border-b-2 border-(--border-secondary) p-4'>
                    <h1 className='text-2xl font-bold'>{ t('VERIFIER.filters') }</h1>
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
                                { Object.keys(listTimes).map((key) => (
                                    <Checkbox
                                        size={ 4 }
                                        key={ key }
                                        label={ listTimes[key as keyof typeof listTimes] }
                                        checked={ selectedTime === key }
                                        onChange={ () => {
                                            setSelectedTime(key);
                                        } }
                                    />
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
                                    <Checkbox
                                        size={ 4 }
                                        key={ key }
                                        label={ listStatuses[key]?.label }
                                        checked={ selectedStatus === listStatuses[key]?.id }
                                        onChange={ () => {
                                            setSelectedStatus(listStatuses[key]?.id);
                                        } }
                                    />
                                )) }
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
                            <div className='flex flex-col'>
                                { Object.keys(listForms).map((key: any) => (
                                    <Checkbox
                                        size={ 4 }
                                        key={ key }
                                        label={ listForms[key]?.label }
                                        checked={ selectedForm === listForms[key]?.id }
                                        onChange={ () => {
                                            setSelectedForm(listForms[key]?.id);
                                        } }
                                    />
                                )) }
                            </div>
                        ) }
                    </div>
                </div>
            </div>

            { hovered && (
                <Thumbnail module={ 'verifier' } document_info={ hovered } open={ true }/>
            ) }

            <div className='p-8 h-full w-full flex flex-col flex-1'>
                <div className='flex items-center gap-6'>
                    <Button icon={ <Filter size={ 14 }/> } onClick={ handleDisplayFilters }
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
                           value={ searchTerm } placeholder={ t('VERIFIER.search') } no_margin_bottom={ true }
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

                <div className="mt-4 flex flex-col overflow-y-auto">
                    { view === 'list' && (
                        <Table
                            baseLink="/verifier/viewer/"
                            data={ documents }
                            actions={ actions }
                            pagination={ true }
                            columns={ columns }
                            menuModel={ menuModel }
                            lazyParams={ lazyParams }
                            checkboxSelection={ true }
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
                            actions={ actions }
                            pagination={ true }
                            columns={ columns }
                            menuModel={ menuModel }
                            lazyParams={ lazyParams }
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
                </div>
            </div>
        </div>
    );
}