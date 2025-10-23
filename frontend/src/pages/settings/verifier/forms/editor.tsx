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
import { useEffect, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { TabPanel, TabView } from "primereact/tabview";
import { Accordion, AccordionTab } from "primereact/accordion";
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, pointerWithin } from "@dnd-kit/core";

import { getAvailableFields } from "./availableFields";

import {
    findLineContainingField,
    findZoneContainingLine,
    getDropContext,
    recalculateLineIds
} from "../../../../components/form/editor/helpers";
import { FieldPalette } from "../../../../components/form/editor/FieldPalette";
import { DroppableZone } from "../../../../components/form/editor/DroppableZone";
import { DroppableLine } from "../../../../components/form/editor/DroppableLine";

export function SettingsVerifierFormsEditor() {
    const tabs: any = {
        account: t('ACCOUNTS.suppliers_list'),
        lines: t('VERIFIER.lines'),
        billing: t('VERIFIER.facturation'),
        custom_fields: t('VERIFIER.custom_fields'),
    };
    const typeLabels: Record<string, string> = {
        text: t('FORMATS.text'),
        select: t('FORMATS.select'),
        number: t('FORMATS.number'),
        date: t('FORMATS.date'),
        email: t('FORMATS.email'),
        phone: t('FORMATS.phone'),
    };
    const availableFields = getAvailableFields(t);

    const [activeTab, setActiveTab] = useState<keyof typeof availableFields>("account");
    const [availableItems, setAvailableItems] = useState(availableFields[activeTab].map((f) => (f)));
    const [usedFields, setUsedFields] = useState<Record<string, string[]>>({
        account: [],
        lines: [],
        billing: [],
        customFields: [],
    });

    useEffect(() => {
        const fields: any = availableFields[activeTab];
        fields.forEach((field: any) => {
            if (field.type && typeLabels[field.type]) {
                field.typeLabel = typeLabels[field.type];
            } else {
                field.typeLabel = '';
            }
        });

        // ❗ filtrer selon les champs déjà utilisés pour cet onglet
        const filtered = fields.filter(
            (f: any) => !usedFields[activeTab].includes(f.id)
        );

        setAvailableItems(filtered);
    }, [activeTab, usedFields]);

    const [lineCounter, setLineCounter] = useState(1);
    const [zones, setZones] = useState([
        { id: "zone-supplier", name: t('FORMS.supplier'), lines: [] },
        { id: "zone-lines", name: t('VERIFIER.lines'), lines: [] },
        { id: "zone-facturation", name: t('FORMS.facturation'), lines: [] },
        { id: "zone-other", name: t('FORMS.other'), lines: [] },
    ]);

    const [activeDragItem, setActiveDragItem] = useState<any>(null);
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        if (active?.data?.current) {
            setActiveDragItem(active.data.current);
            console.log("Drag started:", active.id, active.data.current);
        }
    };

    function logZones(zones: any[]) {
        console.groupCollapsed("%c🧩 Zones Debug", "color:#4caf50; font-weight:bold;");
        zones.forEach((zone: any) => {
            console.group(`📦 ${ zone.name }`);
            zone.lines.forEach((line: any) => {
                console.group(`🧱 ${ line.id }`);
                line.fields.forEach((f: any) =>
                    console.log(`🔹 ${ f.label } (${ f.type }) (required: ${ f.required })`)
                );
                console.groupEnd();
            });
            console.groupEnd();
        });
        console.groupEnd();
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragItem(null);
        const { active, over } = event;
        if (!over) return;

        const activeData = active.data.current as any;
        if (!activeData) return;

        const zonesCopy = structuredClone(zones);
        const { zone: targetZone, line: targetLine, field: targetField } = getDropContext(zonesCopy, over.id as string);

        // 🔵 1. Déplacement d'une LIGNE
        if (activeData.type === "line") {
            const sourceZone = findZoneContainingLine(zonesCopy, active.id as string);
            if (!sourceZone || !targetZone) return;

            const [movedLine] = sourceZone.lines.splice(
                sourceZone.lines.findIndex((l: any) => l.id === active.id),
                1
            );

            const insertIndex = targetZone.lines.findIndex((l: any) => l.id === over.id);
            if (insertIndex >= 0) targetZone.lines.splice(insertIndex, 0, movedLine);
            else targetZone.lines.push(movedLine);

            setZones(recalculateLineIds([...zonesCopy]));
            logZones(zonesCopy);
            return;
        }

        // 🟢 2. Ajout depuis la PALETTE
        if (activeData.from === "palette") {
            const newField = {
                id: activeData.id,
                type: activeData.type,
                label: activeData.label || activeData.typeLabel || activeData.type,
                required: activeData.required ?? false,
                format: activeData.format ?? "",
            };

            if (targetLine) {
                if (targetLine.fields.length >= 5) {
                    const newLineId = `line-${ lineCounter }`;
                    const newLine = {
                        id: newLineId,
                        fields: [newField],
                    };
                    const targetZoneForNewLine = findZoneContainingLine(zonesCopy, targetLine.id);
                    if (targetZoneForNewLine) {
                        targetZoneForNewLine.lines.push(newLine);
                        setLineCounter((prev) => prev + 1);
                    }
                    setZones(recalculateLineIds([...zonesCopy]));
                    logZones(zonesCopy);
                    return;
                }
                targetLine.fields.push(newField);
            } else if (targetZone) {
                const newLineId = `line-${ lineCounter }`;
                targetZone.lines.push({
                    id: newLineId,
                    fields: [newField],
                });
                setLineCounter((prev) => prev + 1);
            }

            setUsedFields((prev) => ({
                ...prev,
                [activeTab]: [...(prev[activeTab] || []), activeData.id],
            }));

            setZones(recalculateLineIds([...zonesCopy]));
            logZones(zonesCopy);
            return;
        }

        // 🟡 3. Déplacement ou réordonnancement d’un CHAMP existant
        if (activeData.type === "field" || activeData.from === "form") {
            const sourceLine = findLineContainingField(zonesCopy, active.id as string);
            if (!sourceLine) return;

            const movedField = sourceLine.fields.find((f: any) => f.id === active.id);
            if (!movedField) return;

            // même ligne → simple réordonnancement
            if (targetLine && targetLine.id === sourceLine.id) {
                const oldIndex = sourceLine.fields.findIndex((f: any) => f.id === active.id);
                const newIndex = targetField
                    ? sourceLine.fields.findIndex((f: any) => f.id === targetField.id)
                    : sourceLine.fields.length - 1;

                sourceLine.fields = arrayMove(sourceLine.fields, oldIndex, newIndex);
                setZones(recalculateLineIds([...zonesCopy]));
                logZones(zonesCopy);
                return;
            }

            // autre ligne → déplacement
            if (targetLine && targetLine.id !== sourceLine.id) {
                if (targetLine.fields.length >= 5) {
                    const newLineId = `line-${ lineCounter }`;
                    const newLine = {
                        id: newLineId,
                        fields: [movedField],
                    };
                    const targetZoneForNewLine = findZoneContainingLine(zonesCopy, targetLine.id);
                    if (targetZoneForNewLine) {
                        targetZoneForNewLine.lines.push(newLine);
                        setLineCounter((prev) => prev + 1);
                    }
                    sourceLine.fields = sourceLine.fields.filter((f: any) => f.id !== active.id);
                    setZones(recalculateLineIds([...zonesCopy]));
                    logZones(zonesCopy);
                    return;
                }

                sourceLine.fields = sourceLine.fields.filter((f: any) => f.id !== active.id);

                const insertIndex = targetField
                    ? targetLine.fields.findIndex((f: any) => f.id === targetField.id)
                    : targetLine.fields.length;

                targetLine.fields.splice(insertIndex, 0, movedField);
                setZones(recalculateLineIds([...zonesCopy]));
                logZones(zonesCopy);
                return;
            }

            // drop sur une zone → créer une nouvelle ligne
            if (targetZone && !targetLine) {
                sourceLine.fields = sourceLine.fields.filter((f: any) => f.id !== active.id);

                const newLineId = `line-${ lineCounter }`;
                targetZone.lines.push({
                    id: newLineId,
                    fields: [movedField],
                });

                setLineCounter((prev) => prev + 1);
                setZones(recalculateLineIds([...zonesCopy]));
                logZones(zonesCopy);
                return;
            }
        }
    };

    const handleUpdateField = (fieldId: string, updatedField: any) => {
        setZones((prevZones: any) =>
            prevZones.map((zone: any) => ({
                ...zone,
                lines: zone.lines.map((line: any) => ({
                    ...line,
                    fields: line.fields.map((f: any) =>
                        f.id === fieldId ? { ...f, ...updatedField } : f
                    )
                }))
            }))
        );
    };

    return (
        <DndContext onDragEnd={ handleDragEnd } onDragStart={ handleDragStart } collisionDetection={ pointerWithin }>
            <div className="flex h-full">
                <div className="flex flex-col border-r-2 border-(--border-secondary) w-full">
                    <TabView>
                        <TabPanel header={ t("SETTINGS.form_details") }>

                        </TabPanel>
                        <TabPanel header={ t("SETTINGS.form_fields") }>
                            <Accordion multiple activeIndex={ [0] } className='p-6'>
                                { zones.map((zone) => (
                                    <AccordionTab header={ zone.name }>
                                        <DroppableZone key={ zone.id } zone={ zone }
                                                       onUpdateField={ handleUpdateField }/>
                                    </AccordionTab>
                                )) }
                            </Accordion>
                        </TabPanel>
                    </TabView>
                </div>

                <div className="w-[25rem] flex flex-col">
                    <TabView
                        scrollable
                        className="available_fields"
                        activeIndex={ Object.keys(availableFields).indexOf(activeTab) }
                        onTabChange={ (e) =>
                            setActiveTab(Object.keys(availableFields)[e.index] as keyof typeof availableFields)
                        }
                    >
                        { Object.keys(tabs).map((tab) => (
                            <TabPanel key={ tab } header={ tabs[tab] }>
                                <FieldPalette fields={ availableItems }/>
                            </TabPanel>
                        )) }
                    </TabView>
                </div>
            </div>

            <DragOverlay>
                { (activeDragItem && activeDragItem.type === 'field') && (
                    <div
                        className='flex flex-col border-2 border-(--border-secondary) rounded-lg bg-(--bg-primary) p-2 w-full opacity-60 cursor-grabbing'>
                        <span className='font-semibold'>{ activeDragItem.field.label }</span>
                        <span className='text-(--text-secondary)'>{ activeDragItem.field.typeLabel }</span>
                    </div>
                ) }
                { (activeDragItem && activeDragItem.from === 'palette') && (
                    <div
                        className='flex flex-col border-2 border-(--border-secondary) rounded-lg bg-(--bg-primary) p-2 w-full opacity-60 cursor-grabbing'>
                        <span className='font-semibold'>{ activeDragItem.label }</span>
                        <span className='text-(--text-secondary)'>{ activeDragItem.typeLabel }</span>
                    </div>
                ) }
                { (activeDragItem && activeDragItem.type === 'line') && (
                    <div className='p-2 opacity-60'>
                        <DroppableLine line={ activeDragItem.line }/>
                    </div>
                ) }
            </DragOverlay>
        </DndContext>
    );
}
