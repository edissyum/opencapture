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
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { File, HandGrab, Trash2, UploadCloud } from "lucide-react";

import { showToast } from "../ToastProvider";

interface UploadDropzoneProps {
    maxSize?: number;
    maxFiles?: number;
    className?: string;
    showPreview?: boolean;
    accept?: { [key: string]: string[] };
    completedFiles?: string[];
    progressByFile?: Record<string, number | undefined>;
    onFilesAccepted?: (files: File[]) => void;
}

export default function UploadDropzone({
    maxFiles,
    className,
    progressByFile,
    onFilesAccepted,
    showPreview = true,
    completedFiles = [],
    maxSize = 5 * 1024 * 1024,
    accept = { "image/*": [".jpeg", ".jpg", ".png"] }
}: UploadDropzoneProps) {
    const [files, setFiles] = useState<any>([]);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            acceptedFiles.forEach((file: any) => {
                file.id = file.name + '-' + Math.random().toString(36).substr(2, 9);
            });

            let newFiles = [...files, ...acceptedFiles];

            if (maxFiles === 1) {
                newFiles = [acceptedFiles[0]];
            }

            setFiles(newFiles);
            if (onFilesAccepted) onFilesAccepted(newFiles);
        },
        [onFilesAccepted]
    );

    const onDropRejected = useCallback((fileRejections: any[]) => {
        if (fileRejections.length > 0) {
            if (fileRejections[0].errors.some((e: any) => e.code === "too-many-files")) {
                showToast(t("UPLOAD.too_many_files", { maxFiles: maxFiles }), "error");
            } else if (fileRejections[0].errors.some((e: any) => e.code === "file-invalid-type")) {
                showToast(t("UPLOAD.invalid_file_type", { types: Object.values(accept).flat().join(", ") }), "error");
            } else if (fileRejections[0].errors.some((e: any) => e.code === "file-too-large")) {
                showToast(t("UPLOAD.file_too_large", { maxSize: maxSize / (1024 * 1024) }), "error");
            } else {
                showToast(t("UPLOAD.file_rejected"), "error");
            }
        }
    }, [accept, maxFiles, maxSize]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        maxFiles,
        onDropRejected
    });

    const removeFile = (e: any, file: File) => {
        e.stopPropagation();
        const newFiles = files.filter((f: File) => f !== file);
        setFiles(newFiles);
        if (onFilesAccepted) onFilesAccepted(newFiles);
    };

    return (
        <div className='h-full flex flex-col'>
            <div
                { ...getRootProps() } className={ `flex justify-center border-2 border-dashed rounded-xl p-6
                    cursor-pointer transition border-(--border-secondary) hover:border-(--border-primary) min-h-50
                    ${ className } ${ isDragActive ? "bg-(--bg-selected) border-(--border-primary)!" : "" }` }>
                <input { ...getInputProps() } />

                { isDragActive ? (
                    <div className="flex flex-col justify-center items-center gap-2">
                        <HandGrab className="text-(--text-secondary)"/>
                        <p className="text-(--text-primary) font-semibold">
                            { t('UPLOAD.drop_files_here') }
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center gap-2">
                        <UploadCloud size={ 38 } className="text-(--text-secondary)"/>
                        <div className='flex gap-1 font-semibold'>
                            <p className='text-(--color-primary)'>
                                { t('UPLOAD.upload_dropzone') }
                            </p>
                            <p>
                                { t('UPLOAD.upload_dropzone_2') }
                            </p>
                        </div>

                        <div className='text-center mt-2'>
                            <p className="text-(--text-secondary) text-sm">
                                { t('UPLOAD.max_filesize', { maxSize: maxSize / (1024 * 1024) }) }
                            </p>
                            <p className="text-(--text-secondary) text-sm">
                                { t('UPLOAD.allowed_extensions') } : { Object.values(accept).flat().join(", ") }
                            </p>
                        </div>
                    </div>
                ) }
            </div>
            { files.length > 0 && showPreview && (
                <div className="mt-4 space-y-2 overflow-y-auto">
                    { files.map((file: any) => (
                        <div key={ file.name + file.size }
                             className="relative flex items-center rounded-lg gap-4 px-3 py-2 bg-(--bg-primary) border border-(--border-secondary)">
                            { progressByFile?.[file.id] !== undefined && (
                                <div className="absolute top-0 left-0 h-full bg-(--color-primary)/10 transition-[width]
                                                duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                                                border-r-2 border-(--border-primary) rounded-md"
                                     style={ { width: `${ progressByFile[file.id] }%` } }/>
                            ) }

                            <div className='text-(--text-primary) bg-(--bg-secondary) p-2 rounded-lg'>
                                <File/>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold">{ file.name }</span>
                                { completedFiles.includes(file.id) ? (
                                    <span className="text-xs font-semibold text-(--text-secondary)">
                                        { t('UPLOAD.upload_completed') }
                                    </span>
                                ) : progressByFile?.[file.id] !== undefined ? (
                                    <span className="text-xs font-semibold text-(--color-primary)">
                                        { t('UPLOAD.upload_progress', { progress: progressByFile[file.id] }) }
                                    </span>
                                ) : (
                                    <span className="text-xs font-semibold text-(--text-secondary)">
                                        { (file.size / 1024 / 1024 >= 1)
                                            ? (file.size / 1024 / 1024).toFixed(2) + " MB"
                                            : (file.size / 1024).toFixed(2) + " KB" }
                                    </span>
                                ) }
                            </div>
                            { progressByFile?.[file.id] === undefined && (
                                <Trash2 size={ 16 }
                                        className="cursor-pointer hover:text-(--text-error) ml-auto"
                                        onClick={ (e) => removeFile(e, file) }/>
                            ) }
                        </div>
                    )) }
                </div>
            ) }
        </div>
    );
}
