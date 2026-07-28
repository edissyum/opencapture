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

import { useNavigate } from "react-router-dom";
import React, { useMemo, useState } from "react";
import { ChevronRight, ChevronsUpDown, EllipsisVertical } from "lucide-react";
import { ActionIcon, Menu, Skeleton, Table as MantineTable } from "@mantine/core";

import { Button } from "../Button";
import { Checkbox } from "../Checkbox";

import { Paginator } from "./Paginator";

type Column<T> = {
    id: string | undefined;
    header: string;
    field?: string;
    sortable?: boolean;
    className?: string;
    body?: (item: T) => React.ReactNode;
};

type DataTableProps<T> = {
    data: T[];
    actions?: any[];
    height?: string;
    baseLink?: string;
    loading?: boolean;
    selectedRows?: T[];
    rowsPerPage?: number;
    pagination?: boolean;
    columns: Column<T>[];
    totalRecords?: number;
    emptyMessage?: string;
    skeletonRows?: number;
    paginatorLeftText?: string;
    checkboxSelection?: boolean;
    rowsPerPageOptions?: { value: any; label: string }[];
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

export function Table<T extends { id: string }>({
    data,
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
    checkboxSelection = false,
    totalRecords = data.length,
    rowsPerPageOptions = [
        { "value": 10, "label": "10" },
        { "value": 20, "label": "20" },
        { "value": 50, "label": "50" }
    ],
    emptyMessage = "Aucun élément trouvé",
    onSelectionChange,
    onLazyParamsChange
}: DataTableProps<T>) {
    const navigate = useNavigate();

    const [_, setSelectedRows] = useState<T[]>([]);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const handleSelectionChange = (rows: T[]) => {
        setSelectedRows(rows);
        if (onSelectionChange) onSelectionChange(rows);
    };

    const handleRowClick = (row: T) => {
        if (baseLink) {
            navigate(baseLink + row.id);
        }
    };

    const onSelect = (checked: boolean, id?: string) => {
        let newSelectedRows = [...selectedRows];
        if (checked) {
            const found = data.find(d => d.id === id);
            if (found) newSelectedRows.push(found);
        } else {
            newSelectedRows = newSelectedRows.filter(r => r.id !== id);
        }
        handleSelectionChange(newSelectedRows);
    };

    const selectAll = () => {
        handleSelectionChange(selectedRows.length === data.length ? [] : data);
    };

    const handleMenuClose = () => {
        setSelectedRows([]);
        onSelectionChange && onSelectionChange([]);
    };

    const handleSort = (fieldId: string) => {
        const newSortOrder: 1 | -1 = lazyParams.sortField === fieldId && lazyParams.sortOrder === 1 ? -1 : 1;
        onLazyParamsChange({
            ...lazyParams,
            sortField: fieldId,
            sortOrder: newSortOrder,
        });
    };

    const renderMenuItems = (items: any[]) => items.map((item: any, index: number) => (
        item.items && item.items.length > 0 ? (
            <Menu.Sub key={ index }>
                <Menu.Sub.Target>
                    <Menu.Sub.Item
                        leftSection={ item.icon }
                        closeMenuOnClick={ false }
                        rightSection={ <ChevronRight size={ 14 }/> }
                        onClick={ (e: React.MouseEvent) => e.stopPropagation() }
                    >
                        { item.label }
                    </Menu.Sub.Item>
                </Menu.Sub.Target>
                <Menu.Sub.Dropdown>
                    { renderMenuItems(item.items) }
                </Menu.Sub.Dropdown>
            </Menu.Sub>
        ) : (
            <Menu.Item
                key={ index }
                leftSection={ item.icon }
                onClick={ (e: React.MouseEvent) => {
                    e.stopPropagation();
                    item.command?.(e);
                } }
            >
                { item.label }
            </Menu.Item>
        )
    ));

    const paginatorLeftData = useMemo(() => {
        return (
            <div className='flex items-center gap-4'>
                { paginatorLeftText && (
                    <span>{ selectedRows.length + " " + paginatorLeftText }</span>
                ) }
                { actions && paginatorLeftText && actions.map((action, idx) => (
                    <Button
                        size='sm'
                        key={ idx }
                        variant="no_bg_border"
                        className='p-2 border gap-1'
                        onClick={ action.command }
                        disabled={ selectedRows.length === 0 || action.disabled }>
                        { action.icon } { action.label }
                    </Button>
                )) }
            </div>
        )
    }, [selectedRows, paginatorLeftText]);

    if (loading) {
        return (
            <div className='flex-1 overflow-hidden flex flex-col rounded-lg'>
                <div className={ `w-full overflow-hidden border border-(--border-secondary) rounded-md` }>
                    { pagination && (
                        <div
                            className="flex items-center justify-between bg-(--bg-primary) px-4 rounded-t-md text-(--text-secondary) font-normal h-15">
                            <Skeleton width='20%' className='dark:bg-(--bg-secondary)! h-3!'/>
                            <Skeleton width='30%' className='dark:bg-(--bg-secondary)! h-3!'/>
                        </div>
                    ) }
                    <div className='flex flex-row p-3 bg-(--bg-primary) border-y border-(--border-secondary)'>
                        { columns.map((col, i) => (
                            <span key={ i }
                                  className={ `${ col.className || 'flex-1' } ml-3 text-left font-bold text-(--text-secondary)` }>
                                <span className='block'>
                                    { col.header }
                                </span>
                            </span>
                        )) }
                    </div>
                    <div className="flex flex-col">
                        { Array.from({ length: skeletonRows }).map((_, idx) => (
                            <div key={ idx }
                                 className="flex p-6 gap-4 bg-(--bg-secondary) even:bg-(--bg-primary) border-b border-(--border-secondary)">
                                { columns.map((col, ci) => (
                                    <span key={ ci } className={ `${ col.className?.replace('p-', '') || 'flex-1' } text-sm` }>
                                        <Skeleton className='dark:bg-(--bg-secondary)! h-3!'/>
                                    </span>
                                )) }
                            </div>
                        )) }
                    </div>
                </div>
            </div>
        );
    }

    const colSpan = columns.length + (checkboxSelection ? 1 : 0) + (actions && actions.length > 0 ? 1 : 0);

    return (
        <div className='border border-(--border-secondary) rounded-lg overflow-hidden w-full flex flex-col'>
            { pagination && (
                <div className="flex items-center justify-between bg-(--bg-primary) px-4 border-b
                                border-(--border-secondary) text-(--text-secondary) font-normal">
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
            <div className='flex-1 overflow-auto'>
                <MantineTable stickyHeader className={ `w-full ${ !baseLink && 'no_hover' }` }>
                    <MantineTable.Thead>
                        <MantineTable.Tr>
                            { checkboxSelection && (
                                <MantineTable.Th className="max-w-5 w-5 leading-0">
                                    <Checkbox
                                        indeterminate={ selectedRows.length > 0 && selectedRows.length !== data.length }
                                        checked={ data.length > 0 && selectedRows.length === data.length }
                                        onChange={ selectAll }
                                    />
                                </MantineTable.Th>
                            ) }

                            { columns.map((col, idx) => (
                                <MantineTable.Th
                                    key={ idx }
                                    onClick={ () => col.sortable && handleSort(col.id as string) }
                                    className={ `${ col.className } ${ col.sortable ? 'cursor-pointer' : 'cursor-auto' }
                                                text-(--text-secondary) font-normal pl-1 pr-1 py-2 border-(--border-secondary)
                                                ${ col.sortable && lazyParams.sortField === col.id ? 'text-(--color-primary)!' : '' }` }
                                >
                                    { col.sortable ? (
                                        <span className='flex items-center'>
                                            { col.header }
                                            <ChevronsUpDown size={ 14 } className='ml-1'/>
                                        </span>
                                    ) : col.header }
                                </MantineTable.Th>
                            )) }

                            { actions && actions.length > 0 && (
                                <MantineTable.Th className="w-10"/>
                            ) }
                        </MantineTable.Tr>
                    </MantineTable.Thead>
                    <MantineTable.Tbody>
                        { data.length === 0 ? (
                            <MantineTable.Tr>
                                <MantineTable.Td colSpan={ colSpan } className="text-center py-8 text-(--text-secondary)">
                                    { emptyMessage }
                                </MantineTable.Td>
                            </MantineTable.Tr>
                        ) : data.map((row) => (
                            <MantineTable.Tr
                                key={ row.id }
                                onClick={ () => handleRowClick(row) }
                                onMouseEnter={ () => setHoveredRow(row.id) }
                                onMouseLeave={ () => setHoveredRow(null) }
                                className={ `${ checkboxSelection || baseLink ? 'cursor-pointer' : 'cursor-auto' }
                                            ${ selectedRows.some(r => r.id === row.id) ? 'bg-(--bg-selected)! text-(--color-primary)!' : '' }` }
                            >
                                { checkboxSelection && (
                                    <MantineTable.Td
                                        className='leading-0'
                                        onClick={ (e) => {
                                            e.stopPropagation();
                                            onSelect(!selectedRows.some(r => r.id === row.id), row.id);
                                        } }
                                    >
                                        <Checkbox
                                            id={ row.id }
                                            checked={ selectedRows.some(r => r.id === row.id) }
                                            onChange={ (checked: boolean, id: string | undefined) => onSelect(checked, id) }
                                        />
                                    </MantineTable.Td>
                                ) }

                                { columns.map((col, ci) => (
                                    <MantineTable.Td key={ ci } className={ `${ col.className } pl-1 pr-1 text-sm py-2` }>
                                        { col.body
                                            ? col.body({ ...row, hoveredRow, setHoveredRow } as any)
                                            : (row as any)[col.field!] }
                                    </MantineTable.Td>
                                )) }

                                { actions && actions.length > 0 && (
                                    <MantineTable.Td className="pl-0! pr-0! text-sm" onClick={ (e) => e.stopPropagation() }>
                                        <Menu position="bottom-end" withinPortal onClose={ handleMenuClose }>
                                            <Menu.Target>
                                                <ActionIcon
                                                    variant="transparent"
                                                    onClick={ (e: any) => {
                                                        e.stopPropagation();
                                                        handleSelectionChange([row]);
                                                    } }
                                                >
                                                    <EllipsisVertical className='text-(--text-primary)' size={ 18 }/>
                                                </ActionIcon>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                { actionsLine && renderMenuItems(actionsLine(selectedRows[0])) }
                                            </Menu.Dropdown>
                                        </Menu>
                                    </MantineTable.Td>
                                ) }
                            </MantineTable.Tr>
                        )) }
                    </MantineTable.Tbody>
                </MantineTable>
            </div>
        </div>
    );
}
