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


export function SettingsGeneralRegex() {
    const { get, put } = axiosApiCall();

    const [loading, setLoading] = useState(false);
    const [regex, setRegex] = useState<any>(null);
    const [selectedRegex, setSelectedRegex] = useState<any[]>([]);
    const [totalRegex, setTotalRegex] = useState<number | null>(null);

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
            icon: <Pencil size={ 16 }/>,
            command: () => handleUpdate()
        }
    ];

    const columns = [
        { id: 'regex_id', field: 'regex_id', header: t('SMTP.login') },
        { id: 'label', field: 'label', header: t('GLOBAL.label'), className: 'min-w-40 w-40' },
        { id: 'content', header: t('SECURITY.value'), field: 'content' }
    ];

    const getActionsLine = () => actions;

    // Retrieve regex
    useEffect(() => {
        const fetchConfigurations = async () => {
            try {
                const response = await get("/config/getRegex", {
                    params: {
                        limit: lazyParams.rows,
                        offset: lazyParams.first,
                        search: debouncedSearchTerm,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                    }
                });
                if (response.regex) {
                    setRegex(response.regex);
                    setTotalRegex(response.regex[0]?.total || 0);
                }
            } catch (error) {
                console.error("Error fetching regex:", error);
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
            value: selectedRegex[0].content,
            title: t('REGEX.update_regex_modale'),
            message: t('REGEX.update_regex_details', { 'name': selectedRegex[0].label }),
            confirmText: t('GLOBAL.modify'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: (value) => {
                const updateValue = async () => {
                    try {
                        selectedRegex[0].content = value;
                        await put('/config/updateRegex/' + selectedRegex[0].id, selectedRegex[0]);
                        showToast(t('REGEX.regex_updated'), "success");
                        setSelectedRegex([]);
                    } catch (error) {
                        console.error("Error updating regex : ", error);
                    } finally {
                        setLoading(false);
                    }
                }
                setLoading(true);
                updateValue().then();
            }
        });
    };

    return (
        <div className="p-6 bg-(--bg-secondary) h-full w-full flex flex-col flex-1">
            <Input id="search" type="text" name="search" className='bg-(--bg-primary) w-1/5 mb-4' height='h-10' autoFocus
                   value={ searchTerm } placeholder={ t('GLOBAL.search') } noMarginBottom={ true }
                   onChange={ (e) => setSearchTerm(e.target.value) }/>

            <Table
                columns={ columns }
                loading={ loading }
                pagination={ true }
                actions={ actions }
                data={ regex }
                lazyParams={ lazyParams }
                actionsLine={ getActionsLine }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                selectedRows={ selectedRegex }
                totalRecords={ totalRegex || 0 }
                emptyMessage={ t("SECURITY.no_configurations") }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedRegex(rows) }
            />
        </div>
    );
}