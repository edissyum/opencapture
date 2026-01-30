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

import z from "zod";
import { t } from "i18next";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { DynamicForm } from "../../form/DynamicForm";
import { axiosApiCall } from "../../../services/hooks/axiosApiCall";

export function CustomFieldsEditor({ module }: { module: 'verifier' | 'splitter' }) {
    const { get, post, put } = axiosApiCall();
    const { customFieldId } = useParams<{ customFieldId: any }>();

    const [customField, setCustomField] = useState<any>({});

    // Fetch customField data if editing an existing custom field
    useEffect(() => {
        if (!customFieldId) return;

        const fetchCustomField = async () => {
            try {
                const response = await get(`/customFields/getById/${ customFieldId }`);
                setCustomField(response);
            } catch (error) {
                console.error('Error fetching custom field data :', error);
            }
        };

        fetchCustomField().then();
    }, [customFieldId]);

    let typesList = [
        { id: 'text', label: t('CUSTOM-FIELDS.type_text'), 'logo': 'text' },
        { id: 'date', label: t('CUSTOM-FIELDS.type_date'), 'logo': 'date' },
        { id: 'select', label: t('CUSTOM-FIELDS.type_select'), 'logo': 'select' },
        { id: 'textarea', label: t('CUSTOM-FIELDS.type_textarea'), 'logo': 'textarea' },
        { id: 'checkbox', label: t('CUSTOM-FIELDS.type_checkbox'), 'logo': 'checkbox' }
    ];
    if (module === 'verifier') {
        typesList.splice(1, 0, {
            id: 'regex', label: t('CUSTOM-FIELDS.type_regex'), 'logo': 'regex'
        });
    }

    const baseShape = {
        label: z.string().min(3).describe(JSON.stringify({
            component: "input",
            type: "text",
            required: true,
            label: t("FORMS.label")
        })),
        label_short: z.string().min(1).optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            required: true,
            label: t("ROLES.label_short")
        }))
    };
    let detailsSchema;
    if (module === 'verifier') {
        detailsSchema = z.object({
            ...baseShape
        });
    } else if (module === 'splitter') {
        detailsSchema = z.object({
            ...baseShape,
            metadata_key: z.string().min(1).describe(JSON.stringify({
                component: "dropdown",
                type: "text",
                label: t("CUSTOM-FIELDS.autocomplete"),
                options: [
                    { label: t('SPLITTER.separator_mem'), value: 'SEPARATOR_MEM' },
                    { label: t('SPLITTER.separator_meta1'), value: 'SEPARATOR_META1' },
                    { label: t('SPLITTER.separator_meta2'), value: 'SEPARATOR_META2' },
                    { label: t('SPLITTER.separator_meta3'), value: 'SEPARATOR_META3' }
                ]
            }))
        });
    }

    const typeSchema = z.object({
        type: z.string().min(1).describe(JSON.stringify({
            component: "box",
            type: "text",
            required: true,
            label: t("CUSTOM-FIELDS.type"),
            options: typesList.map(type => ({
                value: type.id,
                logo: type.logo,
                label: type.label
            }))
        }))
    });

    const regexDetailsSchema = z.object({
        format: z.string().min(1).describe(JSON.stringify({
            component: "dropdown",
            label: t("REGEX.format"),
            options: [
                { value: "text", label: t('FORMATS.text') },
                { value: "date", label: t('FORMATS.date') },
                { value: "number_float", label: t('FORMATS.number') },
                { value: "amount", label: t('FORMATS.amount') },
                { value: "luhn_algorithm", label: t('FORMATS.luhn_algorithm') },
                { value: "iban", label: t('FORMATS.iban') },
                { value: "adeli", label: t('FORMATS.adeli') }
            ]
        })),
        char_min: z.number().nullable().optional().describe(JSON.stringify({
            component: "input",
            type: "number",
            label: t("REGEX.char_min")
        })),
    });
    const regexContentSchema = z.object({
        content: z.string().min(1).describe(JSON.stringify({
            component: "input",
            label: t("REGEX.content")
        })),
    });
    const regexCleanSchema = z.object({
        remove_keyword: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("REGEX.remove_keyword")
        })),
        remove_keyword_value: z.boolean().optional().describe(JSON.stringify({
            component: "input",
            label: t("REGEX.remove_keyword_value")
        })),
        remove_special_char: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("REGEX.remove_special_char")
        })),
        remove_spaces: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("REGEX.remove_spaces")
        }))
    });
    const regexSchema = regexDetailsSchema.extend(regexContentSchema.shape).extend(regexCleanSchema.shape);


    const { control, watch, setValue, setError, clearErrors, handleSubmit, formState: { errors } } = useForm({
        // @ts-ignore
        resolver: zodResolver(detailsSchema.extend(typeSchema.shape).extend(regexSchema.shape)),
        defaultValues: {},
        mode: "onChange"
    });
    const watchLabel = watch("label");

    // Fill form when custom_field data is loaded
    useEffect(() => {
        if (Object.keys(customField).length === 0) return;

        Object.entries(customField).forEach(([key, value]: any) => {
            setValue(key, value);
        });

        if (customField.settings) {
            Object.entries(customField.settings).forEach(([_, value]: any) => {
                if (value) {
                    Object.entries(value).forEach(([settingKey, settingValue]: any) => {
                        setValue(settingKey, settingValue);
                    });
                }
            });
        }
    }, [customField]);

    // Fill label_short with label value
    useEffect(() => {
        if (!watchLabel || customFieldId) return;

        const newLabelShort = watchLabel.toLowerCase().replace(/\s+/g, '_').replace(/[^\w\-]+/g, '');
        setValue("label_short", newLabelShort);
    }, [watchLabel]);

    return (
        <div className="p-8 h-full overflow-y-auto">
            <h1 className="text-lg font-semibold mb-4">
                { t('ROLES.details') }
            </h1>

            <div className='w-1/3'>
                <DynamicForm errors={ errors } control={ control } schema={ detailsSchema }/>
            </div>

            <h1 className="text-lg font-semibold mb-4">
                { t('CUSTOM-FIELDS.custom_type') }
            </h1>
            <DynamicForm errors={ errors } control={ control } schema={ typeSchema }/>

            { watch("type") === 'regex' && (
                <>
                    <h1 className="text-lg font-semibold mb-4 mt-6">
                        { t('REGEX.regex_settings') }
                    </h1>

                    <div className='w-1/3'>
                        <DynamicForm errors={ errors } control={ control } schema={ regexDetailsSchema }/>
                    </div>

                    <h1 className="text-lg font-semibold mb-4 mt-6">
                        { t('REGEX.regex_settings_content') }
                    </h1>
                    <div className='w-1/3'>
                        <DynamicForm errors={ errors } control={ control } schema={ regexContentSchema }/>
                    </div>

                    <h1 className="text-lg font-semibold mb-4 mt-6">
                        { t('REGEX.regex_cleaning') }
                    </h1>
                    <div className='w-1/3'>
                        <DynamicForm errors={ errors } control={ control } schema={ regexCleanSchema }/>
                    </div>
                </>
            ) }

        </div>
    );
}