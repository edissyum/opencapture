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
import { useNavigate } from "react-router-dom";
import { EllipsisVertical } from "lucide-react";
import React, { useMemo, useState } from "react";
import { ActionIcon, Menu, Skeleton } from '@mantine/core';

import { Button } from "../Button";
import { Checkbox } from "../Checkbox";

import { Paginator } from "./Paginator";
import { renderMenuItems } from "./Table";
import { LazyBase64Image } from "./LazyImage";

type Column<T> = {
    id: string | undefined;
    header: string;
    field?: string;
    className?: string;
    body?: (item: T) => React.ReactNode;
};

type CardListProps<T> = {
    data: T[];
    actions: any[];
    module: string;
    baseLink?: string;
    loading?: boolean;
    rowsPerPage?: number;
    pagination?: boolean;
    columns: Column<T>[];
    totalRecords?: number;
    emptyMessage?: string;
    skeletonRows?: number;
    selectedRows?: T[];
    filtersChanged?: boolean;
    rowsPerPageOptions?: any;
    paginatorLeftText: string;
    onSelectionChange?: (selected: T[]) => void;
    lazyParams: {
        first: number;
        rows: number;
        page: number;
        sortField: string | null;
        sortOrder: 1 | -1 | null;
    };
    onLazyParamsChange: (params: any) => void;
    actionsLine?: any;
};

