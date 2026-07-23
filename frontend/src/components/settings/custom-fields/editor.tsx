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
import DOMPurify from "dompurify";
import { Tooltip } from "react-tooltip";
import { ContextMenu } from "primereact/contextmenu";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { CircleQuestionMark, EllipsisVertical, Plus, Trash } from "lucide-react";

import Input from "../../Input";
import { Button } from "../../Button";
import { Dropdown } from "../../Dropdown";
import { InputSwitch } from "../../InputSwitch";
import { showToast } from "../../ToastProvider";
import { DynamicForm } from "../../form/DynamicForm";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";
import { useCustomFields } from "../../../services/hooks/useCustomFields";

export function CustomFieldsEditor({ module }: { module: 'verifier' | 'splitter' }) {
    const { get, post, put } = axiosApiCall();
    const { customFieldId } = useParams<{ customFieldId: any }>();

    const navigate = useNavigate();
    const { customFields } = useCustomFields(module);
    const cm = useRef({ current: null } as any);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
    const [activeAccordionIndexes, setActiveAccordionIndexes] = useState<number[]>([]);
    const [autoFocusOptionIndex, setAutoFocusOptionIndex] = useState<number | null>(null);

    const [customField, setCustomField] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [highlightedResult, setHighlightedResult] = useState('');
    const [isOptionsConditional, setIsOptionsConditional] = useState<boolean>(false);

    const menuModel: any = [
        {
            label: <span className='critical'>{ t('MAILCOLLECT.delete') }</span>,
            icon: <Trash className='mr-2' size={ 16 }/>,
            command: () => handleDeleteOption()
        }
    ];

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
        { id: 'textarea', label: t('CUSTOM-FIELDS.type_textarea'), 'logo': 'textarea' }
    ];

    if (module === 'splitter') {
        typesList.push({ id: 'checkbox', label: t('CUSTOM-FIELDS.type_checkbox'), 'logo': 'checkbox' });
    } else {
        typesList.push({ id: 'regex', label: t('CUSTOM-FIELDS.type_regex'), 'logo': 'regex' });
    }

    const baseShape = {
        label: z.string().min(3).describe(JSON.stringify({
            component: "input",
            type: "text",
            required: true,
            label: t("GLOBAL.label")
        })),
        label_short: z.string().min(1).optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            disabled: !!customFieldId,
            required: true,
            label: t("ROLES.label_short")
        }))
    };
    let detailsSchema: any = {};
    if (module === 'verifier') {
        detailsSchema = z.object({
            ...baseShape
        });
    } else if (module === 'splitter') {
        detailsSchema = z.object({
            ...baseShape,
            metadata_key: z.string().nullable().optional().describe(JSON.stringify({
                component: "dropdown",
                editable: true,
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

    const regexDetailsSchema: any = z.object({
        format: z.string().nullable().describe(JSON.stringify({
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
    const regexContentSchema: any = z.object({
        content: z.string().optional().describe(JSON.stringify({
            component: "input",
            bgColor: "bg-(--color-primary)/15",
            textColor: "color-primary",
            textWeight: '600',
            label: t("REGEX.content")
        })),
    });
    const regexRemoveKeywordSchema: any = z.object({
        remove_keyword: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("REGEX.remove_keyword")
        }))
    });
    const regexCleanSchema: any = z.object({
        remove_keyword_value: z.string().optional().describe(JSON.stringify({
            component: "input",
            bgColor: "bg-(--text-error)/15",
            textColor: "text-error",
            textWeight: '600',
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
    const regexTestSchema: any = z.object({
        test: z.string().optional().describe(JSON.stringify({
            component: "input",
            label: t("REGEX.test_value")
        }))
    });
    const regexSchema: any = regexDetailsSchema.extend(regexContentSchema.shape).
        extend(regexCleanSchema.shape).
        extend(regexRemoveKeywordSchema.shape).
        extend(regexTestSchema.shape);

    const [selectOptions, setSelectOptions] = useState<{
        id: string;
        label: string;
        conditional_custom_field: any;
        conditional_custom_value: string;
    }[]>([]);

    const duplicateOptionLabelShortIndexes = useMemo(() => {
        const normalizedIds = new Map<string, number[]>();

        selectOptions.forEach((option, index) => {
            const normalizedId = option.id?.trim().toLowerCase();
            if (!normalizedId) return;

            const indexes = normalizedIds.get(normalizedId) || [];
            indexes.push(index);
            normalizedIds.set(normalizedId, indexes);
        });

        const duplicates = new Set<number>();
        normalizedIds.forEach((indexes) => {
            if (indexes.length > 1) {
                indexes.forEach((index) => duplicates.add(index));
            }
        });

        return duplicates;
    }, [selectOptions]);

    const { control, watch, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(detailsSchema.extend(typeSchema.shape).extend(regexSchema.shape)),
        mode: "onChange",
        defaultValues: {
            metadata_key: "",
            format: "",
            remove_keyword_value: ""
        }
    });
    const watchTest = watch("test");
    const watchType = watch("type");
    const watchLabel = watch("label");
    const watchLabelShort = watch("label_short");

    const hasDuplicateOptionLabelShort =
        (watchType === 'select' || watchType === 'checkbox') && duplicateOptionLabelShortIndexes.size > 0;

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

        if (customField.settings.conditional) {
            setIsOptionsConditional(customField.settings.conditional);
        }

        if (customField.settings.options && Array.isArray(customField.settings.options)) {
            setSelectOptions(customField.settings.options);
        }
    }, [customField]);

    // Fill label_short with label value
    useEffect(() => {
        if (!watchLabel || customFieldId) return;

        const newLabelShort = watchLabel
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w\-]+/g, '');
        setValue("label_short", newLabelShort);
    }, [watchLabel]);

    // Remove space in label_short
    useEffect(() => {
        if (!watchLabelShort) return;

        const newLabelShort = watchLabelShort.replace(/\s+/g, '');
        if (newLabelShort !== watchLabelShort) {
            setValue("label_short", newLabelShort);
        }
    }, [watchLabelShort]);

    useEffect(() => {
        if (autoFocusOptionIndex === null) return;
        if (!activeAccordionIndexes.includes(autoFocusOptionIndex)) return;

        const timeoutId = window.setTimeout(() => {
            setAutoFocusOptionIndex(null);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [autoFocusOptionIndex, activeAccordionIndexes, selectOptions.length]);

    // Highlight regex matches in test zone
    useEffect(() => {
        if (!watchTest) return;

        const contentRegexValue = watch("content");
        const removeKeywordValue = watch("remove_keyword_value");

        if (!contentRegexValue) return;

        let contentRegex: RegExp;
        try {
            contentRegex = new RegExp(contentRegexValue, 'g');
        } catch (error) {
            console.error('Invalid regex pattern :', error);
            setHighlightedResult(`<span class='text-(--text-error)'>${ t('REGEX.invalid_regex') }</span>`);
            return;
        }

        const removeRegex = removeKeywordValue
            ? new RegExp(removeKeywordValue, 'g')
            : null;

        let html = '';

        const matches = [...watchTest.matchAll(contentRegex)];

        matches.forEach(match => {
            const fullMatch = match[0];

            let label = '';
            let value = fullMatch;

            if (removeRegex) {
                const keywordMatch = fullMatch.match(removeRegex);
                if (keywordMatch) {
                    label = keywordMatch[0];
                    value = fullMatch.replace(removeRegex, '');
                }
            }

            if (label) {
                html += `
                    <span class='bg-(--bg-error) text-(--text-error) font-semibold px-2 py-1 rounded-md'>
                        ${ label }
                    </span>
                `;
            }

            if (value) {
                html += `
                   <span class='bg-(--color-primary)/15 text-(--color-primary) font-semibold px-2 py-1 rounded-md'>
                        ${ value }
                   </span>
                `;
            }
        });

        setHighlightedResult(html);

    }, [watchTest, watch("content"), watch("remove_keyword_value")]);

    const getPayload = (data: any) => {
        if (hasDuplicateOptionLabelShort) return;
        if (errors && Object.keys(errors).length > 0) return;

        const payload = {
            ...data,
            module: module,
            id: customFieldId,
            options: selectOptions,
            conditional: isOptionsConditional
        };

        if (data.type === 'regex') {
            payload.regex = {
                test: data.test,
                format: data.format,
                content: data.content,
                char_min: data.char_min,
                remove_keyword: data.remove_keyword,
                remove_keyword_value: data.remove_keyword_value,
                remove_special_char: data.remove_special_char,
                remove_spaces: data.remove_spaces
            };
        }

        return payload;
    }

    const handleUpdate = async (data: any) => {
        const payload = getPayload(data);

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

    const handleCreate = async (data: any) => {
        const payload = getPayload(data);

        setLoading(true);
        try {
            await post(`/customFields/add`, payload);
            showToast(t('CUSTOM-FIELDS.create_success'), 'success');
            navigate(`/settings/${ module }/custom-fields`);
        } catch (error) {
            console.error('Error updating custom field :', error);
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteOption = async () => {
        if (selectedOptionIndex === null) return;

        const optionToDelete = selectOptions[selectedOptionIndex];
        if (!optionToDelete) return;
        const newOptions = selectOptions.filter((_, index) => index !== selectedOptionIndex);
        setSelectOptions(newOptions);
        setActiveAccordionIndexes((previousIndexes) =>
            previousIndexes
                .filter((index) => index !== selectedOptionIndex)
                .map((index) => (index > selectedOptionIndex ? index - 1 : index))
        );
        setSelectedOptionIndex(null);
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className='p-6 pb-0 flex flex-col gap-4'>
                <h1 className="text-lg font-semibold">
                    { t('ROLES.details') }
                </h1>

                <div className='w-1/3'>
                    <DynamicForm errors={ errors } control={ control } schema={ detailsSchema }/>
                </div>

                <h1 className="text-lg font-semibold">
                    { t('CUSTOM-FIELDS.custom_type') }
                </h1>
                <DynamicForm errors={ errors } control={ control } schema={ typeSchema }/>
            </div>

            { watchType === 'regex' && (
                <>
                    <div className='px-8 pb-8'>
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
                                        id={ field.name }
                                        checked={ !!field.value }
                                        onChange={ (value) => field.onChange(value) }
                                        label={ t("REGEX.remove_keyword") }
                                    />

                                    <span className={ `absolute cursor-pointer z-10 -right-5 top-1.5
                                                   text-(--text-secondary)` }>
                                    <CircleQuestionMark data-tooltip-id="tooltip-1" size={ 16 }/>

                                    <Tooltip id="tooltip-1" place="right">
                                        <div className="flex flex-col gap-2 max-w-xs">
                                            <img src='/imgs/regex_hint.svg' className='rounded-md' alt='Hint'/>
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
                    </div>
                    <div className='px-8 py-4 bg-(--bg-secondary) border-t border-b border-(--border-secondary)
                                    w-full'>
                        <h1 className="text-lg font-semibold mb-4">
                            { t('REGEX.test-zone') }
                        </h1>

                        <div className='w-1/3'>
                            <DynamicForm errors={ errors } control={ control } schema={ regexTestSchema }/>
                        </div>

                        { highlightedResult &&
                            (
                                <>
                                    <h1 className="text-lg font-semibold mt-2">
                                        { t('REGEX.result') }
                                    </h1>

                                    { watchTest && (
                                        <div className='mt-2 p-4 rounded-md w-fit'>
                                            <div dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(highlightedResult) } }/>
                                        </div>
                                    ) }

                                </>
                            ) }
                    </div>
                </>
            ) }
            {/* watch need to match select or checkbox */ }
            { (watchType === 'select' || watchType === 'checkbox') && (
                <div className='px-8'>
                    <div className='flex justify-between items-center'>
                        <h1 className="text-lg font-semibold mb-4 mt-6">
                            { t('CUSTOM-FIELDS.choices') }
                        </h1>
                        { watchType === 'select' && (
                            <div className="flex items-center gap-2">
                                <InputSwitch
                                    id='conditional_custom_field'
                                    checked={ isOptionsConditional }
                                    onChange={ (value) => {
                                        setIsOptionsConditional(value);
                                    } }
                                />
                                <label htmlFor='conditional_custom_field'
                                       className="flex items-center gap-4 cursor-pointer select-none
                                                          text-(--text-secondary)">
                                    { t('CUSTOM-FIELDS.conditional_option') }
                                </label>
                            </div>
                        ) }
                    </div>

                    <Accordion
                        multiple
                        activeIndex={ activeAccordionIndexes }
                        onTabChange={ (e) => {
                            if (Array.isArray(e.index)) {
                                setActiveAccordionIndexes(e.index);
                            } else if (typeof e.index === 'number') {
                                setActiveAccordionIndexes([e.index]);
                            } else {
                                setActiveAccordionIndexes([]);
                            }
                        } }
                        className='max-h-120 overflow-y-auto border-(--border-secondary)'
                    >
                        { selectOptions.map((option, index) => (
                            <AccordionTab key={ index } header={
                                <span className='flex items-center gap-2'>
                                    <span>
                                        { option.label }
                                    </span>
                                    <span className='flex ml-auto'>
                                        <EllipsisVertical onClick={ (e) => {
                                            setSelectedOptionIndex(index);
                                            e.preventDefault();
                                            e.stopPropagation();
                                            cm.current?.show(e);
                                        } }/>
                                        { menuModel && (
                                            <ContextMenu model={ menuModel } className="w-auto!" ref={ cm }/>
                                        ) }
                                    </span>
                                </span>
                            }>
                                <div className='flex flex-col gap-4 mb-4 p-6 pb-0'>
                                    <div className='w-1/3 flex flex-col gap-4'>
                                        <Input type="text"
                                               label={ t('GLOBAL.label') } value={ option.label }
                                               autoFocus={ autoFocusOptionIndex === index }
                                               onChange={ (e) => {
                                                   const newOptions = [...selectOptions];
                                                   newOptions[index].label = e.target.value;
                                                   setSelectOptions(newOptions);
                                               } }
                                        />
                                        <Input type="text"
                                               label={ t('ROLES.label_short') } value={ option.id }
                                               error={ duplicateOptionLabelShortIndexes.has(index)
                                                   ? t('CUSTOM-FIELDS.choice_label_short_duplicate')
                                                   : undefined }
                                               onChange={ (e) => {
                                                   const newOptions = [...selectOptions];
                                                   newOptions[index].id = e.target.value;
                                                   setSelectOptions(newOptions);
                                               } }
                                        />
                                    </div>

                                    { isOptionsConditional && (
                                        <div className='flex gap-4 w-1/2'>
                                            <Dropdown
                                                id={ `conditional_custom_field` }
                                                filter={ true }
                                                value={ option.conditional_custom_field }
                                                label={ t('CUSTOM-FIELDS.conditional_custom_field') }
                                                onChange={ (e) => {
                                                    const newOptions = [...selectOptions];
                                                    newOptions[index].conditional_custom_field = e.value;
                                                    setSelectOptions(newOptions);
                                                } }
                                                options={ customFields.filter((cf: any) => cf.id !== customFieldId).map((cf: any) => ({
                                                    label: cf.label,
                                                    value: cf.id
                                                })) }
                                            />

                                            <Input
                                                type="text"
                                                label={ t('CUSTOM-FIELDS.conditional_value') }
                                                value={ option.conditional_custom_value }
                                                onChange={ (e) => {
                                                    const newOptions = [...selectOptions];
                                                    newOptions[index].conditional_custom_value = e.target.value;
                                                    setSelectOptions(newOptions);
                                                } }
                                            />
                                        </div>
                                    ) }
                                </div>
                            </AccordionTab>
                        )) }
                    </Accordion>

                    <div className='mt-4 flex justify-end'>
                        <Button size='sm' variant="bg_white" onClick={ () => {
                            const newOptionIndex = selectOptions.length;
                            setSelectOptions([
                                ...selectOptions,
                                {
                                    id: '',
                                    label: '',
                                    conditional_custom_field: undefined,
                                    conditional_custom_value: ''
                                }
                            ]);
                            setAutoFocusOptionIndex(newOptionIndex);
                            setActiveAccordionIndexes((previousIndexes) =>
                                previousIndexes.includes(newOptionIndex)
                                    ? previousIndexes
                                    : [...previousIndexes, newOptionIndex]
                            );
                        } }>
                            <Plus size={ 16 }/>
                            { t('CUSTOM-FIELDS.new_choice') }
                        </Button>
                    </div>
                </div>
            ) }

            <div className="p-6 w-fit">
                { customFieldId ? (
                    <Button onClick={ handleSubmit(handleUpdate) }
                            disabled={ !watchType || !watchLabel || !watchLabelShort || loading || Object.keys(errors).length > 0 || hasDuplicateOptionLabelShort }>
                        { loading ? t('GLOBAL.updating') : t('CUSTOM-FIELDS.update_custom_fields') }
                    </Button>
                ) : (
                    <Button onClick={ handleSubmit(handleCreate) }
                            disabled={ !watchType || !watchLabel || !watchLabelShort || loading || Object.keys(errors).length > 0 || hasDuplicateOptionLabelShort }>
                        { loading ? t('GLOBAL.creating') : t('CUSTOM-FIELDS.create_custom_fields') }
                    </Button>
                ) }
            </div>
        </div>
    );
}