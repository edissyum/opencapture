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
import { ChevronsUpDown } from "lucide-react";
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
    actions: any[];
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
    menuModel?: { label: string; icon: string; command: () => void }[];
};

export function Table<T extends { id: string }>({
    data,
    columns,
    actions,
    baseLink,
    menuModel,
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
            <div className='flex items-center gap-2'>
                <span>{ selectedRows.length + " " + paginatorLeftText }</span>
                { actions && actions.map((action, idx) => (
                    <Button
                        key={ idx }
                        size={'sm'}
                        variant={ "no_bg_border" }
                        className='p-2 border'
                        onClick={ action.onClick }
                        disabled={ selectedRows.length === 0 }>
                        { action.icon } { action.label }
                    </Button>
                )) }
            </div>
        )
    }, [selectedRows, paginatorLeftText]);

    if (loading) {
        return (
            <div className="w-full max-h-[70vh] overflow-hidden border border-(--border-secondary) rounded-xl">
                { pagination && (
                    <div className="flex items-center justify-between bg-white dark:bg-(--bg-secondary) px-4 rounded-t-xl text-(--text-secondary) font-normal h-18">
                        <Skeleton width='20%' className='dark:bg-(--text-secondary)'/>
                        <Skeleton width='30%' className='dark:bg-(--text-secondary)'/>
                    </div>
                ) }
                <div className='flex flex-row'>
                    { columns.map((col, i) => (
                        <span key={ i }
                              className="w-1/6 px-5 py-2 text-left font-normal text-(--text-secondary)">
                            <span className='block'>
                                { col.header }
                            </span>
                        </span>
                    )) }
                </div>
                <div className="flex flex-col">
                    { Array.from({ length: skeletonRows }).map((_, idx) => (
                        <div key={ idx }
                             className="flex bg-white dark:bg-(--bg-primary) even:bg-(--bg-secondary) border-b border-(--border-secondary)">
                            { columns.map((_col, ci) => (
                                <span key={ ci } className={ `px-4 py-2 text-sm w-1/6` }>
                                <Skeleton className='dark:bg-(--text-secondary)'/>
                            </span>
                            )) }
                        </div>
                    )) }
                </div>
            </div>
        );
    }

    return (
        <div className='h-[70vh]'>
            { menuModel && (
                <ContextMenu model={ menuModel } className="w-auto!" ref={ cm }/>
            ) }

            <PrimeDataTable
                dataKey="id"
                lazy
                scrollable
                stripedRows
                scrollHeight="flex"
                value={ data }
                rows={ rowsPerPage }
                paginator={ pagination }
                first={ lazyParams.first }
                totalRecords={ totalRecords }
                rowsPerPageOptions={ rowsPerPageOptions }
                sortField={ lazyParams.sortField ?? undefined }
                sortOrder={ lazyParams.sortOrder ?? undefined }
                paginatorPosition={ 'top' }
                paginatorLeft={ paginatorLeftData }
                paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink"
                currentPageReportTemplate={ "{first} " + t('VERIFIER.to') + " {last} " + t('VERIFIER.of') + " {totalRecords}" }
                selection={ selectedRows }
                emptyMessage={ emptyMessage }
                selectionMode={ 'checkbox' }
                onSelectionChange={ (e: any) => {
                    console.log(e)
                    handleSelectionChange(e.value)
                } }
                className="w-full border border-(--border-secondary) rounded-xl"
                contextMenuSelection={ selectedRows }
                onContextMenuSelectionChange={ (e: any) => {
                    handleSelectionChange([e.value]);
                    cm.current?.show(e.originalEvent);
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
                        headerClassName={ `${ col.className } cursor-pointer text-(--text-secondary) font-normal pl-1 pr-1 py-2 border-(--border-secondary)` }
                        bodyClassName={ `${ col.className } cursor-pointer pl-1 pr-1 text-sm py-2` }
                        key={ idx }
                        field={ col.id as string }
                        header={ col.sortable ? <span className='flex items-center'>{ col.header } <ChevronsUpDown
                            size={ 14 } className='ml-1'/></span> : col.header }
                        sortable={ col.sortable }
                        body={ (rowData: any) =>
                            col.body
                                ? col.body({ ...rowData, hoveredRow, setHoveredRow })
                                : rowData[col.field!]
                        }
                    />
                )) }
            </PrimeDataTable>
        </div>
    );
}
