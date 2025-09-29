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

import { DataTable } from "../../components/DataTable";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { FileText } from "lucide-react";
import { Checkbox } from "../../components/Checkbox.tsx";

export function VerifierListPage() {
    const { get, post } = axiosApiCall();
    const { user, loadingUser } = useUser();

    const columns: any = [
        { header: '', value: 'id' },
        { header: t('VERIFIER.name'), render: (item: any) => <span className="font-semibold">{ item.supplier_name }</span> },
        { header: t('VERIFIER.status'), value: 'status' },
        { header: t('VERIFIER.creation_date'), render: (item: any) => new Date(item.register_date).toLocaleString() },
        { header: t('VERIFIER.form'), value: 'form_label' },
        { header: '', render: () => <div className='flex justify-center items-center'><span>1</span> <FileText size={16}/></div>}
    ];

    const [totalPerTime, setTotalPerTime] = useState<any>(null);
    const [totalDocuments, setTotalDocuments] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState('NEW');

    const [documents, setDocuments] = useState<any[]>([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);

    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(16);

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
            <h1 className="text-2xl font-bold mb-4">VERIFIER LIST</h1>
            <div className="mt-4 rounded-md bg-white">
                <div className='p-2'>
                    <Checkbox label={t('VERIFIER.select_all')}/>
                </div>
                <DataTable<Document>
                    data={documents}
                    columns={columns}
                    skeletonRows={16}
                    loading={loadingDocuments}
                    emptyMessage="Aucun document trouvé"
                />
                {/*<p>Total Documents: { totalDocuments !== null ? totalDocuments : 'Loading...' }</p>*/}
                {/*<p>Totals Per Time: { totalPerTime ? JSON.stringify(totalPerTime) : 'Loading...' }</p>*/}
            </div>
        </div>
    );
}