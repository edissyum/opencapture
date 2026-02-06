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
import { Activity, Filter } from "lucide-react";

import Input from "../../components/Input";
import { Button } from "../../components/Button";
import { Table } from "../../components/list/Table";

import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { usePersistentState } from "../../services/hooks/usePersistentState";


export function MonitoringList() {
    const { get } = axiosApiCall();

    const [processes, setProcesses] = useState<any[]>([]);
    const [loadingProcesses, setLoadingProcesses] = useState(false);
    const [totalProcesses, setTotalProcesses] = useState(0);
    const [searchFilename, setSearchFilename] = useState('');
    const [displayFilters, setDisplayFilters] = useState(false);
    const [debouncedSearchFilename, setDebouncedSearchFilename] = useState('');

    const [lazyParams, setLazyParams] = usePersistentState<{
        first: number;
        rows: number;
        page: number;
        sortField: string | null;
        sortOrder: 1 | -1 | null;
    }>('monitoringLazyParams', {
            first: 0,
            rows: 16,
            page: 0,
            sortField: null,
            sortOrder: null
        }
    );

    const columns: any = [
        {
            id: 'module', field: 'module', header: t('MAILCOLLECT.module'), body: (row: any) => (
                <span>{ row.module[0].toUpperCase() + row.module.slice(1) }</span>
            )
        },
        {
            id: 'creation_date',
            field: 'creation_date',
            header: t('MONITORING.creation_date'),
            className: 'w-50 max-w-50'
        },
        { id: 'end_date', field: 'end_date', header: t('MONITORING.end_date'), className: 'w-50 max-w-50' },
        {
            id: 'filename',
            field: 'filename',
            header: t('VERIFIER.filename'),
            className: 'max-w-64',
            body: (row: any) => (
                <span className="block max-w-64 truncate" data-tooltip-id="tooltip" data-tooltip-content={ row.filename }>
                    { row.filename }
                </span>
            )
        },
        {
            id: 'last_message', field: 'last_message', header: t('MONITORING.last_message'), className: 'max-w-[50rem]',
            body: (row: any) => (
                <span className="block truncate max-w-[50rem] whitespace-nowrap">
                    { row.last_message }
                </span>
            )
        },
        { id: 'status', field: 'status', header: t('MONITORING.status') }
    ];

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchFilename(searchFilename);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchFilename]);

    // Fetch processes list
    useEffect(() => {
        setLoadingProcesses(true);

        const fetchProcesses = async () => {
            const res = await get(`/monitoring/list`, {
                params: {
                    limit: lazyParams.rows,
                    offset: lazyParams.first,
                    filename: debouncedSearchFilename,
                    filter: lazyParams.sortField,
                    order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                }
            });

            res.processes.forEach((process: any) => {
                const numberOfSteps = Object.keys(process.steps).length;
                if (process.steps[numberOfSteps]) {
                    process.last_message = process.steps[numberOfSteps].message;
                }
            });

            setProcesses(res.processes || []);
            if (Object.keys(res.processes).length > 0) {
                setTotalProcesses(res.processes[0].total || 0);
            }

            setLoadingProcesses(false);
        }
        fetchProcesses().then();
    }, [lazyParams, debouncedSearchFilename]);


    return (
        <div className='p-8 flex flex-col h-full w-full overflow-hidden'>
            <div className='flex items-center gap-6 mb-4'>
                <Button icon={ <Filter size={ 14 }/> } onClick={ () => setDisplayFilters(!displayFilters) }
                        className={ `rounded-3xl hover:text-(--color-primary) text-(--text-primary)
                                            border-(--border-secondary) p-2.5! bg-(--bg-primary)
                                            ${ displayFilters ? 'bg-(--color-primary) text-white hover:text-white' : 'bg-(--bg-primary) text-(--text-primary)' }` }>
                    { t('VERIFIER.filters') }
                </Button>
                <span className='flex items-center gap-1'>
                    <Activity size={ 16 }/>
                    <span>
                        { t('MONITORING.processes') } ({ totalProcesses || 0 })
                    </span>
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary) w-96' height='h-10'
                       value={ searchFilename } placeholder={ t('MONITORING.search_filename') } noMarginBottom={ true }
                       onChange={ (e) => setSearchFilename(e.target.value) }/>
            </div>
            <Table
                baseLink="/monitoring/"
                data={ processes }
                pagination={ true }
                columns={ columns }
                lazyParams={ lazyParams }
                loading={ loadingProcesses }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ totalProcesses || 0 }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("MONITORING.no_processes") }
                onLazyParamsChange={ setLazyParams }
            />
        </div>
    );
}