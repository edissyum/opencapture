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
    RotateCw,
    Trash2,
    X
} from "lucide-react";
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { useCustomFields } from "../../services/hooks/useCustomFields";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";
import { useUnsavedChangesWarning } from "../../services/hooks/useUnsavedChangesWarning";

import { Button } from "../../components/Button";
import { AttachmentsList } from "../../components/attachments/list";

import { DraggablePage } from "./dnd/draggablePage";
import { DroppableDocumentZone } from "./dnd/droppableDocumentZone";

import { b64ToFile } from "../settings/general/customization";
import { useFormFields } from "../../services/hooks/useFormFields.tsx";
import ISOCalendar from "../../components/Calendar.tsx";
import moment from "moment/moment";
import Input from "../../components/Input.tsx";

export function SplitterViewerPage() {
    const { get, post, del } = axiosApiCall();
    const cm = useRef({ current: null } as any);
    const [unSavedChanges, setUnSavedChanges] = useState(false);
    useUnsavedChangesWarning(unSavedChanges);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const { user, loadingUser } = useUser();
    const { batchId } = useParams<{ batchId: string }>();
    const { customFields } = useCustomFields('splitter');

    const [documents, setDocuments] = useState<any>([]);
    const [batch, setBatch] = useState<any>(null);
    const [batchMetadata, setBatchMetadata] = useState<any[]>([]);
    const [pagesCount, setPagesCount] = useState<number>(0);
    const [batchMetadataValues, setBatchMetadataValues] = useState<any>({});
    const [documentMetadata, setDocumentMetadata] = useState<any>(null);

    const formId = batch?.form_id;
    const { formFields, loading: loadingFormFields } = useFormFields(formId);

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [attachmentsCount, setAttachmentsCount] = useState<number>(0);
    const [attachmentsRefreshKey, setAttachmentsRefreshKey] = useState(0);
    const [showAttachments, setShowAttachments] = useState<boolean>(false);
    const [enableAttachments, setEnableAttachments] = useState<boolean>(true);

    const [movedPages, setMovedPages] = useState<any[]>([]);
    const [deletedPages, setDeletedPages] = useState<any[]>([]);
    const [selectedPages, setSelectedPages] = useState<any[]>([]);
    const [deletedDocuments, setDeletedDocuments] = useState<any[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);

    const [activeDragItem, setActiveDragItem] = useState<any>(null);

    const menuItems: any = [
        {
            label: t('SPLITTER.principal_document'),
            icon: <FileBadge className='mr-1' size={ 16 }/>,
            disabled: documents.length <= 1,
            command: () => handleDocumentPrincipal()
        },
        {
            label: t('SPLITTER.type_document'),
            icon: <FolderTree className='mr-1' size={ 16 }/>,
            command: () => {
            }
        },
        {
            label: <span className='critical'>{ t('SPLITTER.delete_document') }</span>,
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDeleteDocument()
        }
    ];

    const pageMenuItems = [
        {
            label: t('SPLITTER.rotation'),
            icon: <RotateCw className='mr-1' size={ 16 }/>,
            command: () => handleRotation()
        },
        {
            label: t('SPLITTER.delete_page'),
            icon: <Trash2 className='mr-1' size={ 16 }/>,
            command: () => handleDeletePage()
        }
    ]

    // Fetch batch details and attachments config
    useEffect(() => {
        if (!batchId || loadingUser) return;

        const fetchBatchDetails = async () => {
            try {
                const response = await post('/splitter/batches/list', { 'batchId': batchId, 'user_id': user.id });
                if (response?.batches?.length > 0) {
                    const batchData = response.batches[0];
                    batchData.maxSplitIndex = batchData.documents_count;
                    setBatch(batchData);
                }
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

    // Fetch documents of the batch
    useEffect(() => {
        if (!batch) return;

        const fetchDocuments = async () => {
            try {
                const response = await get(`/splitter/documents/${ batch.id }`);
                if (response?.documents) {
                    response.documents.forEach((doc: any) => {
                        doc.metada = doc.data?.custom_fields;
                    })
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

    // Recalculate pages count when documents change (e.g. after drag and drop)
    useEffect(() => {
        let count = 0;
        documents.forEach((doc: any) => {
            doc.pages.forEach(() => {
                count++;
            });
        });
        setPagesCount(count);
    }, [documents]);

    // Fill batch and document metadata
    useEffect(() => {
        if (loadingFormFields) return;

        if (formFields.batch_metadata) {
            const batchMetadata = formFields.batch_metadata;
            let lines: any[] = [];

            Object.values(batchMetadata).forEach((line: any) => {
                let linesFields: any[] = [];
                Object.values(line).forEach((field: any) => {
                    if (field) {
                        const fieldId = parseInt(field.id.replace('custom_', ''));
                        const customField = customFields.find((f: any) => f.id === fieldId);

                        if (customField) {
                            field = { ...field, ...customField };
                        }

                        if (batch.data.custom_fields) {
                            if (batch.data.custom_fields[field.label_short]) {
                                let value = batch.data.custom_fields[field.label_short];

                                if (field.type === 'date') {
                                    const dateValue = moment(value, 'YYYY-MM-DD', true);
                                    if (dateValue.isValid()) {
                                        value = dateValue.format('YYYY-MM-DD');
                                    } else {
                                        value = null;
                                    }
                                }
                                field = { ...field, value: value };
                            }
                        }
                        if (field.value) {
                            setBatchMetadataValues((prev: any) => ({ ...prev, [field.label_short]: field.value }));
                        }
                        linesFields.push(field);
                    }
                });

                if (linesFields.length > 0) {
                    lines.push(linesFields);
                }

            });

            setBatchMetadata(lines);
        }
    }, [loadingFormFields]);

    const normalizeDisplayOrder = (docs: any[]) => {
        docs.forEach((doc) => {
            doc.pages.forEach((page: any, index: number) => {
                page.display_order = index + 1; // ou index si backend 0-based
            });
        });
    };

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

                    setMovedPages(prev => {
                        const filtered = prev.filter(p => p.pageId !== movedPage.id);

                        return [
                            ...filtered,
                            {
                                pageId: movedPage.id,
                                newDocumentId: targetDoc.id
                            }
                        ];
                    });

                    setActiveDragItem((prev: any) =>
                        prev ? { ...prev, documentId: targetDoc.id } : prev
                    );
                }
                normalizeDisplayOrder(next);
                return next;
            }

            // Case 2: hovering over an empty document drop zone
            if (over.data.current?.type === 'document-zone') {
                const targetDoc = next.find(d => String(d.id) === String(over.data.current?.documentId));
                if (!targetDoc || targetDoc.id === sourceDoc.id) return docs;

                const [movedPage] = sourceDoc.pages.splice(pageIndex, 1);
                targetDoc.pages.push(movedPage);

                setMovedPages(prev => {
                    const filtered = prev.filter(p => p.pageId !== movedPage.id);

                    return [
                        ...filtered,
                        {
                            pageId: movedPage.id,
                            newDocumentId: targetDoc.id
                        }
                    ];
                });

                setActiveDragItem((prev: any) =>
                    prev ? { ...prev, documentId: targetDoc.id } : prev
                );
                normalizeDisplayOrder(next);
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

    const handleDeleteDocument = () => {
        showConfirmDialog({
            title: t('SPLITTER.delete_document'),
            message: t('SPLITTER.confirm_delete_document'),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                setDeletedDocuments((prev) => [...prev, selectedDocument]);
                setDocuments((docs: any[]) => docs.filter(doc => doc.id !== selectedDocument.id));
                setUnSavedChanges(true);
            },
            onCancel: () => {
                setSelectedDocument([]);
            }
        });
    }

    const handleRotation = () => {
        const currentDegree = selectedPages[0]?.rotation || 0;
        switch (currentDegree) {
            case -90: {
                selectedPages[0].rotation = 0;
                break;
            }
            case 180: {
                selectedPages[0].rotation = -90;
                break;
            }
            default: {
                selectedPages[0].rotation += 90;
                break;
            }
        }
    }

    const handleDeletePage = () => {
        showConfirmDialog({
            title: t('SPLITTER.delete_document_page', { count: selectedPages.length }),
            message: t('SPLITTER.confirm_delete_document_page', { count: selectedPages.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                setUnSavedChanges(true);
                setDeletedPages((prev) => [...prev, ...selectedPages]);
                setDocuments((docs: any[]) => {
                    const next = docs.map(doc => ({ ...doc, pages: [...doc.pages] }));
                    selectedPages.forEach((page) => {
                        const doc = next.find(d => d.id === page.document_id);
                        if (doc) {
                            doc.pages = doc.pages.filter((p: any) => p.id !== page.id);
                        }
                    });
                    normalizeDisplayOrder(next);
                    return next;
                });
            },
            onCancel: () => {
                setSelectedPages([]);
            }
        });
    }

    const handleDocumentPrincipal = () => {
        showConfirmDialog({
            title: t('SPLITTER.set_document_principal'),
            message: t('SPLITTER.confirm_set_document_principal'),
            confirmText: t('GLOBAL.validate'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                const documentsToMove = documents.filter((doc: any) => doc.id !== selectedDocument.id);
                if (documentsToMove) {
                    documentsToMove.forEach((doc: any) => {
                        setDeletedDocuments((prev) => [...prev, doc]);
                    });
                    setDocuments([selectedDocument]);
                    setUnSavedChanges(true);
                }
            },
            onCancel: () => {
                setSelectedDocument([]);
            }
        });
    }

    const handleSaveChanges = async () => {
        try {
            await post('/splitter/saveModifications', {
                'batchId': batchId,
                'documents': documents,
                'movedPages': movedPages,
                'batchMetadata': batchMetadataValues,
                'deletedPagesIds': deletedPages.map(p => p.id),
                'deletedDocumentsIds': deletedDocuments.map(d => d.id)
            });
            setDeletedPages([]);
            setDeletedDocuments([]);
            setUnSavedChanges(false);
        } catch (error) {
            console.error("Error saving changes:", error);
        }
    }

    const getWidthLine = (line: any) => {
        return line.length === 1 ? 'w-full' :
            line.length === 2 ? 'w-1/2' :
                line.length === 3 ? 'w-1/3' :
                    line.length === 4 ? 'w-1/4' :
                        'w-1/5';
    }

    const handleUpdateBatchMetadataValues = (field: any, value: any) => {
        setBatchMetadataValues((prev: any) => ({ ...prev, [field.label_short]: value }));
        setUnSavedChanges(true);
    }

    const handleUnbinding = () => {
        showConfirmDialog({
            title: t('ATTACHMENTS.unbinding'),
            message: t('SPLITTER.confirm_unbinding'),
            confirmText: t('GLOBAL.validate'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                const response = await get(`/attachments/splitter/list/${ batchId }`);
                if (response) {
                    for (const attachment of response) {
                        const newDocumentId = await addDocument();
                        await post(`/attachments/splitter/unbind`, {
                            pagesCount: pagesCount,
                            attachmentId: attachment.id,
                            newDocumentId: newDocumentId,
                        });
                        await del(`/attachments/splitter/delete/${ attachment.id }`);
                    }
                }
                setShowAttachments(false);
                setAttachmentsRefreshKey(prev => prev + 1);
            },
            onCancel: () => {
                setShowAttachments(false);
                setSelectedDocument([]);
            }
        });
    }

    const addDocument = async () => {
        try {
            const response = await post('/splitter/addDocument', {
                userId: user.id,
                batchId: batchId,
                workflowId: batch.workflow_id,
                splitIndex: batch.maxSplitIndex + 1,
                displayOrder: batch.maxSplitIndex + 1
            });

            if (response?.newDocumentId) {
                const newDocument = {
                    id: response.newDocumentId,
                    pages: [],
                    data: {
                        custom_fields: {}
                    }
                };
                setDocuments((prev: any[]) => [...prev, newDocument]);
                setBatch((prev: any) => ({ ...prev, maxSplitIndex: prev.maxSplitIndex + 1 }));
                return response.newDocumentId;
            }

        } catch (error) {
            console.error("Error adding document:", error);
        }
    }

    if (!batch) return null;

    return (
        <div className='flex flex-col h-full w-full overflow-hidden'>
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
            <div onClick={ handleSaveChanges }>save</div>
            <div onClick={ addDocument }>add document</div>

            { !showAttachments && (
                <div className='px-8 py-4 flex items-center'>
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
                                <Paperclip size={ 16 }/>
                                { attachmentsCount > 0 && (
                                    <div
                                        className="z-1 absolute top-0 right-0 size-3 rounded-full bg-(--color-primary)"/>
                                ) }
                            </div>
                        ) }
                    </div>
                </div>
            ) }

            <div className={ `w-full h-full flex flex-col ${ showAttachments && enableAttachments ? '' : 'hidden' }` }>
                <AttachmentsList
                    key={ attachmentsRefreshKey }
                    module="splitter"
                    documentId={ batchId }
                    unBinding={ handleUnbinding }
                    onAttachmentsCountChange={ setAttachmentsCount }
                    onClose={ () => setShowAttachments(false) }
                />
            </div>

            { !showAttachments && (
                <div className='px-8 pb-4 h-full overflow-y-auto'>
                    <Accordion className='mb-8'>
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
                                        <span>{ documents.length }</span>
                                        { t('SPLITTER.documents', { count: documents.length }) }
                                    </span>
                                </div>

                                { batchMetadata && (
                                    <div>
                                        <h3 className='font-semibold mb-4'>{ t('FORMS.metadata_batch') }</h3>
                                        { batchMetadata.map((line: any, index: number) => (
                                            <div key={ index } className={ `flex gap-4 mb-2` }>
                                                { line.map((field: any) => (
                                                    <div key={ field.id }
                                                         className={ `min-w-1/6 ${ getWidthLine(line) }` }>
                                                        {
                                                            field.type === 'date' ? (
                                                                <ISOCalendar
                                                                    id={ field.id }
                                                                    key={ field.id }
                                                                    label={ t(field.label) }
                                                                    required={ field.required }
                                                                    value={ batchMetadataValues[field.label_short] }
                                                                    onChange={ (e) => {
                                                                        handleUpdateBatchMetadataValues(field, e)
                                                                    } }
                                                                />
                                                            ) : (
                                                                <Input
                                                                    id={ field.id }
                                                                    key={ field.id }
                                                                    type={ field.type }
                                                                    label={ t(field.label) }
                                                                    required={ field.required }
                                                                    value={ batchMetadataValues[field.label_short] }
                                                                    onChange={ (e) => {
                                                                        handleUpdateBatchMetadataValues(field, e.target.value)
                                                                    } }
                                                                />
                                                            )
                                                        }
                                                    </div>
                                                )) }
                                            </div>
                                        )) }
                                    </div>
                                ) }
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
                                className='PanelDocumentList mb-4 w-full'
                                key={ document.id }
                                header={
                                    <div className="flex items-center gap-1.5">
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
                                            <EllipsisVertical
                                                size={ 18 } className="cursor-pointer"
                                                onClick={ (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedDocument(document);
                                                    cm.current?.show(e);
                                                } }
                                            />
                                            <ContextMenu model={ menuItems } className="w-auto!" ref={ cm }
                                                         onHide={ () => setSelectedDocument(null) }/>
                                        </div>
                                    </div>
                                }
                            >
                                <SortableContext strategy={ verticalListSortingStrategy }
                                                 items={ document.pages.map((p: any) => `page-${ p.id }`) }>
                                    <DroppableDocumentZone documentId={ document.id }
                                                           isEmpty={ document.pages.length === 0 }>
                                        { document.pages.length > 0 && (
                                            <div className="flex gap-3 overflow-x-auto py-2">
                                                { document.pages.map((page: any) => (
                                                    <DraggablePage
                                                        page={ page }
                                                        key={ page.id }
                                                        selectedPages={ selectedPages }
                                                        onSelectionChange={ (pages) => setSelectedPages(pages) }
                                                        onZoom={ handlePreview }
                                                        documentId={ document.id }
                                                        menuItems={ pageMenuItems }
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
                                    selectedPages={ [] }
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