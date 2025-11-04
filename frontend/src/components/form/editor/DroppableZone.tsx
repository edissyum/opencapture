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
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { SortableLine } from "./SortableLine";

export function DroppableZone({ zone, onUpdateField, onDeleteField, onDeleteLine, onUpdateLine }: any) {
    const { setNodeRef, isOver } = useDroppable({
        id: zone.id,
        data: { type: "zone", zoneId: zone.id }
    });

    const bg = isOver ? "bg-(--color-primary)/10 border-(--color-primary)" : "bg-(--bg-primary)";
    const padding = zone.lines.length === 1 && zone.lines[0]?.fields.length === 0 ? 'p-5' : 'pl-2 p-5';

    return (
        <div ref={ setNodeRef } className={ `DroppableZone rounded-xl ${ bg } ${ padding }` }>
            <SortableContext id={ zone.id } items={ zone.lines.map((l: any) => l.id) }
                             strategy={ verticalListSortingStrategy }>
                { zone.lines.length === 0 && (
                    <span className={ `w-full rounded-md text-(--text-secondary) text-sm p-6` }>
                        { t("VERIFIER.drop_create_new_line") }
                    </span>
                ) }
                <div className="flex flex-col gap-3">
                    { zone.lines.map((line: any) => (
                        <SortableLine key={ line.id } line={ line } zoneId={ zone.id }
                                      onUpdateField={ onUpdateField }
                                      onDeleteField={ onDeleteField }
                                      onUpdateLine={ onUpdateLine }
                                      onDeleteLine={ onDeleteLine }/>
                    )) }
                </div>
            </SortableContext>
        </div>
    );
}
