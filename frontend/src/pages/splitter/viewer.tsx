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
import DOMPurify from "dompurify";
import moment from "moment/moment";
import { Panel } from "primereact/panel";
import { Divider } from "primereact/divider";
import { ContextMenu } from "primereact/contextmenu";
import { useNavigate, useParams } from "react-router-dom";
import { Accordion, AccordionTab } from "primereact/accordion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import {
    ArrowLeft,
    ChevronDown,
    CircleAlert,
    Combine,
    Download,
    EllipsisVertical,
    File,
    FileBadge,
    FileStack,
    FolderTree,
    Layers,
    Package,
    PackageCheck,
    Paperclip,
    PenOff,
    Plus,
    RotateCw,
    Save,
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
    useSensors
} from "@dnd-kit/core";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { useFormFields } from "../../services/hooks/useFormFields";
import { useCustomFields } from "../../services/hooks/useCustomFields";
import { showConfirmDialog } from "../../services/hooks/ConfirmDialog";
import { useHistoryLogger } from "../../services/hooks/useHistoryLogger";
import { useUnsavedChangesWarning } from "../../services/hooks/useUnsavedChangesWarning";

import Input from "../../components/Input";
import { Button } from "../../components/Button";
import ISOCalendar from "../../components/Calendar";
import { Checkbox } from "../../components/Checkbox";
import { Dropdown } from "../../components/Dropdown";
import { Loader } from "../../components/loader/Loader";
import { showToast } from "../../components/ToastProvider";
import { AttachmentsList } from "../../components/attachments/list";
import { DoctypesTree } from "../../components/settings/doctypes/doctypesTree";

import { BatchCard } from "./batchesList";
import { DraggablePage } from "./dnd/draggablePage";
import { DroppableDocumentZone } from "./dnd/droppableDocumentZone";

import { b64ToFile } from "../settings/general/customization";
import { Tooltip } from "react-tooltip";

