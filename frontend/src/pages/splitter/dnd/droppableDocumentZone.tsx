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
import { useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useVirtualizer } from "@tanstack/react-virtual";

import { DraggablePage } from "./draggablePage";

// PAGE_WIDTH must match the min-w of DraggablePage (min-w-64 = 256px) + gap (12px)
const PAGE_WIDTH = 268;

interface DroppableDocumentZoneProps {
    pages: any[];
    disabled: boolean;
    menuItems: any[];
    isEmpty?: boolean;
    selectedPageIds: any[];
    documentId: string | number;
    onSelectionChange: (page: any, checked: boolean) => void;
    onZoom: (page: any) => void;
}

export function DroppableDocumentZone({
    pages,
    onZoom,
    disabled,
    menuItems,
    documentId,
    selectedPageIds,
    onSelectionChange,
}: DroppableDocumentZoneProps) {
    const { isOver, setNodeRef: setDropRef } = useDroppable({
        id: `droppable-doc-${ documentId }`,
        data: { documentId, type: 'document-zone' }
    });

    const isEmpty = pages.length === 0;

    const scrollRef = useRef<HTMLDivElement>(null);

    // Horizontal virtualizer — only renders pages in the visible scroll window
    const virtualizer = useVirtualizer({
        count: pages.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => PAGE_WIDTH,
        horizontal: true,
        overscan: 5, // render 3 extra pages on each side for smooth drag-scroll
    });

    const virtualItems = virtualizer.getVirtualItems();
    const totalWidth = virtualizer.getTotalSize();

    const setRefs = (el: HTMLDivElement | null) => {
        setDropRef(el);
        (scrollRef as any).current = el;
    };

    return (
        <div ref={ setDropRef }
             className={ `DroppableDocument w-full transition-colors rounded-md
                ${ isEmpty && 'border-2 border-dashed border-(--border-secondary)' }
                ${ isOver && 'bg-(--color-primary)/10 border-(--color-primary)' }` }>
            { isEmpty && !isOver && (
                <div className="flex items-center align-center justify-center h-80 text-(--text-secondary) text-sm">
                    { t('SPLITTER.dropzone_empty') }
                </div>
            ) }
            { isOver && isEmpty && (
                <div className="flex items-center justify-center h-80 text-(--color-primary) text-sm font-medium">
                    { t('SPLITTER.dropzone_over') }
                </div>
            ) }

            { pages.length > 0 && (
                <div ref={ setRefs }
                     className="overflow-x-auto p-4 h-105">
                    <div style={ { width: totalWidth, position: 'relative' } }>
                        { virtualItems.map((virtualItem) => {
                            const page = pages[virtualItem.index];
                            return (
                                <div key={ page.id } className={ `absolute top-0` }
                                     style={ {
                                         left: virtualItem.start,
                                         width: virtualItem.size - 12
                                     } } // subtract gap from width to prevent horizontal scrollbar
                                >
                                    <DraggablePage
                                        page={ page }
                                        onZoom={ onZoom }
                                        disabled={ disabled }
                                        menuItems={ menuItems }
                                        documentId={ documentId }
                                        onSelectionChange={ onSelectionChange }
                                        isSelected={ selectedPageIds.includes(page.id) }
                                    />
                                </div>
                            );
                        }) }
                    </div>
                </div>
            ) }
        </div>
    );
}