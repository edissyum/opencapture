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

import type { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableDocumentZoneProps {
    isEmpty?: boolean;
    children?: ReactNode;
    documentId: string | number;
}

export function DroppableDocumentZone({ documentId, children, isEmpty }: DroppableDocumentZoneProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: `droppable-doc-${ documentId }`,
        data: { documentId, type: 'document-zone' }
    });

    return (
        <div ref={ setNodeRef }
             className={ `DroppableDocument w-full transition-colors rounded-md
                ${ isEmpty ? 'border-2 border-dashed' : '' }
                ${ isOver ? 'bg-(--color-primary)/10 border-(--color-primary)' : isEmpty ? 'border-(--border-secondary)' : '' }` }>
            { isEmpty && !isOver && (
                <div className="flex items-center justify-center h-20 text-(--text-secondary) text-sm">
                    Déposer une page ici
                </div>
            ) }
            { isOver && isEmpty && (
                <div className="flex items-center justify-center h-20 text-(--color-primary) text-sm font-medium">
                    Relâcher pour déposer
                </div>
            ) }
            { children }
        </div>
    );
}