export function SplitterViewerPage() {
    const { get, post, del } = axiosApiCall();
    const navigate = useNavigate();
    const cm = useRef({ current: null } as any);
    const [unSavedChanges, setUnSavedChanges] = useState(false);
    useUnsavedChangesWarning(unSavedChanges);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const { user, loadingUser } = useUser();
    const { logHistory } = useHistoryLogger();

    const [outputsLabels, setOutputsLabels] = useState<any[]>([]);

    const [forms, setForms] = useState<any[]>([]);
    const [doctypes, setDoctypes] = useState<any[]>([]);
    const { batchId } = useParams<{ batchId: string }>();
    const [loading, setLoading] = useState(false);
    const [loadingBatch, setLoadingBatch] = useState(true);
    const { customFields } = useCustomFields('splitter');
    const [statuses, setStatuses] = useState<any[]>([]);

    const [documents, setDocuments] = useState<any>([]);
    const [batch, setBatch] = useState<any>(null);
    const [batchTime, setBatchTime] = useState<string>('');
    const [batchMetadata, setBatchMetadata] = useState<any[]>([]);
    const [disabledBatch, setDisabledBatch] = useState(false);
    const [batchMetadataValues, setBatchMetadataValues] = useState<any>({});
    const [addDocumentTrigger, setAddDocumentTrigger] = useState(0);
    const [documentMetadata, setDocumentMetadata] = useState<any>(null);
    const [documentMetadataValues, setDocumentMetadataValues] = useState<any>({});
    const [documentMetadataOpen, setDocumentMetadataOpen] = useState<boolean>(false);

    const [metadata, setMetadata] = useState<any>([]);
    const [certifiedCopy, setCertifiedCopy] = useState<boolean>(false);

    const formId = batch?.form_id;
    const { formFields, loading: loadingFormFields } = useFormFields(formId);

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const thumbnailRef = useRef<string | null>(null);

    // Revoke the previous Object URL whenever thumbnail changes or on unmount
    useEffect(() => {
        return () => {
            if (thumbnailRef.current) {
                URL.revokeObjectURL(thumbnailRef.current);
                thumbnailRef.current = null;
            }
        };
    }, []);

    const setThumbnailSafe = useCallback((url: string | null) => {
        if (thumbnailRef.current) {
            URL.revokeObjectURL(thumbnailRef.current);
        }
        thumbnailRef.current = url;
        setThumbnail(url);
    }, []);

    const [batchesList, setBatchesList] = useState<any[]>([]);
    const [showBatches, setShowBatches] = useState<boolean>(false);
    const [draggingBatchId, setDraggingBatchId] = useState<number | null>(null);

    const [attachmentsCount, setAttachmentsCount] = useState<number>(0);
    const [attachmentsRefreshKey, setAttachmentsRefreshKey] = useState(0);
    const [showAttachments, setShowAttachments] = useState<boolean>(false);
    const [enableAttachments, setEnableAttachments] = useState<boolean>(true);

    const [deletedPages, setDeletedPages] = useState<any[]>([]);
    const [selectedPages, setSelectedPages] = useState<any[]>([]);
    const [deletedDocuments, setDeletedDocuments] = useState<any[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);

    const [tmpDoctype, setTmpDoctype] = useState<any>(null);
    const [showDoctypeSelection, setShowDoctypeSelection] = useState(false);

    const listRef = useRef({ current: null } as any);

    // Scroll to bottom when documents change (e.g. after drag and drop or adding a new document)
    useEffect(() => {
        if (addDocumentTrigger === 0) return;

        listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "smooth"
        });
    }, [addDocumentTrigger]);

    const handleSelectionChange = useCallback((page: any, checked: boolean) => {
        setSelectedPages(prev =>
            checked ? [...prev, page] : prev.filter((p: any) => p.id !== page.id)
        );
    }, []);

    const handlePreview = useCallback(async (page: any) => {
        const response = await get(`/splitter/pages/${ page.id }/fullThumbnail`);
        if (response.fullThumbnail) {
            const blob = b64ToFile('data:image/jpg;base64,' + response.fullThumbnail);
            setThumbnailSafe(URL.createObjectURL(blob));
        }
    }, []);

    const [activeDragItem, setActiveDragItem] = useState<any>(null);

    const menuItems: any = [
        {
            label: t('SPLITTER.principal_document'),
            icon: <FileBadge size={ 16 }/>,
            disabled: documents.length <= 1 || certifiedCopy,
            command: () => handleDocumentPrincipal()
        },
        {
            label: t('SPLITTER.type_document'),
            icon: <FolderTree size={ 16 }/>,
            command: () => setShowDoctypeSelection(true)
        },
        {
            label: <span className='critical'>{ t('SPLITTER.delete_document') }</span>,
            icon: <Trash2 size={ 16 }/>,
            disabled: certifiedCopy,
            command: () => handleDeleteDocument()
        }
    ];

    const pageMenuItems = [
        {
            label: t('SPLITTER.rotation'),
            icon: <RotateCw size={ 16 }/>,
            command: () => handleRotation()
        },
        {
            label: t('SPLITTER.delete_page'),
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDeletePage()
        }
    ];

    const fetchDocuments = async () => {
        try {
            const response = await get(`/splitter/documents/${ batchId }`);
            if (response?.documents) {
                let lines: any[] = [];
                const documentMetadata = formFields?.document_metadata;
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
                    });
                }
                setDocumentMetadata(lines);
                setDocuments(response.documents);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    // Fetch batch details, forms and attachments config on load
    useEffect(() => {
        if (!batchId || loadingUser) return;

        logHistory({
            module: 'splitter',
            submodule: 'viewer',
            desc: t('HISTORY.viewer_splitter', { batchId: batchId })
        }).then();

        const fetchBatchDetails = async () => {
            try {
                const response = await post('/splitter/batches/list', { 'batchId': batchId, 'user_id': user.id });
                if (response?.batches?.length > 0) {
                    const batchData = response.batches[0];
                    if (batchData.status !== 'NEW') {
                        setDisabledBatch(true);
                    }
                    setBatch(batchData);

                    const batchDate = moment(batchData.creation_date);
                    if (batchDate.isSame(moment(), 'day')) {
                        setBatchTime('today');
                    } else if (batchDate.isSame(moment().subtract(1, 'day'), 'day')) {
                        setBatchTime('yesterday');
                    } else {
                        setBatchTime('older');
                    }
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

        const fetchForms = async () => {
            try {
                const response = await get('/forms/splitter/list', {
                    params: {
                        user: user.id,
                    }
                });
                setForms(response.forms);
            } catch (error) {
                console.error('Error fetching forms :', error);
            }
        };

        fetchForms().then();
        fetchBatchDetails().then();
        fetchEnableAttachments().then();
    }, [loadingUser]);

    // Fetch status
    // Fetch doctypes
    // Fetch current form
    useEffect(() => {
        if (!formId) return;

        const fetchDocTypes = async () => {
            try {
                const response = await get(`/doctypes/list/${ batch?.form_id }`);
                setDoctypes(response.doctypes);
            } catch (error) {
                console.error("Error fetching doctypes:", error);
            }
        };

        const fetchStatus = async () => {
            try {
                const response = await post(`/status/splitter/list`, {});
                setStatuses(response.status);
            } catch (error) {
                console.error("Error fetching statuses:", error);
            }
        }

        const fetchForm = async () => {
            try {
                const res = await get(`/forms/splitter/getById/${ batch.form_id }`);
                if (res) {
                    for (const output of res.outputs) {
                        const o = await get(`/outputs/splitter/getById/${ output }`);
                        setOutputsLabels((prev: any) => [...prev, o.output_label]);
                    }
                }
            } catch (error) {
                console.error("Error fetching form settings:", error);
            }
        };

        fetchForm().then();
        fetchStatus().then();
        fetchDocTypes().then();
    }, [formId]);

    // Recalculate pages count when documents change (e.g. after drag and drop)
    const pagesCount = useMemo(() => documents.reduce((acc: number, doc: any) => acc + doc.pages.length, 0), [documents]);

    // Fill batch metadata and fetch documents
    useEffect(() => {
        if (loadingFormFields) return;

        if (formFields?.batch_metadata) {
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
        fetchDocuments().then();
    }, [loadingFormFields]);

    // Load referential and workflow config
    useEffect(() => {
        if (!batch) return;

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

        const fetchWorkflowDetails = async () => {
            try {
                const response = await get(`/workflows/splitter/getById/${ batch.workflow_id }`);

                if (response) {
                    if (response.input.certified_copy) {
                        setCertifiedCopy(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching workflow details:', error);
            }
        };

        fetchReferential().then();
        fetchWorkflowDetails().then();
        fetchWorkflowDetails().then();
    }, [batchMetadata])

    // Disable loading when batch and documents are loaded
    useEffect(() => {
        if (batch && documents && !loadingFormFields) {
            setLoadingBatch(false);
        }
    }, [batch, documents]);

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
        if (!selectedDocument || disabledBatch || certifiedCopy) return;

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
        if (selectedPages.length === 0) return;

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
        for (const doc of documents) {
            if (doc.pages.length === 0) {
                showToast(t('SPLITTER.empty_document_error'), 'error');
                return;
            }
        }

        showConfirmDialog({
            title: t('SPLITTER.set_document_principal'),
            message: t('SPLITTER.confirm_set_document_principal'),
            confirmText: t('GLOBAL.validate'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                setLoading(true);
                const documentsToMove = documents.filter((doc: any) => doc.id !== selectedDocument.id);
                if (documentsToMove) {
                    try {
                        await post(`/splitter/moveDocumentsToAttachments/${ batch.id }`, { documents: documentsToMove });
                    } catch (error) {
                        console.error("Error moving documents to attachments:", error);
                    } finally {
                        setLoading(false);
                    }

                    documentsToMove.forEach((doc: any) => {
                        setDeletedDocuments((prev) => [...prev, doc]);
                    });

                    setDocuments([selectedDocument]);
                    setAttachmentsRefreshKey(prev => prev + 1);
                    showToast(t('SPLITTER.document_set_as_principal'), 'success');
                    await handleSaveChanges(false, documentsToMove);
                }
            },
            onCancel: () => {
                setSelectedDocument([]);
            }
        });
    }

    const buildDocumentMetadataForSave = () => {
        const documentsWithoutTnl = documents.map((doc: any) => ({
            ...doc,
            pages: doc.pages.map((p: any) => ({
                id: p.id,
                status: p.status,
                rotation: p.rotation,
                source_page: p.source_page,
                document_id: p.document_id,
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
        return documentsWithoutTnl;
    }

    const handleSaveChanges = async (notif = true, extraDeletedDocuments = []) => {
        setLoading(true);
        try {
            const documentsWithoutTnl = buildDocumentMetadataForSave();
            const deletedDocumentsIds = [...deletedDocuments, ...extraDeletedDocuments].map(d => d.id);

            await post('/splitter/saveModifications', {
                'batchId': batchId,
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
        const selectedMetadata = metadata.find((m: any) => m[field.metadata_key] === value);
        setBatchMetadataValues((prev: any) => ({ ...prev, [field.label_short]: value }));

        batchMetadata.forEach((line: any) => {
            line.forEach((f: any) => {
                if (f.metadata_key) {
                    setBatchMetadataValues((prev: any) => ({
                        ...prev, [f.label_short]: selectedMetadata ? selectedMetadata[f.metadata_key] : ''
                    }));
                }
            });
        });

        if (selectedMetadata && selectedMetadata.metadataId) {
            setBatchMetadataValues((prev: any) => ({ ...prev, ['metadataId']: selectedMetadata.metadataId }));
        }
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

                await fetchDocuments();
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
        if (disabledBatch || certifiedCopy) return;

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
                    doctype_key: null,
                    doctype_label: null,
                    document_metadata: {},
                    display_order: batch.max_split_index + 1,
                    data: {
                        custom_fields: {}
                    }
                };
                setDocuments((prev: any[]) => [...prev, newDocument]);
                setBatch((prev: any) => ({ ...prev, max_split_index: prev.max_split_index + 1 }));
                setAddDocumentTrigger(prev => prev + 1);
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
            extras: result.map((key: any) => m[key]).filter(Boolean)
        }));
    }

    const selectAll = () => {
        if (disabledBatch) return;

        if (selectedPages.length === 0) {
            const allPages = documents.reduce((acc: any[], doc: any) => [...acc, ...doc.pages], []);
            setSelectedPages(allPages);
        } else {
            setSelectedPages([]);
        }
    }

    const handleChangeForm = async (event: any) => {
        showConfirmDialog({
            title: t('SPLITTER.change_form'),
            message: t('SPLITTER.confirm_change_form'),
            confirmText: t('GLOBAL.modify'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                setLoading(true);
                try {
                    await post('/splitter/changeForm', { 'batchId': batchId, formId: event.value });
                    showToast(t('SPLITTER.form_changed'), 'success');
                    setTimeout(() => {
                        navigate(0);
                    });
                } catch (error) {
                    console.error("Error changing form:", error);
                }
            },
        });
    }

    const handleValidateBatch = async () => {
        const emptyDocs = documents.filter((doc: any) => doc.pages.length === 0);
        if (emptyDocs.length > 0) {
            showToast(t('SPLITTER.empty_documents_error'), 'error');
            return;
        }

        const unLabeledDocs = documents.filter((doc: any) => !doc.doctype_label);
        if (unLabeledDocs.length > 0) {
            showToast(t('SPLITTER.unlabeled_document_error'), 'error');
            return;
        }

        setLoading(true);
        try {
            const documentsWithoutTnl = buildDocumentMetadataForSave();
            await post('/splitter/export', {
                'batchId': batchId,
                'formId': batch.form_id,
                'documents': documentsWithoutTnl,
                'batchMetadata': batchMetadataValues,
                'deletedPagesIds': deletedPages.map(p => p.id),
                'deletedDocumentsIds': deletedDocuments.map(d => d.id)
            });
            showToast(t('SPLITTER.batch_validated'), 'success');
            logHistory({
                module: 'splitter',
                submodule: 'batch_validated',
                desc: t('HISTORY.batch_validated', { batchId: batchId })
            });
            navigate('/home');
        } catch (error) {
            console.error("Error validating batch:", error);
        } finally {
            setLoading(false);
        }
    };

    const typeDocument = async (document: any) => {
        setSelectedDocument(document);
        setShowDoctypeSelection(true);
    };

    const handleChangeDoctype = async (doctype: any) => {
        setDocuments((docs: any[]) => {
            return docs.map(doc => {
                if (doc.id === selectedDocument.id) {
                    return { ...doc, doctype_label: doctype.label, doctype_key: doctype.key };
                }
                return doc;
            });
        });
        setTmpDoctype(null);
        setUnSavedChanges(true);
        setSelectedDocument(null);
        setShowDoctypeSelection(false);
    }

    const handleBatchDrop = (batchId: number) => {
        showConfirmDialog({
            title: t('SPLITTER.merge_batch'),
            message: t('SPLITTER.confirm_merge_batch', { sourceBatchId: batchId, targetBatchId: batch.id }),
            confirmText: t('GLOBAL.merge'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                setLoading(true);
                try {
                    await post(`/splitter/merge/${ batch.id }`, { batches: [batchId] });
                    showToast(t('SPLITTER.batches_merged'), 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 200);
                } catch (error) {
                    console.error("Error merging batches:", error);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleShowBatches = async () => {
        setShowBatches(!showBatches);

        if (!showBatches && batchesList.length === 0) {
            try {
                const res = await post('/splitter/batches/list', {
                    page: 0,
                    size: 10,
                    time: batchTime,
                    user_id: user.id,
                    status: batch.status
                });

                if (res?.batches) {
                    res.batches.forEach((b: any) => {
                        if (b.id !== batch.id) {
                            setBatchesList(prev => [...prev, b]);
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching batches:", error);
            }
        }
    }

    const getFilteredConditionalOptions = (document_id: number, field: any) => {
        if (!field.settings?.options) return [];
        if (!field.settings?.conditional) return field.settings.options;

        const options: any[] = [];
        field.settings.options.forEach((option: any) => {
            const conditionalCustomField: any = customFields.find((f) => f.id === option.conditional_custom_field);
            if (conditionalCustomField) {
                let conditionalFieldValue = documentMetadataValues[document_id]?.[conditionalCustomField.label_short];
                if (conditionalCustomField.type === 'select' && conditionalFieldValue) {
                    const conditionalOption = conditionalCustomField.settings.options.find((o: any) => o.id === conditionalFieldValue.id);
                    if (conditionalOption) {
                        conditionalFieldValue = conditionalOption.id;
                    }
                }

                if (conditionalFieldValue === option.conditional_custom_value) {
                    options.push({
                        'value': option.id,
                        'label': option.label
                    });
                }
            }
        });
        return options;
    };

    if (loadingBatch || !batch) return <Loader/>;

    return (
        <div className='flex h-full w-full relative'>
            <div className='w-full relative'
                 onDragOver={ (e) => {
                     if (draggingBatchId) e.preventDefault();
                 } }
                 onDrop={ (e) => {
                     e.preventDefault();
                     if (draggingBatchId) {
                         handleBatchDrop(draggingBatchId);
                         setDraggingBatchId(null);
                     }
                 } }
            >
                { draggingBatchId && (
                    <div className="absolute inset-2 z-30 bg-(--bg-selected)/90 border-2 border-dashed
                                    border-(--color-primary) rounded-lg flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col gap-2 items-center w-1/3 text-center">
                            <Combine size={ 20 } className="text-(--text-secondary)"/>
                            <span className="text-(--text-primary)">
                                { t('SPLITTER.drop_batch_here') }
                            </span>
                        </div>
                    </div>
                ) }

                { loading && (
                    <div className={ `absolute inset-0 z-20 flex items-center justify-center bg-(--bg-primary)/80` }>
                        <Loader/>
                    </div>
                ) }

                { (!showAttachments) && (
                    <div className='flex justify-center'>
                        <div className='fixed bottom-4 shadow-lg rounded-3xl flex justify-center items-center gap-4 p-3 bg-(--bg-primary) border
                            border-(--border-secondary) z-10'>
                            <div className={ `bg-(--bg-secondary) p-3 rounded-xl flex items-center gap-2
                                              ${ selectedPages.length == 0 ? 'bg-(--bg-secondary)' : 'bg-(--bg-selected)' }` }>
                                <Checkbox checked={ selectedPages.length !== 0 } onChange={ selectAll }
                                          indeterminate={ selectedPages.length != pagesCount } disabled={ disabledBatch }/>
                                <div className={ `text-sm ${ disabledBatch ? 'cursor-not-allowed' : 'cursor-pointer' }` }
                                     onClick={ selectAll }>
                                    <strong>{ selectedPages.length } </strong>
                                    <span
                                        dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(t('SPLITTER.pages_selected', { count: selectedPages.length })) } }/>
                                </div>
                            </div>
                            <div onClick={ handleDeletePage }
                                 className={ `text-sm text-(--text-error) flex items-center gap-1 font-semibold 
                                        hover:bg-(--bg-error) transition-colors rounded-xl p-3
                                        ${ selectedPages.length == 0 || disabledBatch || certifiedCopy ? 'hidden' : 'cursor-pointer' } ` }>
                                <Trash size={ 16 }/>
                                { t('GLOBAL.delete') }
                            </div>

                            <div onClick={ handleRotation }
                                 className={ `flex items-center text-(--text-secondprimaryary) text-sm gap-1 font-semibold 
                                        hover:bg-(--bg-secondary) transition-colors rounded-xl p-3
                                        ${ selectedPages.length == 0 || disabledBatch || certifiedCopy ? 'hidden' : 'cursor-pointer' } ` }>
                                <RotateCw size={ 14 }/>
                                { t('SPLITTER.rotation') }
                            </div>

                            <Divider layout="vertical"/>

                            <div
                                className={ `flex items-center text-(--text-primary) font-semibold text-sm gap-1  rounded-xl p-3
                                             hover:bg-(--bg-secondary) transition-colors ${ certifiedCopy && 'hidden' } 
                                             ${ attachmentsCount > 0 || disabledBatch ? 'cursor-not-allowed opacity-50' : 'cursor-pointer' } ` }
                                { ...(attachmentsCount > 0 && {
                                    "data-tooltip-id": "tooltip",
                                    "data-tooltip-content": t('SPLITTER.cant_add_document')
                                }) }
                            >
                                <div onClick={ () => attachmentsCount === 0 && !disabledBatch && !certifiedCopy && addDocument() }
                                     className={ 'flex items-center gap-1' }>
                                    <Plus size={ 16 }/>
                                    { t('SPLITTER.add_document') }
                                </div>
                            </div>

                            <div onClick={ () => unSavedChanges && !disabledBatch && handleSaveChanges() }
                                 className={ `flex items-center text-(--text-primary) text-sm gap-1
                              hover:bg-(--bg-secondary) transition-colors rounded-full p-3
                             ${ !unSavedChanges || disabledBatch ? 'cursor-not-allowed opacity-50' : 'cursor-pointer' } ` }>
                                <Save size={ 16 }/>
                            </div>

                            <div>
                                <Tooltip
                                    id="tooltip-outputs"
                                    render={ () => (
                                        <div className='flex flex-col gap-1'>
                                            <div className='font-semibold'>
                                                { t('GLOBAL.executed_outputs') }
                                            </div>
                                            <div className='text-(--text-secondary)'>
                                                { outputsLabels.join(", ") }
                                            </div>
                                        </div>
                                    ) }
                                />
                                <CircleAlert data-tooltip-id="tooltip-outputs" size={ 20 }
                                             className={ `${ disabledBatch ? 'pointer-events-none opacity-50' : 'cursor-pointer' }` }/>
                            </div>

                            <Button disabled={ unSavedChanges || loading || disabledBatch }
                                    className='flex items-center gap-2 px-3!'
                                    onClick={ handleValidateBatch }>
                                <PackageCheck size={ 16 }/>
                                { t('SPLITTER.validate_batch') }
                            </Button>
                        </div>
                    </div>
                ) }

                { thumbnail && (
                    <>
                        <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                             onClick={ () => setThumbnailSafe(null) }/>
                        <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                    max-w-[32vw] border border-(--border-secondary)
                                    rounded-lg overflow-hidden">
                            <img src={ thumbnail } alt="Thumbnail"/>
                            <Button variant="secondary" size="sm" className="absolute top-2 right-2"
                                    onClick={ () => setThumbnailSafe(null) }>
                                <X size={ 16 }/>
                            </Button>
                        </div>
                    </>
                ) }

                { showDoctypeSelection && (
                    <>
                        <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                             onClick={ () => setShowDoctypeSelection(false) }/>
                        <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                    min-w-[32vw] h-3/4 max-h-screen border border-(--border-secondary)
                                    rounded-lg bg-(--bg-primary) flex flex-col">
                            <div className='flex items-center px-6 pt-6'>
                                <h2>{ t('SPLITTER.select_doctype') }</h2>
                                <div className='ml-auto cursor-pointer text-(--text-secondary)'
                                     onClick={ () => setShowDoctypeSelection(false) }>
                                    <X/>
                                </div>
                            </div>
                            <div className='overflow-hidden'>
                                <DoctypesTree formId={ batch.form_id } canFolderBeSelected={ false } editor={ false }
                                              doctypesList={ doctypes } onSelect={ (node) => handleChangeDoctype(node) }
                                              onTmpSelect={ (node) => setTmpDoctype(node) }/>
                            </div>
                            <div className='flex mt-auto justify-end items-center gap-4 p-4'>
                                <Button variant={ "no_bg" } onClick={ () => setShowDoctypeSelection(false) }>
                                    { t('GLOBAL.cancel') }
                                </Button>
                                <Button onClick={ () => handleChangeDoctype(tmpDoctype) } disabled={ !tmpDoctype }>
                                    { t('GLOBAL.select') }
                                </Button>
                            </div>
                        </div>
                    </>
                ) }

                { !showAttachments && (
                    <div className='px-8 py-4 flex items-center gap-2'>
                        <Button variant='bg_white_rounded' icon={ <ArrowLeft size={ 16 }/> }
                                onClick={ () => navigate('/home') }>
                            { t('GLOBAL.back') }
                        </Button>
                        <div className='ml-auto'>
                            <Button variant='bg_white_rounded' icon={ <Download size={ 18 }/> }
                                    onClick={ handleDownloadOriginalFile }>
                                { batch.file_name }
                            </Button>
                        </div>

                        { enableAttachments && (
                            <div className={ `${ documents.length > 1 && 'cursor-not-allowed!' }` }
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
                                        <div className="z-1 absolute top-0 right-0 size-3 rounded-full bg-(--color-primary)"/>
                                    ) }
                                </div>
                            </div>
                        ) }

                        { !certifiedCopy && (
                            <div className={ `flex items-center justify-center bg-(--bg-primary) p-3.5 rounded-full
                                          border border-(--border-secondary) hover:border-(--border-primary)
                                          hover:text-(--color-primary) transition-colors shrink-0 relative cursor-pointer
                                          ${ showBatches ? 'border-(--color-primary) bg-(--bg-selected)' : '' }`
                            }
                                 onClick={ handleShowBatches }
                                 { ...(!certifiedCopy && {
                                     "data-tooltip-id": "tooltip",
                                     "data-tooltip-content": t('SPLITTER.show_batches')
                                 }) }
                            >
                                <Package size={ 18 }/>
                            </div>
                        ) }
                    </div>
                ) }

                { !showAttachments && disabledBatch && (
                    <div className='px-8 pb-4'>
                        <div className='w-full bg-(--bg-error) p-4 rounded-lg flex flex-col gap-4 border border-(--text-error)'>
                            <div className='flex items-center gap-3'>
                                <div className='bg-(--text-error) p-2 rounded-lg'>
                                    <PenOff className="text-white" size={ 28 }/>
                                </div>
                                <div className='flex flex-col'>
                                    <span
                                        className='text-(--text-error) font-semibold'>{ t('SPLITTER.batch_non_modifiable') }</span>
                                    <span
                                        className='text-(--text-secondary)'>{ t('SPLITTER.batch_non_modifiable_details') }</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) }

                { !showAttachments && certifiedCopy && (
                    <div className='px-8 pb-4'>
                        <div className='w-full p-4 rounded-lg flex flex-col gap-4 border bg-yellow-500/10 border-yellow-500'>
                            <div className='flex items-center gap-3'>
                                <div className='flex flex-col'>
                                    <span
                                        className='text-yellow-700 font-semibold'>{ t('SPLITTER.batch_certified_copy') }</span>
                                    <span
                                        className='text-(--text-secondary)'>{ t('SPLITTER.batch_certified_copy_details') }</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) }

                { enableAttachments && (
                    <div className={ `w-full h-full flex flex-col ${ !showAttachments && 'hidden' }` }>
                        <AttachmentsList
                            module="splitter"
                            documentId={ batchId }
                            disabled={ disabledBatch }
                            disableUnbinding={ certifiedCopy }
                            key={ attachmentsRefreshKey }
                            unBinding={ handleUnbinding }
                            onAttachmentsCountChange={ setAttachmentsCount }
                            onClose={ () => setShowAttachments(false) }
                        />
                    </div>
                ) }

                { !showAttachments && (
                    <div ref={ listRef } className={ `${ disabledBatch || certifiedCopy ? 'pb-66' : 'pb-42' } px-8 h-full overflow-y-auto` }
                         onClick={ () => setSelectedDocument(null) }>
                        <Accordion className='mb-6' activeIndex={ 0 }>
                            <AccordionTab header={ t('SPLITTER.batch_content') }>
                                <div className='flex flex-col gap-6 p-4'>
                                    <div className='text-(--text-secondary) flex items-center gap-4'>
                                        <span className='flex items-center'>
                                            <Layers size={ 16 }/>&nbsp;
                                            <span>{ pagesCount }</span>&nbsp;
                                            { t('SPLITTER.pages', { count: pagesCount }) }
                                        </span>
                                        <span className='flex items-center'>
                                            <FileStack size={ 16 }/>&nbsp;
                                            <span>{ documents.length }</span>&nbsp;
                                            { t('SPLITTER.documents', { count: documents.length }) }
                                        </span>
                                    </div>

                                    <Dropdown id={ "forms" }
                                              filter={ true }
                                              className="w-1/3"
                                              disabled={ disabledBatch }
                                              label={ t('VERIFIER.form') }
                                              options={ forms.map((form: any) => ({
                                                  label: form.label,
                                                  value: form.id
                                              })) }
                                              value={ batch.form_id }
                                              onChange={ handleChangeForm }
                                    />

                                    { batchMetadata && batchMetadata.length > 0 && (
                                        <div>
                                            <h3 className='font-semibold mb-4'>{ t('FORMS.metadata_batch') }</h3>
                                            { batchMetadata.map((line: any, index: number) => (
                                                <div key={ index } className={ `flex gap-4` }>
                                                    { line.map((field: any) => (
                                                        <div key={ field.id }
                                                             className={ `min-w-1/6 ${ getWidthLine(line) }` }>
                                                            { field.type === 'date' ? (
                                                                <ISOCalendar
                                                                    id={ field.id }
                                                                    key={ field.id }
                                                                    label={ t(field.label) }
                                                                    disabled={ disabledBatch }
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
                                                                            className="w-full"
                                                                            useExtraInLabel={ true }
                                                                            disabled={ disabledBatch }
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
                                                                            disabled={ disabledBatch }
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
                                    onClick={ (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedDocument(document);
                                    } }
                                    className='mb-4 w-full'
                                    header={
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className={ `${ disabledBatch ? 'cursor-not-allowed' : 'cursor-pointer hover:text-(--color-primary)' }` }
                                                onClick={ () => !disabledBatch && typeDocument(document) }>
                                                { !document.doctype_label && (
                                                    <div className='transition-colors items-center gap-2
                                                                hover:text-(--text-error) text-(--text-error)/80 font-semibold flex'>
                                                        <div className='bg-(--text-error)/20 rounded-md p-1'>
                                                            <FolderTree size={ 20 }/>
                                                        </div>
                                                        { t('SPLITTER.type_document') }
                                                    </div>
                                                ) }
                                                <div className='transition-colors items-center gap-2 font-semibold flex'>
                                                    { document.doctype_label && (
                                                        <div className='bg-(--bg-secondary) rounded-md p-1'>
                                                            <File size={ 20 }/>
                                                        </div>
                                                    ) }
                                                    <div>{ document.doctype_label }</div>
                                                </div>
                                            </div>
                                            <div
                                                className='text-(--text-secondary) font-medium flex items-center bg-(--bg-secondary) px-3 py-1 rounded-3xl'>
                                                <span>{ document.pages.length }&nbsp;</span>
                                                { t('SPLITTER.pages', { count: document.pages.length }) }
                                            </div>
                                            <div className='ml-auto'>
                                                <EllipsisVertical
                                                    size={ 18 }
                                                    className={ `${ disabledBatch ? 'cursor-not-allowed' : 'cursor-pointer' }` }
                                                    onClick={ (e) => {
                                                        if (disabledBatch) return;
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedDocument(document);
                                                        cm.current?.show(e);
                                                    } }
                                                />
                                                <ContextMenu model={ menuItems } className="w-auto!" ref={ cm }/>
                                            </div>
                                        </div>
                                    }
                                >
                                    { documentMetadata.length > 0 && document.pages.length > 0 && (
                                        <div className='px-4 pt-4'>
                                            <h3 className='font-semibold flex items-center cursor-pointer gap-1'
                                                onClick={ () => setDocumentMetadataOpen(prev => !prev) }>
                                                { t('FORMS.metadata_document') }
                                                <ChevronDown
                                                    size={ 16 }
                                                    className={ `transition-transform ${ documentMetadataOpen ? 'rotate-0' : '-rotate-90' }` }
                                                />
                                            </h3>
                                            <div className={ `grid transition-all` }
                                                 style={ { gridTemplateRows: documentMetadataOpen ? '1fr' : '0fr' } }
                                            >
                                                <div className="overflow-hidden">
                                                    { documentMetadata.map((line: any, index: number) => (
                                                        <div key={ index } className={ `flex gap-4 mt-4` }>
                                                            { line.map((field: any) => (
                                                                <div key={ field.id }
                                                                     className={ `min-w-1/6 ${ getWidthLine(line) }` }>
                                                                    { field.type === 'date' && (
                                                                        <ISOCalendar
                                                                            id={ field.id }
                                                                            key={ field.id }
                                                                            label={ t(field.label) }
                                                                            disabled={ disabledBatch }
                                                                            required={ field.required }
                                                                            value={ documentMetadataValues[document.id]?.[field.label_short] }
                                                                            onChange={ (e) => {
                                                                                handleUpdateDocumentMetadataValues(document.id, field, e)
                                                                            } }
                                                                        />
                                                                    ) }
                                                                    { field.type == 'text' && (
                                                                        <Input
                                                                            id={ field.id }
                                                                            key={ field.id }
                                                                            type={ field.type }
                                                                            label={ t(field.label) }
                                                                            disabled={ disabledBatch }
                                                                            required={ field.required }
                                                                            value={ documentMetadataValues[document.id]?.[field.label_short] }
                                                                            onChange={ (e) => {
                                                                                handleUpdateDocumentMetadataValues(document.id, field, e.target.value)
                                                                            } }
                                                                        />
                                                                    ) }
                                                                    { field.type == 'select' && (
                                                                        <Dropdown
                                                                            filter={ true }
                                                                            id={ field.id }
                                                                            label={ t(field.label) }
                                                                            required={ field.required }
                                                                            disabled={ disabledBatch }
                                                                            value={ documentMetadataValues[document.id]?.[field.label_short] }
                                                                            options={ getFilteredConditionalOptions(document.id, field) }
                                                                            onChange={ (e) => {
                                                                                handleUpdateDocumentMetadataValues(document.id, field, e.target.value)
                                                                            } }
                                                                        />
                                                                    ) }
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
                                            disabled={ disabledBatch }
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

            { showBatches && (
                <div className="bg-(--bg-primary) shrink-0 w-[20rem] flex flex-col border-l border-(--border-secondary)">
                    <div className='text-center p-4 border-b border-(--border-secondary)'>
                        { t(`GLOBAL.${ batchTime }`) } ({ statuses.find(s => batch.status === s.id).label })
                    </div>
                    <div className='p-4 space-y-4 overflow-y-auto'>
                        { batchesList.length === 0 && (
                            <div className='text-(--text-secondary) flex flex-col text-center items-center gap-2 mt-10'>
                                <Package size={ 32 }/>
                                <span>{ t('SPLITTER.no_other_batches') }</span>
                            </div>
                        ) }
                        { batchesList.map((row: any) => (
                            <BatchCard key={ row.id } row={ row } navigate={ navigate }
                                       onBatchDragStart={ (id: number) => setDraggingBatchId(id) }
                                       onBatchDragEnd={ () => setDraggingBatchId(null) }/>
                        )) }
                    </div>
                </div>
            ) }
        </div>
    )
        ;
}