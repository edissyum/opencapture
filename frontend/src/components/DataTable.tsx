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

import React from "react";
import Skeleton from "react-loading-skeleton";

type Column<T> = {
    header: string;
    value?: keyof T; // accès simple à une propriété
    render?: (item: T) => React.ReactNode; // pour custom JSX ou formatage
};

type DataTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    emptyMessage?: string;
    skeletonRows?: number;
};

export function DataTable<T>({
    data,
    columns,
    loading = false,
    emptyMessage = "Aucun élément trouvé",
    skeletonRows = 5,
}: DataTableProps<T>) {
    const safeData = Array.isArray(data) ? data : [];

    if (loading) {
        return (
            <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                <tr>
                    { columns.map((_col, i) => (
                        <th key={ i } className="px-4 py-2 text-left text-sm font-semibold ">
                            <Skeleton width={ 80 }/>
                        </th>
                    )) }
                </tr>
                </thead>
                <tbody>
                { Array.from({ length: skeletonRows }).map((_, idx) => (
                    <tr key={ idx } className="border-t odd:bg-white even:bg-(--bg-secondary)">
                        { columns.map((_col, ci) => (
                            <td key={ ci } className="px-4 py-2 text-sm ">
                                <Skeleton/>
                            </td>
                        )) }
                    </tr>
                )) }
                </tbody>
            </table>
        );
    }

    if (!safeData || safeData.length === 0) {
        return <p className="text-gray-400 italic">{ emptyMessage }</p>;
    }

    return (
        <table className="w-full border border-gray-200">
            <thead className="bg-white">
                <tr>
                    { columns.map((col, i) => (
                        <th key={ i } className="px-4 py-2 text-left font-normal text-(--text-secondary)">
                            { col.header }
                        </th>
                    )) }
                </tr>
            </thead>
            <tbody>
                { safeData.map((item, idx) => (
                    <tr key={ idx } className="border-t hover:bg-gray-50 odd:bg-white even:bg-(--bg-secondary)">
                        { columns.map((col, ci) => (
                            <td key={ ci } className="px-4 py-2">
                                {
                                    col.render ? col.render(item) : col.value ? (item[col.value] as React.ReactNode) : null
                                }
                            </td>
                        )) }
                    </tr>
                )) }
            </tbody>
        </table>
    );
}