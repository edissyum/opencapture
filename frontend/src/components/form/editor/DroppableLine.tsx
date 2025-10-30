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

import { useDroppable } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";

import { SortableField } from "./SortableField"

export function DroppableLine({ line, onUpdateField, onDeleteField }: any) {
    const { setNodeRef } = useDroppable({ id: line.id });

    const fieldWidth = line.fields.length === 1 ? 'w-full' :
        line.fields.length === 2 ? 'w-1/2' :
            line.fields.length === 3 ? 'w-1/3' :
                line.fields.length === 4 ? 'w-1/4' :
                    'w-1/5';

    return (
        <SortableContext id={ line.id } items={ line.fields.map((f: any) => f.id) }
                         strategy={ horizontalListSortingStrategy }>
            <div ref={ setNodeRef } className="DroppableLine flex gap-4 flex-wrap relative">
                { line.fields.length >= 1 && (
                    line.fields.map((f: any) => (
                        <div key={ f.id } className={ `${ fieldWidth } flex-1 min-w-1/6` }>
                            <SortableField field={ f } onUpdateField={ onUpdateField } onDeleteField={ onDeleteField }/>
                        </div>
                    ))
                ) }
            </div>
        </SortableContext>
    );
}
