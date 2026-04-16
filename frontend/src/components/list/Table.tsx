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
import { ChevronsUpDown, EllipsisVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useMemo, useRef, useState } from "react";

import { Button } from "../Button";

import { Skeleton } from "primereact/skeleton";
import { ContextMenu } from "primereact/contextmenu";
import { Column as PrimeColumn } from "primereact/column";
import { DataTable as PrimeDataTable } from "primereact/datatable";

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

export function Table<T extends { id: string }>({
    data,
    columns,
    actions,
    baseLink,
    actionsLine,
    lazyParams,
    loading = false,
    skeletonRows = 5,
    rowsPerPage = 10,
    paginatorLeftText,
    pagination = false,
    selectedRows = [],
    checkboxSelection = false,
    totalRecords = data.length,
    rowsPerPageOptions = [10, 20, 50],
    emptyMessage = "Aucun élément trouvé",
    onSelectionChange,
    onLazyParamsChange
}: DataTableProps<T>) {
    const navigate = useNavigate();

    const [_, setSelectedRows] = useState<T[]>([]);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const cm = useRef({ current: null } as any);

    const handleSelectionChange = (rows: T[]) => {
        setSelectedRows(rows);
        if (onSelectionChange) onSelectionChange(rows);
    };

    const handleRowClick = (e: any) => {
        if (baseLink) {
            navigate(baseLink + e.data.id);
        }
    }

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
                        className='p-2 border gap-1'
                        variant={ "no_bg_border" }
                        onClick={ action.command }
                        disabled={ selectedRows.length === 0 }>
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

    return (
        <div className='border border-(--border-secondary) rounded-lg overflow-hidden w-full flex flex-col'>
            { actionsLine && (
                <ContextMenu model={ actionsLine(selectedRows[0]) } ref={ cm }/>
            ) }
            <div className='flex-1 overflow-auto'>
                <PrimeDataTable
                    lazy
                    scrollable
                    stripedRows
                    dataKey="id"
                    value={ data }
                    scrollHeight="flex"
                    rows={ rowsPerPage }
                    paginator={ pagination }
                    first={ lazyParams.first }
                    paginatorPosition={ 'top' }
                    totalRecords={ totalRecords }
                    paginatorLeft={ paginatorLeftData }
                    rowsPerPageOptions={ rowsPerPageOptions }
                    sortField={ lazyParams.sortField ?? undefined }
                    sortOrder={ lazyParams.sortOrder ?? undefined }
                    paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink"
                    currentPageReportTemplate={ "{first} " + t('VERIFIER.to') + " {last} " + t('VERIFIER.of') + " {totalRecords}" }
                    selection={ selectedRows }
                    emptyMessage={ emptyMessage }
                    selectionMode={ 'checkbox' }
                    onSelectionChange={ (e: any) => {
                        handleSelectionChange(e.value)
                    } }
                    className={ `w-full ${ !baseLink ? 'no_hover' : '' }` }
                    contextMenuSelection={ selectedRows }
                    onContextMenuSelectionChange={ (e: any) => {
                        handleSelectionChange([e.value]);
                        if (actionsLine) {
                            cm.current?.show(e.originalEvent);
                        }
                    } }
                    onPage={ (e) =>
                        onLazyParamsChange({
                            ...lazyParams,
                            first: e.first,
                            rows: e.rows,
                            page: e.page,
                        })
                    }
                    onSort={ (e) =>
                        onLazyParamsChange({
                            ...lazyParams,
                            sortField: e.sortField,
                            sortOrder: e.sortOrder,
                        })
                    }
                    onRowClick={ (e) => {
                        handleRowClick(e);
                    } }
                >
                    { checkboxSelection && (
                        <PrimeColumn
                            headerClassName="max-w-16 w-16 text-(--text-secondary) font-normal border-(--border-secondary)! py-0!"
                            bodyClassName="pl-4! pr-1! text-sm py-1!"
                            selectionMode="multiple"/>
                    ) }

                    { columns.map((col, idx) => (
                        <PrimeColumn
                            headerClassName={ `${ col.className } ${ checkboxSelection ? 'cursor-pointer' : 'cursor-auto' } text-(--text-secondary) font-normal pl-1 pr-1 py-2 border-(--border-secondary)` }
                            bodyClassName={ `${ col.className } ${ checkboxSelection || baseLink ? 'cursor-pointer' : 'cursor-auto' } pl-1 pr-1 text-sm py-2` }
                            key={ idx }
                            field={ col.id as string }
                            header={
                                col.sortable ? <span className='flex items-center'>{ col.header }
                                    <ChevronsUpDown size={ 14 } className='ml-1'/></span> : col.header
                            }
                            sortable={ col.sortable }
                            body={ (rowData: any) =>
                                col.body
                                    ? col.body({ ...rowData, hoveredRow, setHoveredRow })
                                    : rowData[col.field!]
                            }
                        />
                    )) }

                    {
                        actions && actions.length > 0 && (
                            <PrimeColumn
                                bodyClassName="pl-0! pr-0! text-sm"
                                body={ (rowData: any) => (
                                    <div className='cursor-pointer' onClick={ (e) => {
                                        e.stopPropagation();
                                        handleSelectionChange([rowData]);
                                        cm.current?.show(e);
                                    } }>
                                        <EllipsisVertical size={ 18 }/>
                                    </div>
                                ) }
                            />
                        )
                    }
                </PrimeDataTable>
            </div>
        </div>
    );
}
