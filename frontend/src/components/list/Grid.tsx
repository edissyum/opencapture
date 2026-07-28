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
import React, { useMemo, useState } from "react";
import { ActionIcon, Menu, Skeleton } from '@mantine/core';

import { Paginator } from "primereact/paginator";

import { Button } from "../Button";
import { Checkbox } from "../Checkbox";

import { LazyBase64Image } from "./LazyImage";
import { EllipsisVertical } from "lucide-react";

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
    paginatorLeftText: string;
    rowsPerPageOptions?: number[];
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
    rowsPerPage = 10,
    paginatorLeftText,
    selectedRows = [],
    pagination = false,
    totalRecords = data.length,
    rowsPerPageOptions = [10, 20, 50],
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
                            key={ idx }
                            size={ "sm" }
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
                <div className="flex items-center justify-between bg-(--bg-primary) px-4 rounded-lg
                                text-(--text-secondary) font-normal">
                    { paginatorLeftData }
                    <Paginator
                        rows={ rowsPerPage }
                        first={ lazyParams.first }
                        totalRecords={ totalRecords }
                        rowsPerPageOptions={ rowsPerPageOptions }
                        onPageChange={ (e) =>
                            onLazyParamsChange({
                                ...lazyParams,
                                first: e.first,
                                rows: e.rows,
                                page: e.page,
                            })
                        }
                        template="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink"
                        currentPageReportTemplate={ "{first} " + t("VERIFIER.to") + " {last} " + t("VERIFIER.of") + " {totalRecords}" }
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
                                className="relative bg-[#D0DAD5] dark:bg-(--bg-secondary) border border-b-0 transition-colors
                                           border-(--border-secondary) group-hover:border-(--text-secondary) rounded-b-none
                                           w-full p-6 pb-0 rounded-md flex items-center justify-center text-(--text-secondary)">
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
                            <div className='px-6 py-3 border border-t-0 rounded-md rounded-t-none transition-colors
                                           border-(--border-secondary) group-hover:border-(--text-secondary)'>
                                <div className="flex gap-2 mb-1">
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
                                    <div className="ml-auto -mr-2.5">
                                        { actionsLine && (
                                            <Menu position="bottom-end" withinPortal onClose={ handleMenuClose }>
                                                <Menu.Target>
                                                    <ActionIcon
                                                        className='mr-0!'
                                                        variant="transparent"
                                                        onClick={ (e: any) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setSelectedRows([row]);
                                                            onSelectionChange && onSelectionChange([row]);
                                                        } }
                                                    >
                                                        <EllipsisVertical
                                                            size={ 20 }
                                                            className='text-(--text-primary) hover:text-(--color-primary)'
                                                        />
                                                    </ActionIcon>
                                                </Menu.Target>

                                                <Menu.Dropdown>
                                                    { actionsLine(selectedRows[0]).map((item: any, index: number) => (
                                                        <Menu.Item key={ index } leftSection={ item.icon }
                                                                   onClick={ (e: React.MouseEvent) => {
                                                                       e.stopPropagation();
                                                                       item.command(e);
                                                                   } }>
                                                            { item.label }
                                                        </Menu.Item>
                                                    )) }
                                                </Menu.Dropdown>
                                            </Menu>
                                        ) }
                                    </div>
                                </div>

                                { columns.filter(col => ![module === 'verifier' ? 'name' : 'filename', 'thumbnail', 'nb_pages'].includes(col.id as string)).map((col) => (
                                    <div key={ col.id } className="text-sm mb-1 truncate">
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
