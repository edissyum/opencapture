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
import { Copy, Download, File, FileBadge, Folder, FolderOpen, Maximize, Minimize, Upload } from "lucide-react";
import type { TreeNode } from "primereact/treenode";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Tree, type TreeExpandedKeysType } from "primereact/tree";

import Input from "../../Input";
import { buildPrimeTree, collectExpanded, normalizeValue } from "./helpers";
import { axiosApiCall } from "../../../services/hooks/axiosApiCall";

function makeNodeTemplate(searchText: string, expandedKeys: TreeExpandedKeysType) {
    return (node: TreeNode) => {
        const doctype = node.data;
        const isFolder = doctype.type === "folder" || doctype.type === "root";
        const isExpanded = isFolder && expandedKeys[node.key as string];

        const renderLabel = () => {
            if (!searchText) return doctype.label;

            const norm = normalizeValue(doctype.label);
            const normS = normalizeValue(searchText);
            const idx = norm.indexOf(normS);

            if (idx === -1) return doctype.label;

            return (
                <>
                    { doctype.label.slice(0, idx) }
                    <mark className="bg-yellow-700 text-white rounded p-0.5">
                        { doctype.label.slice(idx, idx + searchText.length) }
                    </mark>
                    { doctype.label.slice(idx + searchText.length) }
                </>
            );
        };

        return (
            <div className="flex items-center ml-1 gap-1">
                <span className="shrink-0 icons">
                    { isFolder ? (
                        isExpanded ? <FolderOpen stroke={ 'white' } fill={ 'var(--color-primary)' } size={ 16 }/> :
                            <Folder stroke={ 'white' } fill={ 'var(--color-primary)' } size={ 16 }/>
                    ) : (
                        doctype.is_default ? <FileBadge size={ 16 }/> : <File size={ 16 }/>
                    ) }
                </span>

                <span className="truncate text-sm" style={ { fontWeight: isFolder ? 600 : 400 } }>
                    { renderLabel() }
                </span>
            </div>
        );
    };
}

export function DoctypesTree({
    formId,
    editor,
    onSelect,
    onTmpSelect,
    selectedDoctype,
    onDoctypesLoaded,
    canFolderBeSelected = true
}: {
    formId: number;
    editor?: boolean;
    selectedDoctype?: any;
    canFolderBeSelected?: boolean;
    onSelect?: (node: any) => void;
    onTmpSelect?: (node: any) => void;
    onDoctypesLoaded?: (doctypes: any[]) => void;
}) {
    const { get } = axiosApiCall();

    const [doctypes, setDoctypes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedKeys, setExpandedKeys] = useState<TreeExpandedKeysType>({});
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    const ROOT_NODE: TreeNode = {
        key: "0",
        selectable: true,
        data: { code: "0", label: t('DOCTYPES.root'), type: "root" }
    };

    // Fetch doctypes
    useEffect(() => {
        const fetchDocTypes = async () => {
            try {
                const response = await get(`/doctypes/list/${ formId }`);
                setDoctypes(response.doctypes);
                onDoctypesLoaded?.(response.doctypes);
            } catch (error) {
                console.error("Error fetching doctypes:", error);
            }
        };

        fetchDocTypes().then();
    }, [formId]);

    // Set selected key from props
    useEffect(() => {
        if (selectedDoctype) {
            setSelectedKey(selectedDoctype.code);
        } else {
            setSelectedKey(null);
        }
    }, [selectedDoctype]);

    // Derived tree
    const treeNodes = useMemo(() => {
        const children = buildPrimeTree(doctypes);

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


    return (
        <div className="h-full overflow-hidden flex">
            <Tree
                value={ treeNodes }
                selectionMode="single"
                expandedKeys={ expandedKeys }
                selectionKeys={ selectedKey }
                onSelectionChange={ editor ? handleSelect : undefined }
                nodeTemplate={ makeNodeTemplate(searchTerm, expandedKeys) }
                onToggle={ e => setExpandedKeys(e.value) }
                onNodeClick={ e => {
                    const key = e.node.key as string;
                    if (!editor && e.node.data?.type === "document") {
                        onTmpSelect?.(e.node.data);
                        setSelectedKey(key as string);
                    } else if (!editor && e.node.data?.type === "folder") {
                        setExpandedKeys(prev =>
                            prev[key]
                                ? Object.fromEntries(
                                    Object.entries(prev).filter(([k]) => k !== key)
                                )
                                : { ...prev, [key]: true }
                        );
                    }
                } }
                onNodeDoubleClick={ e => {
                    if (e.node.data?.type === "folder") {
                        const key = e.node.key as string;

                        setExpandedKeys(prev =>
                            prev[key]
                                ? Object.fromEntries(
                                    Object.entries(prev).filter(([k]) => k !== key)
                                )
                                : { ...prev, [key]: true }
                        );
                    } else {
                        handleSelect({ value: e.node.key });
                    }
                } }
                filter
                filterMode="lenient"
                emptyMessage={
                    searchTerm ? t('GLOBAL.no_results_for') + `"${ searchTerm }"` : t("DOCTYPES.no_doctypes")
                }
                filterTemplate={ () => (
                    <div className="p-6 pb-0">
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
                                <span onClick={ expandAll }
                                      className="rounded-l-md dark:bg-(--bg-secondary)">
                                    <Maximize size={ 16 }/>
                                </span>

                                <span onClick={ collapseAll }
                                      className="rounded-r-md dark:bg-(--bg-secondary)">
                                    <Minimize size={ 16 }/>
                                </span>
                            </div>

                            { editor && (
                                <div className="actionsButton ml-auto">
                                    <span className="rounded-l-md dark:bg-(--bg-secondary)">
                                        <Download size={ 16 }/>
                                    </span>

                                    <span className="rounded-r-md dark:bg-(--bg-secondary)">
                                        <Upload size={ 16 }/>
                                    </span>

                                    <span className="rounded-md dark:bg-(--bg-secondary) ml-2">
                                        <Copy size={ 16 }/>
                                    </span>
                                </div>
                            ) }

                        </div>
                    </div>
                ) }
            />
        </div>
    );
}