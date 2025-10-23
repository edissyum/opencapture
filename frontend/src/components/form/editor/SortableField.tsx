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
import React, { useRef, useState } from "react";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { InputSwitch } from "primereact/inputswitch";
import { OverlayPanel } from "primereact/overlaypanel";

import { Input } from "../../Input";

type Field = {
    id: string;
    label: string;
    type: string;
    required?: boolean;
    format?: string;
};

export function SortableField({ field, onUpdateField }: {
    field: Field;
    onUpdateField: (id: string, updated: Field) => void;
}) {
    const op = useRef<OverlayPanel | null>(null);
    const [editableField, setEditableField] = useState<Field>(field);

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
        useSortable({
            id: field.id,
            data: { from: "form", field, type: "field" },
        });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition ?? "transform 250ms ease",
        opacity: isDragging ? 0.6 : 1,
    };

    const formatLabels = [
        { value: 'date', label: t('FORMATS.date') },
        { value: 'number_float', label: t('FORMATS.number_float') },
        { value: 'number_int', label: t('FORMATS.number_int') },
        { value: 'char', label: t('FORMATS.char') },
        { value: 'alphanum', label: t('FORMATS.alphanum') },
        { value: 'alphanum_extended', label: t('FORMATS.alphanum_extended') },
        { value: 'alphanum_extended_with_accent', label: t('FORMATS.alphanum_extended_with_accent') },
        { value: 'email', label: t('FORMATS.email') }
    ];

    const openOverlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        op.current?.toggle(e);
        setEditableField(field);
    };

    const handleSave = () => {
        onUpdateField(field.id, editableField);
        op.current?.hide();
    };

    return (
        <>
            <div ref={ setNodeRef } style={ style } onClick={ openOverlay }
                 className="SortableField group truncate bg-(--bg-primary) border-2 border-(--border-secondary)
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

            <OverlayPanel ref={ op } showCloseIcon dismissable className="p-3 w-1/3">
                <div className="flex flex-col gap-3">
                    <Input className="w-full"
                           label={ t('FORMS.field_label') }
                           value={ editableField.label }
                           onChange={ (e: any) =>
                               setEditableField((prev) => ({ ...prev, label: e.target.value }))
                           }
                    />
                    <div>
                        <FloatLabel>
                            <Dropdown
                                id={ 'format-' + editableField.id }
                                className="w-full h-12"
                                value={ editableField.format }
                                options={ formatLabels }
                                onChange={ (e) =>
                                    setEditableField((prev) => ({ ...prev, format: e.value }))
                                }
                            />
                            <label htmlFor={ 'format-' + editableField.id }>{ t("FORMS.formats") }</label>
                        </FloatLabel>
                    </div>

                    <div className="flex items-center gap-2">
                        <InputSwitch inputId={ 'required-' + editableField.id } checked={ !!editableField.required }
                                     onChange={ (e) => setEditableField((prev) => ({
                                         ...prev,
                                         required: e.value
                                     })) }
                        />
                        <label htmlFor={ 'required-' + editableField.id }
                               className="flex items-center gap-4 cursor-pointer select-none text-(--text-primary)">
                            { t('FORMS.field_required') }
                        </label>

                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            className="bg-gray-200 hover:bg-gray-300 text-sm rounded-md px-3 py-1"
                            onClick={ () => op.current?.hide() }
                        >
                            Annuler
                        </button>
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md px-3 py-1"
                            onClick={ handleSave }
                        >
                            Enregistrer
                        </button>
                    </div>
                </div>
            </OverlayPanel>
        </>
    );
}
