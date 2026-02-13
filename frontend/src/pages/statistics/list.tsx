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
import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts";

import { statisticsFunctions } from "./functions";

import { Dropdown } from "../../components/Dropdown";

import { axiosApiCall } from "../../services/hooks/axiosApiCall";

export function StatisticsPage() {
    const { get, post } = axiosApiCall();

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [statisticData, setStatisticData] = useState<any>({});
    const [selectedModule, setSelectedModule] = useState<string>();
    const [selectedStatisticId, setSelectedStatisticId] = useState<string>();

    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const statisticsOptions = [
        {
            'id': 'verifier_batches_validated_per_user',
            'label': t('STATISTICS.verifier_batches_validated_per_user'),
            'function': 'verifierBatchesValidatedPerUser'
        },
        {
            'id': 'verifier_batches_validated_per_form',
            'label': t('STATISTICS.verifier_batches_validated_per_form'),
            'function': 'verifierBatchesValidatedPerForm'
        },
        {
            'id': 'verifier_batches_uploaded_per_worklow',
            'label': t('STATISTICS.verifier_batches_uploaded_per_worklow'),
            'function': 'verifierBatchesValidatedPerWorkflow'
        },
        {
            'id': 'verifier_batches_uploaded_per_user',
            'label': t('STATISTICS.verifier_batches_uploaded_per_user'),
            'function': 'verifierBatchesUploadedPerUser'
        },
        {
            'id': 'verifier_batches_uploaded_per_month',
            'label': t('STATISTICS.verifier_batches_uploaded_per_month'),
            'function': 'verifierBatchesUploadedPerMonth'
        },
        {
            'id': 'verifier_batches_uploaded_per_year',
            'label': t('STATISTICS.verifier_batches_uploaded_per_year'),
            'function': 'verifierBatchesUploadedPerYear'
        }
    ];
    const [filteredStatisticsOptions, setFilteredStatisticsOptions] = useState(statisticsOptions);

    useEffect(() => {
        setLoading(true);
        const fetchUsers = async () => {
            const res = await get('/users/list_full')
            setUsers(res.users);
            setLoading(false);
        };

        const fetchAvailableYears = async () => {
            const res = await get('/history/getAvailableYears');
            if (res.years) {
                const uniqueYears: any = Array.from(new Set(res.years.map((data: any) => data.year)));
                setAvailableYears(uniqueYears);
            }
        };

        fetchUsers().then();
        fetchAvailableYears().then();
    }, []);

    useEffect(() => {
        handleStatisticChange({ value: selectedStatisticId }, true).then();
    }, [selectedYear]);

    const handleModuleChange = (e: any) => {
        setSelectedModule(e.value);
        setSelectedStatisticId(undefined);
        setFilteredStatisticsOptions(statisticsOptions.filter(option => option.id.startsWith(e.value)));
    }

    const handleStatisticChange = async (e: any, force = false) => {
        const selectedOption = statisticsOptions.find(option => option.id === e.value);
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

    return (
        <div className="p-4 h-full">
            <Dropdown
                id="module"
                labelFusion={ true }
                value={ selectedModule }
                label={ t('MAILCOLLECT.module') }
                options={ [{ 'value': 'verifier', 'label': 'Verifier' }, { 'value': 'splitter', 'label': 'Splitter' }] }
                onChange={ handleModuleChange }
            />
            <Dropdown
                id="statistics-dropdown"
                labelFusion={ true }
                value={ selectedStatisticId }
                label={ t('STATISTICS.select_statistic') }
                options={ filteredStatisticsOptions.map(option => ({ value: option.id, label: option.label })) }
                onChange={ handleStatisticChange }
            />
            <Dropdown
                id="select-year"
                value={ selectedYear }
                labelFusion={ true }
                label={ t('STATISTICS.select_year') }
                options={ availableYears.map(year => ({ value: year, label: year.toString() })) }
                onChange={ (e) => setSelectedYear(e.value) }
            />

            { selectedStatisticId && statisticData[selectedStatisticId] && (
                <BarChart key={ selectedStatisticId } className='w-full aspect-square max-h-[60vh]' responsive
                          data={ statisticData[selectedStatisticId].data }>
                    <Bar dataKey="value" label={ { position: "top" } }/>
                    <XAxis dataKey="name"/>
                    <YAxis/>
                    <Tooltip formatter={
                        (value) => [`${ value }`, t('SECURITY.value')]
                    }/>
                </BarChart>
            ) }
        </div>
    );
}