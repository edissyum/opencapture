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

export function SettingsGeneralAdvanced() {
    const { get, put } = AxiosApiCall();

    const [loading, setLoading] = useState(false);
    const [configurations, setConfigurations] = useState<any>(null);
    const [selectedConfiguration, setSelectedConfiguration] = useState<any[]>([]);
    const [totalConfigurations, setTotalConfigurations] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 16,
        page: 0,
        sortField: null as string | null,
        sortOrder: null as 1 | -1 | null
    });
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const actions = [
        {
            label: t('GLOBAL.modify'),
            icon: <Pen size={ 16 }/>,
            command: () => handleUpdate()
        }
    ];

    const getActionsLine = () => actions;

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
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                    }
                });
                if (response.configurations) {
                    setConfigurations(response.configurations);
                    setTotalConfigurations(response.configurations[0]?.total || 0);
                }
            } catch (error) {
                console.error("Error fetching advanced configurations : ", error);
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
        let options = [];
        if (selectedConfiguration[0].data.options) {
            options = selectedConfiguration[0].data.options.map((option: string) => ({value: option, label: option}));
        }

        showConfirmDialogWithInput({
            value: selectedConfiguration[0].data.value,
            title: t('SECURITY.update_configuration_modale'),
            message: t('SECURITY.update_configuration_details', { 'name': selectedConfiguration[0].label }),
            confirmText: t('GLOBAL.modify'),
            cancelText: t('GLOBAL.cancel'),
            options: options,
            type: selectedConfiguration[0].data.type,
            onConfirm: (value) => {
                const updateValue = async () => {
                    try {
                        selectedConfiguration[0].data.value = value;
                        if (selectedConfiguration[0].data.type === 'bool') {
                            selectedConfiguration[0].data.value = value === 'true';
                        }
                        await put('/config/updateConfiguration/' + selectedConfiguration[0].id, selectedConfiguration[0]['data']);
                        showToast(t('SECURITY.configuration_updated'), "success");
                        setSelectedConfiguration([]);
                    } catch (error) {
                        console.error("Error updating configuration : ", error);
                    } finally {
                        setLoading(false);
                    }
                }
                setLoading(true);
                updateValue().then();
            }
        });
    };

    const columns = [
        { id: 'id', field: 'id', header: '', className: 'w-14!', sortable: true},
        { id: 'label', field: 'label', header: t('GLOBAL.label'), className: 'w-2/12' },
        {
            id: 'description',
            className: 'max-w-3xl! w-3xl! truncate',
            header: t('VERIFIER.item_description'),
            body: (row: any) => (
                <span data-tooltip-id="tooltip" data-tooltip-content={ row.data.description }>
                    { row.data.description }
                </span>
            )
        },
        {
            id: 'type',
            className: 'w-2/12',
            header: t('SECURITY.data_type'),
            body: (row: any) => {
                const typeMap: Record<string, string> = {
                    list: t('TYPE.list'),
                    int: t('TYPE.integer'),
                    bool: t('TYPE.boolean')
                };

                return (
                    <span title={ row.data.type }>
                        { typeMap[row.data.type] ?? row.data.type }
                    </span>
                );
            }
        },
        {
            id: 'value',
            className: 'w-1/12',
            header: t('SECURITY.value'),
            body: (row: any) => {
                if (row.data.type === 'bool') {
                    return (
                        <span
                            className={ `${ row.data.value ? 'bg-(--color-primary)/10' : 'bg-(--bg-error)' } px-2 py-1 rounded-md ${ row.data.value ? 'text-(--color-primary)' : 'text-(--text-error)' }` }>
                            { row.data.value ? 'True' : 'False' }
                        </span>
                    );
                }

                return (
                    <span className='bg-[#E8E8E8] px-2 py-1 rounded-md text-(--text-secondary)'>
                        { row.data.value }
                    </span>
                );
            }
        }
    ];

    return (
        <div className="p-6 bg-(--bg-secondary) h-full w-full flex flex-col flex-1">
            <Input id="search" type="text" name="search" className='bg-(--bg-primary) w-1/5 mb-4' height='h-10' autoFocus
                value={ searchTerm } placeholder={ t('GLOBAL.search') } onChange={ (e) => setSearchTerm(e.target.value) }/>

            <Table
                columns={ columns }
                loading={ loading }
                pagination={ true }
                actions={ actions }
                data={ configurations }
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
                selectedRows={ selectedConfiguration }
                totalRecords={ totalConfigurations || 0 }
                emptyMessage={ t("SECURITY.no_configurations") }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedConfiguration(rows) }
            />
        </div>
    );
}