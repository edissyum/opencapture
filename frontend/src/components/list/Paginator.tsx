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
import { Pagination } from '@mantine/core';

import { Select } from "../Select";

type PaginatorProps = {
    first: number;
    rows: number;
    totalRecords: number;
    rowsPerPageOptions: { value: any; label: string }[];
    onChange: (params: { first: number; rows: number; page: number }) => void;
};

export function Paginator({ first, rows, totalRecords, rowsPerPageOptions, onChange }: PaginatorProps) {
    return (
        <div className="flex items-center gap-4 p-2.5">
            <div className='w-16'>
                <Select
                    id="rowsPerPage"
                    value={ String(rows) }
                    options={ rowsPerPageOptions }
                    onChange={ (value) => {
                        if (!value) return;
                        onChange({ rows: Number(value), first: 0, page: 0 });
                    } }
                />
            </div>

            <span>
                { totalRecords === 0 ? 0 : first + 1 } { t("VERIFIER.to") } { Math.min(first + rows, totalRecords) } { t("VERIFIER.of") } { totalRecords }
            </span>
            <Pagination
                withPages={ false }
                total={ Math.max(1, Math.ceil(totalRecords / rows)) }
                value={ Math.floor(first / rows) + 1 }
                onChange={ (newPage) => {
                    onChange({ first: (newPage - 1) * rows, rows, page: newPage - 1 });
                } }
            />
        </div>
    );
}
