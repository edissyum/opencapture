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

import React from "react";
import { t } from "i18next";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon, Menu } from "@mantine/core";
import { Copy, GripVertical, Settings, Trash2 } from "lucide-react";
import { defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";

import { DroppableLine } from "./DroppableLine";

import { InputSwitch } from "../../../InputSwitch";

export function SortableLine({ line, zoneId, onUpdateField, onDeleteField, onDeleteLine, onUpdateLine, module }: any) {
    const menuModel: any = [
        {
            label: <span className='flex items-center gap-2' onClick={ (e) => e.stopPropagation() }>
                { t('FORMS.duplicable') }
                <InputSwitch
                    id={ 'duplicate-' + line.id }
                    checked={ line.duplicable }
                    onChange={ (value) => {
                        onUpdateLine({ id: line.id, duplicable: value })
                    } }
                />
            </span>,
            icon: <Copy size={ 16 }/>,
            visible: zoneId !== 'zone-supplier' && module === 'verifier'
        },
        {
            label: <span className='critical'>{ t('FORMS.delete') } </span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => {
                onDeleteLine(line.id)
            }
        }
    ];

    const animateLayoutChanges = (args: any) =>
        defaultAnimateLayoutChanges({ ...args, wasDragging: true });

    const { setNodeRef, setActivatorNodeRef, listeners, transform, isDragging, isOver, transition } = useSortable({
        id: line.id,
        data: {
            line,
            type: "line"
        },
        animateLayoutChanges
    });
    const bg = isOver ? "bg-(--bg-selected) border-(--border-primary)" : "bg-(--bg-primary) border-transparent";

    const style = {
        transition,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 40 : "auto",
        transform: CSS.Transform.toString(transform)
    };

    return (
        <div ref={ setNodeRef } style={ style }
            className={ `SortableLine relative mt-1 flex justify-center items-center ${ isDragging ? 'opacity-50' : 'opacity-100' }` }>
            { line.fields.length >= 1 && (
                <div className='cursor-grab text-(--text-secondary) hover:text-(--text-primary)'
                    ref={ setActivatorNodeRef } { ...listeners } aria-label="Drag handle">
                    <GripVertical size={ 22 }/>
                </div>
            ) }
            <div className={ `group w-full p-2 ${ bg } border rounded-md hover:bg-[#E1EFE8] transition-colors
                              dark:hover:bg-(--bg-secondary) hover:border-(--border-primary)/30` }>
                <div className='cursor-pointer group-hover:opacity-100 opacity-0 transition-opacity -translate-x-1/2
                               text-(--text-secondary) absolute z-20 -top-5.5 p-0.5 left-1/2 border before:translate-y-px
                               border-b-0 border-(--border-primary)/30 rounded-md rounded-b-none bg-[#E1EFE8] leading-0
                               dark:bg-(--bg-secondary) before:content-[""] before:absolute before:bottom-0'>
                    <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                            <ActionIcon
                                size='xs'
                                className='mr-0!'
                                variant="transparent"
                                onClick={ (e: any) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                } }
                            >
                                <Settings
                                    size={ 16 }
                                    className='text-(--text-secondary)'
                                />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            { menuModel.filter((item: any) => item.visible != false)?.map((item: any, index: number) => (
                                <Menu.Item
                                    key={ index }
                                    leftSection={ item.icon }
                                    disabled={ item.disabled }
                                    onClick={ (e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        item.command(e);
                                    } }
                                >
                                    { item.label }
                                </Menu.Item>
                            )) }
                        </Menu.Dropdown>
                    </Menu>
                </div>

                <DroppableLine line={ line } onUpdateField={ onUpdateField } onDeleteField={ onDeleteField }
                    module={ module }/>
            </div>

            { line.duplicable && (
                <Copy size={ 16 } data-tooltip-id="tooltip" data-tooltip-content={ t('FORMS.duplicated_line') }
                    className='text-(--text-secondary) cursor-pointer ml-2'/>
            ) }
        </div>
    );
}
