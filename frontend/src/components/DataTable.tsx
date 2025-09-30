import React, { useState } from "react";
import { t } from "i18next";
import { DataTable as PrimeDataTable } from "primereact/datatable";
import { Column as PrimeColumn } from "primereact/column";
import { Checkbox } from "./Checkbox";
import { Skeleton } from "primereact/skeleton";
import { ChevronsUpDown } from "lucide-react";

type Column<T> = {
    header: string;
    field?: keyof T;
    sortable?: boolean;
    body?: (item: T) => React.ReactNode;
};

type DataTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    emptyMessage?: string;
    skeletonRows?: number;
    checkboxSelection?: boolean;
    onSelectionChange?: (selected: T[]) => void;
};

export function DataTable<T extends { id: string }>({
                                                        data,
                                                        columns,
                                                        loading = false,
                                                        emptyMessage = "Aucun élément trouvé",
                                                        skeletonRows = 5,
                                                        checkboxSelection = false,
                                                        onSelectionChange,
                                                    }: DataTableProps<T>) {
    const [selectedRows, setSelectedRows] = useState<T[]>([]);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const handleSelectionChange = (rows: T[]) => {
        setSelectedRows(rows);
        if (onSelectionChange) onSelectionChange(rows);
    };

    if (loading) {
        return (
            <div>
                <div className='p-4'>
                    <Checkbox label={ t('VERIFIER.select_all') }/>
                </div>
                <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-white">
                    <tr>
                        { columns.map((col, i) => (
                            <th key={ i }
                                className="px-4 py-2 text-left font-normal text-(--text-secondary) border-b border-(--border-secondary)">
                                <span className='flex items-center gap-0.5 cursor-pointer'>
                                    { col.header } { col.header && (<ChevronsUpDown size={ 15 }/>) }
                                </span>
                            </th>
                        )) }
                    </tr>
                    </thead>
                    <tbody>
                    { Array.from({ length: skeletonRows }).map((_, idx) => (
                        <tr key={ idx }
                            className="even:bg-white odd:bg-(--bg-secondary) border-b border-(--border-secondary)">
                            { columns.map((_col, ci) => (
                                <td key={ ci } className="px-4 py-2 text-sm ">
                                    <Skeleton/>
                                </td>
                            )) }
                        </tr>
                    )) }
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <>
            { checkboxSelection && (
                <>
                    <div className="p-4 border-b border-gray-200">
                        <Checkbox
                            label={ selectedRows.length + ' ' + t("VERIFIER.selected") }
                            checked={ selectedRows.length === data.length && data.length > 0 }
                            onChange={ (checked) => setSelectedRows(checked ? [...data] : []) }/>
                    </div>
                </>
            ) }

            <PrimeDataTable
                dataKey="id"
                stripedRows
                value={ data }
                selection={ selectedRows }
                emptyMessage={ emptyMessage }
                selectionMode={ checkboxSelection ? "checkbox" : undefined }
                onSelectionChange={ (e: any) => handleSelectionChange(e.value) }
                className="w-full border border-(--border-secondary) rounded-lg"
            >
                { checkboxSelection && (
                    <PrimeColumn
                        header=""
                        body={(rowData: T) =>
                            (
                                <Checkbox
                                    checked={selectedRows.findIndex(r => r.id === rowData.id) > -1}
                                    onChange={(checked) => {
                                        if (checked) {
                                            setSelectedRows([...selectedRows, rowData]);
                                        } else {
                                            setSelectedRows(selectedRows.filter((r) => r.id !== rowData.id));
                                        }
                                    }}
                                />
                            )
                        }
                    />
                ) }
                { columns.map((col, idx) => (
                    <PrimeColumn
                        headerClassName="text-left font-semibold px-4 py-1!"
                        bodyClassName="px-4 py-2 text-sm"
                        key={ idx }
                        field={ col.field as string }
                        header={ col.header }
                        sortable={ col.sortable }
                        body={ (rowData: any) =>
                            col.body
                                ? col.body({ ...rowData, hoveredRow, setHoveredRow })
                                : rowData[col.field!]
                        }
                    />
                )) }
            </PrimeDataTable>
        </>
    );
}
