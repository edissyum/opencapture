import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableField({ field }: any) {
    const { setNodeRef, attributes, listeners, transform, transition } = useSortable({
        id: field.id,
        data: { from: "form", field, type: "field" },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={ setNodeRef } { ...attributes } { ...listeners } style={ style }
             className="DraggableField bg-(--bg-primary) border-2 border-(--border-secondary)
                        rounded-md py-2 px-4 cursor-grab hover:border-(--border-primary) transition-colors">
            { field.label }
        </div>
    );
}
