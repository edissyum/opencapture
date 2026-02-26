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
import { CSS } from "@dnd-kit/utilities";
import React, { useMemo, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { EllipsisVertical, Eye } from "lucide-react";
import { ContextMenu } from "primereact/contextmenu";

import { b64ToFile } from "../../settings/general/customization";

import { Checkbox } from "../../../components/Checkbox";

interface DraggablePageProps {
    page: any;
    menuItems?: any[];
    isSelected: boolean;
    isDragOverlay?: boolean;
    documentId: string | number;
    onZoom?: (page: any) => void;
    onSelectionChange?: (page: any, checked: boolean) => void;
}

export const DraggablePage = React.memo(function DraggablePage({
    page,
    documentId,
    isDragOverlay,
    onZoom,
    menuItems,
    isSelected,
    onSelectionChange
}: DraggablePageProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `page-${ page.id }`,
        data: { page, documentId, type: 'page' }
    });

    const cm = useRef<any>(null);

    const thumbnailUrl = useMemo(() => {
        if (!page.thumbnail) return null;
        return URL.createObjectURL(b64ToFile('data:image/jpg;base64,' + page.thumbnail));
    }, [page.thumbnail]);

    const style = {
        transition,
        opacity: isDragging ? 0.3 : 1,
        transform: CSS.Transform.toString(transform)
    };

    return (
        <div
            ref={ setNodeRef }
            style={ isDragOverlay ? {} : style }
            className='DraggablePage group flex items-center gap-2 rounded-lg border border-(--border-secondary)
                       transition-colors bg-(--bg-secondary) cursor-default select-none h-full
                       hover:bg-(--color-primary)/20 hover:cursor-pointer min-w-64'
        >
            <div className='h-full w-full flex flex-col items-center'>
                { thumbnailUrl && (
                    <div className='relative p-6'>
                        <img
                            src={ thumbnailUrl }
                            alt={ `Page ${ page.source_page }` }
                            className={ `h-80 rounded-lg
                                ${ page.rotation === 90 ? 'rotate-90 m-auto scale-75 px-2' : '' }
                                ${ page.rotation === 180 ? 'rotate-180 m-auto' : '' }
                                ${ page.rotation === -90 ? '-rotate-90 m-auto scale-75 px-2' : '' }` }
                        />

                        <div
                            className="flex items-center gap-1 text-(--text-secondary) rounded-md absolute bottom-2
                                       transition-opacity right-4 bg-(--bg-primary) py-1 px-2 border-2
                                       border-(--border-secondary) group-hover:opacity-100 opacity-0"
                            onClick={ (e) => {
                                e.stopPropagation();
                                onZoom?.(page);
                            } }
                        >
                            <Eye size={ 18 }/>
                            { t('SPLITTER.preview') }
                        </div>

                        <Checkbox
                            size={ 6 }
                            id={ page.id }
                            checked={ isSelected }
                            className="absolute top-3 left-3"
                            onChange={ (checked: boolean) => onSelectionChange?.(page, checked) }
                        />
                    </div>
                ) }

                <div
                    className="w-full cursor-grab active:cursor-grabbing rounded-md rounded-t-none
                               p-2 flex items-center gap-1 bg-(--bg-primary) font-semibold"
                    { ...attributes }
                    { ...listeners }
                >
                    <span className="text-sm">Page { page.source_page }</span>
                    <EllipsisVertical
                        size={ 18 } className="cursor-pointer ml-auto"
                        onClick={ (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onSelectionChange?.(page, true);
                            cm.current?.show(e);
                        } }
                    />
                    <ContextMenu
                        model={ menuItems }
                        className="w-auto!"
                        ref={ cm }
                        onHide={ () => onSelectionChange?.(page, false) }
                    />
                </div>
            </div>
        </div>
    );
});