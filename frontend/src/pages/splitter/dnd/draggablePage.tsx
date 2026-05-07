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
import { useSortable } from "@dnd-kit/sortable";
import { EllipsisVertical, Eye } from "lucide-react";
import { ContextMenu } from "primereact/contextmenu";
import React, { useEffect, useRef, useState } from "react";

import { b64ToFile } from "../../settings/general/customization";

import { Checkbox } from "../../../components/Checkbox";

interface DraggablePageProps {
    page: any;
    menuItems?: any[];
    disabled?: boolean;
    isSelected: boolean;
    isDragOverlay?: boolean;
    documentId: string | number;
    onZoom?: (page: any) => void;
    onSelectionChange?: (page: any, checked: boolean) => void;
}

export const DraggablePage = React.memo(function DraggablePage({
    page,
    onZoom,
    disabled,
    menuItems,
    documentId,
    isSelected,
    isDragOverlay,
    onSelectionChange
}: DraggablePageProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `page-${ page.id }`,
        data: { page, documentId, type: 'page' }
    });

    const cm = useRef<any>(null);

    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!page.thumbnail) {
            setThumbnailUrl(null);
            return;
        }
        const url = URL.createObjectURL(b64ToFile('data:image/jpg;base64,' + page.thumbnail));
        setThumbnailUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [page.thumbnail]);

    const style = {
        transition,
        opacity: isDragging ? 0.3 : 1,
        transform: CSS.Transform.toString(transform)
    };

    return (
        <div ref={ setNodeRef } style={ isDragOverlay ? {} : style }
             onClick={ () => !disabled && onSelectionChange?.(page, !isSelected) }
             className={ `DraggablePage group flex items-center gap-2 rounded-lg border border-(--border-secondary)
                transition-colors bg-(--bg-secondary) cursor-default select-none h-full
                hover:bg-(--bg-selected) hover:cursor-pointer min-w-64
                ${ isSelected && 'bg-(--bg-selected) border-(--color-primary)' }` }>
            <div className={ `h-full w-full flex flex-col items-center cursor-grab active:cursor-grabbing
                              ${disabled && 'pointer-events-none'}` }
                 { ...attributes }
                 { ...listeners }
            >
                { thumbnailUrl && (
                    <div className='w-full p-4 relative h-82'>
                        <img
                            src={ thumbnailUrl }
                            alt={ `Page ${ page.source_page }` }
                            className={ `rounded-lg pointer-events-none w-full max-h-full
                                ${ page.rotation === 90 ? 'rotate-90 m-auto scale-75 px-2' : '' }
                                ${ page.rotation === 180 ? 'rotate-180 m-auto' : '' }
                                ${ page.rotation === -90 ? '-rotate-90 m-auto scale-75 px-2' : '' }` }
                        />

                        <div
                            className="flex items-center left-1/2 -translate-x-1/2 gap-1 text-white rounded-3xl
                                       absolute bottom-2 transition-opacity bg-(--color-primary) py-2 px-3
                                       group-hover:opacity-100 opacity-0 text-sm cursor-pointer pointer-events-auto"
                            onClick={ (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onZoom?.(page);
                            } }
                        >
                            <Eye size={ 18 }/>
                            { t('SPLITTER.preview') }
                        </div>

                        <Checkbox
                            size={ 6 }
                            id={ page.id }
                            disabled={ disabled }
                            checked={ isSelected }
                            className="absolute top-3 left-3"
                            onChange={ (checked: boolean) => !disabled && onSelectionChange?.(page, checked) }
                        />
                    </div>
                ) }

                <div className="w-full rounded-lg rounded-t-none p-2 flex items-center gap-1 bg-(--bg-primary) font-semibold">
                    <span className="text-sm">Page { page.source_page }</span>
                    <EllipsisVertical
                        size={ 18 } className={ `ml-auto ${ disabled ? 'cursor-not-allowed' : 'cursor-pointer' }` }
                        onClick={ (e) => {
                            if (disabled) return;
                            e.preventDefault();
                            e.stopPropagation();
                            onSelectionChange?.(page, true);
                            cm.current?.show(e);
                        } }
                    />
                    <ContextMenu
                        ref={ cm }
                        model={ menuItems }
                        className="w-auto!"
                        onHide={ () => onSelectionChange?.(page, false) }
                    />
                </div>
            </div>
        </div>
    );
});