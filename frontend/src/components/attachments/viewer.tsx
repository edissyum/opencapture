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
import { Document, Page } from "react-pdf";
import { ContextMenu } from "primereact/contextmenu";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, EllipsisVertical, Trash2 } from "lucide-react";

import { Button } from "../Button";
import { Loader } from "../loader/Loader";

import { axiosApiCall } from "../../services/hooks/axiosApiCall";

type AttachmentsListProps = {
    show: boolean;
    module: string;
    attachment: any;
    onClose: () => void;
    onDelete: () => void;
    onDownload: () => void;
};

const attachmentCache = new Map<string, { mime: string; url: string }>();

export function AttachmentsViewer({ show, module, attachment, onClose, onDelete, onDownload }: AttachmentsListProps) {
    const { post } = axiosApiCall();
    const cm = useRef({ current: null } as any);

    const [numPages, setNumPages] = useState<number>();
    const [loading, setLoading] = useState(false);
    const [currentAttachmentData, setCurrentAttachmentData] = useState<any>(null);

    // Download attachment data
    useEffect(() => {
        if (!attachment.id || !show) return;

        setNumPages(undefined);

        if (attachmentCache.has(attachment.id)) {
            setCurrentAttachmentData(attachmentCache.get(attachment.id)!);
            setLoading(false);
            return;
        }

        setLoading(true);
        const fetchAttachment = async () => {
            try {
                const res = await post(`/attachments/${ module }/download/${ attachment.id }`)
                if (!res) return;

                let url: string;
                if (res['mime'] === 'application/pdf') {
                    // base64 → Uint8Array → Blob → Object URL (créé une seule fois, jamais détaché)
                    const binary = atob(res['file']);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], { type: 'application/pdf' });
                    url = URL.createObjectURL(blob);
                } else {
                    url = `data:${ res['mime'] };base64,${ res['file'] }`;
                }

                const cached = { mime: res['mime'], url };
                attachmentCache.set(attachment.id, cached);
                setCurrentAttachmentData(cached);
            } catch (error) {
                console.error("Error fetching attachment:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttachment().then();
    }, [attachment.id, show]);

    const memoizedFile = useMemo(() => {
        if (!currentAttachmentData || currentAttachmentData.mime !== 'application/pdf') return null;
        return { url: currentAttachmentData.url };
    }, [currentAttachmentData, show]);

    const menuItems: any = [
        {
            label: t('ATTACHMENTS.download'),
            icon: <Download size={ 16 }/>,
            command: () => onDownload ? onDownload() : null
        },
        {
            label: <span className='critical'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => onDelete ? onDelete() : null
        }
    ];

    if (loading) {
        return <Loader/>;
    }

    return (
        <div className='h-full pb-4'>
            <div className='h-full flex flex-col overflow-auto'>
                <div className='sticky p-6 pb-0 top-0 z-10'>
                    <div className='flex items-center justify-between'>
                        <Button variant='bg_white_rounded' icon={ <ArrowLeft size={ 18 }/> } onClick={ () => onClose() }>
                            { t('ATTACHMENTS.back_to_attachments_list') }
                        </Button>
                        <div className='bg-(--bg-primary) rounded-lg cursor-pointer p-1 border border-(--border-secondary)'>
                            <EllipsisVertical onClick={ (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                cm.current?.show(e);
                            } }/>
                            <ContextMenu model={ menuItems } className="w-auto!" ref={ cm }/>
                        </div>
                    </div>
                </div>
                <div className='p-6 max-w-3xl'>
                    <p className='font-semibold text-(--text-primary) truncate'>
                        { attachment['filename'] }
                    </p>
                    <p className='text-sm text-(--text-secondary) mt-1'>
                        { t('ATTACHMENTS.register_date') }: { attachment.creation_date }
                    </p>
                </div>

                { currentAttachmentData && (() => {
                    if (currentAttachmentData.mime.startsWith('image/')) {
                        return (
                            <div className='h-full flex justify-center pb-2'>
                                <img src={ currentAttachmentData.url } alt="Attachment" className="max-w-full"/>
                            </div>
                        );
                    } else if (currentAttachmentData.mime === 'application/pdf') {
                        return (
                            <div className='h-full flex justify-center pb-2'>
                                <Document
                                    file={ memoizedFile }
                                    loading={ <Loader /> }
                                    error={ t('ATTACHMENTS.error_loading_pdf') }
                                    onLoadSuccess={ ({ numPages }) => setNumPages(numPages) }
                                >
                                    { Array.from({ length: numPages ?? 0 }, (_, i) => (
                                        <Page
                                            key={ i }
                                            className="mb-4"
                                            pageNumber={ i + 1 }
                                            renderAnnotationLayer={ false }
                                        />
                                    )) }
                                </Document>
                            </div>
                        );
                    }
                    return null;
                })() }
            </div>
        </div>
    );
}