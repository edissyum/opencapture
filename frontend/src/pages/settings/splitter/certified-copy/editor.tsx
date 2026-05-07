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
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../../../../components/Button";
import { Loader } from "../../../../components/loader/Loader";
import { DynamicForm } from "../../../../components/form/DynamicForm";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";

export function SettingsSplitterCertifiedCopy() {
    const { get, put } = axiosApiCall();
    const [loading, setLoading] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const [selectedProvider, setSelectedProvider] = useState<any>(null);

    const [enabled, setEnabled] = useState(false);

    const providers = [
        { id: 'freetsa', label: "FreeTSA", hint: t('CERTIFIED-COPY.freetsa_not_prod') },
        { id: 'certinomis', label: "Certinomis" }
    ];

    const schema = z.object({
        enabled: z.boolean().describe(JSON.stringify({
            component: "input_switch",
            required: true,
            label: t("GLOBAL.enable")
        })),
        provider: z.string().optional().describe(JSON.stringify({
            required: enabled,
            disabled: !enabled,
            component: "dropdown",
            hint: selectedProvider?.hint,
            label: t("AI-LLM.provider"),
            options: providers.map(p => ({ value: p.id, label: p.label }))
        })),
        url: z.url().optional().describe(JSON.stringify({
            required: enabled,
            disabled: !enabled,
            component: "input",
            label: t("AI-LLM.url")
        })),
        cert: z.string().describe(JSON.stringify({
            component: "input",
            disabled: !enabled,
            required: enabled && selectedProvider?.id === "certinomis",
            show: selectedProvider?.id === "certinomis",
            hint: t("CERTIFIED-COPY.cert_hint"),
            label: t("CERTIFIED-COPY.cert")
        })),
        key: z.string().describe(JSON.stringify({
            component: "input",
            disabled: !enabled,
            required: enabled && selectedProvider?.id === "certinomis",
            show: selectedProvider?.id === "certinomis",
            hint: t("CERTIFIED-COPY.key_hint"),
            label: t("CERTIFIED-COPY.key")
        }))
    });

    const { control, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            enabled: false,
            cert: "",
            key: ""
        },
        mode: "onChange"
    });

    const watchEnabled = watch("enabled");
    const watchProvider = watch("provider");

    // Update selected provider when form changes
    useEffect(() => {
        const provider: any = providers.find(p => p.id === watchProvider);
        setSelectedProvider(provider);
        clearErrors();
    }, [watchProvider]);

    // Update enabled state when form changes
    useEffect(() => {
        setEnabled(watchEnabled);
    }, [watchEnabled]);

    // Retrieve settings
    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await get("/config/getCertifiedCopy");
                if (response) {
                    const settings = JSON.parse(response);
                    Object.keys(settings).forEach((key: any) => {
                        if (settings[key] !== null) {
                            if (key === "provider") {
                                const provider: any = providers.find(p => p.id === settings[key]);
                                setSelectedProvider(provider);
                                if (provider && settings[provider.id]) {
                                    Object.keys(settings[provider.id]).forEach((pKey: any) => {
                                        setValue(pKey, settings[provider.id][pKey]);
                                    });
                                }
                            }
                            setValue(key, settings[key]);
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to fetch Certified Copy settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings().then();
    }, []);

    const handleUpdate = async (data: any) => {
        if (data.enabled) {
            if (!data.provider) {
                setError("provider", { type: "required", message: t("GLOBAL.field_required") });
                return;
            }
            if (!data.url) {
                setError("url", { type: "required", message: t("GLOBAL.field_required") });
                return;
            }
            if (data.provider === "certinomis") {
                if (!data.cert) {
                    setError("cert", { type: "required", message: t("GLOBAL.field_required") });
                    return;
                }
                if (!data.key) {
                    setError("key", { type: "required", message: t("GLOBAL.field_required") });
                    return;
                }
            }
        } else {
            clearErrors();
        }

        setLoadingUpdate(true);
        try {
            await put("/config/updateCertifiedCopy", data);
        } catch (error) {
            console.error("Failed to update Certified Copy settings:", error);
        } finally {
            setLoadingUpdate(false);
        }
    };

    if (loading) return <Loader/>;

    return (
        <div className="p-6 flex flex-col gap-6 w-1/2">
            <h1 className="text-lg font-semibold">
                { t('CERTIFIED-COPY.settings') }
            </h1>

            <DynamicForm errors={ errors } control={ control } schema={ schema }/>

            <Button onClick={ handleSubmit(handleUpdate) } disabled={ loading || loadingUpdate || Object.keys(errors).length > 0 }>
                { loading ? t('GLOBAL.saving') : t('GLOBAL.save') }
            </Button>
        </div>
    );
}