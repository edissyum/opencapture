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
import { Pen } from "lucide-react";
import { useEffect, useState } from "react";

import { AxiosApiCall } from "../../../services/hooks/AxiosApiCall";
import { showConfirmDialogWithInput } from "../../../services/hooks/ConfirmDialogWithInput";

import Input from "../../../components/Input";
import { Table } from "../../../components/list/Table";
import { showToast } from "../../../components/ToastProvider";


export function SettingsGeneralDocservers() {
    const { get, put } = AxiosApiCall();

    const [loading, setLoading] = useState(false);
    const [docservers, setDocservers] = useState<any>(null);
    const [selectedDocserver, setSelectedDocservers] = useState<any[]>([]);
    const [totalDocserver, setTotalDocservers] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 16,
        page: 0,
        sortField: null as string | null,
        sortOrder: null as 1 | -1 | null
    });
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const columns = [
        { id: 'docserver_id', field: 'docserver_id', header: t('SMTP.login') },
        { id: 'description', field: 'description', header: t('VERIFIER.item_description') },
        { id: 'path', header: t('SECURITY.value'), field: 'path' }
    ];

    const actions = [
        {
            label: t('GLOBAL.modify'),
            icon: <Pen size={ 16 }/>,
            command: () => handleUpdate()
        }
    ];

    const getActionsLine = () => actions;

    // Retrieve docservers
    useEffect(() => {
        const fetchConfigurations = async () => {
            try {
                const response = await get("/config/getDocservers", {
                    params: {
                        limit: lazyParams.rows,
                        offset: lazyParams.first,
                        search: debouncedSearchTerm,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                    }
                });
                if (response.docservers) {
                    setDocservers(response.docservers);
                    setTotalDocservers(response.docservers[0]?.total || 0);
                }
            } catch (error) {
                console.error("Error fetching docservers : ", error);
            }
        };

        fetchConfigurations().then();
    }, [lazyParams, debouncedSearchTerm]);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    const handleUpdate = () => {
        showConfirmDialogWithInput({
            value: selectedDocserver[0].path,
            title: t('DOCSERVERS.update_docserver_modale'),
            message: t('DOCSERVERS.update_docserver_details', { 'name': selectedDocserver[0].docserver_id }),
            confirmText: t('GLOBAL.modify'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: (value) => {
                const updateValue = async () => {
                    try {
                        selectedDocserver[0].path = value;
                        await put('/config/updateDocserver/' + selectedDocserver[0].id, selectedDocserver[0]);
                        showToast(t('DOCSERVERS.docserver_updated'), "success");
                        setSelectedDocservers([]);
                        setLoading(false);
                    } catch (error) {
                        setLoading(false);
                        console.error("Error updating docserver : ", error);
                    }
                }
                setLoading(true);
                updateValue().then();
            },
            onCancel: () => {
            }
        });
    };

    return (
        <div className="p-6 bg-(--bg-secondary) h-full w-full flex flex-col flex-1">
            <Input id="search" type="text" name="search" className='bg-(--bg-primary) w-1/5 mb-4' height='h-10' autoFocus
                   value={ searchTerm } placeholder={ t('GLOBAL.search') } onChange={ (e) => setSearchTerm(e.target.value) }/>

            <Table
                columns={ columns }
                loading={ loading }
                pagination={ true }
                actions={ actions }
                data={ docservers }
                lazyParams={ lazyParams }
                actionsLine={ getActionsLine }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                rowsPerPageOptions={ [
                    { "value": 4, "label": "4" },
                    { "value": 8, "label": "8" },
                    { "value": 16, "label": "16" },
                    { "value": 32, "label": "32" }
                ] }
                selectedRows={ selectedDocserver }
                totalRecords={ totalDocserver || 0 }
                emptyMessage={ t("SECURITY.no_configurations") }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedDocservers(rows) }
            />
        </div>
    );
}