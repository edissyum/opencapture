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

import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";

import { DroppableLine } from "./DroppableLine";

export function SortableLine({ line, onUpdateField }: any) {
    const animateLayoutChanges = (args: any) =>
        defaultAnimateLayoutChanges({ ...args, wasDragging: true });

    const { setNodeRef, setActivatorNodeRef, listeners, transform, isDragging, isOver, transition } = useSortable({
        id: line.id,
        data: {
            type: "line",
            line,
        },
        animateLayoutChanges
    });
    const bg = isOver ? "bg-(--color-primary)/20 border-(--color-primary)" : "bg-(--bg-primary) border-transparent";

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 40 : "auto"
    };

    return (
        <div ref={ setNodeRef } style={ style }
             className={ `SortableLine flex justify-center items-center ${ isDragging ? 'opacity-50' : 'opacity-100' }` }>
            { line.fields.length >= 1 && (
                <div className='cursor-grab text-(--text-secondary) hover:text-(--text-primary)'
                     ref={ setActivatorNodeRef } { ...listeners } aria-label="Drag handle">
                    <GripVertical size={ 22 }/>
                </div>
            ) }
            <div className={ `w-full p-2 ${ bg } border rounded-md` }>
                <DroppableLine line={ line } onUpdateField={ onUpdateField }/>
            </div>
        </div>
    );
}
