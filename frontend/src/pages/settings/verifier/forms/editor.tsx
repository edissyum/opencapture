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
import { useParams } from "react-router-dom";

import { TabPanel, TabView } from "primereact/tabview";
import { Accordion, AccordionTab } from "primereact/accordion";

import { arrayMove } from "@dnd-kit/sortable";
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, pointerWithin } from "@dnd-kit/core";

import { getAvailableFields } from "./availableFieldsSchema";

import {
    findLineContainingField,
    findZoneContainingLine,
    getDropContext
} from "../../../../components/form/editor/helpers";
import { FieldPalette } from "../../../../components/form/editor/FieldPalette";
import { DroppableZone } from "../../../../components/form/editor/DroppableZone";
import { DroppableLine } from "../../../../components/form/editor/DroppableLine";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { Button } from "../../../../components/Button.tsx";
import { showToast } from "../../../../components/ToastProvider.tsx";

export function SettingsVerifierFormsEditor() {
    const { get, post } = axiosApiCall();
    const { formId } = useParams<{ formId: string }>();

    const [zones, setZones] = useState([
        { id: "zone-supplier", name: t('FORMS.supplier'), lines: [] },
        { id: "zone-lines", name: t('VERIFIER.lines'), lines: [] },
        { id: "zone-facturation", name: t('FORMS.facturation'), lines: [] },
        { id: "zone-other", name: t('FORMS.other'), lines: [] }
    ]);
    useEffect(() => {
        if (formId) {
            get('/forms/fields/getByFormId/' + formId).then((response) => {
                if (response && response.fields) {
                    const updatedZones = zones.map((zone) => {
                        const key = zone.id.replace("zone-", "");

                        // Trouver les lignes correspondantes dans la réponse
                        const zoneLines = response.fields[key] || [];

                        // Assurer que chaque ligne et champ a un id unique
                        const formattedLines = zoneLines.map((line: any, index: number) => ({
                            id: `line-${ crypto.randomUUID() }`,
                            fields: line.map((field: any, fIndex: number) => ({
                                id: field.id || `field-${key}-${index + 1}-${fIndex + 1}`,
                                type: field.type,
                                label: field.label,
                                color: field.color || null,
                                required: field.required ?? false,
                                default_value: field.default_value || "",
                                format: field.format ?? "alphanum_extended_with_accent"
                            })) || [],
                        }));
                        return { ...zone, lines: formattedLines };
                    });
                    setZones(updatedZones);
                }
            });
        }
    }, []);

    const tabs: any = {
        supplier: t('ACCOUNTS.suppliers_list'),
        lines: t('VERIFIER.lines'),
        billing: t('VERIFIER.facturation'),
        custom_fields: t('VERIFIER.custom_fields'),
    };
    const availableFields = getAvailableFields(t);

    const [activeTab, setActiveTab] = useState<keyof typeof availableFields>("supplier");
    const [availableItems, setAvailableItems] = useState(availableFields[activeTab].map((f) => (f)));

    const [usedFields, setUsedFields] = useState<Record<string, string[]>>({
        supplier: [],
        lines: [],
        billing: [],
        other: [],
    });
    useEffect(() => {
        const fields: any = availableFields[activeTab];

        // ❗ filtrer selon les champs déjà utilisés pour cet onglet
        const filtered = fields.filter(
            (f: any) => !usedFields[activeTab].includes(f.id)
        );

        setAvailableItems(filtered);
    }, [activeTab, usedFields]);

    const [activeDragItem, setActiveDragItem] = useState<any>(null);
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        if (active?.data?.current) {
            setActiveDragItem(active.data.current);
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

        // 🔵 Déplacement d’une ligne
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

            setZones([...zonesCopy]);
            logZones(zonesCopy);
            return;
        }

        // 🟢 Ajout depuis la palette
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
                    const targetZoneForNewLine = findZoneContainingLine(zonesCopy, targetLine.id);
                    if (targetZoneForNewLine) {
                        targetZoneForNewLine.lines.push({
                            id: `line-${crypto.randomUUID()}`,
                            fields: [newField],
                        });
                    }
                } else {
                    targetLine.fields.push(newField);
                }
            } else if (targetZone) {
                targetZone.lines.push({
                    id: `line-${crypto.randomUUID()}`,
                    fields: [newField],
                });
            }

            setUsedFields((prev) => ({
                ...prev,
                [activeTab]: [...(prev[activeTab] || []), activeData.id],
            }));

            setZones([...zonesCopy]);
            logZones(zonesCopy);
            return;
        }

        // 🟡 Déplacement ou réordonnancement d’un champ existant
        if (activeData.type === "field" || activeData.from === "form") {
            const sourceLine = findLineContainingField(zonesCopy, active.id as string);
            if (!sourceLine) return;

            const movedField = sourceLine.fields.find((f: any) => f.id === active.id);
            if (!movedField) return;

            // 🔸 Réordonnancement dans la même ligne
            if (targetLine && targetLine.id === sourceLine.id) {
                const oldIndex = sourceLine.fields.findIndex((f: any) => f.id === active.id);
                const newIndex = targetField
                    ? sourceLine.fields.findIndex((f: any) => f.id === targetField.id)
                    : sourceLine.fields.length - 1;

                sourceLine.fields = arrayMove(sourceLine.fields, oldIndex, newIndex);
                setZones([...zonesCopy]);
                logZones(zonesCopy);
                return;
            }

            // 🔹 Déplacement vers une autre ligne
            if (targetLine && targetLine.id !== sourceLine.id) {
                if (targetLine.fields.length >= 5) {
                    const targetZoneForNewLine = findZoneContainingLine(zonesCopy, targetLine.id);
                    if (targetZoneForNewLine) {
                        targetZoneForNewLine.lines.push({
                            id: `line-${crypto.randomUUID()}`,
                            fields: [movedField],
                        });
                    }
                } else {
                    const insertIndex = targetField
                        ? targetLine.fields.findIndex((f: any) => f.id === targetField.id)
                        : targetLine.fields.length;
                    targetLine.fields.splice(insertIndex, 0, movedField);
                }

                // ✅ Supprime la ligne si elle est vide après déplacement
                sourceLine.fields = sourceLine.fields.filter((f: any) => f.id !== active.id);
                const sourceZone = findZoneContainingLine(zonesCopy, sourceLine.id);
                if (sourceZone && sourceLine.fields.length === 0) {
                    sourceZone.lines = sourceZone.lines.filter((l: any) => l.id !== sourceLine.id);
                }

                setZones([...zonesCopy]);
                logZones(zonesCopy);
                return;
            }

            // 🔻 Drop sur une zone → nouvelle ligne
            if (targetZone && !targetLine) {
                sourceLine.fields = sourceLine.fields.filter((f: any) => f.id !== active.id);

                targetZone.lines.push({
                    id: `line-${crypto.randomUUID()}`,
                    fields: [movedField],
                });

                // ✅ Supprime la ligne si elle devient vide
                const sourceZone = findZoneContainingLine(zonesCopy, sourceLine.id);
                if (sourceZone && sourceLine.fields.length === 0) {
                    sourceZone.lines = sourceZone.lines.filter((l: any) => l.id !== sourceLine.id);
                }

                setZones([...zonesCopy]);
                logZones(zonesCopy);
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleUpdate = () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        const payload: any = {};
        zones.forEach((zone) => {
            const key = zone.id.replace("zone-", "");
            payload[key] = zone.lines.map((line: any) =>
                line.fields.map((field: any) => ({
                    id: field.id,
                    type: field.type,
                    label: field.label,
                    color: field.color || "#1FAA60",
                    required: field.required ?? false,
                    default_value: field.default_value || "",
                    format: field.format ?? "alphanum_extended_with_accent"
                }))
            );
        });

        try {
            post('forms/verifier/updateFields/' + formId, payload).then(() => {
                showToast(t('FORMS.form_updated'), 'success');
                setIsSubmitting(false);
            });
        } catch (error) {
            console.error("Error updating form fields:", error);
        }
    }

    return (
        <DndContext onDragEnd={ handleDragEnd } onDragStart={ handleDragStart } collisionDetection={ pointerWithin }>
            <div className="flex h-full">
                <div className="flex flex-col border-r-2 border-(--border-secondary) w-full">
                    <TabView>
                        <TabPanel header={ t("SETTINGS.form_details") }>
                            <Button className="ml-6 my-6" variant="primary" onClick={ handleUpdate } disabled={ isSubmitting }>
                                { isSubmitting ? t('GLOBAL.saving') + "..." : t('GLOBAL.save_settings') }
                            </Button>
                        </TabPanel>
                        <TabPanel header={ t("SETTINGS.form_fields") }>
                            <Accordion multiple activeIndex={ [0] } className='p-6'>
                                { zones.map((zone) => (
                                    <AccordionTab header={ zone.name } key={ zone.id }>
                                        <DroppableZone key={ zone.id } zone={ zone }
                                                       onUpdateField={ handleUpdateField }/>
                                    </AccordionTab>
                                )) }
                            </Accordion>
                            <Button className="ml-6 my-6" variant="primary" onClick={ handleUpdate } disabled={ isSubmitting }>
                                { isSubmitting ? t('GLOBAL.saving') + "..." : t('GLOBAL.save_settings') }
                            </Button>
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
                        <span className='font-semibold'>{ t(activeDragItem.field.label) }</span>
                        <span className='text-(--text-secondary)'>{ activeDragItem.field.typeLabel }</span>
                    </div>
                ) }
                { (activeDragItem && activeDragItem.from === 'palette') && (
                    <div
                        className='flex flex-col border-2 border-(--border-secondary) rounded-lg bg-(--bg-primary) p-2 w-full opacity-60 cursor-grabbing'>
                        <span className='font-semibold'>{ t(activeDragItem.label) }</span>
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
