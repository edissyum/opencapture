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
import Papa from "papaparse";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "../Button";
import { Select } from "../Select";
import { Loader } from "../loader/Loader";
import { InputSwitch } from "../InputSwitch";

import UploadDropzone from "../upload/Dropzone";

export function ImportSpreadSheet({ onClose, onValidate, columns, title, loading = false }: {
    title: string,
    columns: string[],
    loading?: boolean,
    onClose: () => void,
    onValidate: (formData: FormData) => void
}) {
    const [editedColumns, setEditedColumns] = useState<string[]>(columns);

    const [file, setFile] = useState<File | null>(null);
    const [sheet, setSheet] = useState<string[][] | null>(null);

    const [rows, setRows] = useState<string[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);

    const [parsing, setParsing] = useState<boolean>(false);
    const [skipHeader, setSkipHeader] = useState<boolean>(true);

    useEffect(() => {
        if (!sheet) return;

        loadDatas(sheet);
    }, [skipHeader]);

    const handleImport = async (file: File) => {
        if (!file) return;

        setFile(file);
        setParsing(true);

        try {
            const text = await file.text();
            const { data } = Papa.parse<string[]>(text, { skipEmptyLines: true });

            setSheet(data);
            loadDatas(data);
        } finally {
            setParsing(false);
        }
    }

    const loadDatas = (data: string[][]) => {
        const formatted = data.map((row) => row.map((cell) => (
            cell === '' || cell === undefined || cell === null ?
                <div className='text-(--text-secondary)'>{ t('GLOBAL.no_data') }</div> : cell
        ))) as string[][];

        setHeaders(formatted[0] as string[]);
        if (skipHeader) {
            setRows(formatted.slice(1) as string[][]);
        } else {
            setRows(formatted as string[][]);
        }
    }

    const handleValidate = () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.set('skipHeader', String(skipHeader));
        formData.set('selectedColumns', String(columns));

        if (onValidate) onValidate(formData);
    }

    return (
        <>
            <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                onClick={ () => onClose() }/>
            <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                            w-4/5 h-11/12 max-h-screen border border-(--border-secondary)
                            rounded-lg bg-(--bg-primary) flex flex-col">
                <div className='flex items-center p-6 pb-0'>
                    <h2>{ title }</h2>
                    <div className='ml-auto cursor-pointer text-(--text-secondary)' onClick={ () => onClose() }>
                        <X/>
                    </div>
                </div>
                <div className='overflow-hidden flex flex-col gap-4 p-6 h-full min-h-0'>
                    <div>
                        <UploadDropzone
                            maxFiles={ 1 }
                            showPreview={ false }
                            accept={ { "text/*": [".csv"] } }
                            onFilesAccepted={ (files) => handleImport(files[0]) }
                        />
                    </div>

                    <div className='border rounded-md border-(--border-secondary) flex flex-col gap-4 h-full
                                    min-h-0 overflow-hidden'>
                        <div className='flex p-4 pb-0'>
                            <h4 className='font-semibold'>{ t('ACCOUNTS.columns_config') }</h4>
                            <div className='ml-auto flex items-center gap-2'>
                                <InputSwitch id='skipHeader' checked={ skipHeader }
                                    onChange={ (value) => setSkipHeader(value) }/>
                                <label htmlFor='skipHeader' className="flex items-center gap-4 cursor-pointer">
                                    { t('GLOBAL.skip_header') }
                                </label>
                            </div>
                        </div>

                        { parsing && (
                            <div className='h-full min-h-0 flex flex-col items-center justify-center gap-2 p-4'>
                                <Loader/>
                            </div>
                        ) }

                        { !parsing && rows.length > 0 && (
                            <div className='h-full min-h-0 flex flex-col overflow-y-auto p-4'>
                                <div className='flex pb-4 gap-8'>
                                    { editedColumns.map((col, idx) => (
                                        <Select
                                            id={ idx }
                                            key={ idx }
                                            value={ col }
                                            className='min-w-60'
                                            options={ columns.map((c) => ({ label: c, value: c })) }
                                            onChange={ (value: any) => {
                                                const newColumns = [...editedColumns];
                                                newColumns[idx] = value;
                                                setEditedColumns(newColumns);
                                            } }
                                        />
                                    )) }
                                </div>
                                <div className='min-h-0 flex-1'>
                                    { rows.map((col, idx) => (
                                        <div key={ idx } className='flex gap-8'>
                                            { col.map((cell, cellIdx) => (
                                                <div key={ cellIdx } className='min-w-60 w-full p-2 truncate'>
                                                    { cell }
                                                </div>
                                            )) }
                                        </div>
                                    )) }
                                </div>
                            </div>
                        ) }
                    </div>

                    <div className='ml-auto flex gap-4'>
                        <Button variant={ "no_bg" } onClick={ () => onClose() }>
                            { t('GLOBAL.cancel') }
                        </Button>
                        <Button disabled={ rows.length == 0 || headers.length == 0 || loading || parsing }
                            onClick={ handleValidate }>
                            { loading ? t('GLOBAL.importing') : t('GLOBAL.import') }
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
