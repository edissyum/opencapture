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
import * as XLSX from "xlsx";
import { X } from "lucide-react";

import { useState } from "react";
import UploadDropzone from "../upload/Dropzone";
import { Dropdown } from "../Dropdown.tsx";

export function ImportSpreadSheet({ onClose, columns }: { onClose: () => void, columns: string[] }) {
    const [editedColumns, setEditedColumns] = useState<string[]>(columns);

    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<string[][]>([]);

    const handleImport = async (file: File) => {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, {
            type: "array",
            codepage: 65001
        });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
        setHeaders(data[0] as string[]);
        setRows(data.slice(1) as string[][]);
    }

    return (
        <>
            <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                 onClick={ () => onClose() }/>
            <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                            w-4/5 h-11/12 max-h-screen border border-(--border-secondary)
                            rounded-lg bg-(--bg-primary) flex flex-col">
                <div className='flex items-center p-6 pb-0'>
                    <h2>{ t('ACCOUNTS.import_suppliers') }</h2>
                    <div className='ml-auto cursor-pointer text-(--text-secondary)' onClick={ () => onClose() }>
                        <X/>
                    </div>
                </div>
                <div className='overflow-hidden flex flex-col gap-4 p-6 h-full'>
                    <div>
                        <UploadDropzone
                            maxFiles={ 1 }
                            showPreview={ false }
                            accept={ { "text/*": [".csv"] } }
                            onFilesAccepted={ (files) => handleImport(files[0]) }
                        />
                    </div>

                    <div className='border rounded-md border-(--border-secondary) p-4 flex flex-col gap-4 h-full'>
                        <h4 className='font-semibold'>{ t('ACCOUNTS.columns_config') }</h4>
                        <div className='overflow-y-auto h-full flex gap-8'>
                            { editedColumns.map((col, idx) => (
                                <Dropdown
                                    id={ idx }
                                    key={ idx }
                                    className='min-w-60'
                                    options={ columns.map((c) => ({ label: c, value: c })) }
                                    value={ col }
                                    onChange={ (selected: any) => {
                                        const newColumns = [...editedColumns];
                                        newColumns[idx] = selected.value;
                                        setEditedColumns(newColumns);
                                    } }
                                />
                            )) }
                        </div>
                        <div className='overflow-auto pb-50'>
                            { rows.map((col, idx) => (
                                <div key={ idx } className='flex gap-8 border-b border-(--border-secondary)'>
                                    { col.map((cell, cellIdx) => (
                                        <div key={ cellIdx } className='min-w-60 p-2'>
                                            { cell }
                                        </div>
                                    )) }
                                </div>
                            )) }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
