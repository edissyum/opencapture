import { useEffect, useState } from "react";
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core";
import { nanoid } from "nanoid";
import { FieldPalette } from "./FieldPalette";
import { DroppableZone } from "./DroppableZone";
import { TabPanel, TabView } from "primereact/tabview";
import { t } from "i18next";
import { arrayMove } from "@dnd-kit/sortable";
import { findLineContainingField, findZoneContainingLine, getDropContext } from "./helpers.tsx";
import { DroppableLine } from "./DroppableLine.tsx";
import { Accordion, AccordionTab } from "primereact/accordion";

export function SettingsVerifierFormsEditor() {
    const tabs: any = {
        account: t('ACCOUNTS.suppliers_list'),
        lines: t('VERIFIER.lines'),
        billing: t('VERIFIER.facturation'),
        custom_fields: t('VERIFIER.custom_fields'),
    };
    const formatLabels: Record<string, string> = {
        text: t('FORMATS.text'),
        select: t('FORMATS.select'),
        number: t('FORMATS.number'),
        date: t('FORMATS.date'),
        email: t('FORMATS.email'),
        phone: t('FORMATS.phone'),
    };
    const availableFields = {
        account: [
            { id: 'name', label: t('ACCOUNTS.supplier_name'), type: 'text', required: true, format: '' },
            { id: 'firstname', label: t('ACCOUNTS.firstname'), type: 'text', required: true, format: '' },
            { id: 'lastname', label: t('ACCOUNTS.lastname'), type: 'text', required: true, format: '' },
            { id: 'function', label: t('ACCOUNTS.function'), type: 'text', required: true, format: '' },
            { id: 'civility', label: t('ACCOUNTS.civility'), type: 'select', required: true, format: '' },
            { id: 'siret', label: t('ACCOUNTS.siret'), type: 'text', required: true, format: '' },
            { id: 'siren', label: t('ACCOUNTS.siren'), type: 'text', required: true, format: '' },
            { id: 'vat_number', label: t('ACCOUNTS.vat_number'), type: 'text', required: true, format: '' },
            { id: 'iban', label: t('ACCOUNTS.iban'), type: 'text', required: true, format: '' },
            { id: 'duns', label: t('ACCOUNTS.duns'), type: 'text', required: true, format: '' },
            { id: 'bic', label: t('ACCOUNTS.bic'), type: 'text', required: true, format: '' },
            { id: 'rccm', label: t('ACCOUNTS.rccm'), type: 'text', required: true, format: '' },
            { id: 'email', label: t('ACCOUNTS.email'), type: 'text', required: true, format: '' },
            { id: 'phone', label: t('ACCOUNTS.phone'), type: 'text', required: true, format: '' },
            { id: 'address1', label: t('ACCOUNTS.address1'), type: 'text', required: true, format: '' },
            { id: 'address2', label: t('ACCOUNTS.address2'), type: 'text', required: true, format: '' },
            { id: 'postal_code', label: t('ACCOUNTS.postal_code'), type: 'text', required: true, format: '' },
            { id: 'country', label: t('ACCOUNTS.country'), type: 'text', required: true, format: '' }
        ],
        lines: [
            { id: 'description', label: t('VERIFIER.item_description'), type: 'text', required: false, format: '' },
            { id: 'reference', label: t('VERIFIER.item_reference'), type: 'text', required: false, format: '' },
            { id: 'quantity', label: t('VERIFIER.item_quantity'), type: 'text', required: false, format: '' },
            { id: 'unit_price', label: t('VERIFIER.item_unit_price'), type: 'text', required: false, format: '' },
            { id: 'line_ht', label: t('VERIFIER.item_total_excl_tax'), type: 'text', required: false, format: '' },
            { id: 'line_vat_rat', label: t('VERIFIER.item_tax_rate'), type: 'text', required: false, format: '' }
        ],
        billing: [
            { id: 'invoice_number', label: t('VERIFIER.invoice_number'), type: 'text', required: true, format: '' },
            { id: 'invoice_date', label: t('VERIFIER.invoice_date'), type: 'date', required: true, format: '' },
            { id: 'due_date', label: t('VERIFIER.due_date'), type: 'date', required: false, format: '' }
        ],
        customFields: [],
    };

    const [activeTab, setActiveTab] = useState<keyof typeof availableFields>("account");
    const [availableItems, setAvailableItems] = useState(
        availableFields[activeTab].map((f) => (f))
    );
    const [usedFields, setUsedFields] = useState<Record<string, string[]>>({
        account: [],
        lines: [],
        billing: [],
        customFields: [],
    });

    useEffect(() => {
        const fields: any = availableFields[activeTab];
        fields.forEach((field: any) => {
            if (field.type && formatLabels[field.type]) {
                field.typeLabel = formatLabels[field.type];
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

    const [zones, setZones] = useState([
        { id: "zone-supplier", name: t('FORMS.supplier'), lines: [{ id: "line-1", fields: [] }] },
        { id: "zone-lines", name: t('VERIFIER.lines'), lines: [{ id: "line-2", fields: [] }] },
        { id: "zone-facturation", name: t('FORMS.facturation'), lines: [{ id: "line-3", fields: [] }] },
        { id: "zone-other", name: t('FORMS.other'), lines: [{ id: "line-4", fields: [] }] },
    ]);

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

            setZones([...zonesCopy]);
            return;
        }

        // 🟢 2. Ajout depuis la PALETTE
        if (activeData.from === "palette") {
            const newField = {
                id: nanoid(),
                type: activeData.type,
                label: activeData.label || activeData.typeLabel || activeData.type,
                required: activeData.required ?? false,
                format: activeData.format ?? "",
            };
            console.log(targetLine, targetZone);
            if (targetLine) {
                if (targetLine.fields.length >= 3) {
                    alert("Une ligne ne peut contenir que 3 champs maximum !");
                    return;
                }
                targetLine.fields.push(newField);
            } else if (targetZone) {
                targetZone.lines.push({
                    id: `line-${ nanoid() }`,
                    fields: [newField],
                });
            }

            setUsedFields((prev) => ({
                ...prev,
                [activeTab]: [...(prev[activeTab] || []), activeData.id],
            }));

            setZones([...zonesCopy]);
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
                setZones([...zonesCopy]);
                return;
            }

            // autre ligne → déplacement
            if (targetLine && targetLine.id !== sourceLine.id) {
                if (targetLine.fields.length >= 3) {
                    alert("Une ligne ne peut contenir que 3 champs maximum !");
                    return;
                }

                sourceLine.fields = sourceLine.fields.filter((f: any) => f.id !== active.id);

                const insertIndex = targetField
                    ? targetLine.fields.findIndex((f: any) => f.id === targetField.id)
                    : targetLine.fields.length;

                targetLine.fields.splice(insertIndex, 0, movedField);
                setZones([...zonesCopy]);
                return;
            }

            // drop sur une zone → créer une nouvelle ligne
            if (targetZone && !targetLine) {
                sourceLine.fields = sourceLine.fields.filter((f: any) => f.id !== active.id);

                targetZone.lines.push({
                    id: `line-${ nanoid() }`,
                    fields: [movedField],
                });

                setZones([...zonesCopy]);
                return;
            }
        }
    };

    return (
        <DndContext onDragEnd={ handleDragEnd } onDragStart={ handleDragStart }>
            <div className="flex h-full">
                <div className="flex flex-col border-r-2 border-(--border-secondary) w-full">
                    <TabView>
                        <TabPanel header={ t("SETTINGS.form_details") }>

                        </TabPanel>
                        <TabPanel header={ t("SETTINGS.form_fields") }>
                            <Accordion multiple activeIndex={ [0] }>
                                { zones.map((zone) => (
                                    <AccordionTab header={ zone.name }>
                                        <DroppableZone key={ zone.id } zone={ zone }/>
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
                { (activeDragItem && activeDragItem.type !== 'line') && (
                    <div
                        className='flex flex-col border-2 border-(--border-secondary) rounded-lg bg-(--bg-primary) p-3 w-full opacity-60'>
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
