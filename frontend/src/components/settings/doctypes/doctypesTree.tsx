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
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useEffect, useMemo, useState } from "react";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
    ArrowRightToLine,
    ChevronDown,
    ChevronRight,
    Copy,
    Download,
    GripVertical,
    Maximize,
    Minimize,
    Plus,
    Sheet,
    Upload,
    X
} from "lucide-react";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";

import { buildDoctypesTree, collectExpanded, type DoctypeTreeNode, type ExpandedKeysType, makeNodeTemplate } from "./helpers";

import Hint from "../../Hint";
import Input from "../../Input";
import { Button } from "../../Button";
import { Select } from "../../Select";
import { Loader } from "../../loader/Loader";
import { showToast } from "../../ToastProvider";
import { ImportSpreadSheet } from "../ImportSpreadSheet";

function DoctypeNode({
                          node,
                          depth,
                          editor,
                          expandedKeys,
                          selectedKey,
                          renderLabel,
                          onToggle,
                          onNodeClick,
                          onNodeDoubleClick
                      }: {
    node: DoctypeTreeNode;
    depth: number;
    editor?: boolean;
    expandedKeys: ExpandedKeysType;
    selectedKey: string | null;
    renderLabel: (node: DoctypeTreeNode) => React.ReactNode;
    onToggle: (key: string) => void;
    onNodeClick: (node: DoctypeTreeNode) => void;
    onNodeDoubleClick: (node: DoctypeTreeNode) => void;
}) {
    const hasChildren = !!node.children?.length;
    const isExpanded = expandedKeys[node.key];
    const isSelected = selectedKey === node.key;

    return (
        <div>
            <div
                onClick={ () => onNodeClick(node) }
                onDoubleClick={ () => onNodeDoubleClick(node) }
                style={ { marginLeft: `${ depth * 1.25 }rem` } }
                className={ `flex items-center py-1 px-1 rounded-md cursor-pointer transition-colors
                            ${ isSelected ? 'bg-(--color-primary) text-white node-selected' : 'hover:bg-(--bg-selected)' }` }
            >
                <span
                    className={ `shrink-0 flex items-center justify-center size-5 ${ hasChildren ? 'cursor-pointer' : 'hidden' }` }
                    onClick={ (e) => {
                        e.stopPropagation();
                        if (hasChildren) onToggle(node.key);
                    } }
                >
                    { hasChildren && (isExpanded ? <ChevronDown size={ 16 }/> : <ChevronRight size={ 16 }/>) }
                </span>

                { renderLabel(node) }
            </div>

            { hasChildren && isExpanded && (
                <div>
                    { node.children!.map(child => (
                        <DoctypeNode
                            node={ child }
                            key={ child.key }
                            editor={ editor }
                            depth={ depth + 1 }
                            expandedKeys={ expandedKeys }
                            selectedKey={ selectedKey }
                            renderLabel={ renderLabel }
                            onToggle={ onToggle }
                            onNodeClick={ onNodeClick }
                            onNodeDoubleClick={ onNodeDoubleClick }
                        />
                    )) }
                </div>
            ) }
        </div>
    );
}

function SortableFieldItem({ field, lastField, onRemove }: {
    field: any,
    lastField: boolean,
    onRemove?: (field: any) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div
            ref={ setNodeRef }
            style={ style }
            className={ `p-2 border-b border-(--border-secondary) flex gap-2 items-center ${ lastField ? 'border-b-0' : '' }` }
        >
            <div { ...attributes } { ...listeners } className="cursor-grab text-(--text-secondary)">
                <GripVertical size={ 20 }/>
            </div>

            { field.label }
            <div className='ml-auto flex items-center gap-4'>
                <div className='text-(--text-secondary) text-sm bg-(--bg-secondary) px-3 py-1 rounded-full'>
                    { field.id }
                </div>
                <X size={ 16 } className="z-10 ml-auto text-(--text-secondary) cursor-pointer" onClick={ (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove?.(field);
                } }/>
            </div>
        </div>
    );
}

