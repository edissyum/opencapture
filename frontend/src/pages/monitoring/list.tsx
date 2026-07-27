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
import { RadioButton } from "primereact/radiobutton";
import { Activity, ChevronDown, Filter, Loader2, Package, RotateCw } from "lucide-react";

import Input from "../../components/Input";
import { Button } from "../../components/Button";
import { Table } from "../../components/list/Table";
import { showToast } from "../../components/ToastProvider";

import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";
import { usePersistentState } from "../../services/hooks/usePersistentState";
import DOMPurify from "dompurify";

export function MonitoringList() {
    const { get, put } = axiosApiCall();

    const [processes, setProcesses] = useState<any[]>([]);
    const [totalProcesses, setTotalProcesses] = useState(0);
    const [searchFilename, setSearchFilename] = useState('');
    const [displayFilters, setDisplayFilters] = useState(false);
    const [loadingProcesses, setLoadingProcesses] = useState(false);
    const [debouncedSearchFilename, setDebouncedSearchFilename] = useState('');

    const [open, setOpen] = useState({
        module: true,
        status: true
    });

    const listModules = [
        { id: 'verifier', label: t('SETTINGS.verifier') },
        { id: 'splitter', label: t('SETTINGS.splitter') }
    ]
    const listStatuses = [
        { id: 'running', label: t('MONITORING.running') },
        { id: 'done', label: t('MONITORING.done') },
        { id: 'error', label: t('MONITORING.error') }
    ]
    const [selectedModule, setSelectedModule] = usePersistentState<string>('selectedModuleMonitoring', '');
    const [selectedStatus, setSelectedStatus] = usePersistentState<string>('selectedStatusMonitoring', '');

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
            className: 'w-60 max-w-60'
        },
        { id: 'end_date', field: 'end_date', header: t('MONITORING.end_date'), className: 'w-60 max-w-60' },
        {
            id: 'filename',
            field: 'filename',
            header: t('VERIFIER.filename'),
            className: 'max-w-60',
            body: (row: any) => (
                <span className="block max-w-64 truncate" data-tooltip-id="tooltip"
                      data-tooltip-content={ row.filename }>
                    { row.filename }
                </span>
            )
        },
        {
            id: 'last_message', field: 'last_message', header: t('MONITORING.last_message'), className: 'max-w-[50rem]',
            body: (row: any) => (
                <span className={ `block truncate max-w-[50rem] whitespace-nowrap
                                   ${ row.status === 'done' && !row.error && 'text-(--color-primary)' }
                                   ${ (row.status === 'error' || row.error) && 'text-(--text-error)' }` }
                      dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(row.last_message) } }
                />
            )
        },
        {
            id: 'status', field: 'status', header: t('GLOBAL.status'), body: (row: any) => (
                <span>
                    { row.status === 'running' && (
                        <Loader2 className="animate-spin "/>
                    ) }
                    { row.status === 'done' && !row.error && (
                        <div className='bg-(--color-primary)/10 text-(--color-primary) rounded-sm px-2 py-1 border-0 w-fit'>
                            { t('MONITORING.done_small') }
                        </div>
                    ) }
                    { (row.status === 'error' || row.error) && (
                        <div className='flex items-center gap-2 text-(--text-error) w-fit'>
                            <div className='bg-(--bg-error) rounded-sm px-3 py-1 border-0'>
                                { t('MONITORING.error_small') }
                            </div>
                            { !row.retry && (
                                <RotateCw size={ 18 } data-tooltip-content={ t('MONITORING.retry_process') }
                                          data-tooltip-id="tooltip"
                                          onClick={ (e) => {
                                              e.stopPropagation();
                                              handleRetryProcess(row.id).then();
                                          } }
                                />
                            ) }
                        </div>
                    ) }
                </span>
            )
        }
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

    const fetchProcesses = async () => {
        const res = await get('/monitoring/list', {
            params: {
                limit: lazyParams.rows,
                module: selectedModule,
                status: selectedStatus,
                offset: lazyParams.first,
                filter: lazyParams.sortField,
                filename: debouncedSearchFilename,
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

    // Fetch processes list
    useEffect(() => {
        setLoadingProcesses(true);
        fetchProcesses().then();

        // Every 25 seconds, fetch processes list. Delay is long to avoid too many requests and 429 request error
        const interval = setInterval(() => {
            fetchProcesses().then();
        }, 25000);

        return () => clearInterval(interval);
    }, [lazyParams, debouncedSearchFilename, selectedModule, selectedStatus]);

    const handleResetFilters = () => {
        setSelectedModule('');
        setSelectedStatus('');
    }

    const handleRetryProcess = async (id: string) => {
        if (!id) return;

        showConfirmDialog({
            title: t('MONITORING.retry_process'),
            message: t('MONITORING.confirm_retry_process'),
            confirmText: t('GLOBAL.relaunch'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await get(`/verifier/retryFromMonitoring/${ id }`);
                await put(`/monitoring/update_retry`, { 'process_id': id });
                showToast(t('MONITORING.process_relaunched'), 'success');
            }
        });
    }

    return (
        <div className='flex h-full w-full overflow-hidden bg-(--bg-secondary)'>
            <div className={ `h-full shrink-0 transition-all border-r border-(--border-secondary) pb-16
                            ${ displayFilters ? "w-[300px] opacity-100" : "w-0 opacity-0 z-0" } bg-(--bg-primary)` }>
                <div className='border-b border-(--border-secondary) p-4 flex items-center justify-between gap-2'>
                    <h1 className='text-2xl font-bold'>{ t('VERIFIER.filters') }</h1>
                    <span className='cursor-pointer text-(--text-secondary) hover:text-(--color-primary) whitespace-nowrap'
                          onClick={ handleResetFilters }>
                        { t('VERIFIER.erase_filters') }
                    </span>
                </div>
                <div className='flex flex-col h-full overflow-y-auto'>
                    <div className={ `${ open.module ? 'bg-(--bg-secondary)' : '' } border-b border-(--border-secondary)` }>
                        <div className="p-4 flex items-center justify-between"
                             onClick={ () => setOpen({ ...open, module: !open.module }) }>
                            <div className="flex items-center gap-2">
                                <Package className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold'>{ t('MAILCOLLECT.module') }</h3>
                            </div>
                            <ChevronDown
                                size={ 18 }
                                className={ `transition-transform ${ open.module ? "rotate-180" : "" }` }/>
                        </div>

                        { open.module && (
                            <div className='p-4 pt-0'>
                                { listModules.map((module: any) => (
                                    <div className='flex items-center text-(--text-secondary)' key={ module.id }>
                                        <RadioButton
                                            inputId={ module.id } checked={ selectedModule === module.id }
                                            className='mr-1 scale-80'
                                            value={ module.id }
                                            onChange={ (e) => {
                                                setSelectedModule(e.value);
                                            } }>
                                        </RadioButton>
                                        <label htmlFor={ module.id } key={ module.id } className='cursor-pointer whitespace-nowrap'>
                                            { module.label }
                                        </label>
                                    </div>
                                )) }
                            </div>
                        ) }
                    </div>
                    <div className={ `${ open.status ? 'bg-(--bg-secondary)' : '' } border-b border-(--border-secondary)` }>
                        <div className="p-4 flex items-center justify-between"
                             onClick={ () => setOpen({ ...open, status: !open.status }) }>
                            <div className="flex items-center gap-2">
                                <Package className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold'>{ t('GLOBAL.status') }</h3>
                            </div>
                            <ChevronDown
                                size={ 18 }
                                className={ `transition-transform ${ open.status ? "rotate-180" : "" }` }/>
                        </div>

                        { open.status && (
                            <div className='flex flex-col p-4 pt-0'>
                                { listStatuses.map((status: any) => (
                                    <div className='flex items-center text-(--text-secondary)' key={ status.id }>
                                        <RadioButton
                                            inputId={ status.id } checked={ selectedStatus === status.id }
                                            className='mr-1 scale-80'
                                            value={ status.id }
                                            onChange={ (e) => {
                                                setSelectedStatus(e.value);
                                            } }>
                                        </RadioButton>
                                        <label htmlFor={ status.id } key={ status.id } className='cursor-pointer whitespace-nowrap'>
                                            { status.label }
                                        </label>
                                    </div>
                                )) }
                            </div>
                        ) }
                    </div>
                </div>
            </div>

            <div className='p-6 h-full w-full flex flex-col flex-1 z-10'>
                <div className='flex items-center gap-6 mb-4'>
                    <Button variant='bg_white_rounded' icon={ <Filter size={ 14 }/> }
                            onClick={ () => setDisplayFilters(!displayFilters) } selected={ displayFilters }>
                        { t('VERIFIER.filters') }
                    </Button>
                    <span className='flex items-center gap-1'>
                        <Activity size={ 16 }/>
                        <span>
                            { t('MONITORING.processes') } ({ totalProcesses || 0 })
                        </span>
                    </span>
                    <Input id="search" type="text" name="search" className='bg-(--bg-primary) w-96' height='h-10' autoFocus
                           value={ searchFilename } placeholder={ t('MONITORING.search_filename') }
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
        </div>
    );
}