import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from "lucide-react";

export type Item = { id: string; label: string, type: string, required: boolean, format: string, typeLabel: string };

export function SortableItem({ item, onDragHandle }: { item: Item; onDragHandle?: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <div ref={ setNodeRef } style={ style }
             className={ `flex gap-2  justify-center items-center ${ isDragging ? 'opacity-50' : 'opacity-100' }` } { ...attributes }>
            <button
                className='cursor-grab text-(--text-secondary) hover:text-(--text-primary)'
                ref={ setActivatorNodeRef }
                { ...listeners }
                aria-label="Drag handle"
            >
                <GripVertical size={ 24 }/>
            </button>
            <div className='flex flex-col border-2 border-(--border-secondary) rounded-lg bg-(--bg-primary) p-3 w-full'>
                <span className='font-semibold'>{ item.label }</span>
                <span className='text-(--text-secondary)'>{ item.typeLabel }</span>
            </div>
        </div>
    );
}