export function Grid<T extends { id: string }>({
    data,
    module,
    columns,
    actions,
    baseLink,
    actionsLine,
    lazyParams,
    loading = false,
    skeletonRows = 5,
    paginatorLeftText,
    selectedRows = [],
    pagination = false,
    filtersChanged = false,
    totalRecords = data.length,
    rowsPerPageOptions = [
        { "value": 10, "label": "10" },
        { "value": 20, "label": "20" },
        { "value": 50, "label": "50" }
    ],
    emptyMessage = "Aucun élément trouvé",
    onSelectionChange,
    onLazyParamsChange
}: CardListProps<T>) {
    const navigate = useNavigate();
    const [_, setSelectedRows] = useState<T[]>([]);

    const handleRowClick = (row: T) => {
        if (baseLink) {
            navigate(baseLink + row.id);
        }
    };

    const onSelect = (checked: boolean, id?: string) => {
        let newSelectedRows = [...selectedRows];
        if (checked) {
            newSelectedRows.push(data.find(d => d.id === id)!);
        } else {
            newSelectedRows = newSelectedRows.filter(r => r.id !== id);
        }
        setSelectedRows(newSelectedRows);
        onSelectionChange && onSelectionChange(newSelectedRows);
    }

    const selectAll = () => {
        let newSelectedRows: T[];
        if (selectedRows.length === data.length) {
            newSelectedRows = [];
        } else {
            newSelectedRows = data;
        }
        setSelectedRows(newSelectedRows);
        onSelectionChange && onSelectionChange(newSelectedRows);
    };

    const handleMenuClose = () => {
        setSelectedRows([]);
        onSelectionChange && onSelectionChange([]);
    }

    const paginatorLeftData = useMemo(() => {
        return (
            <div className="flex items-center gap-4">
                <span className="flex" data-tooltip-id="tooltip" data-tooltip-content={ t('GLOBAL.select_all') }>
                    <Checkbox label={ selectedRows.length + " " + paginatorLeftText }
                              indeterminate={ selectedRows.length !== data.length }
                              checked={ selectedRows.length !== 0 } onChange={ selectAll }/>
                </span>
                { actions &&
                    actions.map((action, idx) => (
                        <Button
                            size="sm"
                            key={ idx }
                            variant="no_bg_border"
                            className="p-2 border"
                            onClick={ action.command }
                            disabled={ selectedRows.length === 0 || action.disabled }
                        >
                            { action.icon } { action.label }
                        </Button>
                    )) }
            </div>
        );
    }, [selectedRows, paginatorLeftText, actions]);

    if (loading) {
        return (
            <div>
                { pagination && (
                    <div
                        className="flex items-center justify-between mt-4 bg-(--bg-primary) px-4 rounded-lg text-(--text-secondary) font-normal h-18 mb-4">
                        <Skeleton width='20%' height={ 17 } className='dark:bg-(--bg-secondary)!'/>
                        <Skeleton width='30%' height={ 17 } className='dark:bg-(--bg-secondary)!'/>
                    </div>
                ) }
                <div className="grid grid-cols-4 gap-6">
                    { Array.from({ length: skeletonRows }).map((_, idx) => (
                        <div key={ idx }
                             className="border border-(--border-secondary) rounded-lg p-4">
                            <Skeleton width="100%" height="8rem" className='dark:bg-(--text-secondary)!'/>
                            <Skeleton className="dark:bg-(--bg-secondary)! mt-2" width="60%" height={ 12 }/>
                            <Skeleton className="dark:bg-(--bg-secondary)! mt-2" width="40%" height={ 12 }/>
                        </div>
                    )) }
                </div>
            </div>
        );
    }

    return (
        <>
            { pagination && (
                <div className="flex items-center justify-between bg-(--bg-primary) px-4 rounded-lg font-normal
                                text-(--text-secondary)">
                    { paginatorLeftData }
                    <Paginator
                        first={ lazyParams.first }
                        rows={ lazyParams.rows }
                        totalRecords={ totalRecords }
                        rowsPerPageOptions={ rowsPerPageOptions }
                        onChange={ (params) => onLazyParamsChange({ ...lazyParams, ...params }) }
                    />
                </div>
            ) }
            { data.length === 0 ? (
                <div className="text-center text-(--text-secondary) py-8 pt-4">
                    { emptyMessage }
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-4 overflow-y-auto pt-4">
                    { data.map((row) => (
                        <div key={ row.id }
                             onClick={ () => handleRowClick(row) }
                             className={ `rounded-md group cursor-pointer bg-(--bg-primary)
                                          ${ selectedRows.some(r => r.id === row.id) ? 'border-(--color-primary)' : '' }` }>
                            <div
                                className={`relative bg-[#D0DAD5] dark:bg-(--bg-secondary) border border-b-0 transition-colors
                                           border-(--border-secondary) group-hover:border-(--text-secondary) rounded-b-none
                                           w-full p-6 pb-0 rounded-md flex items-center justify-center text-(--text-secondary)
                                           ${ filtersChanged && 'border-2 border-(--color-primary)' }`}>
                                <LazyBase64Image
                                    alt={ row.id }
                                    module={ module }
                                    document_info={ row }
                                    className="object-cover object-top rounded-t-lg"
                                />
                                <Checkbox
                                    id={ row.id }
                                    className="absolute top-3 left-3"
                                    checked={ selectedRows.some(r => r.id === row.id) }
                                    onChange={ (checked: boolean, id: string | undefined) => onSelect(checked, id) }
                                />
                            </div>
                            <div className={`py-3 border border-t-0 rounded-md rounded-t-none transition-colors
                                           border-(--border-secondary) group-hover:border-(--text-secondary)
                                           ${ filtersChanged && 'border-2 border-(--color-primary)' }`}>
                                <div className="flex gap-2 mb-1 pl-4">
                                    { columns.filter(col => col.id === 'nb_pages').map((col) => (
                                        <div key={ col.id }>
                                            { col.body ? col.body(row) : (row as any)[col.field!] }
                                        </div>
                                    )) }
                                    { columns.filter(col => module === 'verifier' ? col.id === 'name' : col.id === 'filename').map((col) => (
                                        <div key={ col.id } className='truncate'>
                                            { col.body ? col.body(row) : (row as any)[col.field!] }
                                        </div>
                                    )) }
                                    <div className="ml-auto">
                                        { actionsLine && (
                                            <Menu position="bottom-end" withinPortal onClose={ handleMenuClose }>
                                                <Menu.Target>
                                                    <ActionIcon
                                                        className='mr-0!'
                                                        variant="transparent"
                                                        onClick={ (e: any) => {
                                                            e.stopPropagation();
                                                            setSelectedRows([row]);
                                                            onSelectionChange && onSelectionChange([row]);
                                                        } }
                                                    >
                                                        <EllipsisVertical className='text-(--text-primary)' size={ 18 }/>
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    { actionsLine && renderMenuItems(actionsLine(selectedRows[0])) }
                                                </Menu.Dropdown>
                                            </Menu>
                                        ) }
                                    </div>
                                </div>

                                { columns.filter(col => ![module === 'verifier' ? 'name' : 'filename', 'thumbnail', 'nb_pages'].includes(col.id as string)).map((col) => (
                                    <div key={ col.id } className="text-sm mb-1 truncate px-4">
                                        <span className="text-(--text-secondary) mr-1">
                                            { col.header } :
                                        </span>
                                        <span>
                                            { col.body ? col.body(row) : (row as any)[col.field!] }
                                        </span>
                                    </div>
                                )) }
                            </div>
                        </div>
                    )) }
                </div>
            ) }
        </>
    );
}
