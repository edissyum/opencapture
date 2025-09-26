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

import UploadDropzone from "../../../components/upload/Dropzone";
import { CheckOverlay } from "../../../components/CheckOverlay";
import { ThemeSelection } from "../../../components/onboarding/ThemeSelection";

import { axiosApiCall } from "../../../services/hooks/axiosApiCall";
import { LangSelection } from "../../../components/onboarding/LangSelection.tsx";
import { useTranslation } from "react-i18next";

function b64toBlob(b64Data: string) {
    const byteString = atob(b64Data.split(',')[1]);
    const mimeString = b64Data.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    return new File([blob], "appImage", { type: mimeString });
}

export function SettingsGeneralCustomization() {
    const { t } = useTranslation();
    const { get, put } = axiosApiCall();

    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const defaultImage = "/src/assets/imgs/login_image.svg"

    if (files.length === 0) {
        fetch(defaultImage).then(res => {
            if (res.ok) {
                res.blob().then(blob => {
                    const file = new File([blob], "defaultLoginImage.svg", { type: blob.type });
                    setFiles([file]);
                    setSelectedIndex(0);
                });
            }
        });
    }

    useEffect(() => {
        let cancelled = false;

        async function fetchImage() {
            const currentAppImage = localStorage.getItem('appImage');
            if (currentAppImage) {
                const imageFile = b64toBlob(currentAppImage);

                // Avoid adding duplicate of the same default Open-Capture image
                if (files.length > 0) {
                    if (imageFile.size === files[0].size && imageFile.type === files[0].type) {
                        return;
                    }
                }
                setFiles(() => [imageFile, ...files]);
                return;
            }

            if (!loading) {
                try {
                    setLoading(true);
                    const response = await get('config/getLoginImage');

                    if (cancelled) return;

                    const imageFile = b64toBlob('data:image/svg-xml;base64,' + response)
                    console.log(imageFile);
                    setFiles(() => [imageFile, ...files]);
                } catch (e) {
                    setLoading(false);
                    console.error("Error fetching default image:", e);
                    return;
                } finally {
                    if (!cancelled) setLoading(false);
                }
            }
        }

        if (files.length <= 1) {
            fetchImage().then(() => {
                setLoading(false)
            });
        }

        return () => {
            cancelled = true;
        };
    }, [get]);

    const storeAndUpdateAppImage = (file: File) => {
        const reader = new FileReader();

        reader.onload = () => {
            const b64Data = reader.result as string;
            localStorage.setItem('appImage', b64Data);

            put('config/updateLoginImage', {image_content: b64Data}).then();
            window.dispatchEvent(new Event('appImageChanged'))
        };
        reader.readAsDataURL(file);
    }

    const handleSelectedIndex = (index: number) => {
        setSelectedIndex(index);

        storeAndUpdateAppImage(files[index]);
    };

    const handleNewAppImage = (file: File) => {
        if (!file) return;
        setFiles([file, ...files]);
        storeAndUpdateAppImage(file);
    }

    return (
        <div>
            <h2>{ t('CUSTOMIZATION.theme') }</h2>
            <p className='text-(--text-secondary)'>{ t('CUSTOMIZATION.theme_description') }</p>
            <div className="flex">
                <ThemeSelection />
            </div>

            <hr className='my-6 text-(--border-secondary)'/>

            <h2>{ t('CUSTOMIZATION.app_image') }</h2>
            <p className='text-(--text-secondary) mb-4'>{ t('CUSTOMIZATION.app_image_description') }</p>
            <div className="w-1/2">
                <UploadDropzone
                    accept={{"image/*": [".jpg", ".jpeg", ".png", ".svg"]}}
                    showPreview={false}
                    maxFiles={1}
                    maxSize={2 * 1024 * 1024}
                    onFilesAccepted={(files) => handleNewAppImage(files[0])}
                />
            </div>
            <div className="flex items-start gap-4 h-40 mb-12">
                {!loading && files.length !== 0 && (
                    <>
                        {
                            files.map((file, index) => (
                                <div key={index} onClick={() => handleSelectedIndex(index)}
                                     className="h-full grow-0 justify-center items-center cursor-pointer relative mt-4 border-(--border-primary) border rounded-lg p-4">
                                    <CheckOverlay show={selectedIndex === index}/>
                                    <img className="h-full" src={URL.createObjectURL(file)} alt={file.name}/>
                                </div>
                            ))
                        }
                    </>
                )}
            </div>

            <hr className='my-6 text-(--border-secondary)'/>

            <h2>{ t('CUSTOMIZATION.application_lang') }</h2>
            <p className='text-(--text-secondary)'>{ t('CUSTOMIZATION.application_lang_description') }</p>
            <div className="flex mt-4">
                 <LangSelection />
            </div>
        </div>
    );
}