export function DoctypesTree({
                                 formId,
                                 editor,
                                 onSelect,
                                 onTmpSelect,
                                 doctypesList,
                                 selectedDoctype,
                                 onDoctypesLoaded,
                                 canFolderBeSelected = true
                             }: {
    formId: number;
    editor?: boolean;
    doctypesList?: any[];
    selectedDoctype?: any;
    canFolderBeSelected?: boolean;
    onSelect?: (node: any) => void;
    onTmpSelect?: (node: any) => void;
    onDoctypesLoaded?: (doctypes: any[]) => void;
}) {
    const { get, post } = axiosApiCall();

    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingExport, setLoadingExport] = useState(false);
    const [loadingImport, setLoadingImport] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);

    const [doctypes, setDoctypes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedKeys, setExpandedKeys] = useState<ExpandedKeysType>({});
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

    const [forceRelaunch, setForceRelaunch] = useState(0);
    const [showCloneDialog, setShowCloneDialog] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));
    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = selectedFields.findIndex(f => f.id === active.id);
        const newIndex = selectedFields.findIndex(f => f.id === over.id);

        setSelectedFields(arrayMove(selectedFields, oldIndex, newIndex));
    };
    const delimiterOptions = [
        { label: t("DOCTYPES.tab"), value: "TAB", icon: <ArrowRightToLine size={ 16 }/> },
        { label: t("DOCTYPES.comma"), value: "COMMA", icon: <span style={ { transform: "translateY(2px)" } }>,</span> },
        {
            label: t("DOCTYPES.semicolon"),
            value: "SEMICOLON",
            icon: <span style={ { transform: "translateY(2px)" } }>;</span>
        }
    ];

    const [format, _] = useState("CSV");
    const [delimiter, setDelimiter] = useState(delimiterOptions[2].value);

    const availableFields = [
        { label: t('DOCTYPES.field_label'), id: 'label', selected: true },
        { label: t('DOCTYPES.field_type'), id: 'type', selected: true },
        { label: t('VERIFIER.id'), id: 'key', selected: true },
        { label: t('DOCTYPES.field_form_id'), id: 'form_id', selected: true },
        { label: t('DOCTYPES.field_code'), id: 'code', selected: true },
        { label: t('DOCTYPES.field_status'), id: 'status', selected: false },
        { label: t('DOCTYPES.default_doctype'), id: 'isDefault', selected: false }
    ];

    const [unselectedFields, setUnselectedFields] = useState<any[]>(
        availableFields.filter(f => !f.selected)
    );

    const [selectedFields, setSelectedFields] = useState<any[]>(
        availableFields.filter(f => f.selected)
    );

    const ROOT_NODE: DoctypeTreeNode = {
        key: "0",
        data: { code: "0", label: t('DOCTYPES.root'), type: "root" }
    };

    // Fetch doctypes and forms
    useEffect(() => {
        if (!editor) {
            if (doctypesList) {
                setDoctypes(doctypesList);
                setLoading(false);
                return;
            }
        }

        const fetchDocTypes = async () => {
            try {
                const response = await get(`/doctypes/list/${ formId }`);
                setDoctypes(response.doctypes);
                onDoctypesLoaded?.(response.doctypes);
            } catch (error) {
                console.error("Error fetching doctypes:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchForms = async () => {
            try {
                const res = await get(`/forms/splitter/list`);
                setForms(res.forms.filter((f: any) => f.id !== formId));
            } catch (error) {
                console.error("Error fetching forms:", error);
            }
        };

        fetchForms().then();
        fetchDocTypes().then();
    }, [formId, forceRelaunch]);

    // Set selected key from props
    useEffect(() => {
        if (selectedDoctype) {
            setSelectedKey(selectedDoctype.code);
        } else {
            setSelectedKey('0');
        }
    }, [selectedDoctype]);

    // Derived tree
    const treeNodes = useMemo(() => {
        if (!doctypes) return [];

        const children = buildDoctypesTree(doctypes);

        if (!editor) {
            return children;
        }

        return [
            {
                ...ROOT_NODE,
                children
            }
        ];
    }, [doctypes]);

    // Expand all when nodes change
    useEffect(() => {
        setExpandedKeys(collectExpanded(treeNodes));
    }, [treeNodes]);

    const expandAll = useCallback(() => {
        setExpandedKeys(collectExpanded(treeNodes));
    }, [treeNodes]);

    const collapseAll = useCallback(() => {
        setExpandedKeys({});
    }, []);

    const handleSelect = useCallback((e: any) => {
        const key = e.value as string;
        if (key === ROOT_NODE.key) {
            setSelectedKey(key);
            onSelect?.(ROOT_NODE.data);
            return;
        }

        const flat = doctypes.find(d => d.code === key);

        if (!flat) return;
        if (flat.type === "folder" && !canFolderBeSelected) return;

        setSelectedKey(key);
        onSelect?.(flat);

    }, [doctypes, canFolderBeSelected, onSelect]);

    const cloneDoctypes = async () => {
        try {
            await get(`/doctypes/clone/${ selectedFormId }/${ formId }`);
            setShowCloneDialog(false);
            setForceRelaunch(f => f + 1);
            showToast(t('DOCTYPES.clone_success'), "success");
        } catch (error) {
            console.error("Error cloning doctypes:", error);
        }
    }

    const handleRemoveField = (field: any) => {
        setSelectedFields(prev => prev.filter(f => f.id !== field.id));
        setUnselectedFields(prev => [...prev, { ...field, selected: false }]);
    };

    const exportDoctypes = async () => {
        setLoadingExport(true);

        try {
            const payload = {
                formId: formId,
                extension: format,
                delimiter: delimiter,
                columns: selectedFields
            };

            const response = await post(`/doctypes/export`, payload);
            if (!response.encoded_file) {
                showToast(t('DOCTYPES.export_failed'), 'error');
                return;
            }

            const binary = atob(response.encoded_file);
            const bytes = new Uint8Array(binary.length);

            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: "text/csv;charset=utf-8" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `doctypes.${ format.toLowerCase() }`;
            link.click();
            window.URL.revokeObjectURL(url);

            showToast(t('DOCTYPES.export_success'), 'success');
        } catch (error) {
            console.error("Error exporting doctypes:", error);
        } finally {
            setLoadingExport(false);
        }
    };

    const handleImportDoctypes = async (formData: any) => {
        if (!formData) return;

        setLoadingImport(true);

        await post('/doctypes/csv/import', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        setLoadingImport(false);
        setShowImportDialog(false);
        setForceRelaunch(f => f + 1);
        showToast(t('DOCTYPES.import_success'), 'success');
    }

    if (loading) return <Loader/>;

    return (
        <div className="h-full overflow-hidden flex">
            { showImportDialog && (
                <ImportSpreadSheet
                    loading={ loadingImport }
                    onValidate={ handleImportDoctypes }
                    title={ t('DOCTYPES.import_doctypes') }
                    onClose={ () => setShowImportDialog(false) }
                    columns={ ['label', 'type', 'key', 'form_id', 'code'] }
                />
            ) }

            { showExportDialog && (
                <>
                    <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                         onClick={ () => setShowExportDialog(false) }/>
                    <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-y-auto
                                                h-fit max-h-screen border border-(--border-secondary)
                                                rounded-lg bg-(--bg-primary) flex flex-col">
                        <div className='flex flex-col p-6 gap-4'>
                            <h2>
                                { t('DOCTYPES.export_doctypes') }
                            </h2>
                            <div className='flex flex-col gap-1'>
                                <p className='text-(--text-secondary) font-semibold'>
                                    { t('DOCTYPES.format') }
                                </p>
                                <div className={ `border border-(--border-secondary) hover:border-(--border-primary) transition-colors
                                                  ${ format === "CSV" ? 'bg-(--bg-selected) border-(--border-primary)! text-(--color-primary)' : '' }
                                                  rounded-lg px-12 py-4 cursor-pointer flex flex-col items-center text-center justify-center gap-2` }>
                                    <Sheet/>
                                    <p className='text-md font-semibold min-w-32'>CSV</p>
                                </div>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <p className='text-(--text-secondary) font-semibold'>
                                    { t('DOCTYPES.delimiter') }
                                </p>
                                <div className='flex gap-4'>
                                    { delimiterOptions.map(opt => (
                                        <div key={ opt.value } onClick={ () => setDelimiter(opt.value) }
                                             className={ ` border border-(--border-secondary) hover:border-(--border-primary) transition-colors
                                                    ${ delimiter === opt.value ? 'bg-(--bg-selected) border-(--border-primary)! text-(--color-primary)' : '' }
                                                    rounded-lg px-12 py-4 cursor-pointer flex flex-col items-center text-center justify-center gap-2` }>
                                            { opt.icon }
                                            <p className='text-md font-semibold min-w-32'>{ opt.label }</p>
                                        </div>
                                    )) }
                                </div>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <p className='text-(--text-secondary) font-semibold'>
                                    { t('DOCTYPES.fields_to_export') }
                                </p>
                                <>
                                    <DndContext sensors={ sensors } collisionDetection={ closestCenter }
                                                onDragEnd={ handleDragEnd }>
                                        <SortableContext
                                            items={ selectedFields.map(f => f.id) }
                                            strategy={ verticalListSortingStrategy }
                                        >
                                            <div
                                                className='border border-(--border-secondary) rounded-lg flex flex-col gap-2'>
                                                { selectedFields.map(field => (
                                                    <SortableFieldItem key={ field.id } field={ field }
                                                                       lastField={ field.id === selectedFields[selectedFields.length - 1].id }
                                                                       onRemove={ () => handleRemoveField(field) }/>
                                                )) }
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </>
                                <div className='flex gap-4 mt-2'>
                                    { unselectedFields.map(field => (
                                        <div key={ field.id } onClick={ () => {
                                            setUnselectedFields(prev => prev.filter(f => f.id !== field.id));
                                            setSelectedFields(prev => [...prev, { ...field, selected: true }]);
                                        } }
                                             className={ `border border-(--border-secondary) hover:border-(--border-primary) transition-colors
                                                    rounded-md px-2 py-1 cursor-pointer flex items-center text-center justify-center gap-2` }>
                                            { field.label }
                                            <Plus size={ 16 }/>
                                        </div>
                                    )) }
                                </div>
                            </div>
                            <div className='mt-4 flex justify-end w-full gap-4'>
                                <Button variant={ "no_bg" } onClick={ () => setShowExportDialog(false) }>
                                    { t('GLOBAL.cancel') }
                                </Button>
                                <Button onClick={ () => exportDoctypes() }>
                                    { loadingExport ? t('DOCTYPES.exporting') : t('DOCTYPES.export_doctypes') }
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            ) }

            { showCloneDialog && (
                <>
                    <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                         onClick={ () => setShowCloneDialog(false) }/>
                    <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                            min-w-[32vw] h-fit max-h-screen border border-(--border-secondary)
                                            rounded-lg bg-(--bg-primary) flex flex-col">
                        <div className='flex flex-col px-6 p-6'>
                            <>
                                <h2>
                                    { t('DOCTYPES.clone_doctype_title') }
                                </h2>
                                <p className='text-sm text-(--text-secondary) mb-4'>
                                    { t('DOCTYPES.clone_doctype_desc') }
                                </p>

                                <Hint variant='warning'>
                                    { t('GLOBAL.action_irreversible') }
                                </Hint>
                            </>
                            <div className='absolute right-4 top-4 cursor-pointer text-(--text-secondary)'
                                 onClick={ () => setShowCloneDialog(false) }>
                                <X/>
                            </div>
                            <div className='w-full flex flex-col gap-2 mt-2'>
                                <Select
                                    value={ selectedFormId } id="clone_form_select"
                                    options={ forms.map((f: any) => ({ label: f.label, value: f.id })) }
                                    onChange={ (value: any) => setSelectedFormId(value) }
                                    label={ t('DOCTYPES.select_form_to_clone_from') }
                                />
                            </div>
                            <div className='mt-4 flex justify-end w-full gap-4'>
                                <Button variant={ "no_bg" } onClick={ () => setShowCloneDialog(false) }>
                                    { t('GLOBAL.cancel') }
                                </Button>
                                <Button onClick={ () => cloneDoctypes() }>
                                    { t('DOCTYPES.clone_doctypes') }
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            ) }

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 pb-0 flex flex-col gap-2">
                    <Input
                        type="text"
                        value={ searchTerm }
                        onChange={ e => {
                            const v = e.target.value;
                            setSearchTerm(v);

                            if (v) expandAll();
                        } }
                        label={ t("GLOBAL.search") }
                    />

                    <div className="flex mb-3">
                        <div className="actionsButton">
                            <span onClick={ expandAll } className="rounded-l-md dark:bg-(--bg-secondary) border">
                                <Maximize size={ 16 }/>
                            </span>

                            <span onClick={ collapseAll }
                                  className="rounded-r-md dark:bg-(--bg-secondary) border border-l-0">
                                <Minimize size={ 16 }/>
                            </span>
                        </div>

                        { editor && (
                            <div className="actionsButton ml-auto">
                                <span className="rounded-l-md dark:bg-(--bg-secondary) border"
                                      onClick={ () => setShowImportDialog(true) }
                                      data-tooltip-id='tooltip' data-tooltip-content={ t('DOCTYPES.import') }>
                                    <Download size={ 16 }/>
                                </span>

                                <span className="rounded-r-md dark:bg-(--bg-secondary) border border-l-0"
                                      onClick={ () => setShowExportDialog(true) }
                                      data-tooltip-id='tooltip' data-tooltip-content={ t('DOCTYPES.export') }>
                                    <Upload size={ 16 }/>
                                </span>

                                <span className="rounded-md dark:bg-(--bg-secondary) ml-2 border"
                                      onClick={ () => setShowCloneDialog(true) }
                                      data-tooltip-content={ t('DOCTYPES.clone_doctype') }
                                      data-tooltip-id='tooltip'>
                                    <Copy size={ 16 }/>
                                </span>
                            </div>
                        ) }
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    { treeNodes.length === 0 ? (
                        <div className="text-center text-(--text-secondary) py-8">
                            { searchTerm ? t('GLOBAL.no_results_for') + `"${ searchTerm }"` : t("DOCTYPES.no_doctypes") }
                        </div>
                    ) : (
                        treeNodes.map(node => (
                            <DoctypeNode
                                key={ node.key }
                                node={ node }
                                depth={ 0 }
                                editor={ editor }
                                expandedKeys={ expandedKeys }
                                selectedKey={ selectedKey }
                                renderLabel={ makeNodeTemplate(searchTerm, expandedKeys) }
                                onToggle={ key => setExpandedKeys(prev =>
                                    prev[key]
                                        ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key))
                                        : { ...prev, [key]: true }
                                ) }
                                onNodeClick={ node => {
                                    const key = node.key;
                                    if (!editor && node.data?.type === "document") {
                                        onTmpSelect?.(node.data);
                                        setSelectedKey(key);
                                    } else if (!editor && node.data?.type === "folder") {
                                        setExpandedKeys(prev =>
                                            prev[key]
                                                ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key))
                                                : { ...prev, [key]: true }
                                        );
                                    } else if (editor) {
                                        handleSelect({ value: key });
                                    }
                                } }
                                onNodeDoubleClick={ node => {
                                    if (node.data?.type === "folder") {
                                        const key = node.key;
                                        setExpandedKeys(prev =>
                                            prev[key]
                                                ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key))
                                                : { ...prev, [key]: true }
                                        );
                                    } else {
                                        handleSelect({ value: node.key });
                                    }
                                } }
                            />
                        ))
                    ) }
                </div>
            </div>
        </div>
    );
}