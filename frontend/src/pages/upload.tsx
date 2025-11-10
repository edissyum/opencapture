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

import { useEffect, useState } from "react";

import UploadDropzone from "../components/upload/Dropzone";

import { useUser } from "../services/hooks/useUser";
import { axiosApiCall } from "../services/hooks/axiosApiCall";
import { t } from "i18next";
import { Button } from "../components/Button.tsx";

export function UploadPage() {
    const { get } = axiosApiCall();
    const { user, loadingUser } = useUser();

    const [module, setModule] = useState("");
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [files, setFiles] = useState<File[]>([]);

    const [progress, setProgress] = useState<Record<string, number>>({});

    const selectedModule = localStorage.getItem('selectedModule');
    if (selectedModule && selectedModule !== module) {
        setModule(selectedModule);
    }

    useEffect(() => {
        const handler = () => {
            const module = localStorage.getItem('selectedModule');
            if (module) {
                setModule(module);
            }
        };

        window.addEventListener("updateModule", handler);
        return () => window.removeEventListener("updateModule", handler);
    }, []);

    // Retrieve workflows list
    useEffect(() => {
        if (loadingUser || !selectedModule) return;

        const retrieveWorkflows = async () => {
            try {
                get(`workflows/${ selectedModule }/list/user/${ user.id }`).then((response) => {
                    setWorkflows(response.workflows);
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

    const handleFilesAccepted = () => {
        startFakeUpload(files);
    };

    return (
        <div className='flex h-full w-full overflow-hidden'>
            <div className='p-8 h-full w-[400px] border-r-2 border-(--border-secondary) bg-(--bg-primary)'>
                <h1 className='text-xl font-bold mb-4 truncate'>{ t('UPLOAD.select_workflows') }</h1>
            </div>
            <div className='p-8 w-full flex flex-col h-full'>
                {/*<h1 className='text-lg font-bold mb-4'>*/}
                {/*    { t('UPLOAD.upload') }*/}
                {/*</h1>*/}
                {/*<p className='mb-4 text-(--text-secondary)'>*/}
                {/*    { t('UPLOAD.upload_hint') }*/}
                {/*</p>*/}
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
            </div>
        </div>
    );
}