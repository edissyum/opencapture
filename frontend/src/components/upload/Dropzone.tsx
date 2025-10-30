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
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { HandGrab, UploadCloud, X } from "lucide-react";

import { showToast } from "../ToastProvider";

interface UploadDropzoneProps {
    maxFiles?: number;
    maxSize?: number;
    showPreview?: boolean;
    accept?: { [key: string]: string[] };
    onFilesAccepted?: (files: File[]) => void;
}

export default function UploadDropzone({
    accept = { "image/*": [".jpeg", ".jpg", ".png"] },
    maxFiles = 1,
    maxSize = 5 * 1024 * 1024, // 5MB
    onFilesAccepted,
    showPreview = true,
}: UploadDropzoneProps) {
    const [files, setFiles] = useState<File[]>([]);
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
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
                // return;
            } else if (fileRejections[0].errors.some((e: any) => e.code === "file-invalid-type")) {
                showToast(t("UPLOAD.invalid_file_type", { types: Object.values(accept).flat().join(", ") }), "error");
                // return;
            } else if (fileRejections[0].errors.some((e: any) => e.code === "file-too-large")) {
                showToast(t("UPLOAD.file_too_large", { maxSize: maxSize / (1024 * 1024) }), "error");
                // return;
            } else {
                showToast(t("UPLOAD.file_rejected"), "error");
            }
        }
    }, [accept, maxFiles, maxSize]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept,
        maxSize,
        maxFiles
    });


    const removeFile = (e: any, file: File) => {
        e.stopPropagation();
        const newFiles = files.filter((f: File) => f !== file);
        setFiles(newFiles);
        if (onFilesAccepted) onFilesAccepted(newFiles);
    };

    return (
        <div>
            <div
                { ...getRootProps() } className={ `flex h-50 border-2 border-dashed rounded-xl p-6 cursor-pointer transition border-(--border-secondary) hover:border-(--border-primary)
                    ${ files.length == 0 || !showPreview ? "items-center justify-center" : "items-start" }
                    ${ isDragActive ? "bg-(--color-primary)/20 border-(--border-primary)!" : "" }` }>
                <input { ...getInputProps() } />

                { isDragActive ? (
                    <div className="flex flex-col items-center gap-2">
                        <HandGrab className="text-(--text-secondary)"/>
                        <p className="text-(--text-primary) font-semibold">{ t('UPLOAD.drop_files_here', { count: maxFiles }) }</p>
                    </div>
                ) : (
                    <>
                        { files.length > 0 && showPreview ? (
                            <div className="flex flex-wrap gap-2">
                                { files.map((file) => (
                                    <span key={ file.name + file.size }
                                          className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-sm truncate">
                                        { file.name }
                                        <X size={ 14 } className="ml-2 cursor-pointer hover:text-(--text-error)"
                                           onClick={ (e) => removeFile(e, file) }
                                        />
                                    </span>
                                )) }
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <UploadCloud size={ 38 } className="text-(--text-secondary)"/>
                                <span className='flex gap-1 font-semibold'>
                            <p className='text-(--color-primary)'>
                                { t('UPLOAD.upload_dropzone') }
                            </p>
                            <p>
                                { t('UPLOAD.upload_dropzone_2') }
                            </p>
                        </span>
                                <p className="text-(--text-secondary) mt-2 -mb-2">
                                    { t('UPLOAD.max_filesize', { maxSize: maxSize / (1024 * 1024) }) }
                                </p>
                                <p className="text-(--text-secondary)">
                                    { t('UPLOAD.allowed_extensions') } : { Object.values(accept).flat().join(", ") }
                                </p>
                            </div>
                        ) }
                    </>
                )
                }
            </div>

        </div>
    );
}
