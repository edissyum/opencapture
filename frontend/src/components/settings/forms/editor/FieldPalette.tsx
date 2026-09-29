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
import { useDraggable } from "@dnd-kit/core";

import { getTypeLabels } from "./schemas";

export function FieldPalette({ fields }: any) {
    return (
        <div className="space-y-4 p-6">
            { fields.map((f: any) => (
                <PaletteItem key={ f.id } field={ f }/>
            )) }
        </div>
    );
}

function PaletteItem({ field }: any) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
        id: `palette-${ field.id }`,
        data: {
            from: "palette",
            ...field,
        }
    });

    const typeLabels: any = getTypeLabels(t);

    const style = {
        transform: transform
            ? `translate3d(${ transform.x }px, ${ transform.y }px, 0)`
            : undefined
    };

    return (
        <div ref={ setNodeRef } { ...attributes } { ...listeners } style={ style }
            className={ `flex gap-2 justify-center items-center ${ isDragging ? 'opacity-50' : 'opacity-100' }` }>
            <div
                className='flex border items-center border-(--border-secondary) rounded-lg bg-(--bg-primary) p-2 gap-2 w-full'>
                <div className='cursor-grab text-(--text-secondary) hover:text-(--text-primary)'
                    ref={ setActivatorNodeRef } { ...listeners } aria-label="Drag handle">
                    <GripVertical size={ 24 }/>
                </div>
                <div className='flex flex-col'>
                    <span className='font-semibold'>{ field.label }</span>
                    <span className='text-(--text-secondary)'>{ typeLabels[field.type] }</span>
                </div>
            </div>
        </div>
    );
}
