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
import { useParams } from "react-router-dom";
import { Scroller, Tabs } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Loader } from "../../../../components/loader/Loader";
import { useCallback, useEffect, useRef, useState } from "react";

import { AxiosApiCall } from "../../../../services/hooks/AxiosApiCall";
import { useCustomFields } from "../../../../services/hooks/useCustomFields";

import Input from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { showToast } from "../../../../components/ToastProvider";
import UploadDropzone from "../../../../components/upload/Dropzone";
import { DynamicForm } from "../../../../components/form/DynamicForm";
import { Annotator, type Region } from "../../../../components/Annotator";

import { b64ToFile } from "../../general/customization";

import { getAvailableFields } from "../forms/availableFieldsSchema";

export function SettingsVerifierPositionMaskEditor() {
    const { get, post, put } = AxiosApiCall();
    const { positionMaskId } = useParams<{ positionMaskId: any }>();

    const { customFields } = useCustomFields("verifier");
    const availableBillingFields = getAvailableFields(t)['billing'];

    const [currentPage, setCurrentPage] = useState(1);
    const [activeTabIndex, setActiveTabIndex] = useState('');

    const [forms, setForms] = useState<any[]>([]);
    const [positionMask, setPositionMask] = useState<any>({});
    const [regionsList, setRegionsList] = useState<any[]>([]);
    const [thirdPartyAccounts, setThirdPartyAccounts] = useState<any[]>([]);

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const thumbnailRef = useRef<string | null>(null);
    const setThumbnailSafe = useCallback((url: string | null) => {
        if (thumbnailRef.current) {
            URL.revokeObjectURL(thumbnailRef.current);
        }
        thumbnailRef.current = url;
        setThumbnail(url);
    }, []);

    const [loading, setLoading] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const [focusedField, setFocusedField] = useState<any>({});

    const detailsSchema: any = z.object({
        label: z.string().min(3).describe(JSON.stringify({
            component: "input",
            type: "text",
            required: true,
            label: t("GLOBAL.label")
        })),
        form_id: z.number().describe(JSON.stringify({
            component: "select",
            filter: true,
            options: forms.map(form => ({ label: form.label, value: form.id })),
            label: t("VERIFIER.associated_form")
        })),
        supplier_id: z.number().describe(JSON.stringify({
            component: "select",
            filter: true,
            options: thirdPartyAccounts.map(account => ({ label: account.name, value: account.id })),
            label: t("POSITIONS-MASKS.supplier")
        }))
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(detailsSchema),
        defaultValues: {},
        mode: "onChange"
    });

    // Fetch position mask details
    useEffect(() => {
        if (!positionMaskId || !customFields) return;

        const fetchPositionMaskDetails = async () => {
            try {
                const response = await get(`/positions_masks/getById/${ positionMaskId }`);
                setPositionMask(response);

                Object.keys(response).forEach((field: any) => {
                    if (detailsSchema.shape[field]) {
                        setValue(field, response[field]);
                    }
                });

                if (response.filename) {
                    await getThumbnail(response.filename);
                }

                if (response.positions) {
                    const regions: any = [];
                    Object.keys(response.positions).forEach((key: any) => {
                        let field: any = availableBillingFields.find((f: any) => f.id === key);
                        if (key.startsWith('custom_')) {
                            field = customFields.find((f: any) => `custom_${ f.id }` === key);
                        }

                        const region = {
                            id: key,
                            label: field?.label,
                            x: response.positions[key].x,
                            y: response.positions[key].y,
                            page: response.pages[key] || 1,
                            color: field?.color || '#000000',
                            width: response.positions[key].width,
                            height: response.positions[key].height
                        }
                        if (regions.find((r: any) => r.id === region.id)) return;

                        regions.push(region);
                    });
                    setRegionsList(regions);
                }

            } catch (error) {
                console.error("Error fetching position mask details:", error);
            }
        }

        fetchPositionMaskDetails().then();
    }, [positionMaskId, customFields]);

    // Fetch forms
    // Fetch third party accounts
    useEffect(() => {
        const fetchForms = async () => {
            try {
                const response = await get(`/forms/verifier/list`);
                setForms(response.forms);
            } catch (error) {
                console.error("Error fetching forms:", error);
            }
        }

        const fetchThirdPartyAccounts = async () => {
            try {
                const response = await get(`/accounts/suppliers/list`);
                setThirdPartyAccounts(response.suppliers);
            } catch (error) {
                console.error("Error fetching third party accounts:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchForms().then();
        fetchThirdPartyAccounts().then();
    }, []);

    const handleCreate = async (data: any) => {
        setLoadingSubmit(true);
        try {
            await post(`/positions_masks/add`, data);
            showToast(t('POSITIONS-MASKS.created'), 'success');
        } catch (error) {
            console.error("Error creating position mask:", error);
        } finally {
            setLoadingSubmit(false);
        }
    }

    const handleUpdate = async (data: any) => {
        setLoadingSubmit(true);
        try {
            await put(`/positions_masks/update/${ positionMaskId }`, data);
            showToast(t('POSITIONS-MASKS.details_update_success'), 'success');
        } catch (error) {
            console.error("Error updating position mask:", error);
        } finally {
            setLoadingSubmit(false);
        }
    }

    const handleUpload = async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];

        const formData = new FormData();
        formData.append(file.name, file);

        try {
            const response = await post(`/positions_masks/getImageFromPdf/${ positionMaskId }`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setPositionMask((prev: any) => ({
                ...prev,
                width: response.width,
                filename: response.filename,
                nb_pages: response.nb_pages
            }));
            const blob = b64ToFile('data:image/jpg;base64,' + response.file);
            setThumbnailSafe(URL.createObjectURL(blob));
        } catch (error) {
            console.error("Error uploading position mask zones:", error);
        }
    }

    const handleEnd = async (activeRegion: string, regions: Region[]) => {
        if (regions.length === 0 || !activeRegion) return;

        const activeRegionData: any = regions.find((region: any) => region.id === activeRegion);
        const payload = {
            y: activeRegionData.y,
            x: activeRegionData.x,
            width: activeRegionData.width,
            height: activeRegionData.height
        }

        try {
            await put(`/positions_masks/updatePositions/${ positionMaskId }`, { [activeRegion]: payload });
            await put(`/positions_masks/updatePages/${ positionMaskId }`, { [activeRegion]: activeRegionData.page });

            showToast(t('POSITIONS-MASKS.zone_update_success'), 'success');
        } catch (error) {
            console.error("Error updating position mask zone:", error);
        }

        return;
    }

    const handlePrev = async () => {
        if (currentPage > 1) {
            await changePage(currentPage - 1);
        }
    };

    const handleNext = async () => {
        if (currentPage < positionMask.nb_pages) {
            await changePage(currentPage + 1);
        }
    };

    const changePage = async (page: number) => {
        const extension = positionMask.filename.split('.').pop();
        const oldCpt = String(currentPage).padStart(3, '0');
        const newCpt = String(page).padStart(3, '0');
        const newFilename = positionMask.filename.replace(`-${ oldCpt }.${ extension }`, `-${ newCpt }.${ extension }`);
        await getThumbnail(newFilename);
        setCurrentPage(page);
    }

    const getThumbnail = async (filename: any) => {
        try {
            const response = await post('/verifier/getThumb', {
                'type': 'positions_masks',
                'filename': filename
            });
            const blob = b64ToFile('data:image/jpg;base64,' + response.file);
            setThumbnailSafe(URL.createObjectURL(blob));
        } catch (error) {
            console.error("Error fetching position mask thumbnail:", error);
        }
    }

    const updateRegex = async (fieldId: string, regex: string) => {
        if (!fieldId || !regex) return;

        const payload = { ...positionMask.regex, [fieldId]: regex };
        try {
            await put(`/positions_masks/update/${ positionMaskId }`, { regex: JSON.stringify(payload) });
            showToast(t('POSITIONS-MASKS.regex_update_success'), 'success');
        } catch (error) {
            console.error("Error updating regex:", error);
        }
    }

    if (loading) return <Loader/>;

    return (
        <div className="flex h-full">
            <Tabs defaultValue='details' onChange={ (e: any) => setActiveTabIndex(e) }>
                <Tabs.List>
                    <Tabs.Tab value="details">{ t('POSITIONS-MASKS.mask_details') }</Tabs.Tab>
                    <Tabs.Tab value="zones">{ t('POSITIONS-MASKS.zones') }</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="details" className="bg-(--bg-primary)!">
                    <div className='flex flex-col gap-4 p-6 w-1/3'>
                        <h1 className="text-lg font-bold">{ t('SETTINGS.general') }</h1>
                        <DynamicForm schema={ detailsSchema } control={ control } errors={ errors }/>

                        <div>
                            { positionMaskId ? (
                                <Button onClick={ handleSubmit(handleUpdate) }
                                        disabled={ loadingSubmit || Object.keys(errors).length > 0 }>
                                    { loadingSubmit ? t('GLOBAL.updating') : t('POSITIONS-MASKS.update_mask') }
                                </Button>
                            ) : (
                                <Button onClick={ handleSubmit(handleCreate) }
                                        disabled={ loadingSubmit || Object.keys(errors).length > 0 }>
                                    { loadingSubmit ? t('GLOBAL.creating') : t('POSITIONS-MASKS.create_mask') }
                                </Button>
                            ) }
                        </div>
                    </div>
                </Tabs.Panel>
                <Tabs.Panel value="zones">
                    <div className='p-6 h-full'>
                        { thumbnail ? (
                            <div className=''>
                                <div className="size-fit flex gap-3 bg-(--bg-primary) p-3 rounded-full
                                                cursor-pointer border border-(--border-secondary)">
                                    <button onClick={ handlePrev }
                                            disabled={ currentPage === 1 }
                                            className={ `cursor-pointer rounded-full transition-colors
                                                    ${ currentPage === 1 ? "text-(--text-secondary) cursor-not-allowed"
                                                : "hover:bg-(--bg-secondary) text-(--text-primary)" }` }
                                    >
                                        <ChevronLeft size={ 16 }/>
                                    </button>

                                    <span className="whitespace-nowrap">
                                        { t('VERIFIER.page') } { currentPage } / { positionMask.nb_pages || 1 }
                                    </span>

                                    <button
                                        onClick={ handleNext }
                                        disabled={ currentPage === positionMask.nb_pages }
                                        className={ `cursor-pointer rounded-full transition-colors 
                                                     ${ currentPage === positionMask.nb_pages ? "text-(--text-secondary) cursor-not-allowed"
                                            : "hover:bg-(--bg-secondary) text-(--text-primary)" }` }>
                                        <ChevronRight size={ 16 }/>
                                    </button>
                                </div>

                                <div className='h-full flex flex-col items-center rounded-xl -mt-12'>
                                    <div className="border border-(--border-secondary) rounded-xl h-full w-1/2">
                                        <Annotator
                                            currentPage={ currentPage }
                                            alt={ `Page ${ currentPage }` }
                                            imageB64={ thumbnail }
                                            originalWidth={ positionMask.width }
                                            regionsList={ regionsList }
                                            focusedField={ focusedField }
                                            onEnd={ handleEnd }
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <UploadDropzone
                                accept={ {
                                    "application/*": [".pdf"],
                                } }
                                maxFiles={ 1 }
                                showPreview={ false }
                                maxSize={ 10 * 1024 * 1024 }
                                onFilesAccepted={ handleUpload }
                                className="bg-(--bg-primary)"
                            />
                        ) }
                    </div>
                </Tabs.Panel>
            </Tabs>

            { activeTabIndex === 'zones' && (
                <div className="shrink-0 w-[20rem] flex flex-col border-l border-(--border-secondary)">
                    <Tabs defaultValue='facturation'>
                        <Tabs.List>
                            <Scroller>
                                <Tabs.Tab value='facturation'>
                                    { t('FORMS.facturation') }
                                </Tabs.Tab>
                                <Tabs.Tab value='custom_fields'>
                                    { t('VERIFIER.custom_fields_other') }
                                </Tabs.Tab>
                            </Scroller>
                        </Tabs.List>
                        <Tabs.Panel value="facturation" className="bg-(--bg-primary)!">
                            { availableBillingFields.map((field: any) => (
                                <div key={ field.id }
                                     onClick={ () => setFocusedField(field) }
                                     className="p-3 flex flex-col gap-4 hover:bg-(--bg-secondary) cursor-pointer rounded border-b
                                                border-(--border-secondary)">
                                    { t(field.label) }
                                    <Input id={ `regex-${ field.id }` } label={ t('POSITIONS-MASKS.regex_associated') }
                                           type="text" name={ field.id } value={ positionMask.regex[field.id] || '' }
                                           onBlur={ (e: any) => {
                                               updateRegex(field.id, e.target.value).then()
                                           } }
                                    />
                                </div>
                            )) }
                        </Tabs.Panel>
                        <Tabs.Panel value="custom_fields" className="bg-(--bg-primary)!">
                            { customFields.map((field: any) => (
                                <div key={ `custom_${ field.id }` }
                                     onClick={ () => {
                                         if (!field.id.toString().startsWith('custom_')) {
                                             field.id = `custom_${ field.id }`;
                                         }
                                         setFocusedField(field)
                                     } }
                                     className="p-3 flex flex-col gap-4 hover:bg-(--bg-secondary) cursor-pointer rounded border-b
                                                border-(--border-secondary)">
                                    { t(field.label) }
                                    <Input id={ `regex-${ field.id }` } label={ t('POSITIONS-MASKS.regex_associated') }
                                           type="text" name={ `custom_${ field.id }` }
                                           onBlur={ (e: any) => {
                                               updateRegex(field.id, e.target.value).then()
                                           } }
                                           value={ positionMask.regex[`custom_${ field.id }`] }/>
                                </div>
                            )) }
                        </Tabs.Panel>
                    </Tabs>
                </div>
            ) }
        </div>
    );
}