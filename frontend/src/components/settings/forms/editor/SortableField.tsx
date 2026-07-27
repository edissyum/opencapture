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
import { Popover } from "@mantine/core";
import { useRef, useState } from "react";
import { GripVertical } from "lucide-react";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import Hint from "../../../Hint";
import Input from "../../../Input";
import { Button } from "../../../Button";
import { Select } from "../../../Select.tsx";
import { InputSwitch } from "../../../InputSwitch";

import { getColorOptions, getFormatLabels } from "./schemas";

type Field = {
    id: string;
    type: string;
    label: string;
    color?: string;
    format?: string;
    disabled?: boolean;
    required?: boolean;
    result_mask?: string;
    search_mask?: string;
    default_value?: string;
    validation_mask?: string;
    field_metadata?: boolean;
};

export function SortableField({ field, onUpdateField, onDeleteField, module }: {
    field: Field;
    module?: string;
    onDeleteField: (id: string) => void;
    onUpdateField: (id: string, updated: Field) => void;
}) {
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

    const handleSave = () => {
        onUpdateField(field.id, editableField);
        setOpen(false);
    };

    const [open, setOpen] = useState(false);
    const [openColors, setOpenColors] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const handleSelectColor = (color: string) => {
        setEditableField((prev) => ({ ...prev, color: color }));
        setOpenColors(false);
    };

    return (
        <Popover opened={ open } withinPortal position="bottom-start" onChange={ setOpen }>
            <Popover.Target>
                <div ref={ setNodeRef } style={ style } onClick={ () => setOpen(!open) }
                     className="SortableField truncate bg-(--bg-primary) border border-(--border-secondary)
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
            </Popover.Target>

            <Popover.Dropdown>
                <div className="flex flex-col gap-3 space-y-3">
                    <Input
                        id={ 'label-' + editableField.id }
                        className="w-full"
                        label={ t('FORMS.field_label') }
                        value={ t(editableField.label) }
                        onChange={ (e: any) =>
                            setEditableField((prev) => ({ ...prev, label: e.target.value }))
                        }
                    />
                    <Select
                        className="w-full"
                        options={ formatLabels }
                        value={ editableField.format }
                        label={ t("FORMS.formats") }
                        id={ 'format-' + editableField.id }
                        onChange={ (value) =>
                            setEditableField((prev) => ({ ...prev, format: value }))
                        }
                    />

                    <Input
                        id={ "default_value-" + editableField.id }
                        className="w-full"
                        hint={ t('FORMS.default_value_hint') }
                        label={ t('FORMS.default_value') }
                        value={ editableField.default_value }
                        onChange={ (e: any) =>
                            setEditableField((prev) => ({ ...prev, default_value: e.target.value }))
                        }
                    />

                    { module === 'verifier' && (
                        <div ref={ ref } className="relative inline-block w-full">
                            <div onClick={ () => setOpenColors((o) => !o) }
                                 className="flex items-center justify-center border rounded-md cursor-pointer transition-all select-none h-10"
                                 style={ {
                                     backgroundColor: editableField.color + '1A',
                                     color: editableField.color
                                 } }
                            >
                                { editableField.color ? (
                                    <>
                                        { colorOptions.find((c) => c.value === editableField.color)?.name }
                                    </>
                                ) : (
                                    <span className="text-(--text-secondary)">{ t('COLORS.select_color') }</span>
                                ) }
                            </div>

                            { openColors && (
                                <div
                                    className="left-0 mt-2 w-full p-3 bg-white border rounded-lg shadow-lg grid grid-cols-6 gap-2 z-50"
                                    style={ {
                                        animation: "fadeIn 0.1s ease-in-out"
                                    } }
                                >
                                    { colorOptions.map((color) => (
                                        <div
                                            key={ color.value }
                                            onClick={ () => handleSelectColor(color.value) }
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
                    ) }

                    { module === 'splitter' && (
                        <div>
                            <div className="flex items-center gap-2">
                                <InputSwitch
                                    id={ 'field_metadata-' + editableField.id }
                                    checked={ !!editableField.field_metadata }
                                    label={ t('FORMS.field_metadata') }
                                    onChange={ (value) => setEditableField((prev) => ({
                                        ...prev,
                                        field_metadata: value
                                    })) }
                                />
                            </div>
                            { editableField.field_metadata && (
                                <div className='mt-4'>
                                    <Hint>
                                        { t('FORMS.field_metadata_hint') }
                                    </Hint>
                                    <div className='flex gap-4'>
                                        <Input id={ 'search_mask-' + editableField.id }
                                               className="w-1/3"
                                               label={ t('FORMS.search_mask') }
                                               value={ editableField.search_mask }
                                               onChange={ (e: any) =>
                                                   setEditableField((prev) => ({
                                                       ...prev,
                                                       search_mask: e.target.value
                                                   }))
                                               }
                                        />
                                        <Input id={ 'result_mask-' + editableField.id }
                                               className="w-1/3"
                                               label={ t('FORMS.result_mask') }
                                               value={ editableField.result_mask }
                                               onChange={ (e: any) =>
                                                   setEditableField((prev) => ({
                                                       ...prev,
                                                       result_mask: e.target.value
                                                   }))
                                               }
                                        />
                                        <Input id={ 'validation_mask-' + editableField.id }
                                               className="w-1/3"
                                               label={ t('FORMS.validation_mask') }
                                               value={ editableField.validation_mask }
                                               onChange={ (e: any) =>
                                                   setEditableField((prev) => ({
                                                       ...prev,
                                                       validation_mask: e.target.value
                                                   }))
                                               }
                                        />
                                    </div>
                                </div>
                            ) }
                        </div>
                    ) }

                    <div className='flex gap-4'>
                        <div className="flex items-center gap-2">
                            <InputSwitch
                                id={ 'required-' + editableField.id }
                                label={ t('FORMS.field_required') }
                                checked={ !!editableField.required }
                                onChange={ (value) => setEditableField((prev) => ({
                                    ...prev,
                                    required: value
                                })) }
                            />
                        </div>

                        { module === 'splitter' && (
                            <div>
                                <div className="flex items-center gap-2">
                                    <InputSwitch
                                        id={ 'disabled-' + editableField.id }
                                        checked={ !!editableField.disabled }
                                        label={ t('FORMS.field_disabled') }
                                        onChange={ (value) => setEditableField((prev) => ({
                                            ...prev,
                                            disabled: value
                                        })) }
                                    />
                                </div>
                            </div>
                        ) }
                    </div>

                    <div className="flex gap-2">
                        <div className='flex ml-auto gap-4'>
                            <Button variant="no_bg" onClick={ () => setOpen(false) }>
                                { t('GLOBAL.cancel') }
                            </Button>
                            <Button variant='danger' onClick={ () => onDeleteField(field.id) }>
                                { t('FORMS.delete_field') }
                            </Button>
                            <Button variant="primary" onClick={ handleSave }>
                                { t('FORMS.save_field') }
                            </Button>
                        </div>
                    </div>
                </div>
            </Popover.Dropdown>
        </Popover>
    );
}
