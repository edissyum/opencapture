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
import { useParams } from "react-router-dom";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { EllipsisVertical, Pen } from "lucide-react";
import { ContextMenu } from "primereact/contextmenu";
import { TabPanel, TabView } from "primereact/tabview";
import { Accordion, AccordionTab } from "primereact/accordion";
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, pointerWithin } from "@dnd-kit/core";

import { findLineContainingField, findZoneContainingLine, getDropContext } from "./helpers";

import { Button } from "../../../Button";
import { Loader } from "../../../loader/Loader";
import { FieldPalette } from "./FieldPalette";
import { DroppableZone } from "./DroppableZone";
import { DroppableLine } from "./DroppableLine";
import { showToast } from "../../../ToastProvider";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { useFormFields } from "../../../../services/hooks/useFormFields";
import { useCustomFields } from "../../../../services/hooks/useCustomFields";
import { showConfirmDialogWithInput } from "../../../../services/hooks/ConfirmDialogWithInput";

import { SettingsVerifierFormsDetails } from "../../../../pages/settings/verifier/forms/details";
import { SettingsSplitterFormsDetails } from "../../../../pages/settings/splitter/forms/details";
import { getAvailableFields } from "../../../../pages/settings/verifier/forms/availableFieldsSchema";

import { QrSeparator } from "../../doctypes/qrSeparator";
import { DoctypesTree } from "../../doctypes/doctypesTree";
import { DoctypeDetails } from "../../doctypes/doctypesDetails";

