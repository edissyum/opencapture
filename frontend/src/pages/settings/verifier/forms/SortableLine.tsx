import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DroppableLine } from "./DroppableLine";
import { GripVertical } from "lucide-react";

export function SortableLine({ line }: any) {
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
    const bg = isOver ? "bg-(--color-primary)/40 border-(--color-primary)" : "bg-(--bg-primary) border-transparent";

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
            )}
            <div className={ `w-full ${ bg } border rounded-md` }>
                <DroppableLine line={ line }/>
            </div>
        </div>
    );
}
