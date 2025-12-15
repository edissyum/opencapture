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

import { useEffect, useState } from "react";
import { axiosApiCall } from "../../../services/hooks/axiosApiCall.tsx";
import { t } from "i18next";
import { Table } from "../../../components/list/Table.tsx";

export function SettingsGeneralAdvanced() {
    const { get } = axiosApiCall();

    const [loading, setLoading] = useState(false);
    const [configurations, setConfigurations] = useState<any>(null);
    const [totalConfigurations, setTotalConfigurations] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 16,
        page: 0,
        sortField: null as string | null,
        sortOrder: null as 1 | -1 | null,
    });

    const actions: any = [];
    const getActionsLine = (rowData: any) => {
        return [];
    }

    // Retrieve advanced configurations
    useEffect(() => {
        const fetchConfigurations = async () => {
            try {
                const response = await get("/config/getConfigurations", {
                    params: {
                        limit: lazyParams.rows,
                        offset: lazyParams.first,
                        search: debouncedSearchTerm,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null,
                    }
                });
                if (response.configurations) {
                    setConfigurations(response.configurations);
                    setTotalConfigurations(response.configurations.length);
                }
            } catch (error) {
                console.error("Error fetching advanced configurations:", error);
            }
        };

        fetchConfigurations().then();
    }, [lazyParams, debouncedSearchTerm]);

    const columns = [
        { id: 'id', field: 'id', header: '', className: 'max-w-10! w-10!' },
        { id: 'label', field: 'label', header: t('FORMS.label') },
        {
            id: 'description',
            className: 'max-w-5xl! w-5xl! truncate-data',
            header: t('VERIFIER.item_description'),
            body: (row: any) => (
                <span>
                    { row.data.description }
                </span>
            )
        },
        {
            id: 'type',
            header: t('SECURITY.data_type'),
            body: (row: any) => {
                const typeMap: Record<string, string> = {
                    list: t('TYPE.list'),
                    int: t('TYPE.integer'),
                    bool: t('TYPE.boolean')
                };

                return (
                    <span>
                        { typeMap[row.data.type] ?? row.data.type }
                    </span>
                );
            }
        },
        {
            id: 'value',
            header: t('SECURITY.value'),
            body: (row: any) => (
                <span>
                    { row.data.value }
                </span>
            )
        },
    ];

    return (
        <div className="p-8 bg-(--bg-secondary) h-full w-full flex flex-col flex-1">
            <Table
                data={ configurations }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                loading={ loading }
                lazyParams={ lazyParams }
                actionsLine={ getActionsLine }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ totalConfigurations || 0 }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("SECURITY.no_configurations") }
                onLazyParamsChange={ setLazyParams }
                // onSelectionChange={ (rows) => setSelectedForms(rows) }
            />
        </div>
    );
}