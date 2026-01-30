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
import { Tooltip } from "react-tooltip";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CircleQuestionMark } from "lucide-react";
import { InputSwitch } from "primereact/inputswitch";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../../Button";
import { showToast } from "../../ToastProvider";

import { DynamicForm } from "../../form/DynamicForm";
import { emptyToUndefined } from "../../../services/zod";
import { axiosApiCall } from "../../../services/hooks/axiosApiCall";

export function CustomFieldsEditor({ module }: { module: 'verifier' | 'splitter' }) {
    const { get, post, put } = axiosApiCall();
    const { customFieldId } = useParams<{ customFieldId: any }>();

    const [customField, setCustomField] = useState<any>({});
    const [loading, setLoading] = useState(false);

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
            bgColor: "color-primary",
            textColor: "color-primary",
            textWeight: 'font-semibold',
            label: t("REGEX.content")
        })),
    });
    const regexRemoveKeywordSchema = z.object({
        remove_keyword: z.boolean().nullable().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("REGEX.remove_keyword")
        }))
    });
    const regexCleanSchema = z.object({
        remove_keyword_value: emptyToUndefined(z.string()).optional().describe(JSON.stringify({
            component: "input",
            bgColor: "text-error",
            textColor: "text-error",
            textWeight: 'font-semibold',
            label: t("REGEX.remove_keyword_value")
        })),
        remove_special_char: z.boolean().nullable().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("REGEX.remove_special_char")
        })),
        remove_spaces: z.boolean().nullable().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("REGEX.remove_spaces")
        }))
    });
    const regexSchema = regexDetailsSchema.extend(regexContentSchema.shape).extend(regexCleanSchema.shape).extend(regexRemoveKeywordSchema.shape);

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

    const handleUpdate = async (data: any) => {
        if (errors && Object.keys(errors).length > 0) return;

        const payload = {
            ...data,
            id: customFieldId,
            module: module,
            options: data.options,
            conditional: data.conditional
        };

        if (data.type === 'regex') {
            payload.regex = {
                format: data.format,
                content: data.content,
                char_min: data.char_min,
                remove_keyword: data.remove_keyword,
                remove_keyword_value: data.remove_keyword_value,
                remove_special_char: data.remove_special_char,
                remove_spaces: data.remove_spaces
            }
        }

        setLoading(true);
        try {
            await put(`/customFields/update`, payload);
            showToast(t('CUSTOM-FIELDS.update_success'), 'success');
        } catch (error) {
            console.error('Error updating custom field :', error);
        } finally {
            setLoading(false);
        }
    }

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

                    <Controller
                        name="remove_keyword"
                        control={ control }
                        render={ ({ field }) => (
                            <div className="flex items-center gap-2 relative w-fit mb-2">
                                <InputSwitch
                                    inputId={ field.name }
                                    checked={ !!field.value }
                                    onChange={ e => field.onChange(e.value) }
                                />

                                <label htmlFor={ field.name } className="cursor-pointer">
                                    { t("REGEX.remove_keyword") }
                                </label>

                                <span className={ `absolute cursor-pointer z-10 -right-5 top-1.5
                                                   text-(--text-secondary)` }>
                                    <CircleQuestionMark data-tooltip-id="tooltip-1" size={ 16 }/>

                                    <Tooltip id="tooltip-1" place="right">
                                        <div className="flex flex-col gap-2 max-w-xs">
                                            <img src={ '/src/assets/imgs/regex_hint.svg' } className={ 'rounded-md' }
                                                 alt={ 'Hint' }/>
                                            <div className='px-2'>
                                                <p className='font-semibold mb-1'>{ t('REGEX.remove_keyword_title') }</p>
                                                <span>{ t('REGEX.remove_keyword_hint') }</span>
                                            </div>
                                        </div>
                                    </Tooltip>
                                </span>
                            </div>
                        ) }
                    />

                    <div className='w-1/3'>
                        <DynamicForm errors={ errors } control={ control } schema={ regexCleanSchema }/>
                    </div>
                </>
            ) }

            <div className="mt-6 w-fit">
                { customFieldId ? (
                    <Button onClick={ handleSubmit(handleUpdate) }
                            disabled={ loading || Object.keys(errors).length > 0 }>
                        { loading ? t('GLOBAL.updating') : t('CUSTOM-FIELDS.update_custom_fields') }
                    </Button>
                ) : (
                    <Button //onClick={ handleSubmit(handleCreate) }
                        disabled={ loading || Object.keys(errors).length > 0 }>
                        { loading ? t('GLOBAL.creating') : t('USERS.create_user') }
                    </Button>
                ) }
            </div>
        </div>
    );
}