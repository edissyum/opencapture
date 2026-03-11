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
import type { TreeNode } from "primereact/treenode";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Tree, type TreeExpandedKeysType } from "primereact/tree";
import { Copy, Download, Maximize, Minimize, Upload, X } from "lucide-react";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";

import { buildPrimeTree, collectExpanded, makeNodeTemplate } from "./helpers";

import Hint from "../../Hint";
import Input from "../../Input";
import { Button } from "../../Button";
import { Dropdown } from "../../Dropdown";
import { showToast } from "../../ToastProvider.tsx";

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

    const [forms, setForms] = useState<any[]>([]);
    const [doctypes, setDoctypes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedKeys, setExpandedKeys] = useState<TreeExpandedKeysType>({});
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

    const [showCloneDialog, setShowCloneDialog] = useState(false);
    const [forceRelaunch, setForceRelaunch] = useState(0);

    const ROOT_NODE: TreeNode = {
        key: "0",
        selectable: true,
        data: { code: "0", label: t('DOCTYPES.root'), type: "root" }
    };

    // Fetch doctypes and forms
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

    return (
        <div className="h-full overflow-hidden flex">
            { showCloneDialog && (
                <>
                    <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                         onClick={ () => setShowCloneDialog(false) }/>
                    <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                            min-w-[32vw] h-fit max-h-screen border-2 border-(--border-secondary)
                                            rounded-lg bg-(--bg-primary) flex flex-col">
                        <div className='flex flex-col items-center px-6 p-6'>
                            <div className='flex flex-col'>
                                <h2>
                                    { t('DOCTYPES.clone_doctype_title') }
                                </h2>
                                <p className='text-sm text-(--text-secondary) mb-4'>
                                    { t('DOCTYPES.clone_doctype_desc') }
                                </p>

                                <Hint variant='warning'>
                                    { t('GLOBAL.action_irreversible') }
                                </Hint>
                            </div>
                            <div className='absolute right-4 top-4 cursor-pointer text-(--text-secondary)'
                                 onClick={ () => setShowCloneDialog(false) }>
                                <X/>
                            </div>
                            <div className='w-full flex flex-col gap-2 mt-2'>
                                <Dropdown value={ selectedFormId } id="clone_form_select"
                                          options={ forms.map((f: any) => ({ label: f.label, value: f.id })) }
                                          onChange={ e => setSelectedFormId(e.value) }
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
                    searchTerm ? t('GLOBAL.no_results_for') +
                        `"${ searchTerm }"`
                        : t("DOCTYPES.no_doctypes")
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

                                    <span className="rounded-md dark:bg-(--bg-secondary) ml-2"
                                          onClick={ () => setShowCloneDialog(true) }
                                          data-tooltip-content={ t('DOCTYPES.clone_doctype') }
                                          data-tooltip-id='tooltip'>
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