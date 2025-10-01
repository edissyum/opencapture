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
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Skeleton } from "primereact/skeleton";
import { Column as PrimeColumn } from "primereact/column";
import { DataTable as PrimeDataTable } from "primereact/datatable";
import { ChevronsUpDown } from "lucide-react";

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
    baseLink?: string;
    loading?: boolean;
    rowsPerPage?: number;
    pagination?: boolean;
    columns: Column<T>[];
    totalRecords?: number;
    emptyMessage?: string;
    skeletonRows?: number;
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
};

export function DataTable<T extends { id: string }>({
    data,
    columns,
    baseLink,
    lazyParams,
    loading = false,
    skeletonRows = 5,
    rowsPerPage = 10,
    paginatorLeftText,
    pagination = false,
    checkboxSelection = false,
    totalRecords = data.length,
    rowsPerPageOptions = [10, 20, 50],
    emptyMessage = "Aucun élément trouvé",
    onSelectionChange,
    onLazyParamsChange
}: DataTableProps<T>) {

    const [selectedRows, setSelectedRows] = useState<T[]>([]);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const navigate = useNavigate();
    const handleSelectionChange = (rows: T[]) => {
        setSelectedRows(rows);
        if (onSelectionChange) onSelectionChange(rows);
    };

    const handleRowClick = (e: any) => {
        if (baseLink) {
            navigate(baseLink + e.data.id);
        }
    }

    if (loading) {
        return (
            <div className="w-full max-h-[70vh] overflow-hidden border border-(--border-secondary) rounded-xl">
                <div className='flex items-center gap-20 border-b border-(--border-secondary) h-18'/>
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
                             className="flex odd:bg-white even:bg-(--bg-secondary) border-b border-(--border-secondary)">
                            { columns.map((_col, ci) => (
                                <span key={ ci } className={ `px-4 py-2 text-sm w-1/6` }>
                                <Skeleton/>
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
            <PrimeDataTable
                dataKey="id"
                lazy
                scrollable
                scrollHeight="flex"
                onRowClick={ (e) => {
                    handleRowClick(e);
                } }
                totalRecords={ totalRecords }
                stripedRows
                value={ data }
                paginator={ pagination }
                first={ lazyParams.first }
                rows={ rowsPerPage }
                sortField={ lazyParams.sortField ?? undefined }
                sortOrder={ lazyParams.sortOrder ?? undefined }
                rowsPerPageOptions={ rowsPerPageOptions }
                paginatorPosition={ 'top' }
                paginatorLeft={ <span> { selectedRows.length + ' ' + paginatorLeftText } </span> }
                paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink NextPageLink"
                currentPageReportTemplate={ "{first} " + t('VERIFIER.to') + " {last} " + t('VERIFIER.of') + " {totalRecords}" }
                selection={ selectedRows }
                emptyMessage={ emptyMessage }
                selectionMode={ 'checkbox' }
                onSelectionChange={ (e: any) => handleSelectionChange(e.value) }
                className="w-full border border-(--border-secondary) rounded-xl"
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
            >
                { checkboxSelection && (
                    <PrimeColumn
                        headerClassName="max-w-16 w-16 text-(--text-secondary)! font-normal! border-(--border-secondary)! py-0!"
                        bodyClassName="pl-4! pr-1! text-sm py-1!"
                        selectionMode="multiple"/>
                ) }

                { columns.map((col, idx) => (
                    <PrimeColumn
                        headerClassName={ `${ col.className } cursor-pointer! text-(--text-secondary)! font-normal! pl-1! pr-1! py-2! border-(--border-secondary)!` }
                        bodyClassName={ `${ col.className } cursor-pointer! pl-1! pr-1! text-sm py-2! ` }
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
