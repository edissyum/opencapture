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
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCustom } from "../../../services/custom/customContext";
import { axiosApiCall } from "../../../services/hooks/axiosApiCall";

import { convert_function, rotation_options, system_fields, tesseract_function } from "./helpers";

export function WorkflowEditor({ module }: { module: 'verifier' | 'splitter' }) {
    const custom = useCustom();
    const { get, post, put } = axiosApiCall();
    const { workflowId } = useParams<{ workflowId: any }>();

    const [forms, setForms] = useState([]);
    const [aiLLM, setAiLLM] = useState([]);
    const [aiModels, setAiModels] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [customFields, setCustomFields] = useState([]);
    const [splitterMethods, setSplitterMethods] = useState({});

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
                    setCustomers(response.customers);
                }
            } catch (error) {
                console.error('Error fetching customers :', error);
            }
        };

        const fetchSplitterMethods = async () => {
            if (module === 'verifier') {
                setSplitterMethods([
                    {
                        'id': 'no_sep',
                        'label': t('WORKFLOWS.no_separation')
                    },
                    {
                        'id': 'qr_code_OC',
                        'label': t('WORKFLOWS.qr_code_separation')
                    },
                    {
                        'id': 'c128_OC',
                        'label': t('WORKFLOWS.c128_separation')
                    },
                    {
                        'id': 'separate_by_document_number',
                        'label': t('WORKFLOWS.separate_by_document_number')
                    }
                ]);
                return;
            }
            try {
                const response = await get('/splitter/splitMethods');
                console.log(response)
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

        fetchCustomField().then();

        fetchForms().then();
        fetchAiLLMs().then();
        fetchAiModels().then();
        fetchCustomers().then();
        fetchSplitterMethods().then();
        fetchScriptingAllowed().then();
    }, []);

    // Fetch the workflow data if editing an existing workflow
    useEffect(() => {
        if (!workflowId) return;

        const fetchCustomField = async () => {
            try {
                const response = await get(`/workflows/${ module }/getById/${ workflowId }`
                );
                setWorkflow(response);
            } catch (error) {
                console.error('Error fetching custom field data :', error);
            }
        };

        fetchCustomField().then();
    }, [workflowId]);

    const inputSchema = {
        apply_process: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.apply_process")
        })),
        facturx_only: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.facturx_only")
        })),
        remove_blank_pages: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.remove_blank_pages")
        })),
        input_folder: z.string().describe(JSON.stringify({
            required: true,
            component: "input",
            label: t("WORKFLOWS.input_folder"),
            placeholder:
                `/var/share/${ custom }/input`
        })),
        customer_id: z.number().optional().describe(JSON.stringify({
            component: "dropdown",
            label: t("WORKFLOWS.customer_id"),
            options: customers.map((c: any) => ({ label: c.name, value: c.id }))
        })),
        ai_model_id: z.number().optional().describe(JSON.stringify({
            component: "dropdown",
            label: t("WORKFLOWS.ai_model_id"),
            hint: t("WORKFLOWS.ai_model_id_hint"),
            options: aiModels.map((m: any) => ({ label: m.model_label, value: m.id }))
        })),
        splitter_method_id: z.number().optional().describe(JSON.stringify({
            required: true,
            component: "dropdown",
            label: t("WORKFLOWS.splitter_method_id")
        })),
        separate_by_document_number_value: z.number().optional().describe(JSON.stringify({
            required: true,
            component: "input",
            disabled: (ctx: any) => ctx.splitter_method_id === 'separate_by_document_number',
            label: t("WORKFLOWS.separate_by_document_number_value")
        })),
        rotation: z.string().optional().describe(JSON.stringify({
            component: "dropdown",
            label: t("WORKFLOWS.rotation"),
            options: rotation_options.map((o: any) => ({ label: o.label, value: o.id }))
        }))
    };
    const processSchema: any = {
        use_interface: z.boolean().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.use_interface")
        })),
        allow_automatic_validation: z.boolean().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.allow_automatic_validation"),
            hint: t("WORKFLOWS.allow_automatic_validation_hint")
        })),
        override_supplier_form: z.boolean().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.override_supplier_form")
        })),
        api_only: z.boolean().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.api_only"),
            hint: t("WORKFLOWS.api_only_hint")
        })),
        delete_documents: z.boolean().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.delete_documents"),
            hint: t("WORKFLOWS.delete_documents_hint")
        })),
        allow_third_party_validation: z.boolean().describe(JSON.stringify({
            component: "input_switch",
            label: t("WORKFLOWS.allow_third_party_validation"),
            hint: t("WORKFLOWS.allow_third_party_validation_hint")
        })),
        form_id: z.number().optional().describe(JSON.stringify({
            required: true,
            component: "dropdown",
            label: t("VERIFIER.associated_form"),
            options: forms.map((f: any) => ({ label: f.label, value: f.id }))
        }))
    }

    if (module === 'verifier') {
        processSchema['ai_llm'] = z.string().describe(JSON.stringify({
            required: true,
            component: "dropdown",
            label: t("WORKFLOWS.ai_llm"),
            hint: t("WORKFLOWS.ai_llm_hint"),
            options: aiLLM.map((m: any) => ({ label: m.name, value: m.id }))
        }));

        processSchema['system_fields'] = z.array(z.string()).describe(JSON.stringify({
            component: "dropdown",
            label: t("WORKFLOWS.system_fields"),
            hint: t("WORKFLOWS.system_fields_hint"),
            options: system_fields.map((f: any) => ({ label: f.label, value: f.id }))
        }));

        processSchema['custom_fields'] = z.array(z.string()).describe(JSON.stringify({
            component: "dropdown",
            label: t("WORKFLOWS.custom_fields_to_search"),
            hint: t("WORKFLOWS.custom_fields_to_search_hint"),
            options: system_fields.map((f: any) => ({ label: f.label, value: f.id }))
        }));

        processSchema['tesseract_function'] = z.array(z.string()).describe(JSON.stringify({
            component: "dropdown",
            label: t("WORKFLOWS.tesseract_function"),
            hint: t("WORKFLOWS.tesseract_function_hint"),
            options: tesseract_function.map((f: any) => ({ label: f.label, value: f.id }))
        }));

        processSchema['convert_function'] = z.array(z.string()).describe(JSON.stringify({
            component: "dropdown",
            label: t("WORKFLOWS.convert_function"),
            hint: t("WORKFLOWS.convert_function_hint"),
            options: convert_function.map((f: any) => ({ label: f.label, value: f.id }))
        }));
    }

    return (
        <div className="p-6 flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Workflow Editor</h2>
            <p>Here you can edit the workflow for the { module } module. This is a placeholder for the actual workflow
                editor component.</p>
        </div>
    );
}