export function FormEditor({ module }: { module: 'verifier' | 'splitter' }) {
    const { get, post, put } = axiosApiCall();
    const { formId } = useParams<{ formId: any }>();
    const cm = useRef({ current: null } as any);

    const menuItems: any = [
        {
            label: t('FORMS.change_label'),
            icon: <Pen size={ 16 }/>,
            command: () => handleChangeLabel()
        }
    ];

    const [doctypes, setDoctypes] = useState<any[]>([]);
    const [doctypeUpdatedCpt, setDoctypeUpdatedCpt] = useState(0);
    const [selectedDoctype, setSelectedDoctype] = useState<any>(null);

    if (!formId) return null;

    const [mainTabIndex, setMainTabIndex] = useState(0);

    let tabs: any;
    let defaultTab: any;
    let moduleZones: any;
    let availableFields: any;
    let FormDetailsComponent: any;

    if (module === 'verifier') {
        FormDetailsComponent = SettingsVerifierFormsDetails;
        moduleZones = [
            { id: "zone-supplier", name: t('FORMS.supplier'), lines: [] },
            { id: "zone-lines", name: t('VERIFIER.lines'), lines: [] },
            { id: "zone-facturation", name: t('FORMS.facturation'), lines: [] },
            { id: "zone-other", name: t('FORMS.other'), lines: [] }
        ];
        tabs = {
            supplier: t('ACCOUNTS.suppliers_list'),
            lines: t('VERIFIER.lines'),
            billing: t('VERIFIER.facturation'),
            custom_fields: t('VERIFIER.custom_fields')
        };
        availableFields = getAvailableFields(t);
        defaultTab = 'supplier';
    } else {
        FormDetailsComponent = SettingsSplitterFormsDetails;
        moduleZones = [
            { id: "zone-batch_metadata", name: t('FORMS.metadata_batch'), lines: [] },
            { id: "zone-document_metadata", name: t('FORMS.metadata_document'), lines: [] }
        ];
        tabs = {
            customFields: t('VERIFIER.custom_fields')
        };
        availableFields = {
            customFields: []
        };
        defaultTab = 'customFields';
    }

    const [zones, setZones] = useState(moduleZones);
    const [selectedZone, setSelectedZone] = useState<any>(null);

    const { formFields } = useFormFields(formId);
    const { customFields } = useCustomFields(module);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [usedFields, setUsedFields] = useState<string[]>([]);

    const [formSettingsLoading, setFormSettingsLoading] = useState(true);
    const [formSettings, setFormSettings] = useState<any>({ "label": '', default_form: false, "settings": {} });

    // Retrieve form settings
    useEffect(() => {
        if (!formId) return;

        const retrieveFormSettings = async () => {
            try {
                const response = await get(`forms/${ module }/getById/${ formId }`);
                setFormSettings(response);
                setFormSettingsLoading(false);
            } catch (error) {
                console.error("Error retrieving form settings:", error);
            }
        };

        retrieveFormSettings().then();
    }, [formId]);

    // Initialize zones with existing form fields
    useEffect(() => {
        if (!formId || !formFields || !formSettings) return;

        const updatedZones: any = zones.map((zone: any) => {
            const key: any = zone.id.replace("zone-", "");

            const zoneLines = formFields[key] || [];

            const formattedLines = zoneLines.map((line: any) => ({
                id: `line-${ crypto.randomUUID() }`,
                duplicable: line.duplicable || false,
                fields: Object.values(line).filter(l => typeof l !== 'boolean').map((field: any) =>
                    mapField(field, module)
                )
            }));

            const usedFieldIds = zoneLines.flatMap((line: any) =>
                Object.values(line).filter((field: any) => typeof field !== 'boolean').map((field: any) => field.id)
            );
            setUsedFields((prev) => Array.from(new Set([...prev, ...usedFieldIds])));

            if (formSettings.labels && formSettings.labels[key]) {
                zone.name = formSettings.labels[key];
            }

            return { ...zone, lines: formattedLines };
        });
        setZones(updatedZones);
    }, [formSettings]);

    if (customFields.length > 0) {
        availableFields.customFields = customFields.map((cf: any) => ({
            ...cf,
            id: `custom_${ cf.id }`
        })).map((cf: any) => mapField(cf, module));
    }

    const [activeTab, setActiveTab] = useState<keyof typeof availableFields>(defaultTab);
    const [availableItems, setAvailableItems] = useState(availableFields[activeTab].map((f: any) => (f)));

    // Update available items when active tab or used fields change
    useEffect(() => {
        const fields: any = availableFields[activeTab];
        const filtered = fields.filter((f: any) => !usedFields.includes(f.id));

        setAvailableItems(filtered);
    }, [activeTab, usedFields, customFields]);

    const [activeDragItem, setActiveDragItem] = useState<any>(null);
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        if (active?.data?.current) {
            setActiveDragItem(active.data.current);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragItem(null);
        const { active, over } = event;
        if (!over) return;

        const activeData = active.data.current as any;
        if (!activeData) return;

        const zonesCopy = structuredClone(zones);
        const { zone: targetZone, line: targetLine, field: targetField } = getDropContext(zonesCopy, over.id as string);

        // Move line
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
            return;
        }

        // Add from palette
        if (activeData.from === "palette") {
            const newField = {
                id: activeData.id,
                type: activeData.type,
                color: activeData.color || null,
                label: activeData.label || activeData.typeLabel || activeData.type,
                required: activeData.required ?? false,
                format: activeData.format ?? "",
            };

            if (targetLine) {
                if (targetLine.fields.length >= 5) {
                    const targetZoneForNewLine = findZoneContainingLine(zonesCopy, targetLine.id);
                    if (targetZoneForNewLine) {
                        targetZoneForNewLine.lines.push({
                            id: `line-${ crypto.randomUUID() }`,
                            duplicable: false,
                            fields: [newField],
                        });
                    }
                } else {
                    targetLine.fields.push(newField);
                }
            } else if (targetZone) {
                targetZone.lines.push({
                    id: `line-${ crypto.randomUUID() }`,
                    duplicable: false,
                    fields: [newField],
                });
            }

            setUsedFields((prev) => Array.from(new Set([...prev, activeData.id])));

            setZones([...zonesCopy]);
            return;
        }

        // Moving or reordering an existing field
        if (activeData.type === "field" || activeData.from === "form") {
            const sourceLine = findLineContainingField(zonesCopy, active.id as string);
            if (!sourceLine) return;

            const movedField = sourceLine.fields.find((f: any) => f.id === active.id);
            if (!movedField) return;

            // Reordering within the same row
            if (targetLine && targetLine.id === sourceLine.id) {
                const oldIndex = sourceLine.fields.findIndex((f: any) => f.id === active.id);
                const newIndex = targetField
                    ? sourceLine.fields.findIndex((f: any) => f.id === targetField.id)
                    : sourceLine.fields.length - 1;

                sourceLine.fields = arrayMove(sourceLine.fields, oldIndex, newIndex);
                setZones([...zonesCopy]);
                return;
            }

            // Moving to another line
            if (targetLine && targetLine.id !== sourceLine.id) {
                if (targetLine.fields.length >= 5) {
                    const targetZoneForNewLine = findZoneContainingLine(zonesCopy, targetLine.id);
                    if (targetZoneForNewLine) {
                        targetZoneForNewLine.lines.push({
                            id: `line-${ crypto.randomUUID() }`,
                            duplicable: false,
                            fields: [movedField],
                        });
                    }
                } else {
                    const insertIndex = targetField
                        ? targetLine.fields.findIndex((f: any) => f.id === targetField.id)
                        : targetLine.fields.length;
                    targetLine.fields.splice(insertIndex, 0, movedField);
                }

                // Delete the row if it is empty after moving
                sourceLine.fields = sourceLine.fields.filter((f: any) => f.id !== active.id);
                const sourceZone = findZoneContainingLine(zonesCopy, sourceLine.id);
                if (sourceZone && sourceLine.fields.length === 0) {
                    sourceZone.lines = sourceZone.lines.filter((l: any) => l.id !== sourceLine.id);
                }

                setZones([...zonesCopy]);
                return;
            }

            // Drop onto an area → new line
            if (targetZone && !targetLine) {
                sourceLine.fields = sourceLine.fields.filter((f: any) => f.id !== active.id);

                targetZone.lines.push({
                    id: `line-${ crypto.randomUUID() }`,
                    duplicable: false,
                    fields: [movedField],
                });

                // Delete line if empty after move
                const sourceZone = findZoneContainingLine(zonesCopy, sourceLine.id);
                if (sourceZone && sourceLine.fields.length === 0) {
                    sourceZone.lines = sourceZone.lines.filter((l: any) => l.id !== sourceLine.id);
                }

                setZones([...zonesCopy]);
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

    const handleDeleteField = (fieldId: string) => {
        setZones((prevZones: any) =>
            prevZones.map((zone: any) => ({
                ...zone,
                lines: zone.lines.map((line: any) => ({
                    ...line,
                    fields: line.fields.filter((f: any) => f.id !== fieldId)
                })).filter((line: any) => line.fields.length > 0)
            }))
        );

        setUsedFields((prev) => prev.filter((id) => id !== fieldId));
    };

    const handleDeleteLine = (lineId: string) => {
        setZones((prevZones: any) =>
            prevZones.map((zone: any) => ({
                ...zone,
                lines: zone.lines.filter((line: any) => line.id !== lineId)
            }))
        );
    }

    const handleUpdateLine = (data: any) => {
        setZones((prevZones: any) =>
            prevZones.map((zone: any) => ({
                ...zone,
                lines: zone.lines.map((line: any) =>
                    line.id === data.id ? { ...line, ...data } : line
                )
            }))
        );
    }

    const handleUpdate = () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        const payload: any = {};
        zones.forEach((zone: any) => {
            const key = zone.id.replace("zone-", "");
            payload[key] = zone.lines.map((line: any) =>
                line.fields.map((field: any) =>
                    mapField(field, module)
                )
            );

            if (module === 'verifier') {
                payload[key] = payload[key].map((line: any, index: number) => ({
                    ...line,
                    duplicable: zone.lines[index]?.duplicable || false,
                }));
            }
        });

        try {
            post(`forms/${ module }/updateFields/` + formId, payload).then(() => {
                showToast(t('FORMS.form_updated'), 'success');
                setIsSubmitting(false);
            });
        } catch (error) {
            console.error("Error updating form fields:", error);
        }
    }

    const handleUpdateSettings = () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        const formSettingsCopy = { ...formSettings };
        delete formSettingsCopy.id;
        delete formSettingsCopy.labels;
        try {
            put(`forms/${ module }/update/${ formId }`, formSettingsCopy).then(() => {
                showToast(t('FORMS.form_updated'), 'success');
                setIsSubmitting(false);
            });
        } catch (error) {
            setIsSubmitting(false);
            console.error("Error updating form settings:", error);
        }
    }

    const handleChangeLabel = async () => {
        const zone_id = selectedZone.id.replace("zone-", "");
        showConfirmDialogWithInput({
            value: selectedZone.name,
            title: t('FORMS.change_label'),
            message: t('FORMS.change_zone_label_message'),
            confirmText: t('GLOBAL.modify'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: (value) => {
                selectedZone.name = value;
                setZones([...zones]);
                put(`forms/updateLabel/${ formId }/${ zone_id }`, { label: value });
            }
        });
    }

    function mapField(field: any, module: "verifier" | "splitter") {
        const base = {
            id: field.id,
            type: field.type,
            label: field.label,
            color: field.color || null,
            required: field.required ?? false,
            default_value: field.default_value || "",
            format: field.format ?? "alphanum_extended_with_accent",
            typeLabel: t(`CUSTOM-FIELDS.type_${ field.type }`)
        };

        if (module === "splitter") {
            return {
                ...base,
                disabled: field.disabled || false,
                result_mask: field.result_mask || '',
                search_mask: field.search_mask || '',
                validation_mask: field.validation_mask || '',
                field_metadata: field.field_metadata || false,
            };
        }

        return base;
    }

    return (
        <DndContext onDragEnd={ handleDragEnd } onDragStart={ handleDragStart } collisionDetection={ pointerWithin }>
            <div className="flex h-full">
                <div className="flex flex-col border-r border-(--border-secondary) w-full">
                    <TabView activeIndex={ mainTabIndex } onTabChange={ (e) => setMainTabIndex(e.index) }>
                        <TabPanel header={ t("SETTINGS.form_details") } className='bg-(--bg-primary) h-full'>
                            { formSettingsLoading ? (
                                <Loader/>
                            ) : (
                                <FormDetailsComponent
                                    formSettings={ formSettings }
                                    isSubmitting={ isSubmitting }
                                    submit={ handleUpdateSettings }
                                    setFormSettings={ setFormSettings }
                                    submitLabel={ t('GLOBAL.save_settings') }
                                    submitLabelLoading={ t('GLOBAL.saving') }
                                />
                            ) }
                        </TabPanel>
                        <TabPanel header={ t("SETTINGS.form_fields") }>
                            <Accordion multiple activeIndex={ [0] } className='p-6'>
                                { zones.map((zone: any) => (
                                    <AccordionTab header={
                                        <span className='flex items-center gap-2'>
                                            { zone.name }
                                            { module === 'verifier' && (
                                                <div className='ml-auto cursor-pointer'>
                                                    <EllipsisVertical
                                                        size={ 20 }
                                                        onClick={ (e) => {
                                                            e.stopPropagation();
                                                            e.stopPropagation();
                                                            setSelectedZone(zone);
                                                            cm.current?.show(e);
                                                            // handleChangeLabel(zone).then();
                                                        } }
                                                        data-tooltip-id="tooltip"
                                                        className='hover:text-(--color-primary)'
                                                        data-tooltip-content={ t('FORMS.change_label') }
                                                    />
                                                    <ContextMenu model={ menuItems } className="w-auto!" ref={ cm }/>
                                                </div>
                                            ) }
                                        </span>
                                    } key={ zone.id }>
                                        <DroppableZone
                                            key={ zone.id } zone={ zone } module={ module }
                                            onUpdateLine={ handleUpdateLine }
                                            onDeleteLine={ handleDeleteLine }
                                            onDeleteField={ handleDeleteField }
                                            onUpdateField={ handleUpdateField }
                                        />
                                    </AccordionTab>
                                )) }
                            </Accordion>
                            <Button className="ml-6 my-6" variant="primary" onClick={ handleUpdate }
                                    disabled={ isSubmitting }>
                                { isSubmitting ? t('GLOBAL.saving') + "..." : t('GLOBAL.save_settings') }
                            </Button>
                        </TabPanel>
                        { module === 'splitter' && (
                            <TabPanel header={ t("FORMS.doctypes") }>
                                <DoctypeDetails doctypes={ doctypes } selectedDoctype={ selectedDoctype }
                                                formId={ formId }
                                                doctypeUpdated={ () => setDoctypeUpdatedCpt(prev => prev + 1) }
                                                doctypeChanged={ (doctype) => {
                                                    setSelectedDoctype(doctype)
                                                } }/>
                            </TabPanel>
                        ) }
                        { module === 'splitter' && (
                            <TabPanel header={ t("FORMS.qr_code") }>
                                <QrSeparator selectedDoctype={ selectedDoctype }/>
                            </TabPanel>
                        ) }
                    </TabView>
                </div>

                { mainTabIndex === 1 && (
                    <div className="w-[25rem] h-full flex flex-col">
                        <TabView
                            scrollable
                            className="available_fields"
                            activeIndex={ Object.keys(availableFields).indexOf(activeTab as string) }
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
                ) }

                { [2, 3].includes(mainTabIndex) && module === 'splitter' && (
                    <div className="w-[35rem] flex flex-col">
                        <DoctypesTree key={ doctypeUpdatedCpt } formId={ parseInt(formId) } editor={ true }
                                      selectedDoctype={ selectedDoctype }
                                      onDoctypesLoaded={ (doctypes) => setDoctypes(doctypes) }
                                      onSelect={ (node) => setSelectedDoctype(node) }/>
                    </div>
                ) }
            </div>

            <DragOverlay>
                { (activeDragItem && activeDragItem.type === 'field') && (
                    <div
                        className='flex flex-col border border-(--border-secondary) rounded-lg bg-(--bg-primary) p-2 w-full opacity-60 cursor-grabbing'>
                        <span className='font-semibold'>{ t(activeDragItem.field.label) }</span>
                        <span className='text-(--text-secondary)'>{ activeDragItem.field.typeLabel }</span>
                    </div>
                ) }
                { (activeDragItem && activeDragItem.from === 'palette') && (
                    <div
                        className='flex flex-col border border-(--border-secondary) rounded-lg bg-(--bg-primary) p-2 w-full opacity-60 cursor-grabbing'>
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
