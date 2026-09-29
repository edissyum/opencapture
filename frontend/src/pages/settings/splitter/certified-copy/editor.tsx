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
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../../../../components/Button";
import { Loader } from "../../../../components/loader/Loader";
import { showToast } from "../../../../components/ToastProvider";
import UploadDropzone from "../../../../components/upload/Dropzone";
import { DynamicForm } from "../../../../components/form/DynamicForm";

import { AxiosApiCall } from "../../../../services/hooks/AxiosApiCall";

export function SettingsSplitterCertifiedCopy() {
    const { get, put } = AxiosApiCall();
    const [loading, setLoading] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const [selectedProvider, setSelectedProvider] = useState<any>(null);

    const [enabled, setEnabled] = useState(false);
    const [certFile, setCertFile] = useState<File | null>(null);
    const [keyFile, setKeyFile] = useState<File | null>(null);
    const [savedCertValue, setSavedCertValue] = useState("");
    const [savedKeyValue, setSavedKeyValue] = useState("");
    const [uploadErrors, setUploadErrors] = useState({ cert: "", key: "" });

    const pemAccept = {
        "text/plain": [".pem"],
        "application/x-pem-file": [".pem"],
        "application/octet-stream": [".pem"],
        "application/x-x509-ca-cert": [".pem"]
    };

    const extractFileName = (value?: string) => value ? value.split(/[\\/]/).pop() || value : "";

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
            component: "select",
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
        // cert: z.string().describe(JSON.stringify({
        //     component: "input",
        //     disabled: !enabled,
        //     required: enabled && selectedProvider?.id === "certinomis",
        //     show: selectedProvider?.id === "certinomis",
        //     hint: t("CERTIFIED-COPY.cert_hint"),
        //     label: t("CERTIFIED-COPY.cert")
        // })),
        // key: z.string().describe(JSON.stringify({
        //     component: "input",
        //     disabled: !enabled,
        //     required: enabled && selectedProvider?.id === "certinomis",
        //     show: selectedProvider?.id === "certinomis",
        //     hint: t("CERTIFIED-COPY.key_hint"),
        //     label: t("CERTIFIED-COPY.key")
        // }))
    });

    const { control, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            enabled: false
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
        setUploadErrors({ cert: "", key: "" });
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
                                    if (settings[provider.id].url) {
                                        setValue("url", settings[provider.id].url);
                                    }
                                    if (provider.id === "certinomis") {
                                        setSavedCertValue(settings[provider.id].cert || "");
                                        setSavedKeyValue(settings[provider.id].key || "");
                                    }
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

    const handleCertFilesAccepted = async (files: File[]) => {
        if (files.length === 0) {
            setUploadErrors(prev => ({ ...prev, cert: t("GLOBAL.file_required") }));
            return;
        }

        setCertFile(files[0] || null);
        setSavedCertValue(files[0].name);
        setUploadErrors(prev => ({ ...prev, cert: "" }));
        await uploadNewFile('cert', files[0]);
    };

    const handleKeyFilesAccepted = async (files: File[]) => {
        if (files.length === 0) {
            setUploadErrors(prev => ({ ...prev, key: t("GLOBAL.file_required") }));
            return;
        }

        setKeyFile(files[0] || null);
        setSavedKeyValue(files[0].name);
        setUploadErrors(prev => ({ ...prev, key: "" }));
        await uploadNewFile('key', files[0]);
    };

    const uploadNewFile = async (type: "cert" | "key", file: any) => {
        if (!file) {
            setUploadErrors(prev => ({ ...prev, [type]: t("GLOBAL.file_required") }));
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        await put('/config/uploadFileCertifiedCopy', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        showToast(t("CERTIFIED-COPY.file_upload_success", { fileName: file.name }), "success");
    };

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
                const nextUploadErrors = {
                    cert: certFile || savedCertValue ? "" : t("GLOBAL.field_required"),
                    key: keyFile || savedKeyValue ? "" : t("GLOBAL.field_required")
                };
                setUploadErrors(nextUploadErrors);

                if (nextUploadErrors.cert || nextUploadErrors.key) {
                    return;
                }
            }
        } else {
            clearErrors();
            setUploadErrors({ cert: "", key: "" });
        }

        setLoadingUpdate(true);
        try {
            if (selectedProvider?.id === "certinomis") {
                data.key = savedKeyValue;
                data.cert = savedCertValue;
            }

            await put("/config/updateCertifiedCopy", data);
            showToast(t("CERTIFIED-COPY.update_success"), "success");
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

            { enabled && selectedProvider?.id === "certinomis" && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <div>
                            <h2 className="font-medium">{ t("CERTIFIED-COPY.cert_upload") }</h2>
                            <p className="text-sm text-(--text-secondary)">{ t("CERTIFIED-COPY.cert_hint") }</p>
                            { savedCertValue && !certFile && (
                                <p className="text-sm text-(--text-secondary) mt-1"
                                    dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(t("CERTIFIED-COPY.current_file", { fileName: extractFileName(savedCertValue) })) } }/>
                            ) }
                        </div>
                        <UploadDropzone
                            accept={ pemAccept }
                            maxFiles={ 1 }
                            onFilesAccepted={ handleCertFilesAccepted }
                        />
                        { uploadErrors.cert && (
                            <p className="text-sm text-(--text-error)">{ uploadErrors.cert }</p>
                        ) }
                    </div>

                    <div className="flex flex-col gap-2">
                        <div>
                            <h2 className="font-medium">{ t("CERTIFIED-COPY.key_upload") }</h2>
                            <p className="text-sm text-(--text-secondary)">{ t("CERTIFIED-COPY.key_hint") }</p>
                            { savedKeyValue && (
                                <p className="text-sm text-(--text-secondary) mt-1"
                                    dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(t("CERTIFIED-COPY.current_file", { fileName: extractFileName(savedKeyValue) })) } }/>
                            ) }
                        </div>
                        <UploadDropzone
                            accept={ pemAccept }
                            maxFiles={ 1 }
                            onFilesAccepted={ handleKeyFilesAccepted }
                        />
                        { uploadErrors.key && (
                            <p className="text-sm text-(--text-error)">{ uploadErrors.key }</p>
                        ) }
                    </div>
                </div>
            ) }

            <Button onClick={ handleSubmit(handleUpdate) }
                disabled={ loading || loadingUpdate || Object.keys(errors).length > 0 }>
                { loadingUpdate ? t('GLOBAL.saving') : t('GLOBAL.save') }
            </Button>
        </div>
    );
}