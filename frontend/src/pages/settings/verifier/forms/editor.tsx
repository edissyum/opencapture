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
import { TabPanel, TabView } from "primereact/tabview";
import { arrayMove, SortableContext, verticalListSortingStrategy, } from "@dnd-kit/sortable";
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors, } from "@dnd-kit/core";

import { type Item, SortableItem } from "./SortableItems";

export function SettingsVerifierFormsEditor() {
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
    const tabs = [
        { id: 'account', label: t('ACCOUNTS.suppliers_list') },
        { id: 'lines', label: t('VERIFIER.lines') },
        { id: 'billing', label: t('VERIFIER.facturation') },
        { id: 'customFields', label: t('VERIFIER.custom_fields') },
    ]

    const [items, setItems] = useState<Item[]>([]);

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        const fields: any = availableFields[activeTab];
        fields.forEach((field: any) => {
            if (field.type && formatLabels[field.type]) {
                field.typeLabel = formatLabels[field.type];
            } else {
                field.typeLabel = '';
            }
        });
        console.log(fields);
        setItems(fields.map((f: any) => (f)));
    }, [activeTab]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className="flex h-full overflow-hidden">
            <div className="flex flex-col border-r-2 border-(--border-secondary) w-full">
                <TabView>
                    <TabPanel header={ t('SETTINGS.form_details') }>

                    </TabPanel>
                    <TabPanel header={ t('SETTINGS.form_fields') }>

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
                    { tabs.map((tab) => (
                        <TabPanel key={ tab.id } header={ tab.label }>
                            <DndContext sensors={ sensors } collisionDetection={ closestCenter }
                                        onDragEnd={ handleDragEnd }>
                                <SortableContext items={ items.map((i) => i.id) }
                                                 strategy={ verticalListSortingStrategy }
                                >
                                    <div className="space-x-2 space-y-6">
                                        { items.map((item) => (
                                            <SortableItem key={ item.id } item={ item }/>
                                        )) }
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </TabPanel>
                    )) }
                </TabView>
            </div>
        </div>
    );
}
