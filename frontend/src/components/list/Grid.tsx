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
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paginator } from "primereact/paginator";

import { Button } from "../Button";
import { Skeleton } from "primereact/skeleton";
import { LazyBase64Image } from "./LazyImage.tsx";

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
};

export function Grid<T extends { id: string }>({
    data,
    columns,
    actions,
    baseLink,
    lazyParams,
    loading = false,
    skeletonRows = 5,
    rowsPerPage = 10,
    paginatorLeftText,
    pagination = false,
    selectedRows = [],
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

    const paginatorLeftData = useMemo(() => {
        return (
            <div className="flex items-center gap-2">
                <span>{ selectedRows.length + " " + paginatorLeftText }</span>
                { actions &&
                    actions.map((action, idx) => (
                        <Button
                            key={ idx }
                            size={ "sm" }
                            variant={ "no_bg_border" }
                            className="p-2 border"
                            onClick={ action.onClick }
                            disabled={ selectedRows.length === 0 }
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
                        className="flex items-center justify-between mt-4 bg-white dark:bg-(--bg-secondary) px-4 rounded-xl text-(--text-secondary) font-normal h-18 mb-4">
                        <Skeleton width='20%'/>
                        <Skeleton width='30%'/>
                    </div>
                ) }
                <div className="grid grid-cols-4 gap-6">
                    { Array.from({ length: skeletonRows }).map((_, idx) => (
                        <div
                            key={ idx }
                            className="border border-(--border-secondary) rounded-xl p-4"
                        >
                            <Skeleton width="100%" height="8rem"/>
                            <Skeleton className="mt-2" width="60%"/>
                            <Skeleton className="mt-2" width="40%"/>
                        </div>
                    )) }
                </div>
            </div>
        );
    }

    return (
        <div>
            { pagination && (
                <div
                    className="flex items-center justify-between mt-4 bg-white dark:bg-(--bg-secondary) px-4 rounded-xl text-(--text-secondary) font-normal mb-4">
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
                        currentPageReportTemplate={
                            "{first} " +
                            t("VERIFIER.to") +
                            " {last} " +
                            t("VERIFIER.of") +
                            " {totalRecords}"
                        }
                    />
                </div>
            ) }
            <div className="flex flex-col gap-4">
                { data.length === 0 ? (
                    <div className="text-center text-(--text-secondary) py-8">
                        { emptyMessage }
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-6">
                        { data.map((row) => (
                            <div
                                key={ row.id }
                                onClick={ () => handleRowClick(row) }
                                className="border border-(--border-secondary) rounded-xl p-4 cursor-pointer bg-[#D0DAD5]"
                            >
                                <div
                                    className=" h-40 mb-4 rounded-lg flex items-center justify-center text-(--text-secondary)">
                                    <LazyBase64Image
                                        alt={ row.id }
                                        document_info={ row }
                                        className="h-full w-full object-cover object-top rounded-t-lg"
                                    />
                                </div>
                                { columns.map((col, idx) => (
                                    <div key={ idx } className="mb-2">
                                        <span className="text-xs text-(--text-secondary)">
                                            { col.header }
                                        </span>
                                        <div className="text-sm">
                                            { col.body ? col.body(row) : (row as any)[col.field!] }
                                        </div>
                                    </div>
                                )) }
                            </div>
                        )) }
                    </div>
                ) }
            </div>
        </div>
    );
}
