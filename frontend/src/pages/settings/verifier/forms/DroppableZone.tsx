import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableLine } from "./SortableLine";

export function DroppableZone({ zone }: any) {
    const { setNodeRef, isOver } = useDroppable({
        id: zone.id,
        data: { type: "zone", zoneId: zone.id },
    });

    const bg = isOver ? "bg-(--color-primary)/40 border-(--color-primary)" : "bg-(--bg-primary)";

    return (
        <div ref={ setNodeRef } className={ `DroppableZone ${ bg } p-4` }>
            <SortableContext id={ zone.id } items={ zone.lines.map((l: any) => l.id) }
                             strategy={ verticalListSortingStrategy }>
                <div className="flex flex-col gap-3 mb-3 min-h-[50px]">
                    { zone.lines.map((line: any) => (
                        <SortableLine key={ line.id } line={ line }/>
                    )) }
                </div>
            </SortableContext>
        </div>
    );
}
