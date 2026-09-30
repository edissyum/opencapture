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
import { Download } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Select } from "../../Select";
import { Loader } from "../../loader/Loader";

import { AxiosApiCall } from "../../../services/hooks/AxiosApiCall";

import { b64ToFile } from "../../../pages/settings/general/customization";

export function QrSeparator({ selectedDoctype }: { selectedDoctype: any }) {
    const { post } = AxiosApiCall();

    const [loading, setLoading] = useState<boolean>(false);
    const [allowDownload, setAllowDownload] = useState<boolean>(false);

    const [separator, setSeparator] = useState<any>({});
    const [selectedSeparator, setSelectedSeparator] = useState<string>('doctypeSeparator');

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const thumbnailRef = useRef<string | null>(null);
    const setThumbnailSafe = useCallback((url: string | null) => {
        if (thumbnailRef.current) {
            URL.revokeObjectURL(thumbnailRef.current);
        }
        thumbnailRef.current = url;
        setThumbnail(url);
    }, []);

    const separators = [
        { id: 'bundleSeparator', name: t("SPLITTER.bundle_separator") },
        { id: 'documentSeparator', name: t("SPLITTER.document_separator") },
        { id: 'doctypeSeparator', name: t("SPLITTER.doc_type_separator") }
    ]

    useEffect(() => {
        setAllowDownload(false);

        if (!selectedSeparator) return;
        if (selectedSeparator === 'doctypeSeparator') {
            if (!selectedDoctype || (selectedDoctype && ['root'].includes(selectedDoctype.type))) {
                setThumbnailSafe(null);
                return;
            }
        }

        const generateQrSeparator = async () => {
            setLoading(true);
            setThumbnailSafe(null);
            try {
                const response = await post(`/doctypes/generateSeparator`, {
                    id: selectedDoctype?.id,
                    type: selectedSeparator
                });
                setSeparator(response);
                if (response && response.encoded_thumbnails) {
                    const blob = b64ToFile(response.encoded_thumbnails[0]);
                    setThumbnailSafe(URL.createObjectURL(blob));
                    setAllowDownload(true);
                }
            } catch (error) {
                console.error("Error fetching QR separator:", error);
            } finally {
                setLoading(false);
            }
        };

        generateQrSeparator().then();

    }, [selectedSeparator, selectedDoctype]);

    const handleDownloadSeparator = async () => {
        if (!selectedSeparator) return;
        if (selectedSeparator === 'doctypeSeparator' && !selectedDoctype) return;
        if (selectedDoctype && ['root'].includes(selectedDoctype.type)) return;

        try {
            if (separator['encoded_file']) {
                const blob = b64ToFile(separator['encoded_file']);
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${ selectedSeparator }_${ selectedDoctype?.key ?? '' }.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Error downloading QR separator:", error);
        }
    };

    return (
        <div className="p-6 h-full">
            <div className='flex items-center justify-between gap-6'>
                <div className='w-1/3'>
                    <Select
                        id='qr-separator'
                        value={ selectedSeparator }
                        label={ t("SPLITTER.qr_separator") }
                        onChange={ (value) => setSelectedSeparator(value) }
                        options={ separators.map((s) => ({ label: s.name, value: s.id })) }/>
                </div>

                <div className={ `flex items-center justify-center bg-(--bg-primary) p-3.5 rounded-full
                                 ${ allowDownload ? 'cursor-pointer hover:border-(--border-primary)' : 'cursor-not-allowed opacity-50' }
                                 border border-(--border-secondary) hover:text-(--color-primary) transition-colors shrink-0` }
                onClick={ allowDownload ? handleDownloadSeparator : undefined }
                data-tooltip-id="tooltip"
                data-tooltip-content={ t('SPLITTER.download_separator') }>
                    <Download size={ 18 }/>
                </div>
            </div>
            <div className='flex flex-col items-center mt-6'>
                { loading && (
                    <Loader/>
                ) }

                { thumbnail && (
                    <div className="mt-4 size-102">
                        <img src={ thumbnail } alt="QR Separator"
                            className="object-contain border border-(--border-secondary) rounded-lg"/>
                    </div>
                ) }

                { !loading && !thumbnail && (
                    <div className="mt-4 text-(--text-secondary)">
                        { t("DOCTYPES.select_doctype") }
                    </div>
                ) }
            </div>
        </div>
    );
}
