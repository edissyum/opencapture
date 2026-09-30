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
import { useForm } from "react-hook-form";
import { Editor } from '@monaco-editor/react';
import { useNavigate, useParams } from "react-router-dom";

import { useEffect, useState } from "react";
import { ArrowLeft, Terminal } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Stepper as StepperMantine } from "@mantine/core";

import { toIdentifier } from "../../../services/strings";
import { useCustom } from "../../../services/custom/customContext";
import { AxiosApiCall } from "../../../services/hooks/AxiosApiCall";

import { Button } from "../../Button";
import { Loader } from "../../loader/Loader";
import { showToast } from "../../ToastProvider";
import { InputSwitch } from "../../InputSwitch";
import { DynamicForm } from "../../form/DynamicForm";

import {
    getConvertOptions,
    getRotationOptions,
    getSplitterMethods,
    getSystemFields,
    getTesseractOptions
} from "./helpers";

export function WorkflowEditor({ module }: { module: 'verifier' | 'splitter' }) {
    const custom = useCustom();
    const { get, post, put } = AxiosApiCall();
    const navigate = useNavigate();
    const { workflowId } = useParams<{ workflowId: any }>();

    const [loading, setLoading] = useState(true);
    const [loadingScript, setLoadingScript] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const [stepperIndex, setStepperIndex] = useState(0);

    const [forms, setForms] = useState([]);
    const [aiLLM, setAiLLM] = useState([]);
    const [outputs, setOutputs] = useState([]);
    const [aiModels, setAiModels] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [customFields, setCustomFields] = useState([]);
    const [splitterMethods, setSplitterMethods] = useState<any>([]);

    const [useInterface, setUseInterface] = useState(false);
    const [splitterMethodActive, setSplitterMethodActive] = useState('no_sep');

    const [inputScripting, setInputScripting] = useState(false);
    const [processScripting, setProcessScripting] = useState(false);

    const [inputScript, setInputScript] = useState('');
    const [processScript, setProcessScript] = useState('');

    const [allowScripting, setAllowScripting] = useState(false);

    // Fetch if scripting is allowed
    // Fetch forms for dropdown
    // Fetch AI LLMs for dropdown
    // Fetch outputs for dropdown
    // Fetch customers for dropdown
    // Fetch AI models for dropdown
    // Fetch custom fields for dropdown
    // Fetch splitter methods for dropdown
    useEffect(() => {
        const init = async () => {
            const fetchForms = async () => {
                try {
                    const response = await get(`/forms/${ module }/list`);
                    if (response && response.forms) {
                        setForms(response.forms);
                    }
                } catch (error) {
                    console.error('Error fetching forms :', error);
                }
            };

            const fetchAiLLMs = async () => {
                try {
                    const response = await get(`/ai/llm/list`);
                    if (response && response.llm_models) {
                        response.llm_models.unshift({ id: 'no_ai_llm', name: t('WORKFLOWS.no_ai_llm') });
                        setAiLLM(response.llm_models);
                    }
                } catch (error) {
                    console.error('Error fetching AI LLMs :', error);
                }
            };

            const fetchOutputs = async () => {
                try {
                    const response = await get(`/outputs/${ module }/list`);
                    if (response && response.outputs) {
                        response.outputs.unshift({
                            "id": 0,
                            "output_label": t("WORKFLOWS.no_output"),
                        })
                        setOutputs(response.outputs);
                    }
                } catch (error) {
                    console.error('Error fetching outputs :', error);
                }
            };

            const fetchAiModels = async () => {
                try {
                    const response = await get(`/ai/${ module }/list`);
                    if (response && response.models) {
                        response.models.unshift({ id: 0, model_label: t('WORKFLOWS.no_ai_model') });
                        setAiModels(response.models);
                    }
                } catch (error) {
                    console.error('Error fetching AI models :', error);
                }
            };

            const fetchCustomers = async () => {
                try {
                    const response = await get(`/accounts/customers/list/${ module }`);
                    if (response && response.customers) {
                        if (module === 'verifier') {
                            response.customers.unshift({ id: 0, name: t('WORKFLOWS.no_customer') });
                        }
                        setCustomers(response.customers);
                    }
                } catch (error) {
                    console.error('Error fetching customers :', error);
                }
            };

            const fetchCustomField = async () => {
                if (module !== 'verifier') return;

                try {
                    const response = await get(`/customFields/list?module=${ module }&type=regex`);
                    if (response && response.customFields) {
                        setCustomFields(response.customFields);
                    }
                } catch (error) {
                    console.error('Error fetching custom fields :', error);
                }
            };

            const fetchSplitterMethods = async () => {
                if (module === 'verifier') {
                    setSplitterMethods(getSplitterMethods());
                    return;
                }
                try {
                    const response = await get('/splitter/splitMethods');
                    if (response && response.splitMethods) {
                        setSplitterMethods(response.splitMethods);
                    }
                } catch (error) {
                    console.error('Error fetching splitter methods :', error);
                }
            };

            const fetchScriptingAllowed = async () => {
                try {
                    const response = await get(`/config/getAllowWFScripting`);
                    if (response) {
                        setAllowScripting(response.allowWFScripting.toLowerCase() === 'true');
                    }
                } catch (error) {
                    console.error('Error fetching scripting allowed :', error);
                }
            };

            await fetchForms();
            await fetchAiLLMs();
            await fetchOutputs();
            await fetchAiModels();
            await fetchCustomers();
            await fetchCustomField();
            await fetchSplitterMethods();
            await fetchScriptingAllowed();
            setLoading(false);
        }

        init().then();
    }, []);

    // Fetch the workflow data if editing an existing workflow
    useEffect(() => {
        if (!workflowId) return;

        const fetchCustomField = async () => {
            try {
                const response = await get(`/workflows/${ module }/getById/${ workflowId }`);
                if (response) {
                    Object.entries(response).forEach(([key, value]: any) => {
                        if (['label', 'workflow_id'].includes(key)) {
                            detailsSetValue(key, value);
                        } else {
                            Object.entries(value).forEach(([inputKey, inputValue]: any) => {
                                if (inputValue !== null) {
                                    if (inputKey === 'script') {
                                        if (key === 'input') {
                                            const disabled = inputValue.includes("return 'DISABLED'") || inputValue.includes('return "DISABLED"');
                                            setInputScripting(!disabled);
                                            setInputScript(inputValue);
                                        } else if (key === 'process') {
                                            const disabled = inputValue.includes("return 'DISABLED'") || inputValue.includes('return "DISABLED"');
                                            setProcessScripting(!disabled);
                                            setProcessScript(inputValue);
                                        }
                                    } else {
                                        workflowSetValue(inputKey, inputValue);
                                    }
                                }
                            });
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching custom field data :', error);
            }
        };

        fetchCustomField().then();
    }, [workflowId]);

    const detailSchema = z.object({
        label: z.string().min(3).describe(JSON.stringify({
            required: true,
            component: "input",
            label: t("WORKFLOWS.label")
        })),
        workflow_id: z.string().min(3).describe(JSON.stringify({
            required: true,
            disabled: !!workflowId,
            component: "input",
            label: t("WORKFLOWS.label_short")
        }))
    });

    const {
        watch: detailsWatch,
        control: detailsControl,
        setValue: detailsSetValue,
        getValues: detailsGetValues,
        handleSubmit: detailsHandleSubmit,
        formState: { errors: detailsErrors }
    } = useForm({
        resolver: zodResolver(detailSchema),
        defaultValues: {
            label: '',
            workflow_id: ''
        },
        mode: "onChange"
    });
    const watchLabel = detailsWatch("label");
    const watchWorkflowId = detailsWatch("workflow_id");

    // Fill workflowId with label value
    useEffect(() => {
        if (!watchLabel || workflowId) return;

        detailsSetValue("workflow_id", toIdentifier(watchLabel));
    }, [watchLabel]);

    // Remove space in workflowId
    useEffect(() => {
        if (!watchWorkflowId) return;

        const newWorkflowId = watchWorkflowId.replace(/\s+/g, '');
        if (newWorkflowId !== watchWorkflowId) {
            detailsSetValue("workflow_id", newWorkflowId);
        }
    }, [watchWorkflowId]);


    let inputSchemaFields = z.object({
        input_folder: z.string().optional().describe(JSON.stringify({
            component: "input",
            label: t("WORKFLOWS.input_folder"),
            placeholder: `/var/share/${ custom }/input`
        })),
        customer_id: z.number().describe(JSON.stringify({
            component: "select",
            label: t("WORKFLOWS.customer"),
            required: module === 'splitter',
            searchable: true,
            options: customers.map((c: any) => ({ label: c.name, value: c.id }))
        })),
        ai_model_id: z.number().optional().describe(JSON.stringify({
            component: "select",
            label: t("WORKFLOWS.ai_model"),
            searchable: false,
            hint: t("WORKFLOWS.ai_model_hint"),
            options: aiModels.map((m: any) => ({ label: m.model_label, value: m.id }))
        })),
        splitter_method_id: z.string().optional().describe(JSON.stringify({
            required: true,
            component: "select",
            searchable: false,
            label: t("WORKFLOWS.splitter_method_id"),
            options: splitterMethods.map((m: any) => ({ label: m.label, value: m.id }))
        })),
        separate_by_document_number_value: z.number().describe(JSON.stringify({
            type: "number",
            component: "input",
            label: t("WORKFLOWS.separate_by_document_number_value"),
            required: splitterMethodActive == 'separate_by_document_number',
            disabled: splitterMethodActive !== 'separate_by_document_number'
        }))
    });
    let inputSchemaEndSwitchs = z.object({
        remove_blank_pages: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.remove_blank_pages")
        })),
        apply_process: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.apply_process")
        }))
    });

    if (module === 'verifier') {
        inputSchemaFields = inputSchemaFields.extend({
            rotation: z.string().optional().describe(JSON.stringify({
                component: "select",
                searchable: false,
                label: t("WORKFLOWS.rotation"),
                options: getRotationOptions().map((o: any) => ({ label: o.label, value: o.id }))
            }))
        });
        inputSchemaEndSwitchs = inputSchemaEndSwitchs.extend({
            facturx_only: z.boolean().optional().describe(JSON.stringify({
                component: "input_switch",
                label: t("WORKFLOWS.facturx_only")
            }))
        });
    } else {
        inputSchemaEndSwitchs = inputSchemaEndSwitchs.extend({
            certified_copy: z.boolean().optional().describe(JSON.stringify({
                component: "input_switch",
                label: t("WORKFLOWS.certified_copy"),
                hint: t("WORKFLOWS.certified_copy_hint")
            }))
        });
    }

    const inputSchema = inputSchemaFields.extend(inputSchemaEndSwitchs.shape);

    let processSchemaStartSwitchs: any = z.object({});
    let processSchemaInputFields: any = z.object({
        form_id: z.any().describe(JSON.stringify({
            component: "select",
            required: useInterface && stepperIndex == 1,
            disabled: !useInterface,
            label: t("VERIFIER.associated_form"),
            options: forms.map((f: any) => ({ label: f.label, value: f.id }))
        }))
    });
    const processSchemaEndSwitchs: any = z.object({
        delete_documents: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.delete_documents"),
            hint: t("WORKFLOWS.delete_documents_hint")
        })),
        use_interface: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.use_interface")
        }))
    });

    if (module === 'verifier') {
        processSchemaStartSwitchs = z.object({
            allow_third_party_validation: z.boolean().optional().describe(JSON.stringify({
                component: "input_switch",
                label: t("WORKFLOWS.allow_third_party_validation"),
                hint: t("WORKFLOWS.allow_third_party_validation_hint")
            })),
            allow_automatic_validation: z.boolean().optional().describe(JSON.stringify({
                component: "input_switch",
                label: t("WORKFLOWS.allow_automatic_validation"),
                hint: t("WORKFLOWS.allow_automatic_validation_hint")
            })),
            override_supplier_form: z.boolean().optional().describe(JSON.stringify({
                component: "input_switch",
                label: t("WORKFLOWS.override_supplier_form")
            })),
            api_only: z.boolean().optional().describe(JSON.stringify({
                component: "input_switch",
                label: t("WORKFLOWS.api_only"),
                hint: t("WORKFLOWS.api_only_hint")
            }))
        });
        processSchemaInputFields = processSchemaInputFields.extend({
            ai_llm: z.string().describe(JSON.stringify({
                component: "select",
                label: t("WORKFLOWS.ai_llm"),
                hint: t("WORKFLOWS.ai_llm_hint"),
                options: aiLLM.map((m: any) => ({ label: m.name, value: String(m.id) }))
            })),
            system_fields: z.array(z.string()).describe(JSON.stringify({
                component: "multi_select",
                label: t("WORKFLOWS.system_fields"),
                hint: t("WORKFLOWS.system_fields_hint"),
                options: getSystemFields().map((f: any) => ({ label: f.label, value: f.id }))
            })),
            custom_fields: z.array(z.number()).describe(JSON.stringify({
                component: "multi_select",
                label: t("WORKFLOWS.custom_fields_to_search"),
                hint: t("WORKFLOWS.custom_fields_to_search_hint"),
                options: customFields.map((f: any) => ({ label: f.label, value: f.id }))
            })),
            tesseract_function: z.string().describe(JSON.stringify({
                component: "select",
                required: stepperIndex == 1,
                label: t("WORKFLOWS.tesseract_function"),
                hint: t("WORKFLOWS.tesseract_function_hint"),
                options: getTesseractOptions().map((f: any) => ({ label: f.label, value: f.id }))
            })),
            convert_function: z.string().describe(JSON.stringify({
                component: "select",
                required: stepperIndex == 1,
                label: t("WORKFLOWS.convert_function"),
                hint: t("WORKFLOWS.convert_function_hint"),
                options: getConvertOptions().map((f: any) => ({ label: f.label, value: f.id }))
            }))
        });
    } else {
        processSchemaInputFields = processSchemaInputFields.extend({
            rotation: z.string().optional().describe(JSON.stringify({
                component: "select",
                label: t("WORKFLOWS.rotation"),
                options: getRotationOptions().map((o: any) => ({ label: o.label, value: o.id }))
            }))
        });
    }

    const processSchema = processSchemaStartSwitchs.extend(processSchemaInputFields.shape).extend(processSchemaEndSwitchs.shape);

    const outputSchema = z.object({
        outputs_id: z.array(z.number()).describe(JSON.stringify({
            disabled: useInterface,
            component: "multi_select",
            label: t("WORKFLOWS.outputs"),
            options: outputs.map((o: any) => ({ label: o.output_label, value: o.id }))
        }))
    });

    const {
        watch: workflowWatch,
        control: workflowControl,
        setValue: workflowSetValue,
        setError: workflowSetError,
        clearErrors: workflowClearErrors,
        getValues: workflowGetValues,
        handleSubmit: workflowHandleSubmit,
        formState: { errors: workflowErrors }
    } = useForm({
        resolver: zodResolver(inputSchema.extend(processSchema.shape).extend(outputSchema.shape)),
        defaultValues: {
            input_folder: '',
            api_only: false,
            allow_automatic_validation: false,
            allow_third_party_validation: false,
            override_supplier_form: false,
            facturx_only: false,
            certified_copy: false,
            remove_blank_pages: true,
            apply_process: true,
            use_interface: true,
            splitter_method_id: 'no_sep',
            rotation: 'no_rotation',
            ai_llm: 'no_ai_llm',
            ai_model_id: 0,
            customer_id: 0,
            form_id: undefined,
            convert_function: 'pdf2image',
            tesseract_function: 'line_box_builder',
            system_fields: [],
            custom_fields: [],
            outputs_id: []
        },
        mode: "onChange"
    });

    const formIdValue: any = workflowWatch('form_id');
    const customerId: any = workflowWatch('customer_id');
    const useInterfaceValue: any = workflowWatch('use_interface');
    const splitterMethod: any = workflowWatch('splitter_method_id');

    // Enable/disable outputs dropdown based on useInterface switch
    useEffect(() => {
        setUseInterface(useInterfaceValue);
    }, [useInterfaceValue]);

    // Show error if customer is not selected and module is splitter
    useEffect(() => {
        if (module === 'splitter' && !customerId) {
            workflowSetError('customer_id', { message: t("WORKFLOWS.customer_required") });
        } else {
            workflowClearErrors('customer_id');
        }
    }, [customerId]);

    // Enable/disable separate_by_document_number_value based on splitter method
    useEffect(() => {
        if (splitterMethod !== 'separate_by_document_number') {
            workflowSetValue('separate_by_document_number_value', 0);
        }
        setSplitterMethodActive(splitterMethod);
    }, [splitterMethod]);

    // Update outputs options based on selected form
    useEffect(() => {
        const form: any = forms.find((f: any) => f.id === formIdValue);
        if (form) {
            const outputsList = outputs.filter((o: any) => form.outputs.some((fo: any) => parseInt(fo) === o.id));
            workflowSetValue('outputs_id', outputsList.map((o: any) => o.id));
        }
    }, [formIdValue]);

    const handleNextStep: any = (data: FormData) => {
        if (data && Object.keys(workflowErrors).length > 0) {
            return;
        }
        setStepperIndex(stepperIndex + 1);
    }

    const handlePreviousStep = () => setStepperIndex(stepperIndex - 1);

    const handleSubmitStep = async (data: any) => {
        const label = detailsGetValues('label');
        const workflowId = detailsGetValues('workflow_id');
        if (Object.keys(detailsErrors).length > 0 || !workflowId || !label) {
            await detailsHandleSubmit(() => {})();
            showToast(t("WORKFLOWS.fix_details_errors"), 'error');
            return;
        }

        if (stepperIndex === 0) {
            const inputFolder = workflowGetValues('input_folder');
            if (inputFolder) {
                setLoadingUpdate(true);
                if (workflowId) {
                    try {
                        await post(`workflows/${ module }/createScriptAndWatcher`, {
                            workflow_label: label,
                            workflow_id: workflowId,
                            input_folder: inputFolder
                        })
                    } catch (error) {
                        console.error('Error validating input folder :', error);
                        return;
                    } finally {
                        setLoadingUpdate(false);
                    }
                } else {
                    setLoadingUpdate(false);
                    showToast(t("WORKFLOWS.fix_details_errors"), 'error');
                    return;
                }
            }
        }

        if (inputScripting && stepperIndex === 2 || stepperIndex == 1) {
            if (useInterface && !formIdValue) {
                workflowSetError('form_id', { message: t("WORKFLOWS.form_required") });
                return;
            }
        }

        await handleSubmit(data);

        handleNextStep(data);
    }

    const handleSubmit = async (data: any) => {
        if (Object.keys(detailsErrors).length > 0 || Object.keys(workflowErrors).length > 0) {
            return;
        }

        setLoadingUpdate(true);

        const payload: any = {
            ...detailsGetValues(),
            input: {
                input_folder: data.input_folder,
                customer_id: data.customer_id,
                ai_model_id: data.ai_model_id,
                splitter_method_id: data.splitter_method_id,
                separate_by_document_number_value: data.separate_by_document_number_value,
                facturx_only: data.facturx_only,
                certified_copy: data.certified_copy,
                remove_blank_pages: data.remove_blank_pages,
                apply_process: data.apply_process,
            },
            process: {
                form_id: data.form_id,
                ai_llm: data.ai_llm,
                system_fields: data.system_fields,
                custom_fields: data.custom_fields,
                tesseract_function: data.tesseract_function,
                convert_function: data.convert_function,
                allow_third_party_validation: data.allow_third_party_validation,
                allow_automatic_validation: data.allow_automatic_validation,
                override_supplier_form: data.override_supplier_form,
                api_only: data.api_only,
                delete_documents: data.delete_documents,
                use_interface: data.use_interface,
            },
            output: {
                outputs_id: data.outputs_id
            }
        };

        if (module === 'verifier') {
            payload.input.rotation = data.rotation;
        } else {
            payload.process.rotation = data.rotation;
        }

        if (inputScripting || inputScript) {
            payload.input['script'] = inputScript;
        }
        if (processScripting || processScript) {
            payload.process['script'] = processScript;
        }

        try {
            if (workflowId) {
                await put(`/workflows/${ module }/update/${ workflowId }`, payload);
                showToast(t('WORKFLOWS.update_success'), 'success');
            } else {
                const res = await post(`/workflows/${ module }/create`, payload);
                if (res.id) {
                    navigate(`/settings/${ module }/workflows/edit/${ res.id }`);
                    showToast(t('WORKFLOWS.create_success'), 'success');
                }
            }
        } catch (error) {
            console.error('Error updating workflow :', error);
        } finally {
            setLoadingUpdate(false);
        }
    }

    const handleSubmitScript = async (script: string, step: string) => {
        try {
            setLoadingScript(true);
            await post(`/workflows/${ module }/testScript`, {
                step: step,
                codeContent: script,
                input_folder: workflowWatch('input_folder')
            });
            showToast(t('WORKFLOWS.test_script_success'), 'success');
            handleNextStep({});
            setLoadingScript(false);
        } catch (error: any) {
            setLoadingScript(false);
            console.error('Error testing script :', error);
        }
    }

    if (loading) return <Loader/>;

    return (
        <div className="h-full overflow-y-auto">
            <div className='px-6 pt-6'>
                <h1 className="text-lg font-semibold mb-4">
                    { t('WORKFLOWS.details') }
                </h1>

                <div className='w-full'>
                    <DynamicForm errors={ detailsErrors } control={ detailsControl } schema={ detailSchema }
                                 grid={ 2 }/>
                </div>
            </div>

            <StepperMantine className='p-6' active={ stepperIndex } onStepClick={ setStepperIndex }>
                <StepperMantine.Step label={ t("WORKFLOWS.input") }>
                    <div className='flex flex-col gap-2'>
                        <DynamicForm schema={ inputSchemaFields } control={ workflowControl } errors={ workflowErrors }
                                     grid={ 2 }/>
                        <DynamicForm schema={ inputSchemaEndSwitchs } control={ workflowControl }
                                     errors={ workflowErrors } gap={ 2 }/>

                        { allowScripting && (
                            <div className='flex items-center gap-2'>
                                <InputSwitch
                                    id='inputScripting'
                                    checked={ inputScripting }
                                    label={ t('WORKFLOWS.input_scripting') }
                                    onChange={ (value) => setInputScripting(value) }
                                />
                            </div>
                        ) }

                        <div className="flex justify-end">
                            <Button onClick={ workflowHandleSubmit(handleSubmitStep) } className="ml-auto px-12"
                                    disabled={ loading || Object.keys(workflowErrors).length > 0 }>
                                { loadingUpdate ? t("WORKFLOWS.validating") : t("GLOBAL.next") }
                            </Button>
                        </div>
                    </div>
                </StepperMantine.Step>

                { allowScripting && inputScripting && (
                    <StepperMantine.Step className='stepper-secondary' label={
                        <div className='flex items-center gap-2'>
                            <Terminal className='bg-(--border-secondary) text-(--text-secondary) p-2 rounded-lg'
                                      size={ 36 }/>
                            <div className='text-(--text-secondary)'>
                                { t("WORKFLOWS.input_scripting") }
                            </div>
                        </div>
                    }>
                        <div className='flex flex-col gap-4'>
                            <div className="relative">
                                <Editor
                                    className='border border-(--border-secondary) rounded-md p-2'
                                    height="50vh"
                                    defaultLanguage="python"
                                    defaultValue={ inputScript }
                                    options={ {
                                        contextmenu: true,
                                        minimap: { enabled: true }
                                    } }
                                    onChange={ (value) => setInputScript(value || '') }
                                    theme={ document.documentElement.classList.contains('dark') ? 'vs-dark' : '' }
                                />
                                <label className={ `absolute left-3 select-none pointer-events-none transition-all 
                                                    duration-150 top-0 -translate-y-1/2 px-1 text-xs bg-(--bg-primary) 
                                                    text-(--text-secondary)` }
                                >
                                    { t("WORKFLOWS.script_content") }
                                </label>
                            </div>
                            <div className='flex justify-between'>
                                <Button onClick={ handlePreviousStep } variant="no_bg"
                                        className="px-0! text-(--color-primary) border-transparent hover:text-(--text-primary)">
                                    <ArrowLeft/> { t("MAILCOLLECT.previous") }
                                </Button>

                                <Button data-tooltip-id='tooltip'
                                        data-tooltip-content={ t("WORKFLOWS.next_script_testing") }
                                        onClick={ () => handleSubmitScript(inputScript, 'input') } className="px-12"
                                        disabled={ loading || Object.keys(workflowErrors).length > 0 }>
                                    { loadingScript ? t("WORKFLOWS.validating_script") : t("GLOBAL.next") }
                                </Button>
                            </div>
                        </div>
                    </StepperMantine.Step>
                ) }

                <StepperMantine.Step label={ t("WORKFLOWS.process") }>
                    <div className='flex flex-col gap-2'>
                        <DynamicForm schema={ processSchemaStartSwitchs } control={ workflowControl }
                                     errors={ workflowErrors }
                                     gap={ 2 } className='mb-2'/>
                        <DynamicForm schema={ processSchemaInputFields } control={ workflowControl }
                                     errors={ workflowErrors }
                                     grid={ 2 }/>
                        <DynamicForm schema={ processSchemaEndSwitchs } control={ workflowControl }
                                     errors={ workflowErrors }
                                     gap={ 2 }/>

                        { allowScripting && (
                            <div className='flex items-center gap-2'>
                                <InputSwitch
                                    id='processScripting'
                                    checked={ processScripting }
                                    label={ t('WORKFLOWS.process_scripting') }
                                    onChange={ (value) => setProcessScripting(value) }
                                />
                            </div>
                        ) }

                        <div className='flex justify-between'>
                            <Button onClick={ handlePreviousStep } variant="no_bg"
                                    className="px-0! text-(--color-primary) border-transparent hover:text-(--text-primary)">
                                <ArrowLeft/> { t("MAILCOLLECT.previous") }
                            </Button>

                            <Button onClick={ workflowHandleSubmit(handleSubmitStep) } className="px-12"
                                    disabled={ loading || Object.keys(workflowErrors).length > 0 }>
                                { t("GLOBAL.next") }
                            </Button>
                        </div>
                    </div>
                </StepperMantine.Step>

                { allowScripting && processScripting && (
                    <StepperMantine.Step className='stepper-secondary' label={
                        <div className='flex items-center gap-2'>
                            <Terminal className='bg-(--border-secondary) text-(--text-secondary) p-2 rounded-lg'
                                      size={ 36 }/>
                            <div className='text-(--text-secondary)'>
                                { t("WORKFLOWS.process_scripting") }
                            </div>
                        </div>
                    }>
                        <div className="relative">
                            <Editor
                                className='border border-(--border-secondary) rounded-md p-2'
                                height="50vh"
                                defaultLanguage="python"
                                defaultValue={ processScript }
                                options={ {
                                    contextmenu: true,
                                    minimap: { enabled: true }
                                } }
                                onChange={ (value) => setProcessScript(value || '') }
                                theme={ document.documentElement.classList.contains('dark') ? 'vs-dark' : '' }
                            />
                            <label className={ `absolute left-3 select-none pointer-events-none transition-all 
                                                        duration-150 top-0 -translate-y-1/2 px-1 text-xs bg-(--bg-primary) 
                                                        text-(--text-secondary)` }
                            >
                                { t("WORKFLOWS.script_content") }
                            </label>
                        </div>

                        <div className='mt-4 flex justify-between'>
                            <Button onClick={ handlePreviousStep } variant="no_bg"
                                    className="px-0! text-(--color-primary) border-transparent hover:text-(--text-primary)">
                                <ArrowLeft/> { t("MAILCOLLECT.previous") }
                            </Button>

                            <Button data-tooltip-id='tooltip'
                                    data-tooltip-content={ t("WORKFLOWS.next_script_testing") }
                                    onClick={ () => handleSubmitScript(processScript, 'process') } className="px-12"
                                    disabled={ loading || Object.keys(workflowErrors).length > 0 }>
                                { loadingScript ? t("WORKFLOWS.validating_script") : t("GLOBAL.next") }
                            </Button>
                        </div>
                    </StepperMantine.Step>
                ) }

                <StepperMantine.Step label={ t("WORKFLOWS.output") }>
                    <DynamicForm schema={ outputSchema } control={ workflowControl } errors={ workflowErrors }/>

                    <div className='mt-4 flex justify-between'>
                        <Button onClick={ handlePreviousStep } variant="no_bg"
                                className="px-0! text-(--color-primary) border-transparent hover:text-(--text-primary)">
                            <ArrowLeft/> { t("MAILCOLLECT.previous") }
                        </Button>

                        <Button onClick={ workflowHandleSubmit(handleSubmit) } className="px-12"
                                disabled={ loadingUpdate || Object.keys(workflowErrors).length > 0 }>
                            { workflowId && (
                                <>
                                    { loadingUpdate ? t("WORKFLOWS.updating") : t("WORKFLOWS.update") }
                                </>
                            ) }

                            { !workflowId && (
                                <>
                                    { loadingUpdate ? t("WORKFLOWS.updating") : t("MAILCOLLECT.create") }
                                </>
                            ) }
                        </Button>
                    </div>
                </StepperMantine.Step>
            </StepperMantine>

        </div>
    );
}