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
import { Panel } from "primereact/panel";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ContextMenu } from "primereact/contextmenu";
import { Accordion, AccordionTab } from "primereact/accordion";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
    Download,
    EllipsisVertical,
    FileBadge,
    FileStack,
    FolderTree,
    Layers,
    Paperclip,
    Trash2,
    X
} from "lucide-react";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { useCustomFields } from "../../services/hooks/useCustomFields";

import { Button } from "../../components/Button";
import { AttachmentsList } from "../../components/attachments/list";

import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { DroppableDocumentZone } from "./dnd/droppableDocumentZone";
import { DraggablePage } from "./dnd/draggablePage";
import { b64ToFile } from "../settings/general/customization";

export function SplitterViewerPage() {
    const { get, post } = axiosApiCall();
    const cm = useRef({ current: null } as any);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const { user, loadingUser } = useUser();
    const { batchId } = useParams<{ batchId: string }>();
    const { customFields } = useCustomFields('splitter');

    const [documents, setDocuments] = useState<any>([]);
    const [batch, setBatch] = useState<any>(null);
    const [pagesCount, setPagesCount] = useState<number>(0);

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [attachmentsCount, setAttachmentsCount] = useState<number>(0);
    const [showAttachments, setShowAttachments] = useState<boolean>(false);
    const [enableAttachments, setEnableAttachments] = useState<boolean>(true);
    const [activeDragItem, setActiveDragItem] = useState<any>(null);

    const menuItems: any = [
        {
            label: t('SPLITTER.principal_document'),
            icon: <FileBadge className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        },
        {
            label: t('SPLITTER.type_document'),
            icon: <FolderTree className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        },
        {
            label: <span className='critical'>{ t('SPLITTER.delete_document') }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    useEffect(() => {
        if (!batchId || loadingUser) return;

        const fetchBatchDetails = async () => {
            try {
                const response = await post('/splitter/batches/list', { 'batchId': batchId, 'user_id': user.id });
                if (response?.batches?.length > 0) setBatch(response.batches[0]);
            } catch (error) {
                console.error('Error fetching batch details:', error);
            }
        };

        const fetchEnableAttachments = async () => {
            try {
                const res = await get('config/getConfigurationNoAuth/enableAttachments');
                if (res?.configuration) setEnableAttachments(res.configuration[0].data.value);
            } catch (error) {
                console.error("Error fetching enable attachments config:", error);
            }
        };

        fetchBatchDetails().then();
        fetchEnableAttachments().then();
    }, [loadingUser]);

    useEffect(() => {
        if (!batch) return;

        const fetchDocuments = async () => {
            try {
                const response = await get(`/splitter/documents/${ batch.id }`);
                if (response?.documents) {
                    setDocuments(response.documents);
                    let count = 0;
                    response.documents.forEach((doc: any) => {
                        doc.pages.forEach(() => {
                            count++;
                        });
                    });
                    setPagesCount(count);
                }
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };

        fetchDocuments().then();
    }, [batch]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        if (active?.data?.current?.type === 'page') {
            setActiveDragItem(active.data.current);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || active.data.current?.type !== 'page') return;

        const activePageId = active.id as string;
        const overPageId = over.id as string;

        setDocuments((docs: any[]) => {
            const next = docs.map(doc => ({ ...doc, pages: [...doc.pages] }));

            // Always find source from live state — data.current is stale after first dragOver
            const sourceDoc = next.find(d =>
                d.pages.some((p: any) => `page-${ p.id }` === activePageId)
            );
            if (!sourceDoc) return docs;

            const pageIndex = sourceDoc.pages.findIndex((p: any) => `page-${ p.id }` === activePageId);
            if (pageIndex === -1) return docs;

            // Case 1: hovering over another page (same doc = reorder, different doc = transfer)
            if (over.data.current?.type === 'page') {
                const targetDoc = next.find(d =>
                    d.pages.some((p: any) => `page-${ p.id }` === overPageId)
                );
                if (!targetDoc) return docs;

                const overIndex = targetDoc.pages.findIndex((p: any) => `page-${ p.id }` === overPageId);
                if (overIndex === -1) return docs;

                if (sourceDoc.id === targetDoc.id) {
                    // Same doc: live reorder with arrayMove
                    if (pageIndex === overIndex) return docs;
                    targetDoc.pages = arrayMove(targetDoc.pages, pageIndex, overIndex);
                } else {
                    // Different doc: remove from source, insert at hovered position
                    const [movedPage] = sourceDoc.pages.splice(pageIndex, 1);
                    targetDoc.pages.splice(overIndex, 0, movedPage);
                    setActiveDragItem((prev: any) =>
                        prev ? { ...prev, documentId: targetDoc.id } : prev
                    );
                }
                return next;
            }

            // Case 2: hovering over an empty document drop zone
            if (over.data.current?.type === 'document-zone') {
                const targetDoc = next.find(d => String(d.id) === String(over.data.current.documentId));
                if (!targetDoc || targetDoc.id === sourceDoc.id) return docs;

                const [movedPage] = sourceDoc.pages.splice(pageIndex, 1);
                targetDoc.pages.push(movedPage);
                setActiveDragItem((prev: any) =>
                    prev ? { ...prev, documentId: targetDoc.id } : prev
                );
                return next;
            }

            return docs;
        });
    };

    const handleDragEnd = (_event: DragEndEvent) => {
        setActiveDragItem(null);
    };

    const handlePreview = async (page: any) => {
        const response = await get(`/splitter/pages/${ page.id }/fullThumbnail`);
        if (response.fullThumbnail) {
            const blob = b64ToFile('data:image/jpg;base64,' + response.fullThumbnail);
            setThumbnail(URL.createObjectURL(blob));
        }
    }

    const handleDownloadOriginalFile = () => {
        if (!batch) return;

        const fetchAndDownload = async () => {
            try {
                get(`splitter/batch/${ batchId }/file`, {}).then((response) => {
                    const link = document.createElement('a');
                    link.href = `data:application/pdf;base64, ` + response.encodedFile;
                    link.download = response.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
            } catch (error) {
                console.error("Error downloading original file:", error);
            }
        };
        fetchAndDownload().then();
    };

    if (!batch) return null;

    return (
        <div className='flex flex-col h-full overflow-hidden'>
            { thumbnail && (
                <>
                    <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                         onClick={ () => setThumbnail(null) }/>
                    <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                    max-w-[32vw] border-2 border-(--border-secondary)
                                    rounded-lg overflow-hidden">
                        <img src={ thumbnail } alt="Thumbnail"/>
                        <Button variant="secondary" size="sm" className="absolute top-2 right-2"
                                onClick={ () => setThumbnail(null) }>
                            <X size={ 16 }/>
                        </Button>
                    </div>
                </>
            ) }
            <div className='px-8 pt-4 flex items-center'>
                <Button
                    size={ 'sm' }
                    variant={ "secondary" }
                    onClick={ handleDownloadOriginalFile }
                    className='p-2 px-3 bg-(--bg-primary) border-(--border-secondary) text-(--text-secondary) hover:text-(--color-primary)'>
                    <Download size={ 16 } className="mr-2"/> { batch.file_name }
                </Button>
                <div className="ml-auto">
                    { enableAttachments && (
                        <div className="flex items-center justify-center bg-(--bg-primary) p-3.5 rounded-full
                                    cursor-pointer border border-(--border-secondary) hover:border-(--border-primary)
                                    hover:text-(--color-primary) transition-colors shrink-0 relative"
                             onClick={ () => setShowAttachments(true) }
                             data-tooltip-id="tooltip"
                             data-tooltip-content={ t('VERIFIER.show_attachments') }>
                            <Paperclip size={ 18 }/>
                            { attachmentsCount > 0 && (
                                <div className="z-1 absolute top-0 right-0 size-3 rounded-full bg-(--color-primary)"/>
                            ) }
                        </div>
                    ) }
                </div>
            </div>

            <div className={ `h-full flex flex-col pb-10 ${ showAttachments && enableAttachments ? '' : 'hidden' }` }>
                <AttachmentsList
                    module="splitter"
                    documentId={ batchId }
                    onAttachmentsCountChange={ setAttachmentsCount }
                    onClose={ () => setShowAttachments(false) }
                />
            </div>

            { !showAttachments && (
                <div className='px-8 py-4 h-full overflow-y-auto'>
                    <Accordion className='mb-8' activeIndex={ 0 }>
                        <AccordionTab header={ t('SPLITTER.batch_content') }>
                            <div className='p-4'>
                                <div className='text-(--text-secondary) flex items-center gap-4 mb-4'>
                                    <span className='flex items-center gap-1'>
                                        <Layers size={ 16 }/>
                                        <span>{ pagesCount }</span>
                                        { t('SPLITTER.pages', { count: pagesCount }) }
                                    </span>
                                    <span className='flex items-center gap-1'>
                                        <FileStack size={ 16 }/>
                                        <span>{ batch.documents_count }</span>
                                        { t('SPLITTER.documents', { count: batch.documents_count }) }
                                    </span>
                                </div>
                            </div>
                        </AccordionTab>
                    </Accordion>

                    <DndContext
                        sensors={ sensors }
                        collisionDetection={ closestCenter }
                        onDragStart={ handleDragStart }
                        onDragOver={ handleDragOver }
                        onDragEnd={ handleDragEnd }
                    >
                        { documents.map((document: any) => (
                            <Panel
                                className='mb-4'
                                key={ document.id }
                                header={
                                    <div className="flex items-center gap-1.5 w-full">
                                        { !document.doctype_label && (
                                            <div className='text-(--text-error) font-semibold flex items-center gap-2'>
                                                <FolderTree size={ 18 }/>
                                                { t('SPLITTER.type_document') }
                                            </div>
                                        ) }
                                        <div>{ document.doctype_label }</div>
                                        <div className='text-(--text-secondary) font-medium flex items-center gap-1.5'>
                                            <span>{ document.pages.length }</span>
                                            { t('SPLITTER.pages', { count: document.pages.length }) }
                                        </div>
                                        <div className='ml-auto'>
                                            <EllipsisVertical size={ 18 } className="cursor-pointer"
                                                              onClick={ (e) => {
                                                                  e.preventDefault();
                                                                  e.stopPropagation();
                                                                  cm.current?.show(e);
                                                              } }
                                            />
                                            <ContextMenu model={ menuItems } className="w-auto!" ref={ cm }/>
                                        </div>
                                    </div>
                                }
                            >
                                <SortableContext
                                    items={ document.pages.map((p: any) => `page-${ p.id }`) }
                                    strategy={ verticalListSortingStrategy }
                                >
                                    <DroppableDocumentZone
                                        documentId={ document.id }
                                        isEmpty={ document.pages.length === 0 }
                                    >
                                        { document.pages.length > 0 && (
                                            <div className="flex gap-3">
                                                { document.pages.map((page: any) => (
                                                    <DraggablePage
                                                        page={ page }
                                                        key={ page.id }
                                                        onZoom={ handlePreview }
                                                        documentId={ document.id }
                                                    />
                                                )) }
                                            </div>
                                        ) }
                                    </DroppableDocumentZone>
                                </SortableContext>
                            </Panel>
                        )) }

                        <DragOverlay>
                            { activeDragItem?.type === 'page' && (
                                <DraggablePage
                                    isDragOverlay
                                    page={ activeDragItem.page }
                                    documentId={ activeDragItem.documentId }
                                />
                            ) }
                        </DragOverlay>
                    </DndContext>
                </div>
            ) }
        </div>
    );
}