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
import DOMPurify from "dompurify";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { copyToClipboard } from "../../services/hooks/copyToClipboard";

import { Table } from "../../components/list/Table";
import { Loader } from "../../components/loader/Loader";
import { showToast } from "../../components/ToastProvider";

export function MonitoringDetails() {
    const { get } = axiosApiCall();
    const { processId } = useParams<{ processId: any }>();

    const [steps, setSteps] = useState<any>([]);
    const [process, setProcess] = useState<any>({});

    const [loading, setLoading] = useState<boolean>(true);
    const [workflowLabel, setWorkflowLabel] = useState<string>('');

    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 8,
        page: 0,
        sortField: 'event_date',
        sortOrder: null,
    });

    const paginatedSteps = useMemo(() => {
        let data = [...steps];

        if (lazyParams.sortField) {
            data.sort((a, b) => {
                const valueA = a[lazyParams.sortField];
                const valueB = b[lazyParams.sortField];

                if (valueA == null) return -1;
                if (valueB == null) return 1;

                if (valueA < valueB) return lazyParams.sortOrder === 1 ? -1 : 1;
                if (valueA > valueB) return lazyParams.sortOrder === 1 ? 1 : -1;
                return 0;
            });
        }

        const start = lazyParams.first;
        const end = start + lazyParams.rows;

        return data.slice(start, end);
    }, [steps, lazyParams]);

    const columns: any = [
        { field: 'step', header: t('MONITORING.step') },
        { field: 'date', header: t('MONITORING.exec_date'), className: 'w-60 max-w-60' },
        {
            field: 'message', header: t('MONITORING.event_details'), body: (row: any) => (
                <span className={ `${ row.status === 'done' && !row.error && 'text-(--color-primary)' }
                                   ${ (row.status === 'error' || row.error) && 'cursor-pointer text-(--text-error)' }` }
                      data-tooltip-id='tooltip'
                      data-tooltip-content={ (row.status === 'error' || row.error) ? t('MONITORING.copy_error_message') : '' }
                      onClick={ async () => {
                          if (row.status === 'error' || row.error) {
                              await copyToClipboard(row.message);
                              showToast(t('MONITORING.error_message_copied'), 'success');
                          }
                      } }
                      dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(row.message_formatted) } }/>
            )
        },
        {
            id: 'status', field: 'status', header: t('GLOBAL.status'), body:
                (row: any) => (
                    <span>
                        { row.status === 'error' || row.error ? (
                            <div className='flex items-center gap-2 text-(--text-error) w-fit'>
                                <div className='bg-(--bg-error) rounded-sm px-3 py-1 border-0'>
                                    { t('MONITORING.error_small') }
                                </div>
                            </div>
                        ) : (
                            <div
                                className='bg-(--color-primary)/10 text-(--color-primary) rounded-sm px-2 py-1 border-0 w-fit'>
                                { t('MONITORING.done_small') }
                            </div>
                        ) }
                    </span>
                )
        }
    ];

    // Fetch process details
    useEffect(() => {
        const fetchProcessDetails = async () => {
            try {
                const response = await get(`/monitoring/getProcessById/${ processId }`);
                if (response && response.process) {
                    if (response.process?.elapsed_time) {
                        const hours = response.process.elapsed_time.slice(0, 2);
                        const minutes = response.process.elapsed_time.slice(3, 5);
                        const seconds = response.process.elapsed_time.slice(6, 11);

                        let message = '';
                        if (hours && hours !== '00') {
                            message += `${ hours } ${ t('MONITORING.hours', { count: parseInt(hours) }) } `;
                        }
                        if (minutes && minutes !== '00') {
                            message += `${ minutes } ${ t('MONITORING.minutes', { count: parseInt(minutes) }) } `;
                        }
                        if (seconds && seconds !== '00') {
                            if (parseInt(minutes) < 1 && parseInt(hours) < 1) {
                                const seconds_splitted = seconds.slice(0, 2);
                                const microseconds = seconds.slice(3, 5);
                                message += `${ seconds_splitted } ${ t('MONITORING.seconds', { count: parseInt(seconds_splitted) }) } `;
                                message += `${ t('MONITORING.and') } `;
                                message += `${ microseconds } ms`;
                            } else {
                                message += `${ seconds } ${ t('MONITORING.seconds', { count: parseInt(seconds) }) }`;
                            }
                        }
                        response.process.elapsedTime = message.trim();
                    }

                    const stepsList: any = [];
                    Object.keys(response.process.steps).forEach((key) => {
                        const step = response.process.steps[key];
                        step.step = parseInt(key);
                        step.id = key;
                        step.date = new Date(step.date).toLocaleString();

                        step.message_formatted = step.message.replace(/\n/g, '<br>');
                        stepsList.push(step);
                    });

                    setSteps(stepsList);
                    setProcess(response.process);
                }
            } catch (error) {
                console.error('Error fetching process details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProcessDetails().then();
    }, []);

    // Fetch workflow details when process is loaded
    useEffect(() => {
        if (Object.keys(process).length === 0) return;

        const fetchWorkflowDetails = async () => {
            try {
                const response = await get(`/workflows/${ process.module }/getByWorkflowId/${ process.workflow_id }`);
                if (response) {
                    setWorkflowLabel(response.label);
                }
            } catch (error) {
                console.error('Error fetching workflow details:', error);
            }
        };

        fetchWorkflowDetails().then();
    }, [process]);

    if (loading) return <Loader/>;

    return (
        <div className="bg-(--bg-secondary) p-6 h-full w-full flex flex-col overflow-hidden">
            <h1 className="text-md font-bold">{ t('MONITORING.process_details') }</h1>
            <div className="p-4 bg-(--bg-primary) border border-(--border-secondary) rounded-lg mt-4 grid grid-cols-6 gap-4">
                <div>
                    <p className='text-(--text-secondary) font-semibold mb-1'>
                        { t('MONITORING.id') }
                    </p>
                    <p className='font-bold'>{ processId }</p>
                </div>
                <div>
                    <p className='text-(--text-secondary) font-semibold mb-1'>
                        { t('MONITORING.workflow') }
                    </p>
                    <p className='font-bold'>{ workflowLabel }</p>
                </div>
                <div>
                    <p className='text-(--text-secondary) font-semibold mb-1'>
                        { t('MONITORING.creation_date') }
                    </p>
                    <p className='font-bold w-11/12'>
                        { process.creation_date_formated }
                    </p>
                </div>
                <div>
                    <p className='text-(--text-secondary) font-semibold mb-1'>
                        { t('MONITORING.end_date') }
                    </p>
                    <p className='font-bold w-11/12'>
                        { process.end_date_formated }
                    </p>
                </div>
                <div>
                    <p className='text-(--text-secondary) font-semibold mb-1'>
                        { t('MONITORING.elapsed_time') }
                    </p>
                    <p className='font-bold'>{ process.elapsedTime }</p>
                </div>
                <div>
                    <p className='text-(--text-secondary) font-semibold mb-1'>
                        { t('GLOBAL.status') }
                    </p>
                    <div className='font-bold w-fit'>
                        { process.status === 'running' && (
                            <Loader2 className="animate-spin "/>
                        ) }
                        { process.status === 'done' && !process.error && (
                            <div
                                className='bg-(--color-primary)/10 text-(--color-primary) rounded-sm px-2 py-1 border-0'>
                                { t('MONITORING.done_small') }
                            </div>
                        ) }
                        { (process.status === 'error' || process.error) && (
                            <div className='flex items-center gap-2 text-(--text-error)'>
                                <div className='bg-(--bg-error) rounded-sm px-3 py-1 border-0'>
                                    { t('MONITORING.error_small') }
                                </div>
                            </div>
                        ) }
                    </div>
                </div>
            </div>
            <h1 className="mt-6 mb-4 text-md font-bold">{ t('MONITORING.process_steps') }</h1>
            <Table
                pagination={ true }
                columns={ columns }
                loading={ loading }
                data={ paginatedSteps }
                lazyParams={ lazyParams }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ steps.length || 0 }
                rowsPerPageOptions={ [4, 8, 16, 32] }
                emptyMessage={ t("MONITORING.no_processes") }
                onLazyParamsChange={ setLazyParams }
            />
        </div>
    );
}