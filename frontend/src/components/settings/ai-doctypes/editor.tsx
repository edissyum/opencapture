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
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";

import { DynamicForm } from "../../form/DynamicForm";

export function AiDoctypesEditor({ module }: { module: 'verifier' | 'splitter' }) {
    const { get, post, put } = axiosApiCall();
    const { aiDoctypeId } = useParams<{ aiDoctypeId: any }>();
    const navigate = useNavigate();

    const [aiDoctype, setAiDoctype] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Fetch the AI Doctype details if editing an existing one
    useEffect(() => {
        if (!aiDoctypeId) return;

        const fetchAiDoctype = async () => {
            setLoading(true);
            try {
                const response = await get(`/ai/getById/${ aiDoctypeId }`);
                setAiDoctype(response);
            } catch (error) {
                console.error("Failed to fetch AI Doctype details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAiDoctype().then();
    }, [aiDoctypeId]);

    const modelSchema: any = z.object({
        model_label: z.string().describe(JSON.stringify({
            required: true,
            component: "input",
            label: t("AI-LLM.name")
        })),
        model_path: z.string().refine((val: string) => val.endsWith('.sav'), {
            message: t('AI-DOCTYPES.model_path_need_sav_end')
        }).describe(JSON.stringify({
            required: true,
            component: "input",
            label: t("AI-DOCTYPES.model_path")
        })),
        min_proba: z.number().describe(JSON.stringify({
            required: true,
            component: "input",
            label: t("AI-DOCTYPES.min_proba")
        }))
    });

    const { control, watch, setValue, setError, clearErrors, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(modelSchema),
        mode: "onChange",
        defaultValues: {
            model_label: '',
            model_path: '',
            min_proba: 0
        }
    });

    // Fill ai doctype when data is loaded
    useEffect(() => {
        if (aiDoctype) {
            setValue('model_label', aiDoctype.model_label || '');
            setValue('model_path', aiDoctype.model_path || '');
            setValue('min_proba', aiDoctype.min_proba || 0);
        }
    }, [aiDoctype]);

    return (
        <div className="h-full overflow-y-auto p-8">
            <div>
                <h1 className="text-lg font-semibold mb-4">
                    { t('AI-DOCTYPES.details') }
                </h1>

                <div className='w-1/3'>
                    <DynamicForm errors={ errors } control={ control } schema={ modelSchema }/>
                </div>
            </div>
        </div>
    );
}