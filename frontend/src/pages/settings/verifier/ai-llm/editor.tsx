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
import { Copy } from "lucide-react";
import { useForm } from "react-hook-form";
import { Editor } from "@monaco-editor/react";
import { FloatLabel } from "primereact/floatlabel";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { defaultJsonContent } from "./json_defaults";

import Hint from "../../../../components/Hint";
import { Button } from "../../../../components/Button";
import { showToast } from "../../../../components/ToastProvider";
import { DynamicForm } from "../../../../components/form/DynamicForm";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { copyToClipboard } from "../../../../services/hooks/copyToClipboard";

export function SettingsVerifierAiLLMEditor() {
    const navigate = useNavigate();
    const { get, put, post } = axiosApiCall();
    const { aiLLMId } = useParams<{ aiLLMId: any }>();

    const isFirstProviderEffect = useRef(true);

    const [jsonValid, setJsonValid] = useState(true);
    const [containsPlaceholder, setContainsPlaceholder] = useState(false);
    const [ocrPlaceholder, setOcrPlaceholder] = useState('##OCR_CONTENT##');

    const [aiLLM, setAiLLM] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [dataCopied, setDataCopied] = useState(false);
    const [aiLLMJson, setAiLLMJson] = useState<string>("");
    const [selectedProvider, setSelectedProvider] = useState('mistral');
    const [providerUrlPlaceholder, setProviderUrlPlaceholder] = useState('');

    const providers = [
        {
            name: "mistral",
            label: "Mistral",
            url: "https://api.mistral.ai/v1/chat/completions",
            logo: "/src/assets/imgs/ai-llm/mistral.svg",
            costs: [
                { type: "input", price: 0.00010 },
                { type: "output", price: 0.00030 }
            ],
            ocr_placeholder: "##OCR_CONTENT##"
        },
        {
            name: "mistral_ocr",
            label: "Mistral OCR",
            url: "https://api.mistral.ai/v1/ocr",
            logo: "/src/assets/imgs/ai-llm/mistral_ocr.svg",
            costs: [
                { type: "input", price: 0.86000 },
                { type: "output", price: 0.00000 }
            ],
            ocr_placeholder: "##FILE_NAME##"
        },
        {
            name: "gemini",
            label: "Google Gemini",
            url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
            logo: "/src/assets/imgs/ai-llm/gemini.svg",
            costs: [
                { type: "input", price: 0.00010 },
                { type: "output", price: 0.00040 }
            ],
            ocr_placeholder: "##OCR_CONTENT##"
        },
        {
            name: "copilot",
            label: "Microsoft Copilot",
            url: "https://oc.cognitiveservices.azure.com/openai/deployments/gpt-5-mini/chat/completions?api-version=2024-08-01-preview",
            logo: "/src/assets/imgs/ai-llm/copilot.svg",
            costs: [
                { type: "input", price: 0.012 },
                { type: "output", price: 0.024 }
            ],
            ocr_placeholder: "##OCR_CONTENT##"
        }
    ];

    // Fetch AI-LLM details if aiLLMId is present (edit mode)
    useEffect(() => {
        if (!aiLLMId) return;

        const fetchAiLLMDetails = async () => {
            try {
                const res = await get(`/ai/llm/getById/${ aiLLMId }`);
                setAiLLM(res);
            } catch (error) {
                console.error("Error fetching AI-LLM details:", error);
            }
        };

        fetchAiLLMDetails().then()
    }, [aiLLMId]);

    const detailsSchema: any = z.object({
        name: z.string().min(1).describe(JSON.stringify({
            component: "input",
            required: true,
            label: t("AI-LLM.name")
        }))
    });
    const apiSchema: any = z.object({
        url: z.string().min(1).describe(JSON.stringify({
            component: "input",
            required: true,
            placeholder: providerUrlPlaceholder,
            label: t("AI-LLM.url")
        })),
        api_key: z.string().min(1).describe(JSON.stringify({
            component: "input",
            required: true,
            label: t("AI-LLM.api_key")
        }))
    });
    const costsSchema: any = z.object({
        input_price: z.number().optional().describe(JSON.stringify({
            component: "input",
            label: t("AI-LLM.input_cost"),
            type: "number"
        })),
        output_price: z.number().optional().describe(JSON.stringify({
            component: "input",
            label: t("AI-LLM.output_cost"),
            type: "number"
        }))
    });

    type FormData = z.infer<typeof detailsSchema> & z.infer<typeof apiSchema> & z.infer<typeof costsSchema>;
    const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            url: '',
            api_key: ''
        },
        resolver: zodResolver(detailsSchema.extend(apiSchema.shape).extend(costsSchema.shape))
    });

    // Fill form when ai llm data is loaded
    useEffect(() => {
        if (Object.keys(aiLLM).length === 0) return;

        Object.entries(aiLLM).forEach(([key, value]: any) => {
            setValue(key, value);
        });
        if (aiLLM.settings) {
            Object.entries(aiLLM.settings).forEach(([key, value]: any) => {
                setValue(key, value);
            });
        }

        if (aiLLM.json_content && Object.keys(aiLLM.json_content).length > 0) {
            setAiLLMJson(JSON.stringify(aiLLM.json_content, null, 4));
        }

        setSelectedProvider(aiLLM.provider);
    }, [aiLLM]);

    // Validate JSON content and check for placeholder and if json was updated by user
    useEffect(() => {
        try {
            JSON.parse(aiLLMJson);
            setJsonValid(true);
        } catch (error) {
            setJsonValid(false);
        }

        setContainsPlaceholder(aiLLMJson.includes(ocrPlaceholder));
    }, [aiLLMJson, ocrPlaceholder]);

    // Handle provider change
    useEffect(() => {
        const provider: any = providers.find((p: any) => p.name === selectedProvider);
        if (provider) {
            setProviderUrlPlaceholder(provider.url);
            setOcrPlaceholder(provider.ocr_placeholder);
            if (!aiLLMId) {
                setValue('url', provider.url);
            }
            setValue('input_price', provider.costs.find((c: any) => c.type === 'input')?.price);
            setValue('output_price', provider.costs.find((c: any) => c.type === 'output')?.price);

            if (isFirstProviderEffect.current) {
                isFirstProviderEffect.current = true;
                return;
            }

            const defautJson = defaultJsonContent[selectedProvider];
            setAiLLMJson(JSON.stringify(defautJson, null, 4));
        }
    }, [selectedProvider]);

    const getPayload = (data: any) => {
        let payload = { ...data, json_content: JSON.parse(aiLLMJson), provider: selectedProvider };
        payload['settings'] = {};
        if (data.input_price) {
            payload['settings']['input_price'] = data.input_price;
        }
        if (data.output_price) {
            payload['settings']['output_price'] = data.output_price;
        }
        return payload;
    }

    const handleCreate = async (data: any) => {
        setLoading(true);
        try {
            const payload = getPayload(data);
            await post(`/ai/llm/create`, payload);
            showToast(t('AI-LLM.created'), 'success');
            navigate('/settings/verifier/ai-llm');
        } catch (error) {
            console.error("Error creating AI-LLM:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (data: any) => {
        setLoading(true);
        try {
            const payload = getPayload(data);
            await put(`/ai/llm/update/${ aiLLMId }`, payload);
            showToast(t('AI-LLM.updated'), 'success');
        } catch (error) {
            console.error("Error updating AI-LLM:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCopy = async () => {
        await copyToClipboard(ocrPlaceholder);
        setDataCopied(true);
        setTimeout(() => setDataCopied(false), 2000);
    }

    return (
        <div className="h-full overflow-y-auto">
            <div className='p-6 pb-0 flex flex-col gap-6'>
                <div className='flex flex-col gap-2'>
                    <h1 className="text-lg font-semibold">
                        { t('AI-LLM.details') }
                    </h1>
                    <div className='w-1/3'>
                        <DynamicForm errors={ errors } control={ control } schema={ detailsSchema }/>
                    </div>
                </div>

                <div className='flex flex-col gap-2'>
                    <h1 className="text-lg font-semibold">
                        { t('AI-LLM.provider') }
                    </h1>
                    <div className='flex gap-4'>
                        { providers.map((provider: any) => (
                            <div key={ provider.name }
                                 onClick={ () => setSelectedProvider(provider.name) }
                                 className={ `border border-(--border-secondary) hover:border-(--border-primary) transition-colors
                             rounded-lg px-8 py-3 cursor-pointer flex items-center justify-center gap-4
                             ${ selectedProvider === provider.name ? 'bg-(--bg-selected) border-(--color-primary)' : '' } ` }>
                                { provider.logo && <img src={ provider.logo } alt={ provider.name } className='h-7'/> }
                                <p className='text-lg font-semibold'>{ provider.label }</p>
                            </div>
                        )) }
                    </div>
                </div>

                <div className='flex flex-col gap-3'>
                    <p className="text-lg font-semibold">
                        { t('AI-LLM.costs') }
                    </p>
                    <p className='text-sm text-(--text-secondary) w-1/2'>
                        { t('AI-LLM.costs_description') }
                    </p>
                    <div className='w-1/2'>
                        <DynamicForm errors={ errors } control={ control } schema={ costsSchema } grid={ 2 }/>
                    </div>
                </div>

                <div className='flex flex-col gap-4'>
                    <h1 className="text-lg font-semibold">
                        { t('AI-LLM.api_call') }
                    </h1>
                    <div className='w-1/2'>
                        <DynamicForm errors={ errors } control={ control } schema={ apiSchema } gap={ 2 }/>
                    </div>
                </div>

                { !jsonValid && (
                    <Hint variant="error">
                        { t('AI-LLM.json_content_invalid') }
                    </Hint>
                ) }
                { !containsPlaceholder && (
                    <Hint variant="warning">
                        { t('AI-LLM.json_content_hint_prefix') }
                        <span className='bg-(--bg-selected) border-(--border-primary) text-(--color-primary)
                                         p-1 rounded-md'>
                             { ocrPlaceholder }
                        </span>
                        <span onClick={ handleCopy }
                              className='bg-(--bg-selected) border-(--border-primary) p-1.5 rounded-md cursor-pointer relative'>
                            <div
                                className={ `absolute opacity-0 top-0 left-1/2 -translate-x-1/2 text-nowrap ${ dataCopied ? '-top-10! opacity-100!' : '' }
                                              transition-all bg-[#E4DDD3] border-(--border-primary) p-1.5 rounded-md` }>
                                { t('GLOBAL.copied') } !
                            </div>
                            <Copy size={ 18 }/>
                        </span>
                        { t('AI-LLM.json_content_hint_suffix') }
                    </Hint>
                ) }

                <FloatLabel>
                    <Editor
                        height='50vh'
                        defaultLanguage={ 'json' }
                        value={ aiLLMJson ?? aiLLMJson }
                        className='border border-(--border-secondary) rounded-md p-2'
                        options={ {
                            stickyScroll: {
                                enabled: false
                            },
                            contextmenu: true,
                            minimap: { enabled: true }
                        } }
                        onChange={ (value: any) => setAiLLMJson(value) }
                        theme={ document.documentElement.classList.contains('dark') ? 'vs-dark' : '' }
                    />
                    <label className="text-(--text-secondary) text-sm top-0! bg-(--bg-primary) px-1">
                        { t('AI-LLM.json_content') } <span className="text-(--text-error)">*</span>
                    </label>
                </FloatLabel>
            </div>

            <div className="p-6 w-fit">
                { aiLLMId ? (
                    <Button onClick={ handleSubmit(handleUpdate) }
                            disabled={ loading || Object.keys(errors).length > 0 || !jsonValid }>
                        { loading ? t('GLOBAL.updating') : t('AI-LLM.update_ai_llm') }
                    </Button>
                ) : (
                    <Button onClick={ handleSubmit(handleCreate) }
                            disabled={ loading || Object.keys(errors).length > 0 || !jsonValid }>
                        { loading ? t('GLOBAL.creating') : t('AI-LLM.create_ai_llm') }
                    </Button>
                ) }
            </div>
        </div>
    );
}