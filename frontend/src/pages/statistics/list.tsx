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
import { Radio } from "@mantine/core";
import { useEffect, useState } from "react";
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, ChartSpline, ChevronDown, Filter, Package } from "lucide-react";

import { Button } from "../../components/Button";
import { Select } from "../../components/Select";

import { statisticsFunctions } from "./functions";

import { axiosApiCall } from "../../services/hooks/axiosApiCall";

export function StatisticsPage() {
    const { get, post } = axiosApiCall();

    const [users, setUsers] = useState<any[]>([]);
    const [displayFilters, setDisplayFilters] = useState(false);

    const [open, setOpen] = useState({
        module: true,
        statistics: true,
        year: true
    });

    const [statisticData, setStatisticData] = useState<any>({});
    const [selectedModule, setSelectedModule] = useState<string>();
    const [selectedStatisticId, setSelectedStatisticId] = useState<string>();

    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const statisticsOptions = [
        {
            'id': 'verifier_documents_validated_per_user',
            'label': t('STATISTICS.verifier_documents_validated_per_user'),
            'function': 'verifierDocumentsValidatedPerUser'
        },
        {
            'id': 'verifier_documents_validated_per_form',
            'label': t('STATISTICS.verifier_documents_validated_per_form'),
            'function': 'verifierDocumentsValidatedPerForm'
        },
        {
            'id': 'verifier_documents_uploaded_per_worklow',
            'label': t('STATISTICS.verifier_documents_uploaded_per_worklow'),
            'function': 'verifierDocumentsValidatedPerWorkflow'
        },
        {
            'id': 'verifier_documents_uploaded_per_user',
            'label': t('STATISTICS.verifier_documents_uploaded_per_user'),
            'function': 'verifierDocumentsUploadedPerUser'
        },
        {
            'id': 'verifier_documents_uploaded_per_month',
            'label': t('STATISTICS.verifier_documents_uploaded_per_month'),
            'function': 'verifierDocumentsUploadedPerMonth'
        },
        {
            'id': 'verifier_documents_uploaded_per_year',
            'label': t('STATISTICS.verifier_documents_uploaded_per_year'),
            'function': 'verifierDocumentsUploadedPerYear'
        },
        {
            'id': 'splitter_documents_processed_per_worklow',
            'label': t('STATISTICS.splitter_documents_processed_per_worklow'),
            'function': 'splitterDocumentsProcessedPerWorkflow'
        },
        {
            'id': 'splitter_documents_processed_per_user',
            'label': t('STATISTICS.splitter_documents_processed_per_user'),
            'function': 'splitterGetUserProcessedDocumentSlitter'
        },
        {
            'id': 'splitter_documents_processed_per_month',
            'label': t('STATISTICS.splitter_documents_processed_per_month'),
            'function': 'splitterGetDocumentsProcessedByMonth'
        },
        {
            'id': 'splitter_documents_processed_per_year',
            'label': t('STATISTICS.splitter_documents_processed_per_year'),
            'function': 'splitterGetDocumentsProcessedByYear'
        },
        {
            'id': 'splitter_batches_uploaded_per_month',
            'label': t('STATISTICS.splitter_batches_uploaded_per_month'),
            'function': 'splitterGetBatchesUploadedByMonth'
        },
        {
            'id': 'splitter_batches_uploaded_per_year',
            'label': t('STATISTICS.splitter_batches_uploaded_per_year'),
            'function': 'splitterGetBatchesUploadedByYear'
        }
    ];
    const [filteredStatisticsOptions, setFilteredStatisticsOptions] = useState<any[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await get('/users/list_full')
            setUsers(res.users);
        };

        const fetchAvailableYears = async () => {
            const res = await get('/history/getAvailableYears');
            if (res.years) {
                const uniqueYears: any = Array.from(new Set(res.years.map((data: any) => {
                    return { 'value': data.year, 'label': data.year }
                })));
                uniqueYears.unshift({ 'value': null, 'label': t('STATISTICS.all_years') });
                setAvailableYears(uniqueYears);
            }
        };

        fetchUsers().then();
        fetchAvailableYears().then();
    }, []);

    useEffect(() => {
        handleStatisticChange(selectedStatisticId, true).then();
    }, [selectedYear]);

    const handleModuleChange = (e: any) => {
        setSelectedModule(e.target.value);
        setSelectedStatisticId(undefined);
        setFilteredStatisticsOptions(statisticsOptions.filter(option => option.id.startsWith(e.target.value)));
    }

    const handleStatisticChange = async (value: any, force = false) => {
        const selectedOption = statisticsOptions.find(option => option.id === value);
        if (selectedOption) {
            setSelectedStatisticId(selectedOption.id);
            if (statisticData[selectedOption.id] && !force) {
                return;
            }

            const functionToCall = statisticsFunctions[selectedOption.function as keyof typeof statisticsFunctions];
            const args = {
                'get': get,
                'post': post,
                'users': users,
                'selectedYear': selectedYear
            };

            const res: any = await functionToCall(args);
            if (res) {
                setStatisticData((prev: any) => ({
                    ...prev,
                    [selectedOption.id]: res
                }));
            }
        }
    }

    const handleResetFilters = () => {
        setSelectedYear(null);
        setSelectedModule(undefined);
        setSelectedStatisticId(undefined);
        setFilteredStatisticsOptions(statisticsOptions);
    }

    return (
        <div className="flex h-full w-full overflow-hidden bg-(--bg-secondary)">
            <div className={ `h-full shrink-0 transition-all border-r border-(--border-secondary)
                            ${ displayFilters ? "w-[400px] opacity-100" : "w-0 opacity-0 z-0" } bg-(--bg-primary)` }>
                <div className='border-b border-(--border-secondary) p-4 flex items-center justify-between gap-2'>
                    <h1 className='text-2xl font-bold'>{ t('VERIFIER.filters') }</h1>
                    <span className='cursor-pointer text-(--text-secondary) hover:text-(--color-primary) whitespace-nowrap'
                          onClick={ handleResetFilters }>
                        { t('VERIFIER.erase_filters') }
                    </span>
                </div>
                <div className='flex flex-col h-full overflow-y-auto'>
                    <div className={ `${ open.module ? 'bg-(--bg-secondary)' : '' } border-b border-(--border-secondary)` }>
                        <div className="p-4 cursor-pointer flex items-center justify-between"
                             onClick={ () => setOpen({ ...open, module: !open.module }) }>
                            <div className="flex items-center gap-2">
                                <Package className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold'>{ t('MAILCOLLECT.module') }</h3>
                            </div>
                            <ChevronDown size={ 18 } className={ `transition-transform ${ open.module && "rotate-180" }` }/>
                        </div>

                        { open.module && (
                            <div className='p-4 pt-0'>
                                { ['verifier', 'splitter'].map((module) => (
                                    <div className='flex items-center gap-2 text-(--text-secondary)' key={ module }>
                                        <Radio
                                            id={ module }
                                            value={ module }
                                            checked={ selectedModule === module }
                                            onChange={ handleModuleChange }>
                                        </Radio>
                                        <label htmlFor={ module } key={ module } className='cursor-pointer whitespace-nowrap'>
                                            { module[0].toUpperCase() + module.substring(1) }
                                        </label>
                                    </div>
                                )) }
                            </div>
                        ) }
                    </div>
                    <div className={ `${ open.statistics ? 'bg-(--bg-secondary)' : '' } border-b border-(--border-secondary)` }>
                        <div className="p-4 cursor-pointer flex items-center justify-between"
                             onClick={ () => setOpen({ ...open, statistics: !open.statistics }) }>
                            <div className="flex items-center gap-2">
                                <ChartSpline className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold'>{ t('GLOBAL.statistics') }</h3>
                            </div>
                            <ChevronDown size={ 18 } className={ `transition-transform ${ open.statistics && "rotate-180" }` }/>
                        </div>

                        { open.statistics && (
                            <div className='p-4 pt-0'>
                                <Select
                                    id="statistics"
                                    value={ selectedStatisticId }
                                    placeholder={ t('STATISTICS.select_statistic') }
                                    options={ filteredStatisticsOptions.map(option => ({
                                        value: option.id,
                                        label: option.label
                                    })) }
                                    onChange={ (value) => handleStatisticChange(value) }
                                />
                            </div>
                        ) }
                    </div>
                    <div className={ `${ open.year ? 'bg-(--bg-secondary)' : '' } border-b border-(--border-secondary)` }>
                        <div className="p-4 cursor-pointer flex items-center justify-between"
                             onClick={ () => setOpen({ ...open, year: !open.year }) }>
                            <div className="flex items-center gap-2">
                                <Calendar className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold whitespace-nowrap'>{ t('STATISTICS.year_optionnal') }</h3>
                            </div>
                            <ChevronDown size={ 18 } className={ `transition-transform ${ open.year && "rotate-180" }` }/>
                        </div>

                        { open.year && (
                            <div className='p-4 pt-0'>
                                <Select
                                    id="year"
                                    value={ selectedYear }
                                    placeholder={ t('STATISTICS.select_year') }
                                    options={ availableYears.map((year: any) => ({
                                        value: year.value,
                                        label: year.label
                                    })) }
                                    onChange={ (value: any) => setSelectedYear(value) }
                                />
                            </div>
                        ) }
                    </div>
                </div>
            </div>

            <div className='p-6 h-full w-full flex flex-col flex-1'>
                <div className='flex items-center gap-6 mb-4 z-1'>
                    <Button variant='bg_white_rounded' icon={ <Filter size={ 14 }/> }
                            onClick={ () => setDisplayFilters(!displayFilters) }
                            selected={ displayFilters }>
                        { t('VERIFIER.filters') }
                    </Button>
                    { selectedStatisticId && statisticData[selectedStatisticId] && (
                        <>
                            { t('STATISTICS.results') } : { statisticData[selectedStatisticId].total }
                        </>
                    ) }
                </div>

                { selectedStatisticId && statisticData[selectedStatisticId] ? (
                    <BarChart key={ selectedStatisticId } className='w-full aspect-square max-h-[70vh]' responsive
                              data={ statisticData[selectedStatisticId].data }>
                        <Bar dataKey="value" label={ { position: "top" } }/>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip formatter={
                            (value) => [`${ value }`, t('SECURITY.value')]
                        }/>
                    </BarChart>
                ) : (
                    <div className='w-full h-full relative'>
                        <div className='h-full flex items-center justify-center text-(--text-secondary)'>
                            { t('STATISTICS.select_filters') }
                        </div>
                    </div>
                ) }
            </div>
        </div>
    );
}