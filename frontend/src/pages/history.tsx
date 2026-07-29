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
import { Radio } from "@mantine/core";
import { useEffect, useState } from "react";
import { Activity, ChevronDown, Filter, Package } from "lucide-react";

import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { Table } from "../components/list/Table";

import { axiosApiCall } from "../services/hooks/axiosApiCall";
import { usePersistentState } from "../services/hooks/usePersistentState";

export function HistoryList() {
    const { get } = axiosApiCall();

    const [history, setHistory] = useState<any[]>([]);
    const [totalHistory, setTotalHistory] = useState(0);
    const [displayFilters, setDisplayFilters] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [open, setOpen] = useState({
        user: true,
        module: true,
        submodule: true
    });

    const listModules = [
        { id: 'general', label: t('SETTINGS.general') },
        { id: 'accounts', label: t('HISTORY.accounts') },
        { id: 'verifier', label: t('HISTORY.verifier') },
        { id: 'splitter', label: t('HISTORY.splitter') }
    ]

    const [listUsers, setListUsers] = useState<any[]>([]);
    const [listSubModules, setListSubModules] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = usePersistentState<string>('selectedUserHistory', '');
    const [selectedModule, setSelectedModule] = usePersistentState<string>('selectedModuleHistory', '');
    const [selectedSubModule, setSelectedSubModule] = usePersistentState<string>('selectedSubModuleHistory', '');

    const [lazyParams, setLazyParams] = usePersistentState<{
        first: number;
        rows: number;
        page: number;
        sortField: string | null;
        sortOrder: 1 | -1 | null;
    }>('historyLazyParams', {
            first: 0,
            rows: 16,
            page: 0,
            sortField: null,
            sortOrder: null
        }
    );

    const columns: any = [
        { id: 'history_module', field: 'history_module', header: t('MAILCOLLECT.module'), sortable: true, className: 'w-1/12' },
        { id: 'history_submodule', field: 'history_submodule', header: t('HISTORY.submodule'), sortable: true, className: 'w-3/24' },
        { id: 'history_date', field: 'date', header: t('HISTORY.event_date'), sortable: true, className: 'w-3/24' },
        { id: 'user_info', field: 'user_info', header: t('HISTORY.user_info'), className: 'w-2/12' },
        {
            id: 'history_desc',
            field: 'history_desc',
            header: t('HISTORY.description'),
            className: 'w-4/12',
            body: (row: any) => (
                <div className='truncate' title={ row.history_desc }
                     dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(row.history_desc) } }></div>
            )
        },
        { id: 'user_ip', field: 'user_ip', header: t('HISTORY.ip'), className: 'w-1/12' },
    ];

    // Fetch processes list, submodules and users
    useEffect(() => {
        setLoadingHistory(true);

        const fetchHistory = async () => {
            const res = await get('/history/list', {
                params: {
                    user: selectedUser,
                    limit: lazyParams.rows,
                    module: selectedModule,
                    offset: lazyParams.first,
                    submodule: selectedSubModule,
                    filter: lazyParams.sortField,
                    order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null
                }
            });

            setHistory(res.history || []);
            if (Object.keys(res.history).length > 0) {
                setTotalHistory(res.history[0].total || 0);
            }
        }

        const fetchSubModules = async () => {
            const res = await get('/history/submodules');
            if (res.history) {
                res.history.forEach((item: any) => {
                    setListSubModules((prev: any) => [...prev, {
                        id: item.history_submodule,
                        label: item.history_submodule
                    }]);
                });
            }
        }

        const fetchUsers = async () => {
            const users = await get('/users/list_full')
            const res = await get('/history/users');
            if (!res.history) return;

            const usersMap = new Map<number, any>();
            res.history.forEach((item: any) => {
                if (!item.user_id) return;

                const user = users.users.find((u: any) => u.id === item.user_id);
                if (!user) return;

                usersMap.set(item.user_id, user);
            });

            setListUsers(Array.from(usersMap.values()));
        }

        fetchUsers().then();
        fetchHistory().then();
        fetchSubModules().then();
        setLoadingHistory(false);
    }, [lazyParams, selectedModule, selectedSubModule, selectedUser]);

    const handleResetFilters = () => {
        setSelectedUser('');
        setSelectedModule('');
        setSelectedSubModule('');
    }

    return (
        <div className='flex h-full bg-(--bg-secondary) w-full overflow-hidden'>
            <div className={ `h-full shrink-0 transition-all border-r-2 border-(--border-secondary)
                            ${ displayFilters ? "w-[300px] opacity-100" : "w-0 opacity-0 z-0" } bg-(--bg-primary)` }>
                <div className='border-b border-(--border-secondary) p-4 flex items-center justify-between gap-2'>
                    <h1 className='text-2xl font-bold'>{ t('VERIFIER.filters') }</h1>
                    <span className='cursor-pointer text-(--text-secondary) hover:text-(--color-primary) whitespace-nowrap'
                          onClick={ handleResetFilters }>
                        { t('VERIFIER.erase_filters') }
                    </span>
                </div>
                <div className='flex flex-col h-full overflow-y-auto'>
                    <div className={ `${ open.user ? 'bg-(--bg-secondary)' : '' } border-b border-(--border-secondary)` }>
                        <div className="p-4 cursor-pointer flex items-center justify-between"
                             onClick={ () => setOpen({ ...open, user: !open.user }) }>
                            <div className="flex items-center gap-2">
                                <Package className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold'>{ t('HISTORY.user') }</h3>
                            </div>
                            <ChevronDown
                                size={ 18 }
                                className={ `transition-transform ${ open.user ? "rotate-180" : "" }` }/>
                        </div>

                        { open.user && (
                            <div className='p-4 pt-0'>
                                <Select
                                    
                                    value={ selectedUser.toString() }
                                    id="folder_destination"
                                    className="w-full mb-2"
                                    label={ t('HISTORY.user') }
                                    options={ listUsers.map((user: any) => ({
                                        label: user.lastname + ' ' + user.firstname + ' (' + user.username + ')',
                                        value: user.id.toString()
                                    })) }
                                    onChange={ (value) => setSelectedUser(value.toString()) }
                                />
                            </div>
                        ) }
                    </div>
                    <div className={ `${ open.module ? 'bg-(--bg-secondary)' : '' } border-b border-(--border-secondary)` }>
                        <div className="p-4 cursor-pointer flex items-center justify-between"
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
                                    <div className='flex items-center gap-2 text-(--text-secondary)' key={ module.id }>
                                        <Radio
                                            id={ module.id }
                                            value={ module.id }
                                            checked={ selectedModule === module.id }
                                            onChange={ (e) => {
                                                setSelectedModule(e.target.value);
                                            } }>
                                        </Radio>
                                        <label htmlFor={ module.id } key={ module.id } className='cursor-pointer whitespace-nowrap'>
                                            { module.label }
                                        </label>
                                    </div>
                                )) }
                            </div>
                        ) }
                    </div>
                    <div className={ `${ open.submodule ? 'bg-(--bg-secondary)' : '' } border-b border-(--border-secondary)` }>
                        <div className="p-4 cursor-pointer flex items-center justify-between"
                             onClick={ () => setOpen({ ...open, submodule: !open.submodule }) }>
                            <div className="flex items-center gap-2">
                                <Package className="text-(--color-primary)" size={ 20 }/>
                                <h3 className='text-lg font-semibold whitespace-nowrap'>{ t('HISTORY.submodule') }</h3>
                            </div>
                            <ChevronDown
                                size={ 18 }
                                className={ `transition-transform ${ open.submodule ? "rotate-180" : "" }` }/>
                        </div>

                        { open.submodule && (
                            <div className='p-4 pt-0'>
                                <Select
                                    
                                    value={ selectedSubModule.toString() }
                                    id="folder_destination"
                                    className="w-full mb-2"
                                    label={ t('HISTORY.submodule') }
                                    options={ listSubModules.map((submodule: any) => ({
                                        label: submodule.label,
                                        value: submodule.id.toString()
                                    })) }
                                    onChange={ (value) => setSelectedSubModule(value.toString()) }
                                />
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
                            { t('HISTORY.history') } ({ totalHistory || 0 })
                        </span>
                    </span>
                </div>
                <Table
                    data={ history }
                    pagination={ true }
                    columns={ columns }
                    lazyParams={ lazyParams }
                    loading={ loadingHistory }
                    rowsPerPage={ lazyParams.rows }
                    skeletonRows={ lazyParams.rows }
                    totalRecords={ totalHistory || 0 }
                    rowsPerPageOptions={ [
                            { "value": 4, "label": "4" },
                            { "value": 8, "label": "8" },
                            { "value": 16, "label": "16" },
                            { "value": 32, "label": "32" }
                        ] }
                    emptyMessage={ t("HISTORY.no_history") }
                    onLazyParamsChange={ setLazyParams }
                />
            </div>
        </div>
    );
}