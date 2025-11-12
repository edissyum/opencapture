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
import { useEffect, useState } from "react";
import { Check, Wrench } from "lucide-react";

import { useUser } from "../services/hooks/useUser";
import { axiosApiCall } from "../services/hooks/axiosApiCall";

import { Button } from "../components/Button";
import UploadDropzone from "../components/upload/Dropzone";
import { Loader } from "../components/loader/Loader.tsx";
import { showToast } from "../components/ToastProvider.tsx";

export function UploadPage() {
    const { get, post } = axiosApiCall();
    const { user, loadingUser } = useUser();

    const [module, setModule] = useState("");

    const [timeout, setTimeout] = useState(2000);

    const [workflows, setWorkflows] = useState<any[]>([]);
    const [workflowLoading, setWorkflowLoading] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);

    const [files, setFiles] = useState<File[]>([]);
    const [sending, setSending] = useState(false);
    const [progress, setProgress] = useState<Record<string, number | undefined>>({});

    const selectedModule = localStorage.getItem('selectedModule');
    if (selectedModule && selectedModule !== module) {
        setModule(selectedModule);
    }

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
                    if (response && response.configuration) {
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
                    setWorkflowLoading(false);
                });
            } catch (error) {
                console.error("Error retrieving workflows:", error);
            }
        }

        retrieveWorkflows().then();
    }, [loadingUser, selectedModule]);

    const startFakeUpload = (newFiles: File[]) => {
        newFiles.forEach((file) => {
            let p = 0;

            const interval = setInterval(() => {
                p += Math.floor(Math.random() * 15) + 5; // avance un peu comme un paresseux enthousiaste

                if (p >= 100) {
                    p = 100;
                    clearInterval(interval);
                }

                setProgress((prev) => ({
                    ...prev,
                    [file.name]: p
                }));
            }, 150);
        });
    };

    const handleUpload = async () => {
        if (files.length === 0 || !selectedWorkflow) return;

        setSending(true);
        const res = await checkFiles(files);
        console.log(res);
        if (res !== undefined) {
            await upload(files);
        }
        setSending(false);
        console.log('here')
    };

    async function upload(filesToUpload: File[]) {
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
                            [file.name]: progressEvent
                        }));
                    }
                });
                cpt += 1;
                if (cpt === filesToUpload.length) {
                    setFiles([]);
                    showToast(t('UPLOAD.upload_success'), "success");
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

    return (
        <div className='flex h-full w-full overflow-hidden'>
            <div className='pb-20 h-full w-[350px] shrink-0 border-r-2 border-(--border-secondary) bg-(--bg-primary)'>
                <h1 className='px-6 pt-6 text-xl font-bold mb-4 truncate flex items-center gap-2'>
                    <Wrench size={ 20 } className='text-(--color-primary)'/>
                    { t('UPLOAD.select_workflows') }
                </h1>
                <div className='px-6 flex flex-col gap-2 overflow-y-auto h-full'>
                    {
                        workflowLoading && (
                            <Loader/>
                        )
                    }
                    { workflows.map((workflow) => (
                        <div key={ workflow.id }
                             onClick={ () => setSelectedWorkflow(workflow.workflow_id) }
                             className={ `cursor-pointer flex items-center gap-1 border-2 border-(--border-secondary) 
                                          rounded-md p-2 hover:border-(--color-primary)
                                          ${ selectedWorkflow === workflow.id ? 'text-(--color-primary) font-semibold bg-(--color-primary)/10' : '' }` }>
                            { selectedWorkflow === workflow.workflow_id && (
                                <Check size={ 18 } className='shrink-0'/>
                            ) }
                            <p className='truncate'>{ workflow.label }</p>
                        </div>
                    )) }
                </div>
            </div>
            <div className='p-8 w-full flex flex-col h-full'>
                <h1 className='text-lg font-bold mb-2'>
                    { t('UPLOAD.upload') }
                </h1>
                <p className='mb-4 text-(--text-secondary)'>
                    { t('UPLOAD.upload_hint') }
                </p>
                <UploadDropzone
                    accept={ {
                        "application/*": [".pdf"],
                        "image/*": [".jpg", ".jpeg", ".png", ".heif", ".heic"]
                    } }
                    progressByFile={ progress }
                    onFilesAccepted={ setFiles }
                    maxSize={ 10 * 1024 * 1024 }
                    className="bg-(--bg-primary)"
                />
                <Button className="mt-4 w-fit" onClick={ handleUpload }
                        disabled={ files.length === 0 || !selectedWorkflow || sending }>
                    { t('UPLOAD.upload_files', { count: files.length }) }
                </Button>
            </div>
        </div>
    );
}