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
import { Eye, FileText, Filter, Paperclip } from "lucide-react";

import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { DataTable } from "../../components/DataTable";
import { Thumbnail } from "../../components/Thumbnail";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";

export function VerifierListPage() {
    const { get, post } = axiosApiCall();
    const { user, loadingUser } = useUser();

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
    const columns: any = [
        {
            id: 'id',
            header: '',
            field: 'id',
            sortable: true,
            className: 'max-w-14! w-14!'
        },
        {
            id: 'name',
            header: t('VERIFIER.name'),
            className: 'max-w-md! w-md! truncate-data',
            body: (item: any) => <span className="font-semibold">{ item.supplier_name ? item.supplier_name : t('VERIFIER.unkown_supplier') }</span>
        },
        {
            id: 'register_date',
            header: t('VERIFIER.creation_date'),
            sortable: true,
            body: (item: any) => new Date(item.register_date).toLocaleString()
        },
        { id: 'form_label', header: t('VERIFIER.form'), field: 'form_label' },
        {
            id: 'nb_pages',
            header: '',
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
                            <span>{ item.attachments_count}</span>
                            <Paperclip size={ 15 }/>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'thumbnail',
            header: '',
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
                    status: selectedStatus,
                    limit: lazyParams.rows,
                    offset: lazyParams.first,
                    filter: lazyParams.sortField,
                    search: searchTerm || null,
                    order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null,
                    user_id: user.id
                }) || [];
                console.log("Documents récupérés :", res);
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

    return (
        <div>
            { hovered && (
                <Thumbnail document_info={ hovered } open={ true }/>
            ) }

            <div className='flex items-center gap-6'>
                <Button icon={ <Filter size={ 14 }/> }
                        className='rounded-3xl! bg-white dark:bg-(--bg-secondary) text-(--text-primary)! border-(--border-secondary)!'>
                    { t('VERIFIER.filters') }
                </Button>
                <span className='flex items-center gap-0'>
                    <FileText size={ 16 }/>
                    <span className='ml-1'>
                        { t('VERIFIER.documents', { count: totalDocuments! }) } ({ totalDocuments || 0 })
                    </span>
                </span>
                <span>
                    <Input id="search" type="text" name="search" className='bg-white'
                           value={ searchTerm } onChange={ (e) => setSearchTerm(e.target.value) }
                           placeholder={ t('VERIFIER.search') }/>
                </span>
            </div>

            <div className="mt-4 rounded-xl">
                <DataTable
                    baseLink="/verifier/document/"
                    data={ documents }
                    totalRecords={ totalDocuments || 0 }
                    pagination={ true }
                    columns={ columns }
                    rowsPerPage={ lazyParams.rows }
                    rowsPerPageOptions={ [4, 8, 16, 32] }
                    skeletonRows={ lazyParams.rows }
                    checkboxSelection={ true }
                    loading={ loadingDocuments }
                    paginatorLeftText={ t('VERIFIER.document_selected', { count: selectedDocuments.length }) }
                    emptyMessage={ t("VERIFIER.no_documents") }
                    lazyParams={ lazyParams }
                    onLazyParamsChange={ setLazyParams }
                    onSelectionChange={ (rows) => setSelectedDocuments(rows) }
                />
            </div>
        </div>
    );
}