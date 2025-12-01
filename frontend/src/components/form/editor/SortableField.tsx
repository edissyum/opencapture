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
import { GripVertical } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { InputSwitch } from "primereact/inputswitch";
import { OverlayPanel } from "primereact/overlaypanel";

import Input from "../../Input";
import { Button } from "../../Button";

import { getColorOptions, getFormatLabels } from "./schemas";

type Field = {
    id: string;
    type: string;
    label: string;
    color?: string;
    format?: string;
    disabled?: boolean;
    required?: boolean;
    default_value?: string;
};

export function SortableField({ field, onUpdateField, onDeleteField, module }: {
    field: Field;
    module?: string;
    onDeleteField: (id: string) => void;
    onUpdateField: (id: string, updated: Field) => void;
}) {
    const op = useRef<OverlayPanel | null>(null);
    const [editableField, setEditableField] = useState<Field>(field);

    const formatLabels = getFormatLabels(t);
    const colorOptions = getColorOptions(t);
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: field.id,
        data: { from: "form", field, type: "field" }
    });

    const style = {
        opacity: isDragging ? 0.6 : 1,
        transform: CSS.Transform.toString(transform),
        transition: transition ?? "transform 250ms ease"
    };

    const openOverlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        op.current?.toggle(e);
        setEditableField(field);
    };

    const handleSave = () => {
        onUpdateField(field.id, editableField);
        op.current?.hide();
    };

    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (color: string) => {
        setEditableField((prev) => ({ ...prev, color: color }));
        setOpen(false);
    };

    return (
        <>
            <div ref={ setNodeRef } style={ style } onClick={ openOverlay }
                 className="SortableField truncate bg-(--bg-primary) border-2 border-(--border-secondary)
                   rounded-md px-3 py-2 flex items-center gap-2 hover:border-(--border-primary)
                   transition-colors select-none">
                <button type="button" aria-label="Déplacer le champ" { ...attributes } { ...listeners }
                        onClick={ (e) => e.stopPropagation() }
                        className="cursor-grab text-(--text-secondary) hover:text-(--text-primary)">
                    <GripVertical size={ 16 }/>
                </button>

                <div className="min-w-0 flex-1 truncate cursor-pointer">
                    { t(field.label) }
                </div>
            </div>

            <OverlayPanel ref={ op } dismissable
                          className="bg-(--bg-primary)! p-3 w-1/2 shadow-none! border-2! border-(--border-secondary)! min-h-[20%] max-h-[60%]">
                <div className="flex flex-col gap-3 space-y-3">
                    <Input id={ 'label-' + editableField.id }
                           className="w-full" noMarginBottom={ true }
                           label={ t('FORMS.field_label') }
                           value={ t(editableField.label) }
                           onChange={ (e: any) =>
                               setEditableField((prev) => ({ ...prev, label: e.target.value }))
                           }
                    />
                    <FloatLabel>
                        <Dropdown
                            id={ 'format-' + editableField.id }
                            className="w-full"
                            value={ editableField.format }
                            options={ formatLabels }
                            onChange={ (e) =>
                                setEditableField((prev) => ({ ...prev, format: e.value }))
                            }
                        />
                        <label htmlFor={ 'format-' + editableField.id }>{ t("FORMS.formats") }</label>
                    </FloatLabel>

                    { module === 'verifier' && (
                        <>
                            <Input id={ "default_value-" + editableField.id }
                                   className="w-full" noMarginBottom={ true }
                                   hint={ t('FORMS.default_value_hint') }
                                   label={ t('FORMS.default_value') }
                                   value={ editableField.default_value }
                                   onChange={ (e: any) =>
                                       setEditableField((prev) => ({ ...prev, default_value: e.target.value }))
                                   }
                            />

                            <div ref={ ref } className="relative inline-block w-full">
                                <div onClick={ () => setOpen((o) => !o) }
                                     className="flex items-center justify-center border rounded-md cursor-pointer transition-all select-none h-10"
                                     style={ {
                                         backgroundColor: editableField.color + '1A',
                                         color: editableField.color
                                     } }>
                                    { editableField.color ? (
                                        <>
                                            { colorOptions.find((c) => c.value === editableField.color)?.name }
                                        </>
                                    ) : (
                                        <span className="text-(--text-secondary)">{ t('COLORS.select_color') }</span>
                                    ) }
                                </div>

                                { open && (
                                    <div
                                        className="left-0 mt-2 w-full p-3 bg-white border rounded-lg shadow-lg grid grid-cols-6 gap-2 z-50"
                                        style={ {
                                            animation: "fadeIn 0.1s ease-in-out"
                                        } }
                                    >
                                        { colorOptions.map((color) => (
                                            <div
                                                key={ color.value }
                                                onClick={ () => handleSelect(color.value) }
                                                title={ color.name }
                                                className="w-full flex justify-center items-center h-14 rounded-md cursor-pointer border hover:scale-110 transition-transform bg-opacity-10"
                                                style={ {
                                                    color: color.value,
                                                    backgroundColor: color.value + '1A'
                                                } }>
                                                { color.name }
                                            </div>
                                        )) }
                                    </div>
                                ) }
                            </div>
                        </>
                    ) }

                    <div className='flex gap-2'>
                        <div className="flex items-center gap-2">
                            <InputSwitch inputId={ 'required-' + editableField.id } checked={ !!editableField.required }
                                         onChange={ (e) => setEditableField((prev) => ({
                                             ...prev,
                                             required: e.value
                                         })) }
                            />
                            <label htmlFor={ 'required-' + editableField.id }
                                   className="flex items-center gap-4 cursor-pointer select-none text-(--text-secondary)">
                                { t('FORMS.field_required') }
                            </label>
                        </div>

                        { module === 'splitter' && (
                            <div className="flex items-center gap-2">
                                <InputSwitch inputId={ 'disabled-' + editableField.id }
                                             checked={ !!editableField.disabled }
                                             onChange={ (e) => setEditableField((prev) => ({
                                                 ...prev,
                                                 disabled: e.value
                                             })) }
                                />
                                <label htmlFor={ 'disabled-' + editableField.id }
                                       className="flex items-center gap-4 cursor-pointer select-none text-(--text-secondary)">
                                    { t('FORMS.field_disabled') }
                                </label>
                            </div>
                        ) }
                    </div>

                    <div className="flex gap-2">
                        <Button variant='danger' onClick={ () => onDeleteField(field.id) }>
                            { t('FORMS.delete_field') }
                        </Button>
                        <div className='flex ml-auto gap-4'>
                            <Button variant="no_bg" onClick={ () => op.current?.hide() }>
                                { t('GLOBAL.cancel') }
                            </Button>
                            <Button variant="primary" onClick={ handleSave }>
                                { t('MAILCOLLECT.save') }
                            </Button>
                        </div>
                    </div>
                </div>
            </OverlayPanel>
        </>
    );
}
