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
import { ContextMenu } from "primereact/contextmenu";
import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, CloudUpload, Download, EllipsisVertical, Trash2 } from "lucide-react";

import { Button } from "../Button";
import { Loader } from "../loader/Loader";
import { AttachmentsViewer } from "./viewer";

import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";

type AttachmentsListProps = {
    module: string;
    documentId: any;
    onClose: () => void;
    onAttachmentsCountChange: (count: number) => void;
};

export function AttachmentsList({ module, documentId, onAttachmentsCountChange, onClose }: AttachmentsListProps) {
    const { get, post, del } = axiosApiCall();

    const cm = useRef({ current: null } as any);

    const [loading, setLoading] = useState(false);

    const [locale, setLocale] = useState('fr-FR');
    const [attachments, setAttachments] = useState<any[]>([]);
    const [showAttachment, setShowAttachment] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Set locale based on stored language preference
    useEffect(() => {
        const storageLocale = localStorage.getItem('selectedLang');
        if (storageLocale === 'fra') {
            setLocale('fr-FR');
        } else if (storageLocale === 'eng') {
            setLocale('en-US');
        } else if (storageLocale === 'spa') {
            setLocale('es-ES');
        }
    }, []);

    // Fetch attachments
    useEffect(() => {
        refreshAttachments().then();
    }, []);

    const refreshAttachments = async () => {
        try {
            const response = await get(`/attachments/${ module }/list/${ documentId }`);
            if (response) {
                onAttachmentsCountChange(response.length);
                response.forEach((attachment: any) => {
                    attachment.creation_date = new Intl.DateTimeFormat(locale, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }).format(new Date(attachment.creation_date)).replace(' ', ' ' + t('GLOBAL.at') + ' ').replace(',', '').replaceAll('/', '-')
                });
                setAttachments(response);
            }
        } catch (error) {
            console.error("Error fetching attachments:", error);
            onAttachmentsCountChange(0);
        }
    };

    const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);

        const attachments = new FormData();
        attachments.append(file.name, file);

        if (module === 'verifier') {
            attachments.append('documentId', documentId.toString());
        } else {
            attachments.append('batchId', documentId.toString());
        }

        try {
            await post(`/attachments/${ module }/upload`, attachments, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            });
            refreshAttachments().then();
        } catch (error) {
            console.error("Error uploading attachment:", error);
        } finally {
            setLoading(false);
        }
    };

    const menuItems: any = [
        {
            label: t('ATTACHMENTS.download'),
            icon: <Download className='mr-1' size={ 16 }/>,
            command: () => handleDownload()
        },
        {
            label: <span className='critical'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const handleDownload = () => {
        if (!selectedAttachment) return;

        try {
            post(`/attachments/${ module }/download/${ selectedAttachment.id }`).then((response) => {
                const link = document.createElement('a');
                link.href = 'data:' + response.mime + ';base64,' + response.file;
                link.download = selectedAttachment.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        } catch (error) {
            console.error("Error downloading attachment:", error);
        }
    };

    const handleDelete = () => {
        if (!selectedAttachment) return;

        showConfirmDialog({
            title: t('ATTACHMENTS.delete_attachment'),
            message: t('ATTACHMENTS.confirm_delete_attachment'),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                setLoading(true);
                try {
                    await del(`/attachments/${ module }/delete/${ selectedAttachment.id }`);
                    refreshAttachments().then();
                } catch (error) {
                    console.error("Error deleting attachment:", error);
                } finally {
                    setLoading(false);
                }
            }
        })
    };

    const handleAttachementView = (attachment: any) => {
        if (attachment.mime_type === 'application/pdf' || attachment.mime_type.startsWith('image/')) {
            setSelectedAttachment(attachment);
            setShowAttachment(true);
        }
    };

    if (loading ) {
        return <Loader/>;
    }

    return (
        <div className="flex flex-col h-full ">
            <div className={ `w-full h-full flex flex-col ${ showAttachment ? '' : 'hidden' }` }>
                <AttachmentsViewer module={ module } show={ showAttachment }
                                   attachment={ selectedAttachment ?? {} }
                                   onClose={ () => setShowAttachment(false) }/>
            </div>
            <div className='h-full flex flex-col flex-1 overflow-y-auto'>
                { !showAttachment && (
                    <div className='flex justify-between sticky p-6 top-0 z-10'>
                        <Button icon={ <ArrowLeft size={ 18 }/> } onClick={ () => onClose() }
                                className='rounded-3xl hover:text-(--color-primary) text-(--text-primary)
                               border-(--border-secondary) p-2.5! px-5! bg-(--bg-primary)'>
                            { module === 'verifier' ? t('ATTACHMENTS.back_to_file') : t('ATTACHMENTS.back_to_batch') }
                        </Button>

                        <input ref={ fileInputRef } type="file" className="hidden" onChange={ handleFileSelected }/>
                        <Button icon={ <CloudUpload size={ 18 }/> } onClick={ () => fileInputRef.current?.click() }
                                className='rounded-3xl hover:text-(--color-primary) text-(--text-primary)
                               border-(--border-secondary) p-2.5! px-5! bg-(--bg-primary)'>
                            { t('ATTACHMENTS.upload_new_file') }
                        </Button>
                    </div>
                ) }

                { !showAttachment && (
                    <div className="grid grid-cols-2 gap-4 px-6 pb-6">
                        { attachments.map((attachment) => (
                            <div key={ attachment.id } onClick={ () => handleAttachementView(attachment) }
                                 className="border-2 border-(--border-secondary) hover:border-(--text-secondary)
                                            rounded-lg cursor-pointer bg-(--bg-primary) transition-border-color duration-200">
                                <div className="relative bg-[#D0DAD5] dark:bg-(--bg-secondary) rounded-b-none w-full p-6
                                                pb-0 rounded-md flex items-center justify-center text-(--text-secondary)">
                                    <div className="w-full h-40 relative">
                                        <img alt={ attachment.filename }
                                             src={ 'data:image/jpg;base64,' + attachment['thumb'] }
                                             className='object-cover object-top rounded-t-lg w-full! h-full!'
                                        />
                                    </div>
                                </div>
                                <div className='px-6 py-3'>
                                    <div className='flex mb-2'>
                                        <p className='font-semibold text-(--text-primary) truncate'>{ attachment.filename }</p>
                                        <div className="ml-auto -mr-3">
                                            <EllipsisVertical onClick={ (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                cm.current?.show(e);
                                                setSelectedAttachment(attachment);
                                            } }/>
                                            <ContextMenu model={ menuItems } className="w-auto!" ref={ cm }/>
                                        </div>
                                    </div>
                                    <p className='text-sm text-(--text-secondary)'>
                                        { t('ATTACHMENTS.register_date') }: { attachment.creation_date }
                                    </p>
                                </div>
                            </div>
                        )) }
                    </div>
                ) }
            </div>
        </div>
    );
}

