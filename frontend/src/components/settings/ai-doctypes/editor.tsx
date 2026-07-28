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
import { File, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";

import { Panel } from "../../Panel";
import { Select } from "../../Select";
import { Button } from "../../Button";
import { Loader } from "../../loader/Loader";
import { InputSwitch } from "../../InputSwitch";
import { showToast } from "../../ToastProvider";
import { DynamicForm } from "../../form/DynamicForm";
import { DoctypesTree } from "../doctypes/doctypesTree";

export function AiDoctypesEditor({ module }: { module: 'verifier' | 'splitter' }) {
    const navigate = useNavigate();
    const { get, post, put } = axiosApiCall();
    const { aiDoctypeId } = useParams<{ aiDoctypeId: any }>();

    const [forms, setForms] = useState<any[]>([]);
    const [doctypes, setDoctypes] = useState<any[]>([]);

    const [aiDoctype, setAiDoctype] = useState<any>({});
    const [documents, setDocuments] = useState<any[]>([]);
    const [workflows, setWorkflows] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    const [selectedFormId, setSelectedFormId] = useState<number>();
    const [tmpDoctype, setTmpDoctype] = useState<any>(null);
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [showDoctypeSelection, setShowDoctypeSelection] = useState(false);

    // Fetch the AI Doctype details if editing an existing one
    useEffect(() => {
        if (!aiDoctypeId) return;

        const fetchAiDoctype = async () => {
            setLoading(true);
            try {
                const response = await get(`/ai/getById/${ aiDoctypeId }`);
                setAiDoctype(response);
                setDocuments(response.documents || []);
            } catch (error) {
                console.error("Failed to fetch AI Doctype details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAiDoctype().then();
    }, [aiDoctypeId]);

    // Fetch documents if creating new AI Doctype
    useEffect(() => {
        if (aiDoctypeId) return;

        const fetchDocuments = async () => {
            try {
                const response = await get(`/ai/${ module }/getTrainDocuments`);

                const docs: any = [];
                response.forEach((doc: any) => {
                    if (!docs.some((d: any) => d.folder === doc)) {
                        docs.push({ folder: doc, active: false, workflow_id: null });
                    }
                });
                setDocuments(docs);
            } catch (error) {
                console.error("Failed to fetch documents:", error);
            }
        }

        fetchDocuments().then();
    }, []);

    // Fetch workflows if module is verifier
    useEffect(() => {
        if (module !== 'verifier') return;

        const fetchWorkflows = async () => {
            try {
                const response = await get(`/workflows/${ module }/list`);
                setWorkflows(response.workflows);
            } catch (error) {
                console.error("Failed to fetch workflows:", error);
            }
        }

        fetchWorkflows().then();
    }, []);

    // Fetch forms and doctypes if module is splitter
    useEffect(() => {
        if (module !== 'splitter') return;

        const fetchForms = async () => {
            try {
                const response = await get(`/forms/${ module }/list`);
                setForms(response.forms);
            } catch (error) {
                console.error("Failed to fetch forms:", error);
            }
        }

        const fetchDoctypes = async () => {
            try {
                const response = await get(`/doctypes/list`);
                setDoctypes(response.doctypes);
            } catch (error) {
                console.error("Failed to fetch doctypes:", error);
            }
        }

        fetchForms().then();
        fetchDoctypes().then();
    }, []);

    const modelSchema: any = z.object({
        model_label: z.string().min(1, t('GLOBAL.field_required')).describe(JSON.stringify({
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
        min_proba: z.number(t('GLOBAL.field_required')).max(100).describe(JSON.stringify({
            required: true,
            component: "input",
            type: "number",
            label: t("AI-DOCTYPES.min_proba")
        }))
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(modelSchema),
        mode: "onChange",
        defaultValues: {
            model_path: ''
        }
    });

    // Fill ai doctype when data is loaded
    useEffect(() => {
        if (aiDoctype) {
            setValue('min_proba', aiDoctype.min_proba);
            setValue('model_path', aiDoctype.model_path || '');
            setValue('model_label', aiDoctype.model_label || '');
        }
    }, [aiDoctype]);

    const handleModelUpdate = async (data: any) => {
        if (Object.keys(errors).length > 0) return;

        const payload = {
            ...data,
            documents: documents
        };

        try {
            setLoadingUpdate(true);
            await put(`ai/${ module }/update/${ aiDoctypeId }`, payload);
            showToast(t('AI-DOCTYPES.update_success'), 'success');
        } catch (error) {
            console.error("Failed to update AI Doctype:", error);
        } finally {
            setLoadingUpdate(false);
        }
    }

    const handleModelCreate = async (data: any) => {
        if (Object.keys(errors).length > 0) return;

        const payload = {
            ...data,
            documents: documents
        };

        try {
            setLoadingUpdate(true);
            post(`ai/${ module }/trainModel/${ payload.model_path }`, payload).then();
            showToast(t('AI-DOCTYPES.create_success'), 'success');
            navigate(`/settings/${ module }/ai-doctypes`);
        } catch (error) {
            console.error("Failed to update AI Doctype:", error);
        } finally {
            setLoadingUpdate(false);
        }
    }

    const handleWorkflowChange = (e: any, doc: any) => {
        const updatedDocuments = documents.map((d: any) => {
            if (d.folder === doc.folder) {
                return { ...d, workflow_id: e.value };
            }
            return d;
        });

        setDocuments(updatedDocuments);
    }

    const handleDoctypeChange = (node: any) => {
        const updatedDocuments = documents.map((d: any) => {
            if (d.folder === selectedDoc.folder) {
                return { ...d, doctype: node.key };
            }
            return d;
        });

        setDocuments(updatedDocuments);
        setShowDoctypeSelection(false);
    }

    const handleFormChange = (e: any, doc: any) => {
        const updatedDocuments = documents.map((d: any) => {
            if (d.folder === doc.folder) {
                return { ...d, form: e.value };
            }
            return d;
        });

        setDocuments(updatedDocuments);
    }

    const handleEnableDocument = (e: any, doc: any) => {
        const updatedDocuments = documents.map((d: any) => {
            if (d.folder === doc.folder) {
                return { ...d, active: e.value };
            }
            return d;
        });

        setDocuments(updatedDocuments);
    }

    if (loading) return <Loader/>;

    return (
        <div className="h-full overflow-y-auto p-6">
            { showDoctypeSelection && selectedFormId && (
                <>
                    <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                         onClick={ () => setShowDoctypeSelection(false) }/>
                    <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                    min-w-[32vw] h-3/4 max-h-screen border border-(--border-secondary)
                                    rounded-lg bg-(--bg-primary) flex flex-col">
                        <div className='flex items-center px-6 pt-6'>
                            <h2>{ t('SPLITTER.select_doctype') }</h2>
                            <div className='ml-auto cursor-pointer text-(--text-secondary)'
                                 onClick={ () => setShowDoctypeSelection(false) }>
                                <X/>
                            </div>
                        </div>
                        <div className='overflow-hidden'>
                            <DoctypesTree formId={ selectedFormId } canFolderBeSelected={ false }
                                          editor={ false } onSelect={ (node) => handleDoctypeChange(node) }
                                          onTmpSelect={ (node) => setTmpDoctype(node) }/>
                        </div>
                        <div className='mt-auto flex justify-end items-center gap-4 p-6'>
                            <Button variant={ "no_bg" } onClick={ () => setShowDoctypeSelection(false) }>
                                { t('GLOBAL.cancel') }
                            </Button>
                            <Button onClick={ () => handleDoctypeChange(tmpDoctype) } disabled={ !tmpDoctype }>
                                { t('GLOBAL.select') }
                            </Button>
                        </div>
                    </div>
                </>
            ) }

            <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-4'>
                    <h1 className="text-lg font-semibold">
                        { t('AI-DOCTYPES.details') }
                    </h1>

                    <div className='w-1/3'>
                        <DynamicForm errors={ errors } control={ control } schema={ modelSchema }/>
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    <h1 className="text-lg font-semibold">
                        { t('AI-DOCTYPES.choose_documents') }
                    </h1>

                    <div className='grid grid-cols-4 gap-4'>
                        { documents && documents.map((doc: any) => (
                            <Panel key={ doc.folder } header={
                                <div className='flex items-center font-semibold'>
                                    <span>{ doc.folder }</span>
                                    <span className='ml-auto'>
                                        <InputSwitch
                                            id={ doc.folder }
                                            checked={ doc.active }
                                            onChange={ (e) => handleEnableDocument(e, doc) }
                                        />
                                    </span>
                                </div>
                            }>
                                <div className='p-4'>
                                    { module === 'verifier' ? (
                                        <Select id={ 'workflow' } value={ doc.workflow_id }
                                                  label={ t('AI-DOCTYPES.workflow_associated') }
                                                  options={ workflows.map((wf: any) => ({
                                                      label: wf.label,
                                                      value: wf.workflow_id
                                                  })) }
                                                  onChange={ (value) => handleWorkflowChange(value, doc) }/>
                                    ) : (
                                        <div>
                                            <Select id={ 'form' } value={ doc.form }
                                                      label={ t('AI-DOCTYPES.form_associated') }
                                                      options={ forms.map((f: any) => ({
                                                          label: f.label,
                                                          value: f.id
                                                      })) }
                                                      onChange={ (value) => handleFormChange(value, doc) }/>

                                            <div
                                                className='relative mt-4 gap-4 cursor-pointer text-(--text-secondary) hover:text-(--color-primary)'
                                                onClick={ () => {
                                                    setSelectedDoc(doc);
                                                    setSelectedFormId(doc.form);
                                                    setShowDoctypeSelection(true);
                                                } }>
                                                { doctypes.find((dt: any) => dt.key === doc.doctype) ? (
                                                    <>
                                                        <p className='absolute -top-2 text-xs text-(--text-secondary) bg-(--bg-primary) px-1 rounded left-3'>
                                                            { t('AI-DOCTYPES.select_doctype') }
                                                        </p>
                                                        <Button variant="no_bg_border"
                                                                className='w-full justify-start px-4! text-(--text-primary)'>
                                                            <File size={ 18 }/>
                                                            <span>{ doctypes.find((dt: any) => dt.key === doc.doctype)?.label }</span>
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button variant="no_bg_border" disabled={ !doc.form }
                                                            className='w-full justify-start px-4!'>
                                                        { t('AI-DOCTYPES.click_to_select_doctype') }
                                                    </Button>
                                                ) }
                                            </div>
                                        </div>
                                    ) }
                                </div>
                            </Panel>
                        )) }
                    </div>
                </div>
                <div className="w-fit">
                    { aiDoctypeId ? (
                        <Button
                            onClick={ handleSubmit(handleModelUpdate) }
                            disabled={ loadingUpdate || Object.keys(errors).length > 0 }>
                            { loadingUpdate ? t('GLOBAL.updating') : t('AI-DOCTYPES.update') }
                        </Button>
                    ) : (
                        <Button
                            onClick={ handleSubmit(handleModelCreate) }
                            disabled={ loadingUpdate || Object.keys(errors).length > 0 }>
                            { loadingUpdate ? t('GLOBAL.creating') : t('AI-DOCTYPES.create') }
                        </Button>
                    ) }
                </div>
            </div>
        </div>
    );
}