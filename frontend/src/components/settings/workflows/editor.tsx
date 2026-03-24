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
import { Stepper } from "primereact/stepper";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { StepperPanel } from "primereact/stepperpanel";

import { useCustom } from "../../../services/custom/customContext";
import { axiosApiCall } from "../../../services/hooks/axiosApiCall";

import { Loader } from "../../loader/Loader";
import { DynamicForm } from "../../form/DynamicForm";

import {
    getConvertOptions,
    getRotationOptions,
    getSplitterMethods,
    getSystemFields,
    getTesseractOptions
} from "./helpers";
import { InputSwitch } from "primereact/inputswitch";
import { ArrowLeft, Terminal } from "lucide-react";
import { Button } from "../../Button.tsx";

export function WorkflowEditor({ module }: { module: 'verifier' | 'splitter' }) {
    const custom = useCustom();
    const { get, post, put } = axiosApiCall();
    const { workflowId } = useParams<{ workflowId: any }>();

    const [loading, setLoading] = useState(true);
    const stepperRef = useRef<any>(null);
    const [stepperIndex, setStepperIndex] = useState(0);

    const [forms, setForms] = useState([]);
    const [aiLLM, setAiLLM] = useState([]);
    const [aiModels, setAiModels] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [customFields, setCustomFields] = useState([]);
    const [splitterMethods, setSplitterMethods] = useState<any>([]);
    const [splitterMethodActive, setSplitterMethodActive] = useState('no_sep');

    const [inputScripting, setInputScripting] = useState(false);
    const [processScripting, setProcessScripting] = useState(false);
    const [outputScripting, setOutputScripting] = useState(false);

    const [workflow, setWorkflow] = useState(null);
    const [allowScripting, setAllowScripting] = useState(false);

    // Fetch if scripting is allowed
    // Fetch forms for dropdown
    // Fetch AI LLMs for dropdown
    // Fetch customers for dropdown
    // Fetch AI models for dropdown
    // Fetch custom fields for dropdown
    // Fetch splitter methods for dropdown
    useEffect(() => {
        const init = async () => {
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
                        response.customers.unshift({ id: 0, name: t('WORKFLOWS.no_customer') });
                        setCustomers(response.customers);
                    }
                } catch (error) {
                    console.error('Error fetching customers :', error);
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
                        response.llm_models.unshift({ id: 'no_ai_llm', model_label: t('WORKFLOWS.no_ai_llm') });
                        setAiLLM(response.llm_models);
                    }
                } catch (error) {
                    console.error('Error fetching AI LLMs :', error);
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

            await fetchForms();
            await fetchAiLLMs();
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
                    setWorkflow(response);
                    Object.entries(response).forEach(([key, value]: any) => {
                        if (['label', 'workflow_id'].includes(key)) {
                            detailsSetValue(key, value, { shouldValidate: true });
                        }
                        if (key === 'input' || key === 'process') {
                            Object.entries(value).forEach(([inputKey, inputValue]) => {
                                if (inputValue !== null) {
                                    workflowSetValue(inputKey, inputValue, { shouldValidate: true });
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
        label: z.string().describe(JSON.stringify({
            required: true,
            component: "input",
            label: t("WORKFLOWS.label")
        })),
        workflow_id: z.string().optional().describe(JSON.stringify({
            component: "input",
            label: t("WORKFLOWS.label_short")
        }))
    });

    const {
        control: detailsControl,
        setValue: detailsSetValue,
        handleSubmit: detailsHandleSubmit,
        formState: { errors: detailsErrors }
    } = useForm({
        resolver: zodResolver(detailSchema),
        defaultValues: {},
        mode: "onChange"
    });

    const inputSchemaStartSwitchs = z.object({
        facturx_only: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.facturx_only")
        })),
        remove_blank_pages: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.remove_blank_pages")
        }))
    });
    const inputSchemaFields = z.object({
        input_folder: z.string().describe(JSON.stringify({
            required: true,
            component: "input",
            label: t("WORKFLOWS.input_folder"),
            placeholder:
                `/var/share/${ custom }/input`
        })),
        customer_id: z.number().optional().describe(JSON.stringify({
            component: "dropdown",
            label: t("WORKFLOWS.customer"),
            options: customers.map((c: any) => ({ label: c.name, value: c.id }))
        })),
        ai_model_id: z.number().optional().describe(JSON.stringify({
            component: "dropdown",
            label: t("WORKFLOWS.ai_model"),
            hint: t("WORKFLOWS.ai_model_hint"),
            options: aiModels.map((m: any) => ({ label: m.model_label, value: m.id }))
        })),
        rotation: z.string().optional().describe(JSON.stringify({
            component: "dropdown",
            label: t("WORKFLOWS.rotation"),
            options: getRotationOptions().map((o: any) => ({ label: o.label, value: o.id }))
        })),
        splitter_method_id: z.string().optional().describe(JSON.stringify({
            required: true,
            component: "dropdown",
            label: t("WORKFLOWS.splitter_method_id"),
            options: splitterMethods.map((m: any) => ({ label: m.label, value: m.id }))
        })),
        separate_by_document_number_value: z.number().describe(JSON.stringify({
            component: "input",
            type: "number",
            required: splitterMethodActive == 'separate_by_document_number',
            disabled: splitterMethodActive !== 'separate_by_document_number',
            label: t("WORKFLOWS.separate_by_document_number_value")
        }))
    });
    const inputSchemaEndSwitchs = z.object({
        apply_process: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.apply_process")
        }))
    });
    const inputSchema = inputSchemaStartSwitchs.extend(inputSchemaFields.shape).extend(inputSchemaEndSwitchs.shape);

    const processSchemaStartSwitchs: any = z.object({
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
    const processSchemaInputFields: any = z.object({
        form_id: z.number().optional().describe(JSON.stringify({
            component: "dropdown",
            required: stepperIndex == 1,
            label: t("VERIFIER.associated_form"),
            options: forms.map((f: any) => ({ label: f.label, value: f.id }))
        }))
    });
    if (module === 'verifier') {
        processSchemaInputFields['ai_llm'] = z.string().describe(JSON.stringify({
            component: "dropdown",
            required: stepperIndex == 1,
            label: t("WORKFLOWS.ai_llm"),
            hint: t("WORKFLOWS.ai_llm_hint"),
            options: aiLLM.map((m: any) => ({ label: m.name, value: m.id }))
        }));

        processSchemaInputFields['system_fields'] = z.array(z.string()).describe(JSON.stringify({
            component: "dropdown",
            label: t("WORKFLOWS.system_fields"),
            options: getSystemFields().map((f: any) => ({ label: f.label, value: f.id }))
        }));

        processSchemaInputFields['custom_fields'] = z.array(z.string()).describe(JSON.stringify({
            component: "dropdown",
            label: t("WORKFLOWS.custom_fields_to_search"),
            hint: t("WORKFLOWS.custom_fields_to_search_hint"),
            options: customFields.map((f: any) => ({ label: f.label, value: f.id }))
        }));

        processSchemaInputFields['tesseract_function'] = z.array(z.string()).describe(JSON.stringify({
            component: "dropdown",
            required: stepperIndex == 1,
            label: t("WORKFLOWS.tesseract_function"),
            hint: t("WORKFLOWS.tesseract_function_hint"),
            options: getTesseractOptions().map((f: any) => ({ label: f.label, value: f.id }))
        }));

        processSchemaInputFields['convert_function'] = z.array(z.string()).describe(JSON.stringify({
            component: "dropdown",
            required: stepperIndex == 1,
            label: t("WORKFLOWS.convert_function"),
            hint: t("WORKFLOWS.convert_function_hint"),
            options: getConvertOptions().map((f: any) => ({ label: f.label, value: f.id }))
        }));
    }
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
    const processSchema = processSchemaStartSwitchs.extend(processSchemaInputFields.shape).extend(processSchemaEndSwitchs.shape);

    const {
        watch: workflowWatch,
        control: workflowControl,
        setValue: workflowSetValue,
        handleSubmit: workflowHandleSubmit,
        formState: { errors: workflowErrors }
    } = useForm({
        resolver: zodResolver(inputSchema.extend(processSchema.shape)),
        defaultValues: {},
        mode: "onChange"
    });

    const splitterMethod: any = workflowWatch('splitter_method_id');
    useEffect(() => {
        if (splitterMethod !== 'separate_by_document_number') {
            workflowSetValue('separate_by_document_number_value', 0);
        }
        setSplitterMethodActive(splitterMethod);
    }, [splitterMethod]);

    const handleNextStep: any = (data: FormData) => {
        if (data && Object.keys(workflowErrors).length > 0) {
            return;
        }
        stepperRef.current?.nextCallback();
    }

    const handlePreviousStep = () => stepperRef.current?.prevCallback();

    const handleSubmitInput = (data: any) => {
        console.log(data);
        handleNextStep(data);
    }
    if (loading) return <Loader/>;

    return (
        <div className="h-full overflow-y-auto p-6">
            <h1 className="text-lg font-semibold mb-4">
                { t('WORKFLOWS.details') }
            </h1>

            <div className='w-full'>
                <DynamicForm errors={ detailsErrors } control={ detailsControl } schema={ detailSchema } grid={ 2 }/>
            </div>

            <Stepper ref={ stepperRef } linear className='p-4' activeStep={ stepperIndex }
                     onChangeStep={ (e: any) => setStepperIndex(e.index) }>
                <StepperPanel header={ t("WORKFLOWS.input") }>
                    <DynamicForm schema={ inputSchemaStartSwitchs } control={ workflowControl }
                                 errors={ workflowErrors }/>

                    <div className='mt-4'>
                        <DynamicForm schema={ inputSchemaFields } control={ workflowControl } errors={ workflowErrors }
                                     grid={ 2 }/>
                    </div>

                    <DynamicForm schema={ inputSchemaEndSwitchs } control={ workflowControl }
                                 errors={ workflowErrors }/>

                    <div className='flex items-center mt-2'>
                        <InputSwitch inputId='inputScripting' checked={ inputScripting }
                                     onChange={ (e) => setInputScripting(e.value) }/>
                        <label htmlFor={ 'inputScripting' }
                               className="flex items-center gap-4 cursor-pointer">
                            { t('WORKFLOWS.input_scripting') }
                        </label>
                    </div>

                    <div className="flex justify-end mt-6">
                        <Button onClick={ workflowHandleSubmit(handleSubmitInput) } className="ml-auto px-12"
                                disabled={ loading || Object.keys(workflowErrors).length > 0 }>
                            { t("MAILCOLLECT.next") }
                        </Button>
                    </div>
                </StepperPanel>
                { inputScripting && (
                    <StepperPanel header={
                        <div className='flex items-center gap-2'>
                            <Terminal className='bg-(--border-secondary) text-(--text-secondary) p-2 rounded-lg'
                                      size={ 36 }/>
                            <div className='text-(--text-secondary)'>
                                { t("WORKFLOWS.input_scripting") }
                            </div>
                        </div>
                    } pt={ {
                        header: { className: "stepper-secondary left-1/5 -translate-x-1/5" }
                    } }>

                    </StepperPanel>
                ) }
                <StepperPanel header={ t("WORKFLOWS.process") }>
                    <DynamicForm schema={ processSchemaStartSwitchs } control={ workflowControl }
                                 errors={ workflowErrors }/>

                    <div className='mt-4'>
                        <DynamicForm schema={ processSchemaInputFields } control={ workflowControl } errors={ workflowErrors }
                                     grid={ 2 }/>
                    </div>

                    <DynamicForm schema={ processSchemaEndSwitchs } control={ workflowControl }
                                 errors={ workflowErrors }/>

                    <div className='flex items-center mt-2'>
                        <InputSwitch inputId='processScripting' checked={ processScripting }
                                     onChange={ (e) => setProcessScripting(e.value) }/>
                        <label htmlFor={ 'processScripting' }
                               className="flex items-center gap-4 cursor-pointer">
                            { t('WORKFLOWS.process_scripting') }
                        </label>
                    </div>

                    <Button onClick={ handlePreviousStep } variant="no_bg"
                            className="mt-4 mr-2 px-0! text-(--color-primary) border-transparent hover:text-(--text-primary)">
                        <ArrowLeft/> { t("MAILCOLLECT.previous") }
                    </Button>
                </StepperPanel>
                { processScripting && (
                    <StepperPanel header={
                        <div className='flex items-center gap-2'>
                            <Terminal className='bg-(--border-secondary) text-(--text-secondary) p-2 rounded-lg'
                                      size={ 36 }/>
                            <div className='text-(--text-secondary)'>
                                { t("WORKFLOWS.process_scripting") }
                            </div>
                        </div>
                    } pt={ {
                        header: { className: "stepper-secondary left-1/2 translate-x-1/2" }
                    } }>

                    </StepperPanel>
                ) }
                <StepperPanel header={ t("WORKFLOWS.output") }>
                </StepperPanel>
            </Stepper>
        </div>
    );
}