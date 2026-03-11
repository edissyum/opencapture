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
import { useEffect, useMemo, useRef, useState } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { ContextMenu } from "primereact/contextmenu";
import {
    ChevronRight,
    EllipsisVertical,
    File,
    FilePlusCorner,
    Folder,
    FolderOpen,
    FolderPlus,
    Trash,
    X
} from "lucide-react";

import Input from "../../Input";
import { Button } from "../../Button";
import { showToast } from "../../ToastProvider";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../../services/hooks/ConfirmDialog";

export function DoctypeDetails({ selectedDoctype, doctypes, formId, doctypeChanged, doctypeUpdated }: {
    formId: any;
    doctypes: any[];
    selectedDoctype: any;
    doctypeUpdated?: () => void;
    doctypeChanged: (d: any) => void
}) {
    const { post } = axiosApiCall();
    const cm = useRef({ current: null } as any);

    const ROOT_NODE = { type: "root", code: "0", label: t('DOCTYPES.root') };

    const [showAddDoctype, setShowAddDoctype] = useState(false);

    const [newDoctypeKey, setNewDoctypeKey] = useState("");
    const [newDoctypeType, setNewDoctypeType] = useState("");
    const [newDoctypeLabel, setNewDoctypeLabel] = useState("");
    const [newDoctypeIsDefault, setNewDoctypeIsDefault] = useState(false);

    // Set selected key from props
    useEffect(() => {
        if (!selectedDoctype) {
            doctypeChanged(ROOT_NODE);
        }
    }, [selectedDoctype]);

    const menuModel: any = [
        {
            label: <span className='critical text-(--text-secondary)'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash size={ 18 } className='mr-2 text-(--text-secondary)'/>,
            command: () => {
                deleteDoctype().then();
            }
        }
    ];

    // Compute parent, children and breadcrumb based on selected doctype
    const info: any = useMemo(() => {
        if (!selectedDoctype) return null;

        const code = selectedDoctype.code;

        if (code === "root") {
            return {
                parent: null,
                breadcrumb: [ROOT_NODE],
                children: doctypes.filter(d => d.code.split("-").length === 2)
            };
        }

        const parentCode = code.includes("-")
            ? code.split("-").slice(0, -1).join("-")
            : "root";

        const parent = parentCode === "root"
            ? ROOT_NODE
            : doctypes.find(d => d.code === parentCode);

        const level = (code.match(/-/g) || []).length;

        const children = doctypes.filter(d =>
            d.code.startsWith(code + "-") &&
            (d.code.match(/-/g) || []).length === level + 1
        );

        const segments = code.split("-");
        const breadcrumb: any[] = [ROOT_NODE];

        segments.reduce((acc: any, seg: any) => {
            const current = acc ? `${ acc }-${ seg }` : seg;
            const node = doctypes.find(d => d.code === current);
            if (node) breadcrumb.push(node);
            return current;
        }, "");

        return { parent, children, breadcrumb };

    }, [selectedDoctype, doctypes]);

    const updateDoctype = async (doctype: any) => {
        try {
            await post('/doctypes/update', doctype);
            doctypeUpdated?.();
        } catch (err) {
            console.error("Error updating doctype:", err);
        }
    }

    const deleteDoctype = async () => {
        showConfirmDialog({
            title: selectedDoctype.type === 'document' ? t('DOCTYPES.delete_doctype') : t('DOCTYPES.delete_folder'),
            message: selectedDoctype.type === 'document' ? t('DOCTYPES.confirm_delete_doctype') : t('DOCTYPES.confirm_delete_folder'),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                try {
                    await post('/doctypes/update', { ...selectedDoctype, status: "DEL" });

                    const parentCode = selectedDoctype.code.includes("-")
                        ? selectedDoctype.code.split("-").slice(0, -1).join("-")
                        : "root";

                    if (selectedDoctype.code === selectedDoctype.code) {
                        const parent = parentCode === "root"
                            ? ROOT_NODE
                            : doctypes.find(d => d.code === parentCode);

                        doctypeChanged?.(parent);
                    }

                    doctypeUpdated?.();
                    showToast(selectedDoctype.type === 'document' ? t('DOCTYPES.doctype_deleted') : t('DOCTYPES.folder_deleted'), "success");
                } catch (err) {
                    console.error("Error deleting doctype:", err);
                }
            }
        })
    }

    const addDoctype = async () => {
        if (!newDoctypeKey || !newDoctypeLabel) return;

        try {
            const parentCode = selectedDoctype.code === "root" ? "" : selectedDoctype.code;
            const lastChildCode = doctypes.filter(d => d.code.startsWith(parentCode) && d.code.split("-").length === parentCode.split("-").length + 1).map(d => d.code.split("-").pop()).filter(c => !isNaN(Number(c))).map(Number).sort((a, b) => b - a)[0] || 0;

            const newCode = parentCode ? `${ parentCode }-${ lastChildCode + 1 }` : (lastChildCode + 1).toString();

            await post('/doctypes/add', {
                code: newCode,
                form_id: formId,
                key: newDoctypeKey,
                type: newDoctypeType,
                label: newDoctypeLabel,
                is_default: newDoctypeIsDefault
            });

            setNewDoctypeKey("");
            setNewDoctypeType("");
            setNewDoctypeLabel("");
            setShowAddDoctype(false);
            setNewDoctypeIsDefault(false);
            doctypeUpdated?.();
            showToast(newDoctypeType === 'document' ? t('DOCTYPES.doctype_created') : t('DOCTYPES.folder_created'), "success");
        } catch (err) {
            console.error("Error adding doctype:", err);
        }
    }

    if (!selectedDoctype) {
        return (
            <div className="p-6 text-(--text-secondary)">
                { t('DOCTYPES.select_doctype') }
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col h-full gap-4">
            { showAddDoctype && (
                <>
                    <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                         onClick={ () => setShowAddDoctype(false) }/>
                    <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                    min-w-[32vw] h-fit max-h-screen border-2 border-(--border-secondary)
                                    rounded-lg bg-(--bg-primary) flex flex-col">
                        <div className='flex flex-col px-6 p-6'>
                            <div className='flex'>
                                <h2>
                                    { newDoctypeType === 'document' ?
                                        t('DOCTYPES.add_doctype') :
                                        t('DOCTYPES.add_folder')
                                    }
                                </h2>
                            </div>
                            <div className='absolute right-4 top-4 cursor-pointer text-(--text-secondary)'
                                 onClick={ () => setShowAddDoctype(false) }>
                                <X/>
                            </div>
                            <div className='w-full flex flex-col gap-2 mt-2'>
                                <Input label={ t('GLOBAL.label') } value={ newDoctypeLabel } onChange={ (e) => {
                                    setNewDoctypeLabel(e.target.value);
                                    setNewDoctypeKey(e.target.value.toUpperCase().replace(/\s+/g, "_"));
                                } }/>
                                <Input label={ t('ROLES.label_short') } value={ newDoctypeKey } onChange={ (e) => {
                                    setNewDoctypeKey(e.target.value.toUpperCase().replace(/\s+/g, "_"));
                                } }/>
                                { newDoctypeType === 'document' && (
                                    <div className='flex items-center'>
                                        <InputSwitch inputId='isDefault' checked={ newDoctypeIsDefault }
                                                     onChange={ (e) => {
                                                         setNewDoctypeIsDefault(e.value);
                                                     } }/>
                                        <label htmlFor={ 'isDefault' }
                                               className="flex items-center gap-4 cursor-pointer">
                                            { t('DOCTYPES.is_default') }
                                        </label>
                                    </div>
                                ) }
                            </div>
                            <div className='mt-4 flex justify-end w-full gap-4'>
                                <Button variant={ "no_bg" } onClick={ () => setShowAddDoctype(false) }>
                                    { t('GLOBAL.cancel') }
                                </Button>
                                <Button onClick={ () => addDoctype() }>
                                    { newDoctypeType === 'document' ? t('DOCTYPES.create_doctype') : t('DOCTYPES.create_folder') }
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            ) }

            { info?.breadcrumb && (
                <div className='flex gap-4'>
                    <div className="flex w-fit gap-2 text-sm text-(--text-secondary) border-2
                                    border-(--border-secondary) bg-(--bg-primary) rounded-xl p-2">
                        { info.breadcrumb.map((b: any, i: number) => (
                            <span key={ b.code } className={ `flex items-center ${ i === 0 && 'ml-1' }` }>
                                { i > 0 && <ChevronRight size={ 18 }/> }
                                <span className='px-2.5 py-1 rounded-full flex items-center gap-1 bg-transparent transition-colors
                                               hover:bg-(--bg-secondary) cursor-pointer'
                                      onClick={ () => doctypeChanged?.(() => {
                                          const node = doctypes.find((d: any) => d.code === b.code);
                                          if (b.type === 'root') {
                                              return ROOT_NODE;
                                          }
                                          return node || selectedDoctype;
                                      }) }>
                                    { b.type !== "document" && (
                                        <FolderOpen size={ 16 } fill={ 'var(--color-primary)' } stroke={ 'white' }/>
                                    ) }
                                    { b.label && (
                                        <span className="font-medium text-(--text-primary)">
                                            { b.label }
                                        </span>
                                    ) }
                                </span>
                            </span>
                        )) }
                    </div>
                    <div className='ml-auto flex gap-2'>
                        { selectedDoctype.type !== 'document' && (
                            <>
                                <Button variant='secondary' className='px-2!' onClick={ () => {
                                    setNewDoctypeType('folder')
                                    setShowAddDoctype(true)
                                } }>
                                    <FolderPlus size={ 18 }/>&nbsp;
                                    { t('DOCTYPES.folder') }
                                </Button>
                                <Button className='px-2!' onClick={ () => {
                                    setNewDoctypeType('document');
                                    setShowAddDoctype(true);
                                } }>
                                    <FilePlusCorner size={ 18 }/>&nbsp;
                                    { t('DOCTYPES.doctype') }
                                </Button>
                            </>
                        ) }
                        <div className={ `flex cursor-pointer items-center px-2 border-2 border-(--border-secondary)
                                          bg-(--bg-primary) rounded-lg ${ selectedDoctype.code === "root" && 'cursor-not-allowed!' }` }
                             onClick={ (e) => {
                                 cm.current?.show(e);
                             } }
                        >
                            <EllipsisVertical size={ 18 }
                                              className={ `${ selectedDoctype.code === "root" && 'pointer-events-none' }` }
                            />
                            <ContextMenu model={ menuModel } className="w-auto!" ref={ cm }/>
                        </div>
                    </div>
                </div>
            ) }

            { selectedDoctype.type === 'document' ? (
                <div>
                    <div className="p-4 rounded-xl border-2 border-(--border-secondary) bg-(--bg-primary)">
                        <h3 className='text-lg font-semibold'>
                            { t('DOCTYPES.update_doctype') }
                        </h3>
                        <div className='flex gap-4 mt-4'>
                            <Input className='w-2/3' label={ t('GLOBAL.label') } value={ selectedDoctype.label }
                                   onChange={ (e) => {
                                       doctypeChanged?.({
                                           ...selectedDoctype,
                                           label: e.target.value || ""
                                       });
                                   } }/>
                            <Input className='w-1/3' label={ t('ROLES.label_short') } value={ selectedDoctype.key }
                                   disabled/>
                        </div>
                        <div className="flex items-center gap-2">
                            <InputSwitch inputId='isDefault' checked={ selectedDoctype.is_default }
                                         onChange={ () => {
                                             doctypeChanged?.({
                                                 ...selectedDoctype,
                                                 is_default: !selectedDoctype.is_default
                                             });
                                         } }/>
                            <label htmlFor={ 'isDefault' } className="flex items-center gap-4 cursor-pointer">
                                { t('DOCTYPES.is_default') }
                            </label>
                        </div>
                    </div>
                    <div className='flex justify-end mt-4'>
                        <Button onClick={ () => updateDoctype(selectedDoctype) }>
                            { t('DOCTYPES.update_doctype') }
                        </Button>
                    </div>
                </div>
            ) : (
                <div className='flex flex-col gap-6 h-full'>
                    { selectedDoctype.type !== "root" && (
                        <div>
                            <div className="p-4 rounded-xl border-2 border-(--border-secondary) bg-(--bg-primary)">
                                <h3 className='text-lg font-semibold'>
                                    { t('DOCTYPES.update_folder') }
                                </h3>
                                <div className='flex gap-4 mt-4'>
                                    <Input className='w-2/3' label={ t('GLOBAL.label') } value={ selectedDoctype.label }
                                           onChange={ (e) => {
                                               doctypeChanged?.({
                                                   ...selectedDoctype,
                                                   label: e.target.value || ""
                                               });
                                           } }/>
                                    <Input className='w-1/3' label={ t('ROLES.label_short') }
                                           value={ selectedDoctype.key }
                                           disabled/>
                                </div>
                            </div>
                            <div className='flex justify-end mt-4'>
                                <Button onClick={ () => updateDoctype(selectedDoctype) }>
                                    { t('DOCTYPES.update_folder') }
                                </Button>
                            </div>
                        </div>
                    ) }
                    <div
                        className="p-4 rounded-xl border-2 border-(--border-secondary) bg-(--bg-primary) overflow-scroll">
                        <div className='flex flex-col gap-4'>
                            <h3 className='text-lg font-semibold'>
                                { t('DOCTYPES.children') }
                            </h3>
                            { info?.children?.length! > 0 ? (
                                <div className='flex flex-col gap-2 w-full'>
                                    { info?.children?.map((child: any) => (
                                        <div key={ child.code }
                                             className="flex items-center gap-2 cursor-pointer hover:bg-(--color-primary)/20 rounded-md p-2"
                                             onClick={ () => doctypeChanged?.(child) }>
                                            <div className='bg-(--bg-secondary) rounded-md p-1'>
                                                { child.type === "folder" ? (
                                                    <FolderOpen size={ 20 }/>
                                                ) : (
                                                    <File size={ 20 }/>
                                                ) }
                                            </div>
                                            <div>
                                                { child.label }
                                            </div>
                                            <div
                                                className='ml-auto text-sm text-(--text-secondary) rounded-full bg-(--bg-secondary) px-2 py-1'>
                                                { child.key }
                                            </div>
                                        </div>
                                    )) }
                                </div>
                            ) : (
                                <div className='flex flex-col gap-2 w-full items-center text-(--text-secondary) p-5'>
                                    <Folder className='p-2 rounded-md bg-(--bg-secondary)' size={ 45 }/>
                                    <span>{ t('DOCTYPES.no_children') }</span>
                                    <span>{ t('DOCTYPES.add_child_to_folder') }</span>
                                </div>
                            ) }
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
}