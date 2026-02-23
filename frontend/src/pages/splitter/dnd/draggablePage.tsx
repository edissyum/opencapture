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
import { useSortable } from "@dnd-kit/sortable";
import { EllipsisVertical, Eye } from "lucide-react";

import { b64ToFile } from "../../settings/general/customization";

import { Checkbox } from "../../../components/Checkbox";

interface DraggablePageProps {
    page: any;
    onZoom?: (page: any) => void;
    documentId: string | number;
    isDragOverlay?: boolean;
}

export function DraggablePage({ page, documentId, isDragOverlay, onZoom }: DraggablePageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: `page-${ page.id }`,
        data: { page, documentId, type: 'page' }
    });

    const style = {
        transition,
        opacity: isDragging ? 0.3 : 1,
        transform: CSS.Transform.toString(transform)
    };

    return (
        <div ref={ setNodeRef } style={ isDragOverlay ? {} : style }
             className={ `DraggablePage group flex items-center gap-2 rounded-md border border-(--border-secondary) transition-colors 
                bg-(--bg-secondary) cursor-default select-none h-full hover:bg-(--color-primary)/20 hover:cursor-pointer
                ${ isDragOverlay ? 'rotate-1 opacity-90' : '' }` }>

            <div className='h-full'>
                { page.thumbnail && (
                    <div className='relative'>
                        <img
                            src={ URL.createObjectURL(b64ToFile('data:image/jpg;base64,' + page.thumbnail)) }
                            alt={ `Page ${ page.source_page }` }
                            className="h-90 p-4 rounded-[20px]"
                        />

                        <div className="flex items-center gap-1 text-(--text-secondary) rounded-md absolute bottom-2 transition-opacity
                                        right-4 bg-(--bg-primary) py-1 px-2 border-2 border-(--border-secondary) group-hover:opacity-100 opacity-0"
                             onClick={ (e) => {
                                 e.stopPropagation();
                                 if (onZoom) onZoom(page);
                             } }>
                            <Eye size={18}/>
                            Apercu
                        </div>

                        <Checkbox
                            id={ page.id }
                            className="absolute top-2 left-2"
                            // checked={ selectedRows.some(r => r.id === row.id) }
                            // onChange={ (checked: boolean, id: string | undefined) => onSelect(checked, id) }
                        />
                    </div>
                ) }
                <div
                    className="w-full cursor-grab active:cursor-grabbing rounded-md rounded-t-none
                               p-2 flex items-center gap-1 bg-(--bg-primary) font-semibold"
                    { ...attributes } { ...listeners }>
                    <span className="text-sm ">Page { page.source_page }</span>
                    <EllipsisVertical size={ 18 } className="ml-auto" />
                </div>
            </div>
        </div>
    );
}