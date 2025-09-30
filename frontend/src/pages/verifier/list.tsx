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
import { Eye, FileText } from "lucide-react";

import { DataTable } from "../../components/DataTable";

import { b64ToFile } from "../settings/general/customization";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { Thumbnail } from "../../components/Thumbnail.tsx";

export function VerifierListPage() {
    const { get, post } = axiosApiCall();
    const { user, loadingUser } = useUser();
    const [hovered, setHovered] = useState<string | null>(null);

    const columns: any = [
        { header: '', field: 'id', sortable: true },
        {
            header: t('VERIFIER.name'),
            body: (item: any) => <span className="font-semibold">{ item.supplier_name }</span>,
        },
        { header: t('VERIFIER.creation_date'), body: (item: any) => new Date(item.register_date).toLocaleString() },
        { header: t('VERIFIER.form'), field: 'form_label', sortable: true },
        {
            header: '',
            body: (item: any) => (
                <div className='flex justify-center items-center text-(--color-primary) gap-0.5'
                     data-tooltip-id="tooltip" data-tooltip-content={ t('VERIFIER.nb_pages') }>
                    <span>{ item.nb_pages }</span>
                    <FileText size={ 15 }/>
                </div>
            )
        },
        {
            header: '',
            body: (item: any) => (
                <div onMouseEnter={() => setHovered(item)} onMouseLeave={() => setHovered(null)}>
                    <Eye></Eye>
                </div>
            )
        }
    ];

    const [totalPerTime, setTotalPerTime] = useState<any>(null);
    const [totalDocuments, setTotalDocuments] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState('NEW');

    const [documents, setDocuments] = useState<any[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);

    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(10);

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
                    limit: limit,
                    offset: offset,
                    user_id: user.id
                }) || [];
                console.log("Documents récupérés :", res);
                setDocuments(res.documents);
            } catch (err) {
                console.error("Erreur récupération documents :", err);
                setDocuments([]);
            } finally {
                setLoadingDocuments(false);
            }
        }

        retrieveDocuments();
    }, [user, loadingUser, selectedStatus]);

    useEffect(() => {
        console.log("totalPerTime mis à jour:", totalPerTime);
    }, [totalPerTime]);

    return (
        <div>
            { hovered && (
                <Thumbnail document_info={hovered} open={true} />
            )}
            <h1 className="text-2xl font-bold mb-4">VERIFIER LIST</h1>
            <div className="mt-4 rounded-md bg-white">
                <DataTable
                    data={ documents }
                    columns={ columns }
                    skeletonRows={ limit }
                    checkboxSelection={ true }
                    loading={ loadingDocuments }
                    emptyMessage={ t("VERIFIER.no_documents") }
                />
            </div>
        </div>
    );
}