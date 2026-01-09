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
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";
import { showConfirmDialogWithInput } from "../../../services/hooks/ConfirmDialogWithInput";

import Input from "../../../components/Input";
import { Table } from "../../../components/list/Table";
import { showToast } from "../../../components/ToastProvider";

export function SettingsGeneralAdvanced() {
    const { get, put } = axiosApiCall();

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
        sortOrder: null as 1 | -1 | null,
    });
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const actions = [
        {
            label: t('GLOBAL.modify'),
            icon: <Pencil className='mr-1' size={ 16 }/>,
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
        showConfirmDialogWithInput({
            value: selectedConfiguration[0].data.value,
            title: t('SECURITY.update_configuration_modale'),
            message: t('SECURITY.update_configuration_details', { 'name': selectedConfiguration[0].label }),
            confirmText: t('GLOBAL.modify'),
            cancelText: t('GLOBAL.cancel'),
            options: selectedConfiguration[0].data.options || [],
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
            },
            onCancel: () => {
            }
        });
    };

    const columns = [
        { id: 'id', field: 'id', header: '', className: 'max-w-10! w-10!' },
        { id: 'label', field: 'label', header: t('FORMS.label'), className: 'max-w-45! w-45!' },
        {
            id: 'description',
            className: 'max-w-4xl! w-4xl! truncate-data',
            header: t('VERIFIER.item_description'),
            body: (row: any) => (
                <span data-tooltip-id="tooltip" data-tooltip-content={ row.data.description }>
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
            body: (row: any) => {
                if (row.data.type === 'bool') {
                    return (
                        <span
                            className={ `bg-[#E8E8E8] p-2 rounded-md ${ row.data.value ? 'text-(--color-primary)' : 'text-(--text-error)' }` }>
                            { row.data.value ? 'True' : 'False' }
                        </span>
                    );
                }

                return (
                    <span className='bg-[#E8E8E8] p-2 rounded-md text-(--text-secondary)'>
                        { row.data.value }
                    </span>
                );
            }
        },
    ];

    return (
        <div className="p-8 bg-(--bg-secondary) h-full w-full flex flex-col flex-1">
            <Input id="search" type="text" name="search" className='bg-(--bg-primary) w-1/5 mb-4' height={ 'h-10' }
                   value={ searchTerm } placeholder={ t('USERS.search') } noMarginBottom={ true }
                   onChange={ (e) => setSearchTerm(e.target.value) }/>

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
                rowsPerPageOptions={ [4, 8, 16, 32] }
                selectedRows={ selectedConfiguration }
                totalRecords={ totalConfigurations || 0 }
                emptyMessage={ t("SECURITY.no_configurations") }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedConfiguration(rows) }
            />
        </div>
    );
}