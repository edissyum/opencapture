import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

export function FieldPalette({ fields }: any) {
    return (
        <div className="space-y-4 pr-2">
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

    const style = {
        transform: transform
            ? `translate3d(${ transform.x }px, ${ transform.y }px, 0)`
            : undefined
    };

    return (
        <div ref={ setNodeRef } { ...attributes } { ...listeners } style={ style }
             className={ `flex gap-2 justify-center items-center ${ isDragging ? 'opacity-50' : 'opacity-100' }` }>
            <div className='cursor-grab text-(--text-secondary) hover:text-(--text-primary)'
                 ref={ setActivatorNodeRef } { ...listeners } aria-label="Drag handle">
                <GripVertical size={ 24 }/>
            </div>
            <div className='flex flex-col border-2 border-(--border-secondary) rounded-lg bg-(--bg-primary) p-3 w-full'>
                <span className='font-semibold'>{ field.label }</span>
                <span className='text-(--text-secondary)'>{ field.typeLabel }</span>
            </div>
        </div>
    );
}
