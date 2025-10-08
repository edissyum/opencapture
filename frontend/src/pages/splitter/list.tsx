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
import { CircleQuestionMark, Eye, FileText, LayoutGrid, Paperclip, Rows3, Trash2 } from "lucide-react";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";

import { Input } from "../../components/Input";
import { Grid } from "../../components/list/Grid";
import { Table } from "../../components/list/Table";
import { Thumbnail } from "../../components/Thumbnail";

export function SplitterListPage() {
    const { user, loadingUser } = useUser();
    const { get, post, put } = axiosApiCall();

    const [view, setView] = useState<'list' | 'grid'>('list');
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

    const [totalPerTime, setTotalPerTime] = useState<any>(null);
    const [selectedStatus, setSelectedStatus] = useState('NEW');

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

    const menuModel: any = [
        {
            label: t('SPLITTER.delete_batch'),
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
    ]

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
            className: 'max-w-16! w-16!',
            body: (item: any) => (
                <div className='flex gap-1'>
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

    useEffect(() => {
        async function retrieveTotalBatches() {
            if (!user || loadingUser) return;

            const res = await get(`/splitter/batches/user/${ user.id }/totals/${ selectedStatus }`, {}) || 0;
            if (res && res.totals) {
                let totals = 0;
                setTotalPerTime(res.totals);
                for (const key in res.totals) {
                    if (Object.prototype.hasOwnProperty.call(res.totals, key)) {
                        totals += res.totals[key];
                    }
                }
                setTotalBatches(totals);
                return;
            }
        }

        if (!totalBatches) {
            retrieveTotalBatches().then();
        }
    }, [user, loadingUser]);

    useEffect(() => {
        async function retrieveBatches() {
            if (!user || loadingUser) return;
            setLoadingBatches(true);

            try {
                const res = await post('/splitter/batches/list', {
                    user_id: user.id,
                    status: selectedStatus,
                    limit: lazyParams.rows,
                    offset: lazyParams.first,
                    search: searchTerm || null,
                    filter: lazyParams.sortField,
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
    }, [user, lazyParams, searchTerm]);

    const handleDelete = async () => {
        if (selectedBatches.length === 0) return;

        showConfirmDialog({
            icon: <CircleQuestionMark/>,
            title: t('SPLITTER.delete_batch'),
            message: t('SPLITTER.confirm_delete_batch', { count: selectedBatches.length }),
            confirmText: t('GLOBAL.yes'),
            cancelText: t('GLOBAL.no'),
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

    return (
        <div>
            { hovered && (
                <Thumbnail module={ 'splitter' } document_info={ hovered } open={ true }/>
            ) }

            <div className='flex items-center gap-6'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    <span>
                        { t('SPLITTER.batches', { count: totalBatches! }) } ({ totalBatches || 0 })
                    </span>
                </span>
                <span>
                    <Input id="search" type="text" name="search" className='bg-white dark:bg-(--bg-secondary) w-80'
                           value={ searchTerm } placeholder={ t('SPLITTER.search') }
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
                        baseLink="/splitter/viewer/"
                        data={ batches }
                        actions={ actions }
                        pagination={ true }
                        columns={ columns }
                        menuModel={ menuModel }
                        lazyParams={ lazyParams }
                        checkboxSelection={ true }
                        loading={ loadingBatches }
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
                        menuModel={ menuModel }
                        lazyParams={ lazyParams }
                        loading={ loadingBatches }
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