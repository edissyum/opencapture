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

import { z } from "zod";
import { t } from "i18next";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { Stepper } from "primereact/stepper";
import { Editor } from "@monaco-editor/react";
import { Scroller, Tabs } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { StepperPanel } from "primereact/stepperpanel";
import { useNavigate, useParams } from "react-router-dom";

import { executeAuthFunction, executeMEMFunction, getTestConnectionMapping } from "./functions";
import { getCompressTypeOptions, getSystemFieldsOptionsSplitter, getSystemFieldsOptionsVerifier } from "./helpers";

import Hint from "../../Hint";
import Input from "../../Input";
import { Button } from "../../Button";
import { Select } from "../../Select.tsx";
import { Loader } from "../../loader/Loader";
import { InputSwitch } from "../../InputSwitch";
import { showToast } from "../../ToastProvider";
import { DynamicForm } from "../../form/DynamicForm";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";
import { copyToClipboard } from "../../../services/hooks/copyToClipboard";
import { useCustomFields } from "../../../services/hooks/useCustomFields";

export function OutputEditor({ module }: { module: string }) {
    const { get, post, put } = axiosApiCall();
    const navigate = useNavigate();
    const { outputId } = useParams<{ outputId: any }>();

    const [loading, setLoading] = useState(true);
    const [loadingStep, setLoadingStep] = useState(false);

    const stepperRef = useRef<any>(null);
    const [stepperIndex, setStepperIndex] = useState(0);

    const [outputTypes, setOutputTypes] = useState([]);
    const [outputType, setOutputType] = useState<any>({});
    const [output, setOutput] = useState<any>({
        output_type_id: '',
        output_label: '',
        compress_type: '',
        ocrise: false,
        data: {
            options: {
                auth: [],
                parameters: []
            }
        }
    });

    const [codeType, setCodeType] = useState('json');
    const [, setAllowedPath] = useState('');

    const { customFields } = useCustomFields(module);

    let availableSystemFields;

    if (module === 'verifier') {
        availableSystemFields = getSystemFieldsOptionsVerifier();
    } else {
        availableSystemFields = getSystemFieldsOptionsSplitter();
    }

    const detailSchema = z.object({
        output_type_id: z.string().min(3).describe(JSON.stringify({
            required: true,
            component: "select",
            disabled: outputId,
            label: t("OUTPUTS.type"),
            options: outputTypes.map((o: any) => ({ label: o.output_type_label, value: o.output_type_id }))
        })),
        output_label: z.string().min(3).describe(JSON.stringify({
            required: true,
            component: "input",
            label: t("GLOBAL.label")
        })),
        compress_type: z.string().optional().describe(JSON.stringify({
            component: "select",
            show: ['export_pdf', 'export_cmis', 'export_openads'].includes(outputType?.output_type_id),
            label: t("OUTPUTS.compress_type"),
            options: getCompressTypeOptions().map((o: any) => ({ label: o.label, value: o.id }))
        })),
        ocrise: z.boolean().describe(JSON.stringify({
            className: "flex items-center col-span-2",
            component: "input_switch",
            show: ['export_pdf', 'export_cmis', 'export_openads'].includes(outputType?.output_type_id),
            label: t("OUTPUTS.ocrise")
        }))
    });

    const {
        watch: watchDetails,
        control: detailsControl,
        setValue: detailsSetValue,
        formState: { errors: detailsErrors }
    } = useForm({
        resolver: zodResolver(detailSchema),
        defaultValues: {
            output_label: '',
            output_type_id: '',
            compress_type: '',
            ocrise: false
        },
        mode: "onChange"
    });

    const ocrise = watchDetails('ocrise');
    const output_label = watchDetails('output_label');
    const output_type_id = watchDetails('output_type_id');
    const compress_type = watchDetails('compress_type');

    // Fetch output details
    useEffect(() => {
        if (!outputId || outputTypes.length == 0) return;

        const fetchOutputDetails = async () => {
            try {
                const response = await get(`/outputs/${ module }/getById/${ outputId }`);
                if (response) {
                    Object.keys(response).forEach((key: any) => {
                        detailsSetValue(key, response[key]);
                    });
                }
                setOutput(response);

                const newOutputType: any = outputTypes.find((o: any) => o.output_type_id === response.output_type_id);
                setOutputType(newOutputType);

                if (!newOutputType?.data?.options?.auth || newOutputType?.data?.options.auth.length === 0) {
                    setStepperIndex(1);
                }
            } catch (error) {
                console.error("Error fetching output details:", error);
            }
        };

        fetchOutputDetails().then();
    }, [outputTypes]);

    // handle output type change to check input types
    useEffect(() => {
        if (outputType && outputType.data && outputType.data.options && outputType.data.options.parameters) {
            if (outputType.data.options.links?.length > 0 &&
                (!output.data.options.links || output.data.options.links.length === 0)) {
                const newLinks = outputType.data.options.links.map((option: any) => {
                    return {
                        id: option.id,
                        type: option.type,
                        hint: option.hint,
                        label: option.label,
                        required: option.required,
                        placeholder: option.placeholder,
                        webservice: option.webservice ?? ''
                    }
                });

                setOutput((prev: any) => ({
                    ...prev,
                    data: {
                        ...prev.data,
                        options: {
                            ...prev.data.options,
                            links: newLinks
                        }
                    }
                }));
            }

            if (outputType.data.options.parameters.length > 0 &&
                (!output.data.options.parameters || output.data.options.parameters.length === 0)) {
                const newParameters = outputType.data.options.parameters.map((option: any) => {
                    return {
                        id: option.id,
                        type: option.type,
                        label: option.label,
                        required: option.required,
                        placeholder: option.placeholder,
                        webservice: option.webservice ?? ''
                    }
                });

                setOutput((prev: any) => ({
                    ...prev,
                    data: {
                        ...prev.data,
                        options: {
                            ...prev.data.options,
                            parameters: newParameters
                        }
                    }
                }));
            }

            outputType.data.options.parameters.forEach((option: any) => {
                if (option.type === 'textarea') {
                    const value = output?.data?.options?.parameters?.find((o: any) => o.id === option.id)?.value || '';
                    if (value) {
                        try {
                            JSON.parse(value);
                            setCodeType('json');
                        } catch (e) {
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(value, "application/xml");
                            if (xmlDoc.getElementsByTagName("parsererror").length === 0) {
                                setCodeType('xml');
                            }
                        }
                    } else {
                        if (outputType.output_type_id === 'export_xml') {
                            setCodeType('xml');
                        }
                    }
                }
            });
        }
    }, [outputType]);

    // Update output type when changed
    useEffect(() => {
        const outputTypeId = watchDetails('output_type_id');
        const newOutputType: any = outputTypes.find((o: any) => o.output_type_id === outputTypeId);

        if (newOutputType) {
            setOutputType(newOutputType);
            if (newOutputType.data?.options?.auth?.length > 0) {
                setStepperIndex(0);
            } else {
                setStepperIndex(1);
            }
        }
    }, [watchDetails('output_type_id')]);

    // Fetch output types
    // Fetch allowed path for output if needed
    useEffect(() => {
        const fetchAllowedPath = async () => {
            try {
                const response = await get(`/outputs/${ module }/allowedPath`);
                if (response && response.allowedPath) {
                    setAllowedPath(response.allowedPath);
                }
            } catch (error) {
                console.error("Error fetching allowed path:", error);
            }
        }

        const fetchOutputTypes = async () => {
            try {
                const response = await get(`/outputs/${ module }/getOutputsTypes`);
                if (response && response.outputs_types) {
                    setOutputTypes(response.outputs_types);
                }
            } catch (error) {
                console.error("Error fetching output types:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllowedPath().then();
        fetchOutputTypes().then();
    }, []);

    const handleAuthStep: any = async (data: FormData) => {
        if (data && Object.keys(detailsErrors).length > 0) {
            return;
        }

        setLoadingStep(true);

        const authFunctionName: any = getTestConnectionMapping().find((m: any) => m.id === outputType.output_type_id)?.function;
        let authOptions: any = {};
        output?.data?.options?.auth.forEach((option: any) => {
            authOptions[option.id] = output?.data?.options?.auth?.find((o: any) => o.id === option.id)?.value || '';
        });

        const res = await executeAuthFunction(authFunctionName, authOptions, { post });

        let errorInWs = false;

        if (res && res.success) {
            if (outputType.output_type_id === 'export_mem') {
                for (const data of Object.keys(output.data.options)) {
                    for (const option of output.data.options[data]) {
                        if (option.webservice) {
                            const res = await executeMEMFunction(option.webservice, authOptions, { post });

                            if (res && res.success && res.data) {
                                setOutput((prev: any) => {
                                    const newParameters = prev.data.options[data].map((o: any) => {
                                        if (o.id === option.id) {
                                            return { ...o, values: res.data };
                                        }
                                        return o;
                                    });

                                    return {
                                        ...prev,
                                        data: {
                                            ...prev.data,
                                            options: {
                                                ...prev.data.options,
                                                [data]: newParameters
                                            }
                                        }
                                    };
                                });
                            } else {
                                errorInWs = true;
                            }
                        }
                    }
                }
            }

            if (!errorInWs) {
                stepperRef.current?.nextCallback();
                showToast(t(res.message), "success");
            }
        } else {
            showToast(t(res.message), "error");
        }

        setLoadingStep(false);
    }

    const handleNextStep = () => {
        stepperRef.current?.nextCallback();
    }

    const handleAuthChange = (e: any, option: any) => {
        const value = e.target.value;

        setOutput((prev: any) => {
            const optionExist = prev.data.options.auth.find((o: any) => o.id === option.id);

            if (!optionExist) {
                option.value = value;
                prev.data.options.auth.push(option);
            }

            let newAuthOptions = prev.data.options.auth.map((o: any) => {
                if (o.id === option.id) {
                    return { ...o, value };
                }
                return o;
            });

            return {
                ...prev,
                data: {
                    ...prev.data,
                    options: {
                        ...prev.data.options,
                        auth: newAuthOptions
                    }
                }
            };
        });
    }

    const handleSpecificLinksChange = (e: any, option: any, data: any) => {
        const value = e.target.value;
        setOutput((prev: any) => {
            // If the option already exists, update it. Otherwise, add it to the array
            const newSpecificOptions = prev.data.options[data].map((o: any) => {
                if (o.id === option.id) {
                    return { ...o, value };
                }
                return o;
            });

            // If the option was not found in the existing options, add it
            if (!prev.data.options[data].find((o: any) => o.id === option.id)) {
                newSpecificOptions.push({ id: option.id, value });
            }

            return {
                ...prev,
                data: {
                    ...prev.data,
                    options: {
                        ...prev.data.options,
                        [data]: newSpecificOptions
                    }
                }
            };
        });
    }

    const handlePreviousStep = () => stepperRef.current?.prevCallback();

    const handleSubmit = async () => {
        if (Object.keys(detailsErrors).length > 0 || !output_label || !output_type_id) {
            showToast(t("OUTPUTS.fix_details_errors"), 'error');
            return;
        }

        setLoadingStep(true);

        const tmpData = structuredClone(output.data);
        if (output.output_type_id === 'export_mem') {
            tmpData.options.parameters = tmpData.options.parameters.map((param: any) => {
                delete param.values;
                return param;
            });
        }

        const payload = {
            module: module,
            output_label: output_label,
            output_type_id: output_type_id,
            compress_type: compress_type,
            ocrise: ocrise,
            data: tmpData
        };

        try {
            if (outputId) {
                await put(`/outputs/${ module }/update/${ outputId }`, payload);
                showToast(t('OUTPUTS.update_success'), "success");
            } else {
                await post(`/outputs/${ module }/create`, payload);
                showToast(t('OUTPUTS.create_success'), "success");
                navigate(`/settings/${ module }/outputs`);
            }
        } catch (error) {
            console.error("Error saving output:", error);
        } finally {
            setLoadingStep(false);
        }
    }

    if (loading) return <Loader/>;

    return (
        <div className="h-full w-full overflow-y-auto flex">
            <div className='w-full h-full overflow-y-auto'>
                <div className='p-6 flex flex-col gap-4'>
                    <h1 className="text-lg font-semibold">
                        { t('OUTPUTS.details') }
                    </h1>

                    <div className='w-full'>
                        <DynamicForm errors={ detailsErrors } control={ detailsControl } schema={ detailSchema }
                                     grid={ 2 }/>
                    </div>
                </div>

                { outputType && Object.keys(outputType).length > 0 && (
                    <Stepper ref={ stepperRef } linear activeStep={ stepperIndex }
                             onChangeStep={ (e: any) => setStepperIndex(e.index) }>
                        <StepperPanel header={ t("SMTP.authentication") }>
                            <div className='flex flex-col gap-4'>
                                <div className='flex gap-6 w-full'>
                                    { outputType?.data?.options.auth && outputType?.data?.options.auth.map((option: any) => (
                                        <div key={ option.id } className="w-full gap-2">
                                            <Input id={ option.id } type={ option.type } name={ option.id }
                                                   label={ option.label }
                                                   value={ output?.data?.options?.auth?.find((o: any) => o.id === option.id)?.value || '' }
                                                   onChange={ (e) => {
                                                       handleAuthChange(e, option)
                                                   } }/>
                                        </div>
                                    )) }
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={ handleAuthStep } className="ml-auto px-8"
                                            disabled={ loadingStep }>
                                        { loadingStep ? t("OUTPUTS.testing_connection") : t("OUTPUTS.test_connection") }
                                    </Button>
                                </div>
                            </div>
                        </StepperPanel>

                        <StepperPanel header={ t("OUTPUTS.specific") }>
                            <div className='flex flex-col gap-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                    { outputType?.data?.options.parameters.map((option: any) => (
                                        <div key={ option.id }
                                             className={ `w-full gap-2 ${ option.type === 'textarea' ? 'col-span-2' : '' }` }>
                                            { option.type === 'textarea' && (
                                                <>
                                                    { ['xml', 'json'].includes(codeType) && (
                                                        <Editor
                                                            className='border border-(--border-secondary) rounded-md p-2'
                                                            height={ outputType.output_type_id === 'export_mem' ? '15vh' : '50vh' }
                                                            defaultLanguage={ codeType }
                                                            defaultValue={ output?.data?.options?.parameters?.find((o: any) => o.id === option.id)?.value || '' }
                                                            options={ {
                                                                stickyScroll: {
                                                                    enabled: false
                                                                },
                                                                contextmenu: true
                                                            } }
                                                            onChange={ (value) => {
                                                                handleSpecificLinksChange({ target: { value: value } }, option, 'parameters')
                                                            } }
                                                            theme={ document.documentElement.classList.contains('dark') ? 'vs-dark' : '' }
                                                        />
                                                    ) }
                                                </>
                                            ) }
                                            { option.type === 'text' && option.webservice && (
                                                <Select
                                                    id={ option.id } label={ option.label } 
                                                    options={ output?.data?.options?.parameters?.find((o: any) => o.id === option.id)?.values || [] }
                                                    value={ output?.data?.options?.parameters?.find((o: any) => o.id === option.id)?.value || '' }
                                                    onChange={ (value) => {
                                                        handleSpecificLinksChange({ target: { value: value } }, option, 'parameters')
                                                    } }
                                                />
                                            ) }
                                            { option.type === 'text' && !option.webservice && (
                                                <Input
                                                    id={ option.id } type={ option.type } name={ option.id }
                                                    label={ option.label } hint={ option.hint }
                                                    value={ output?.data?.options?.parameters?.find((o: any) => o.id === option.id)?.value || '' }
                                                    onChange={ (e) => {
                                                        handleSpecificLinksChange(e, option, 'parameters')
                                                    } }/>
                                            ) }
                                        </div>
                                    )) }
                                </div>
                                <div className='flex justify-between'>
                                    <Button onClick={ handlePreviousStep } variant="no_bg"
                                            disabled={ outputType?.data?.options?.auth?.length === 0 }
                                            className="px-0! text-(--color-primary) border-transparent hover:text-(--text-primary)">
                                        <ArrowLeft/> { t("MAILCOLLECT.previous") }
                                    </Button>

                                    <Button
                                        onClick={ outputType.output_type_id === 'export_mem' ? handleNextStep : handleSubmit }
                                        className="px-8" disabled={ loading || loadingStep }>
                                        { outputType.output_type_id === 'export_mem' ? (
                                            t("GLOBAL.next")
                                        ) : (
                                            <>
                                                { outputId ? (
                                                    <>
                                                        { loadingStep ? t("OUTPUTS.updating") : t("OUTPUTS.update") }
                                                    </>
                                                ) : (
                                                    <>
                                                        { loadingStep ? t("OUTPUTS.creating") : t("OUTPUTS.create") }
                                                    </>
                                                ) }
                                            </>
                                        ) }
                                    </Button>
                                </div>
                            </div>
                        </StepperPanel>

                        { outputType.output_type_id === 'export_mem' && (
                            <StepperPanel header={ t("OUTPUTS.links") }>
                                <Hint>
                                    { t('OUTPUTS.links_hint') }
                                </Hint>
                                <div className='flex flex-col gap-4'>
                                    <div className='grid grid-cols-2 gap-4'>
                                        { outputType?.data?.options.links.map((option: any) => (
                                            <div key={ option.id }
                                                 className={ `w-full gap-2 ${ option.type === 'boolean' ? 'col-span-2' : '' }` }>
                                                { option.type === 'text' && option.webservice && (
                                                    <Select
                                                        id={ option.id } label={ option.label } 
                                                        options={ output?.data?.options?.links?.find((o: any) => o.id === option.id)?.values || [] }
                                                        value={ output?.data?.options?.links?.find((o: any) => o.id === option.id)?.value || '' }
                                                        onChange={ (value) => {
                                                            handleSpecificLinksChange({ target: { value: value } }, option, 'links')
                                                        } }
                                                    />
                                                ) }
                                                { option.type === 'boolean' && (
                                                    <div className='flex items-center gap-2'>
                                                        <InputSwitch
                                                            id={ option.id }
                                                            label={ option.label }
                                                            checked={ output?.data?.options?.links?.find((o: any) => o.id === option.id)?.value || false }
                                                            onChange={ (value) => {
                                                                handleSpecificLinksChange({ target: { value } }, option, 'links')
                                                            } }/>
                                                    </div>
                                                ) }
                                                { option.type === 'text' && !option.webservice && (
                                                    <Input id={ option.id } type={ option.type } name={ option.id }
                                                           label={ option.label } hint={ option.hint }
                                                           value={ output?.data?.options?.links?.find((o: any) => o.id === option.id)?.value || '' }
                                                           onChange={ (e) => {
                                                               handleSpecificLinksChange(e, option, 'links')
                                                           } }/>
                                                ) }
                                            </div>
                                        )) }
                                    </div>
                                    <div className='flex justify-between'>
                                        <Button onClick={ handlePreviousStep } variant="no_bg"
                                                disabled={ outputType?.data?.options.auth.length === 0 }
                                                className="px-0! text-(--color-primary) border-transparent hover:text-(--text-primary)">
                                            <ArrowLeft/> { t("MAILCOLLECT.previous") }
                                        </Button>

                                        <Button onClick={ handleSubmit } disabled={ loading || loadingStep }>
                                            <>
                                                { outputId ? (
                                                    <>
                                                        { loadingStep ? t("OUTPUTS.updating") : t("OUTPUTS.update") }
                                                    </>
                                                ) : (
                                                    <>
                                                        { loadingStep ? t("OUTPUTS.creating") : t("OUTPUTS.create") }
                                                    </>
                                                ) }
                                            </>
                                        </Button>
                                    </div>
                                </div>
                            </StepperPanel>
                        ) }
                    </Stepper>
                ) }
            </div>

            { stepperIndex !== 0 && (
                <div className="shrink-0 w-[20rem] h-full flex flex-col border-l border-(--border-secondary)">
                    <Tabs defaultValue='available_fields'>
                        <Tabs.List>
                            <Scroller>
                                <Tabs.Tab key={ 'available_fields' } value={ 'available_fields' }>
                                    { t("VERIFIER.system_fields") }
                                </Tabs.Tab>
                                { customFields.length > 0 && (
                                    <Tabs.Tab key={ 'custom_fields' } value={ 'custom_fields' }>
                                        { t("VERIFIER.custom_fields") }
                                    </Tabs.Tab>
                                ) }
                            </Scroller>
                        </Tabs.List>
                        <Tabs.Panel key={ 'available_fields' } value={ 'available_fields' }>
                            <div className="p-4 flex flex-col gap-2">
                                { availableSystemFields.map((option: any) => (
                                    <div key={ option.id } data-tooltip-id='tooltip'
                                         data-tooltip-content={ t("OUTPUTS.copy_to_clipboard") }
                                         onClick={ async () => {
                                             await copyToClipboard(option.id);
                                         } }
                                         className='flex flex-col border border-(--border-secondary) rounded-lg
                                                    transition-colors bg-(--bg-primary) px-4 py-2 w-full cursor-pointer hover:bg-(--bg-secondary)'>
                                        <div className='text-(--text-primary) font-semibold'>
                                            { option.label }
                                        </div>
                                        <div className='text-(--text-secondary)'>
                                            { option.id }
                                        </div>
                                    </div>
                                )) }
                            </div>
                        </Tabs.Panel>
                        { customFields.length > 0 && (
                            <Tabs.Panel key={ 'custom_fields' } value={ 'custom_fields' }>
                                <div className="p-4 flex flex-col gap-2">
                                    { customFields.map((field: any) => (
                                        <div key={ field.id } data-tooltip-id='tooltip'
                                             data-tooltip-content={ t("OUTPUTS.copy_to_clipboard") }
                                             onClick={ async () => {
                                                 await copyToClipboard(field.label_short);
                                             } }
                                             className='flex flex-col border border-(--border-secondary) rounded-lg
                                                        transition-colors bg-(--bg-primary) px-4 py-2 w-full cursor-pointer hover:bg-(--bg-secondary)'>
                                            <div className='text-(--text-primary) font-semibold'>
                                                { field.label }
                                            </div>
                                            <div className='text-(--text-secondary)'>
                                                { field.label_short }
                                            </div>
                                        </div>
                                    )) }
                                </div>
                            </Tabs.Panel>
                        ) }
                    </Tabs>
                </div>
            ) }
        </div>
    )
}