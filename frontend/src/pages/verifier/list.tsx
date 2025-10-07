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
import { CircleQuestionMark, Eye, FileText, Filter, LayoutGrid, Paperclip, Rows3, Trash2 } from "lucide-react";

import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Grid } from "../../components/list/Grid";
import { Table } from "../../components/list/Table";
import { Thumbnail } from "../../components/Thumbnail";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";

export function VerifierListPage() {
    const { user, loadingUser } = useUser();
    const { get, post, del } = axiosApiCall();

    const [view, setView] = useState<'list' | 'grid'>('list');
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

    const [totalPerTime, setTotalPerTime] = useState<any>(null);
    const [selectedStatus, setSelectedStatus] = useState('NEW');

    const [searchTerm, setSearchTerm] = useState('');
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
            label: t('VERIFIER.delete_document'),
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const actions: any = [
        {
            label: t('VERIFIER.delete_documents'),
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            onClick: () => handleDelete()
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
                }).format(new Date(item.register_date)).replace(' ', ' ' + t('GLOBAL.at') + ' ').replace(',', '')
                .replaceAll('/', '-')
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

    useEffect(() => {
        async function retrieveTotalDocuments() {
            if (!user || loadingUser) return;

            const res = await get(`/verifier/documents/totals/${ selectedStatus }/${ user.id }`, {}) || 0;
            if (res && res.totals) {
                let totals = 0;
                setTotalPerTime(res.totals);
                for (const key in res.totals) {
                    if (Object.prototype.hasOwnProperty.call(res.totals, key)) {
                        totals += res.totals[key];
                    }
                }
                setTotalDocuments(totals);
                return;
            }
        }

        if (!totalDocuments) {
            retrieveTotalDocuments().then();
        }
    }, [user, loadingUser, selectedStatus]);

    useEffect(() => {
        async function retrieveDocuments() {
            if (!user || loadingUser) return;
            setLoadingDocuments(true);

            try {
                const res = await post('/verifier/documents/list', {
                    user_id: user.id,
                    status: selectedStatus,
                    limit: lazyParams.rows,
                    offset: lazyParams.first,
                    search: searchTerm || null,
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
    }, [user, lazyParams, searchTerm]);

    const handleDelete = async () => {
        if (selectedDocuments.length === 0) return;

        showConfirmDialog({
            icon: <CircleQuestionMark/>,
            title: t('VERIFIER.delete_document'),
            message: t('VERIFIER.confirm_delete_document', { count: selectedDocuments.length }),
            confirmText: t('GLOBAL.yes'),
            cancelText: t('GLOBAL.no'),
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

    return (
        <div>
            { hovered && (
                <Thumbnail module={ 'verifier' } document_info={ hovered } open={ true }/>
            ) }

            <div className='flex items-center gap-6'>
                <Button icon={ <Filter size={ 14 }/> }
                        className='rounded-3xl bg-white dark:bg-(--bg-secondary) text-(--text-primary) hover:text-(--color-primary) border-(--border-secondary)'>
                    { t('VERIFIER.filters') }
                </Button>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    <span>
                        { t('VERIFIER.documents', { count: totalDocuments! }) } ({ totalDocuments || 0 })
                    </span>
                </span>
                <span>
                    <Input id="search" type="text" name="search" className='bg-white dark:bg-(--bg-secondary)'
                           value={ searchTerm } placeholder={ t('VERIFIER.search') }
                           onChange={ (e) => setSearchTerm(e.target.value) }/>
                </span>
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

            <div className="mt-4 rounded-xl">
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
    );
}