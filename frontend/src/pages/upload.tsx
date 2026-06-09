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

import { t } from "i18next";
import { Pencil, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useUser } from "../services/hooks/useUser";
import { axiosApiCall } from "../services/hooks/axiosApiCall";

import { Button } from "../components/Button";
import { Loader } from "../components/loader/Loader";
import { showToast } from "../components/ToastProvider";
import UploadDropzone from "../components/upload/Dropzone";

export function UploadPage() {
    const { get, post } = axiosApiCall();
    const { user, loadingUser } = useUser();

    const [module, setModule] = useState("");
    const [timeout, setTimeout] = useState(2000);

    const [workflows, setWorkflows] = useState<any[]>([]);
    const [workflowLoading, setWorkflowLoading] = useState(true);
    const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

    const [files, setFiles] = useState<File[]>([]);
    const [sending, setSending] = useState(false);
    const [completedFiles, setCompletedFiles] = useState<string[]>([]);
    const [progress, setProgress] = useState<Record<string, number | undefined>>({});

    const selectedModule = localStorage.getItem('selectedModule');
    if (selectedModule && selectedModule !== module) {
        setModule(selectedModule);
    }

    const [showAllWorkflows, setShowAllWorkflows] = useState(false);
    const [canExpandWorkflows, setCanExpandWorkflows] = useState(false);
    const workflowsWrapRef = useRef<HTMLDivElement | null>(null);

    const filteredWorkflows = workflows.filter(w => !w?.process?.api_only);

    useEffect(() => {
        const el = workflowsWrapRef.current;
        if (!el) return;

        // Détecte si le contenu dépasse la hauteur repliée
        setCanExpandWorkflows(el.scrollHeight > 44);
    }, [filteredWorkflows, showAllWorkflows]);

    useEffect(() => {
        const handler = () => {
            const module = localStorage.getItem('selectedModule');
            if (module) {
                setFiles([]);
                setModule(module);
                setWorkflows([]);
                setSelectedWorkflow(null);
            }
        };

        window.addEventListener("updateModule", handler);
        return () => window.removeEventListener("updateModule", handler);
    }, []);

    // Retrieve timeout setting
    useEffect(() => {
        const retrieveTimeout = async () => {
            try {
                get(`config/getConfigurationNoAuth/timeoutUpload`).then((response) => {
                    if (response && response.configuration && response.configuration.length > 0) {
                        setTimeout(response.configuration[0].data.value);
                    }
                });
            } catch (error) {
                console.error("Error retrieving timeout:", error);
            }
        }

        retrieveTimeout().then();
    }, []);

    // Retrieve workflows list
    useEffect(() => {
        if (loadingUser || !selectedModule) return;

        const retrieveWorkflows = async () => {
            setWorkflowLoading(true);
            try {
                get(`workflows/${ selectedModule }/list/user/${ user.id }`).then((response) => {
                    setWorkflows(response.workflows);
                    if (response.workflows.length == 1) {
                        setSelectedWorkflow(response.workflows[0].workflow_id);
                    }

                    setWorkflowLoading(false);
                });
            } catch (error) {
                console.error("Error retrieving workflows :", error);
            }
        }

        retrieveWorkflows().then();
    }, [loadingUser, selectedModule]);

    const handleUpload = async () => {
        if (files.length === 0 || !selectedWorkflow) return;

        setSending(true);
        const res = await checkFiles(files);
        if (res !== undefined) {
            await upload(files);
        }
        setSending(false);
    };

    async function upload(filesToUpload: any[]) {
        let cpt = 0;
        for (const file of filesToUpload) {
            const formData = new FormData();
            formData.append("files", file);
            formData.append("userId", user.id);
            formData.append("workflowId", selectedWorkflow);

            try {
                await post(`/${ module }/upload`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    onUploadProgress: (progressEvent) => {
                        setProgress((prev) => ({
                            ...prev,
                            [file.id]: progressEvent
                        }));
                    }
                });
                setCompletedFiles(prev => [...prev, file.id]);
                cpt += 1;
                if (cpt === filesToUpload.length) {
                    setFiles([]);
                    showToast(t('UPLOAD.upload_success', { count: filesToUpload.length }), "success");
                }
            } catch (error) {
                setProgress((prev => ({
                    ...prev,
                    [file.name]: undefined
                })));
                console.error("Error upload file:", error);
            }
        }
    }

    async function checkFiles(filesToCheck: File[]) {
        const formData = new FormData();
        for (const file of filesToCheck) {
            formData.append("files", file);
        }

        try {
            return await post("/checkFileBeforeUpload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: timeout
            });
        } catch (error) {
            console.error("Error checking files before upload:", error);
        }
    }

    if (workflowLoading) return <Loader/>;

    return (
        <div className='flex h-full w-full overflow-hidden justify-center'>
            <div className='p-6 w-4/5 flex flex-col h-full overflow-auto gap-4'>
                <div>
                    <h1 className='text-lg font-bold'>
                        { t('UPLOAD.upload') }
                    </h1>
                    <p className='text-(--text-secondary)'>
                        { t('UPLOAD.upload_hint') }
                    </p>
                </div>

                <div
                    className='bg-(--bg-primary) py-4 px-6 rounded-md border border-(--border-secondary) flex flex-col gap-4'>
                    <div className='flex items-center gap-4'>
                        <div className='rounded-full bg-(--color-primary) size-6 flex items-center justify-center
                                        text-white font-semibold'
                        >
                            1
                        </div>
                        <div className='flex flex-col'>
                            <span>{ t('UPLOAD.select_workflow') }</span>
                            <span className='text-(--text-secondary) text-sm'>{ t('UPLOAD.select_workflow_hint') }</span>
                        </div>
                        <div className='ml-auto'>
                            { selectedWorkflow && (
                                <div onClick={ () => setSelectedWorkflow(null) }
                                    className='flex items-center gap-2 bg-(--bg-selected) px-2 py-1 rounded-md text-sm
                                               border-(--border-primary) border text-(--color-primary) font-semibold
                                               cursor-pointer '>
                                    <Pencil size={ 16 }/>
                                    { workflows.find(w => w.workflow_id === selectedWorkflow)?.label }
                                </div>
                            ) }
                        </div>
                    </div>
                    <div
                        className={ `flex flex-col gap-2 transition-all ${ !selectedWorkflow ? "max-h-auto" : "hidden" }` }>
                        <div
                            ref={ workflowsWrapRef }
                            className={ `flex flex-wrap gap-2 overflow-hidden transition-all ${
                                showAllWorkflows ? "max-h-[999px]" : "max-h-[44px]"
                            }` }
                        >
                            { filteredWorkflows.map((workflow) => (
                                <div
                                    key={ workflow.id }
                                    onClick={ () => setSelectedWorkflow(workflow.workflow_id) }
                                    className={ `flex items-center gap-1 p-2 border border-(--border-secondary) rounded-md cursor-pointer 
                                                 hover:border-(--border-primary) transition-colors min-w-0
                                                 ${ selectedWorkflow === workflow.workflow_id ? 'text-(--color-primary) border-(--color-primary) font-semibold bg-(--bg-selected)' : '' }` }
                                >
                                    <p className='truncate select-none whitespace-nowrap'>{ workflow.label }</p>
                                </div>
                            )) }
                        </div>

                        { canExpandWorkflows && (
                            <button
                                type="button"
                                onClick={ () => setShowAllWorkflows((v) => !v) }
                                className='text-sm text-(--text-secondary) cursor-pointer w-fit'
                            >
                                { showAllWorkflows ? (
                                    t('UPLOAD.show_less')
                                ) : (
                                    <div className='flex items-center'>
                                        <RotateCcw size={ 16 } className='inline-block mr-1'/>
                                        { t('UPLOAD.show_more') }
                                    </div>
                                ) }
                            </button>
                        ) }
                    </div>
                </div>

                <div className={ `bg-(--bg-primary) py-4 px-6 rounded-md border border-(--border-secondary) flex flex-col 
                                  gap-4 ${ !selectedWorkflow ? 'opacity-50 pointer-events-none' : '' }` }>
                    <div className='flex items-center gap-4'>
                        <div className='rounded-full bg-(--color-primary) size-6 flex items-center justify-center
                                        text-white font-semibold'
                        >
                            2
                        </div>
                        <div className='flex flex-col'>
                            <span>{ t('UPLOAD.add_document') }</span>
                            <span className='text-(--text-secondary) text-sm'>{ t('UPLOAD.add_document_hint') }</span>
                        </div>
                    </div>

                    <UploadDropzone
                        accept={ {
                            "application/*": [".pdf"],
                            "image/*": [".jpg", ".jpeg", ".png", ".heif", ".heic"]
                        } }
                        progressByFile={ progress }
                        completedFiles={ completedFiles }
                        onFilesAccepted={ setFiles }
                        maxSize={ 10 * 1024 * 1024 }
                        className="bg-(--bg-primary)"
                    />
                </div>
                <div className="w-fit">
                    <Button onClick={ handleUpload }
                            disabled={ files.length === 0 || !selectedWorkflow || sending }>
                        { t('UPLOAD.upload_files', { count: files.length }) }
                    </Button>
                </div>
            </div>
        </div>
    );
}