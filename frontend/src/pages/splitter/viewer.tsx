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
import moment from "moment/moment";
import { Panel } from "primereact/panel";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ContextMenu } from "primereact/contextmenu";
import { Accordion, AccordionTab } from "primereact/accordion";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import {
    ChevronDown,
    Download,
    EllipsisVertical,
    FileBadge,
    FileStack,
    FolderTree,
    Layers,
    Paperclip,
    RotateCw,
    Trash,
    Trash2,
    X
} from "lucide-react";
import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    pointerWithin,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { useFormFields } from "../../services/hooks/useFormFields";
import { useCustomFields } from "../../services/hooks/useCustomFields";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";
import { useUnsavedChangesWarning } from "../../services/hooks/useUnsavedChangesWarning";

import Input from "../../components/Input";
import { Button } from "../../components/Button";
import ISOCalendar from "../../components/Calendar";
import { Checkbox } from "../../components/Checkbox";
import { Loader } from "../../components/loader/Loader";
import { showToast } from "../../components/ToastProvider";
import { AttachmentsList } from "../../components/attachments/list";

import { DraggablePage } from "./dnd/draggablePage";
import { DroppableDocumentZone } from "./dnd/droppableDocumentZone";

import { b64ToFile } from "../settings/general/customization";
import { Dropdown } from "../../components/Dropdown.tsx";

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
    const [loading, setLoading] = useState(false);
    const { customFields } = useCustomFields('splitter');

    const [documents, setDocuments] = useState<any>([]);
    const [batch, setBatch] = useState<any>(null);
    const [batchMetadata, setBatchMetadata] = useState<any[]>([]);
    const [batchMetadataValues, setBatchMetadataValues] = useState<any>({});
    const [documentMetadata, setDocumentMetadata] = useState<any>(null);
    const [documentMetadataValues, setDocumentMetadataValues] = useState<any>({});
    const [documentMetadataOpen, setDocumentMetadataOpen] = useState<boolean>(false);

    const [metadata, setMetadata] = useState<any>([]);

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

    // ✅ Callback stable
    const handleSelectionChange = useCallback((page: any, checked: boolean) => {
        setSelectedPages(prev =>
            checked ? [...prev, page] : prev.filter((p: any) => p.id !== page.id)
        );
    }, []);

    // ✅ handlePreview stable
    const handlePreview = useCallback(async (page: any) => {
        const response = await get(`/splitter/pages/${ page.id }/fullThumbnail`);
        if (response.fullThumbnail) {
            const blob = b64ToFile('data:image/jpg;base64,' + response.fullThumbnail);
            setThumbnail(URL.createObjectURL(blob));
        }
    }, []);

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
    ];

    // Fetch batch details and attachments config
    useEffect(() => {
        if (!batchId || loadingUser) return;

        const fetchBatchDetails = async () => {
            try {
                const response = await post('/splitter/batches/list', { 'batchId': batchId, 'user_id': user.id });
                if (response?.batches?.length > 0) {
                    const batchData = response.batches[0];
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

    // Fetch documents of the batch and initialize metadata values
    useEffect(() => {
        if (!batch || loadingFormFields) return;

        setLoading(true);
        const fetchDocuments = async () => {
            try {
                const response = await get(`/splitter/documents/${ batch.id }`);
                if (response?.documents) {
                    let lines: any[] = [];
                    const documentMetadata = formFields.document_metadata;

                    if (documentMetadata) {
                        response.documents.forEach((doc: any) => {
                            doc.document_metadata = doc.data?.custom_fields;
                            if (doc.document_metadata) {
                                Object.values(documentMetadata).forEach((line: any) => {
                                    let linesFields: any[] = [];
                                    Object.values(line).forEach((field: any) => {
                                        if (field) {
                                            const fieldId = parseInt(field.id.replace('custom_', ''));
                                            const customField = customFields.find((f: any) => f.id === fieldId);

                                            if (customField) {
                                                field = { ...field, ...customField };
                                            }

                                            if (doc.data.custom_fields) {
                                                if (doc.data.custom_fields[field.label_short]) {
                                                    let value = doc.data.custom_fields[field.label_short];

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

                                                if (field.value) {
                                                    setDocumentMetadataValues((prev: any) => ({
                                                        ...prev, [doc.id]: {
                                                            ...prev[doc.id],
                                                            [field.label_short]: field.value
                                                        }
                                                    }));
                                                }
                                                linesFields.push(field);
                                            }
                                        }
                                    });

                                    if (linesFields.length > 0 && !lines.some(line => line.every((f: any) => linesFields.some((lf: any) => lf.id === f.id)))) {
                                        lines.push(linesFields);
                                    }
                                });
                            }
                        })
                    }
                    setLoading(false);
                    setDocumentMetadata(lines);
                    setDocuments(response.documents);
                }
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };

        fetchDocuments().then();
    }, [batch, loadingFormFields]);

    // Recalculate pages count when documents change (e.g. after drag and drop)
    const pagesCount = useMemo(() =>
            documents.reduce((acc: number, doc: any) => acc + doc.pages.length, 0),
        [documents]
    );

    // Fill batch metadata
    useEffect(() => {
        if (loadingFormFields) return;

        if (formFields.batch_metadata) {
            let lines: any[] = [];
            const batchMetadata = formFields.batch_metadata;

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

    // Load referential
    useEffect(() => {
        if (batchMetadata.length == 0) return;

        const fetchReferential = async () => {
            try {
                const response = await get(`/splitter/metadataMethods/${ batch.form_id }`);
                if (response && response.metadataMethods) {
                    if (response.metadataMethods[0].callOnSplitterView) {
                        const referential = await get(`/splitter/loadReferential/${ batch.form_id }`);
                        if (referential?.metadata) {
                            referential.metadata.forEach((metadataItem: any) => {
                                metadataItem.data['metadataId'] = metadataItem.external_id ? metadataItem.external_id : metadataItem.id;
                                batchMetadata.forEach((line: any) => {
                                    line.forEach((field: any) => {
                                        const metadataKey = field.metadata_key;
                                        if (metadataKey && !(metadataKey in metadataItem.data)) {
                                            metadataItem.data[metadataKey] = '';
                                        }
                                    });
                                });

                                setMetadata((prev: any) => [...prev, metadataItem.data]);
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching referential:', error);
            }
        }

        fetchReferential().then();
    }, [batchMetadata])

    const normalizeDisplayOrder = (docs: any[]) => {
        docs.forEach((doc) => {
            doc.pages.forEach((page: any, index: number) => {
                page.display_order = index + 1; // ou index si backend 0-based
            });
        });
        setUnSavedChanges(true);
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
                return next;
            }

            return docs;
        });

    };

    const handleDragEnd = (_event: DragEndEvent) => {
        setActiveDragItem(null);
        normalizeDisplayOrder(documents);
    };

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
        if (selectedPages.length === 0) return;

        setDocuments((docs: any[]) => {
            return docs.map(doc => ({
                ...doc,
                pages: doc.pages.map((page: any) => {
                    const isSelected = selectedPages.some(p => p.id === page.id);
                    if (!isSelected) return page;

                    const currentDegree = page.rotation || 0;

                    let newRotation;
                    switch (currentDegree) {
                        case -90:
                            newRotation = 0;
                            break;
                        case 180:
                            newRotation = -90;
                            break;
                        default:
                            newRotation = currentDegree + 90;
                            break;
                    }

                    return {
                        ...page,
                        rotation: newRotation
                    };
                })
            }));
        });

        setUnSavedChanges(true);
    };

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
                setLoading(true);
                const documentsToMove = documents.filter((doc: any) => doc.id !== selectedDocument.id);
                if (documentsToMove) {
                    await post(`/splitter/moveDocumentsToAttachments/${ batch.id }`, { documents: documentsToMove });

                    documentsToMove.forEach((doc: any) => {
                        setDeletedDocuments((prev) => [...prev, doc]);
                    });
                    setDocuments([selectedDocument]);
                    setAttachmentsRefreshKey(prev => prev + 1);
                    showToast(t('SPLITTER.document_set_as_principal'), 'success');
                    await handleSaveChanges(false, documentsToMove);
                    setLoading(false);
                }
            },
            onCancel: () => {
                setSelectedDocument([]);
            }
        });
    }

    const handleSaveChanges = async (notif = true, extraDeletedDocuments = []) => {
        setLoading(true);
        try {
            const documentsWithoutTnl = documents.map((doc: any) => ({
                ...doc,
                pages: doc.pages.map((p: any) => ({
                    id: p.id,
                    status: p.status,
                    rotation: p.rotation,
                    source_page: p.source_page,
                    docuemnt_id: p.document_id,
                    display_order: p.display_order
                }))
            }));

            Object.keys(documentMetadataValues).forEach((document_id: any) => {
                const doc = documentsWithoutTnl.find((d: any) => String(d.id) === String(document_id));
                if (doc) {
                    doc.document_metadata = {
                        ...doc.document_metadata,
                        ...documentMetadataValues[document_id]
                    }
                }
            });

            const deletedDocumentsIds = [...deletedDocuments, ...extraDeletedDocuments].map(d => d.id);

            await post('/splitter/saveModifications', {
                'batchId': batchId,
                'movedPages': movedPages,
                'documents': documentsWithoutTnl,
                'batchMetadata': batchMetadataValues,
                'deletedDocumentsIds': deletedDocumentsIds,
                'deletedPagesIds': deletedPages.map(p => p.id),
            });
            setDeletedPages([]);
            setDeletedDocuments([]);
            setLoading(false);
            setUnSavedChanges(false);

            if (notif) {
                showToast(t('SPLITTER.changes_saved'), 'success');
            }
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

    const handleUpdateDocumentMetadataValues = (document_id: number, field: any, value: any) => {
        setDocumentMetadataValues((prev: any) => ({
            ...prev, [document_id]: {
                ...prev[document_id],
                [field.label_short]: value
            }
        }));
        setUnSavedChanges(true);
    }

    const handleUnbinding = () => {
        showConfirmDialog({
            title: t('ATTACHMENTS.unbinding'),
            message: t('SPLITTER.confirm_unbinding'),
            confirmText: t('GLOBAL.validate'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                setLoading(true);
                const response = await get(`/attachments/splitter/list/${ batchId }`);
                if (response) {
                    for (const attachment of response) {
                        const newDocumentId = await addDocument();
                        await post(`/attachments/splitter/unbind`, {
                            attachmentId: attachment.id,
                            newDocumentId: newDocumentId,
                        });
                        await del(`/attachments/splitter/delete/${ attachment.id }`);
                    }
                }
                setLoading(false);
                setShowAttachments(false);
                setAttachmentsRefreshKey(prev => prev + 1);
                showToast(t('SPLITTER.unbind_success'), 'success');
            },
            onCancel: () => {
                setLoading(false);
                setSelectedDocument([]);
                setShowAttachments(false);
            }
        });
    }

    const addDocument = async () => {
        try {
            const response = await post('/splitter/addDocument', {
                userId: user.id,
                batchId: batchId,
                workflowId: batch.workflow_id,
                splitIndex: batch.max_split_index + 1,
                displayOrder: batch.max_split_index + 1
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
                setBatch((prev: any) => ({ ...prev, max_split_index: prev.max_split_index + 1 }));
                return response.newDocumentId;
            }

        } catch (error) {
            console.error("Error adding document:", error);
        }
    }

    const getMetadaValuesForField = (field: any) => {
        const result: any = [];
        let resultMask = field.result_mask;
        if (resultMask) {
            resultMask.split('#').map((part: string) => {
                if (field.metadata_key !== part) {
                    result.push(part);
                }
            });
        }

        return metadata.map((m: any) => ({
            label: m[field.metadata_key],
            value: m[field.metadata_key],
            extras: result.map(key => m[key]).filter(Boolean)
        }));
    }

    const selectAll = () => {
        if (selectedPages.length === 0) {
            const allPages = documents.reduce((acc: any[], doc: any) => [...acc, ...doc.pages], []);
            setSelectedPages(allPages);
        } else {
            setSelectedPages([]);
        }
    }

    if (!batch) return null;

    return (
        <div className='flex flex-col h-full w-full overflow-hidden relative'>
            { loading && (
                <div className={ `absolute inset-0 z-20 flex items-center justify-center bg-(--bg-primary)/80` }>
                    <Loader/>
                </div>
            ) }
            { (!showAttachments) && (
                <div className='absolute bottom-0 w-full flex items-center gap-4 p-4 bg-(--bg-primary) border-t-2
                            border-(--border-secondary) z-10'>
                    <Checkbox checked={ selectedPages.length !== 0 } onChange={ selectAll }
                              indeterminate={ selectedPages.length != pagesCount }/>
                    <Button size="sm" onClick={ () => handleSaveChanges() } disabled={ !unSavedChanges }>
                        { t('GLOBAL.save_changes') }
                    </Button>
                    <div data-tooltip-id="tooltip"
                         data-tooltip-content={ attachmentsCount > 0 ? t('SPLITTER.cant_add_document') : '' }>
                        <Button size="sm" onClick={ addDocument } disabled={ attachmentsCount > 0 }>
                            { t('SPLITTER.add_document') }
                        </Button>
                    </div>
                    <Button variant={ 'no_bg_border' } onClick={ handleRotation } disabled={ selectedPages.length == 0 }
                            className='flex items-center'>
                        <RotateCw size={ 16 }/>
                    </Button>
                    <Button variant={ 'no_bg_border' } onClick={ handleDeletePage }
                            disabled={ selectedPages.length == 0 }
                            className='flex items-center'>
                        <Trash size={ 16 }/>
                    </Button>
                </div>
            ) }

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

            { !showAttachments && (
                <div className='px-8 py-4 flex items-center'>
                    <Button
                        size={ 'sm' }
                        variant={ "secondary" }
                        onClick={ handleDownloadOriginalFile }
                        className='p-2 px-3 bg-(--bg-primary) border-(--border-secondary) text-(--text-secondary) hover:text-(--color-primary)'>
                        <Download size={ 16 } className="mr-2"/> { batch.file_name }
                    </Button>

                    { enableAttachments && (
                        <div className={ `ml-auto ${ documents.length > 1 && 'cursor-not-allowed!' }` }
                             data-tooltip-id="tooltip"
                             data-tooltip-content={ documents.length > 1 ? t('SPLITTER.one_document') : '' }
                        >
                            <div className={
                                `flex items-center justify-center bg-(--bg-primary) p-3.5 rounded-full
                                border border-(--border-secondary) hover:border-(--border-primary)
                                hover:text-(--color-primary) transition-colors shrink-0 relative cursor-pointer
                                ${ documents.length > 1 && 'opacity-50 pointer-events-none' }`
                            }
                                 onClick={ () => setShowAttachments(true) }
                                 data-tooltip-id="tooltip"
                                 data-tooltip-content={ t('VERIFIER.show_attachments') }
                            >
                                <Paperclip size={ 16 }/>
                                { attachmentsCount > 0 && (
                                    <div
                                        className="z-1 absolute top-0 right-0 size-3 rounded-full bg-(--color-primary)"/>
                                ) }
                            </div>
                        </div>
                    ) }
                </div>
            ) }

            { enableAttachments && (
                <div className={ `w-full h-full flex flex-col ${ !showAttachments && 'hidden' }` }>
                    <AttachmentsList
                        key={ attachmentsRefreshKey }
                        module="splitter"
                        documentId={ batchId }
                        unBinding={ handleUnbinding }
                        onAttachmentsCountChange={ setAttachmentsCount }
                        onClose={ () => setShowAttachments(false) }
                    />
                </div>
            ) }

            { !showAttachments && (
                <div className='px-8 pb-18 h-full overflow-y-auto'>
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
                                                        { field.type === 'date' ? (
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
                                                            <div>
                                                                { field.metadata_key && metadata.length > 0 ? (
                                                                    <Dropdown
                                                                        id={ field.id }
                                                                        filter={ true }
                                                                        label={ field.label }
                                                                        className="w-full mb-2"
                                                                        useExtraInLabel={ true }
                                                                        options={ getMetadaValuesForField(field) }
                                                                        value={ batchMetadataValues[field.label_short] }
                                                                        onChange={ (e) => handleUpdateBatchMetadataValues(field, e.value) }
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
                                                                ) }
                                                            </div>
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
                        onDragEnd={ handleDragEnd }
                        onDragOver={ handleDragOver }
                        onDragStart={ handleDragStart }
                        collisionDetection={ pointerWithin }
                    >
                        { documents.map((document: any) => (
                            <Panel
                                key={ document.id }
                                className='PanelDocumentList mb-4 w-full'
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
                                { documentMetadata && document.pages.length > 0 && (
                                    <div className='px-4 pt-4'>
                                        <h3 className='font-semibold flex items-center cursor-pointer gap-1'
                                            onClick={ () => setDocumentMetadataOpen(prev => !prev) }>
                                            { t('FORMS.metadata_document') }
                                            <ChevronDown
                                                size={ 16 }
                                                className={ `transition-transform duration-200 ${ documentMetadataOpen ? 'rotate-0' : '-rotate-90' }` }
                                            />
                                        </h3>
                                        <div className={ `grid transition-all duration-300 ease-in-out` }
                                             style={ { gridTemplateRows: documentMetadataOpen ? '1fr' : '0fr' } }
                                        >
                                            <div className="overflow-hidden">
                                                { documentMetadata.map((line: any, index: number) => (
                                                    <div key={ index } className={ `flex gap-4 mt-4` }>
                                                        { line.map((field: any) => (
                                                            <div key={ field.id }
                                                                 className={ `min-w-1/6 ${ getWidthLine(line) }` }>
                                                                { field.type === 'date' ? (
                                                                    <ISOCalendar
                                                                        id={ field.id }
                                                                        key={ field.id }
                                                                        label={ t(field.label) }
                                                                        required={ field.required }
                                                                        value={ documentMetadataValues[document.id]?.[field.label_short] }
                                                                        onChange={ (e) => {
                                                                            handleUpdateDocumentMetadataValues(document.id, field, e)
                                                                        } }
                                                                    />
                                                                ) : (
                                                                    <Input
                                                                        id={ field.id }
                                                                        key={ field.id }
                                                                        type={ field.type }
                                                                        label={ t(field.label) }
                                                                        required={ field.required }
                                                                        value={ documentMetadataValues[document.id]?.[field.label_short] }
                                                                        onChange={ (e) => {
                                                                            handleUpdateDocumentMetadataValues(document.id, field, e.target.value)
                                                                        } }
                                                                    />
                                                                )
                                                                }
                                                            </div>
                                                        )) }
                                                    </div>
                                                )) }
                                            </div>
                                        </div>
                                    </div>
                                ) }
                                <SortableContext strategy={ verticalListSortingStrategy }
                                                 items={ document.pages.map((p: any) => `page-${ p.id }`) }>
                                    <DroppableDocumentZone
                                        pages={ document.pages }
                                        documentId={ document.id }
                                        menuItems={ pageMenuItems }
                                        isEmpty={ document.pages.length === 0 }
                                        selectedPageIds={ selectedPages.map(p => p.id) }
                                        onSelectionChange={ handleSelectionChange }
                                        onZoom={ handlePreview }
                                    />
                                </SortableContext>
                            </Panel>
                        )) }

                        <DragOverlay>
                            { activeDragItem?.type === 'page' && (
                                <DraggablePage
                                    isDragOverlay
                                    isSelected={ false }
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