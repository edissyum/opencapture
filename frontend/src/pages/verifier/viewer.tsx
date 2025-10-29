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
import moment from "moment";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download, Eye, EyeOff } from "lucide-react";

import { Accordion, AccordionTab } from "primereact/accordion";

import Input from "../../components/Input";
import { Loader } from "../../components/loader/Loader";
import { ZoomControl } from "../../components/ZoomControl";
import { Annotator, type Region } from "../../components/Annotator";

import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { useFormFields } from "../../services/hooks/useFormFields";
import { useCustomFields } from "../../services/hooks/useCustomFields";

export function VerifierViewerPage() {
    const { get, post, put } = axiosApiCall();
    const { documentId } = useParams<{ documentId: string }>();

    const [documentData, setDocumentData] = useState<any>(null);
    const [loadingUpdateData, setLoadingUpdateDocumentData] = useState<boolean>(false);
    const [tmpDocumentData, setTmpDocumentData] = useState<any>(null);

    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

    const { customFields, loading: loadingCustom } = useCustomFields("verifier");
    const { formFields, loading: loadingFormFields } = useFormFields(documentData ? documentData.form_id : 0);

    const [fieldsZone, setFieldsZone] = useState(() => ([
        { id: "supplier", name: t('FORMS.supplier'), lines: [] as any[] },
        { id: "lines", name: t('VERIFIER.lines'), lines: [] as any[] },
        { id: "facturation", name: t('FORMS.facturation'), lines: [] as any[] },
        { id: "other", name: t('FORMS.other'), lines: [] as any[] }
    ]));

    const patterns: any = {
        alphanum: '^[\\-?0-9a-zA-Z\\s\'‘]*$',
        alphanum_extended: '^[\\-?0-9a-zA-Z\\\/#,\\.\'‘\\s\\(\\)_\\+:]*$',
        alphanum_extended_with_accent: '^[\\-?0-9a-zA-Z\\u00C0-\\u017F\\\/#,\'‘\\.\\s\\(\\)_&°"%\\+:€$£]*$',
        number_int: '^[\\-?0-9]*$',
        number_float: '^[\\-?0-9]*([.][0-9]*)*$',
        char: '^[A-Za-z\\s]*$',
        email: '^[A-Za-z0-9._\%+\\-]{1,64}@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,252}$'
    };

    const [pagesList, setPagesList] = useState<number[]>([]);
    const totalPages = pagesList.length;

    const [zoom, setZoom] = useState(100);
    const [indicatorsVisible, setIndicatorsVisible] = useState<boolean>(true);

    const [regionsList, setRegionsList] = useState<any[]>([]);
    const [focusedField, setFocusedField] = useState<any>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [currentFilename, setCurrentFilename] = useState<string>("");
    const [pagesImageB64, setPagesImageB64] = useState<{ [key: number]: string }>({});

    const lang = localStorage.getItem("selectedLang") || "en";
    moment.locale(lang.startsWith("fr") ? "fr" : lang.startsWith("es") ? "es" : "en");

    useEffect(() => {
        const fetchDocumentData = async () => {
            try {
                get(`verifier/documents/${ documentId }`, {}).then((response) => {
                    setDocumentData(response);
                    setTmpDocumentData(response);
                    setCurrentFilename(response.full_jpg_filename);
                    setPagesList([...Array(response.nb_pages).keys()].map(i => i + 1));
                });
            } catch (error) {
                console.error("Error fetching document data:", error);
            }
        };
        fetchDocumentData().then();
    }, [documentId]);

    useEffect(() => {
        if (!documentData || formFields.length === 0) return;

        Object.keys(documentData.datas).forEach((fieldId) => {
            const fieldValue = documentData.datas[fieldId];

            Object.keys(formFields).forEach((parent: any) => {
                formFields[parent].forEach((line: any) => {
                    line.forEach((field: any) => {
                        if (field.id === fieldId) {
                            if (field.format === 'date' && fieldValue && typeof fieldValue === 'string') {
                                let value: any = fieldValue.replaceAll('.', '/');
                                value = value.replaceAll(',', '/');
                                value = value.replaceAll(' ', '/');
                                const format = moment().localeData().longDateFormat('L');
                                const tmpValue = value;
                                value = moment(value, format);
                                value = new Date(value._d);
                                if (value.toString() === 'Invalid Date') {
                                    value = moment(tmpValue, 'YYYY-MM-DD');
                                    value = new Date(value._d);
                                }
                                setDocumentData((prevData: any) => ({
                                    ...prevData,
                                    datas: {
                                        ...prevData.datas,
                                        [fieldId]: value
                                    }
                                }));

                            }
                        }
                    });
                });
            });
        });

    }, [documentData, loadingFormFields, formFields])

    useEffect(() => {
        if (!documentData) return;

        if (pagesImageB64[currentPage]) {
            return;
        }

        const fetchDocumentPages = async (page: number) => {
            try {
                const data = {
                    "type": 'full',
                    "documentId": documentId,
                    "filename": currentFilename,
                    "registerDate": documentData.register_date
                }
                post('verifier/getThumb', data).then((response) => {
                    setPagesImageB64(prev => ({ ...prev, [page]: 'data:image/jpeg;base64,' + response.file }));
                });
            } catch (error) {
                console.error(`Error fetching page ${ page } data:`, error);
            }
        };
        fetchDocumentPages(currentPage).then();
    }, [documentData, currentFilename]);

    // Create regions of ocr on fly
    useEffect(() => {
        if (!documentData || loadingCustom || loadingFormFields || formFields.length === 0) return;

        if (regionsList.length > 0) return;
        Object.keys(documentData.positions).forEach((position) => {
            let label = '';
            const pos = documentData.positions[position];
            if (!pos) return;

            if (position.includes('custom_')) {
                label = customFields.find((field) => `custom_${ field.id }` === position)?.label || position;
            } else {
                Object.keys(formFields).forEach((parent: any) => {
                    formFields[parent].forEach((line: any) => {
                        line.forEach((field: any) => {
                            if (field.id === position) {
                                label = t(field.label);
                            }
                        });
                    });
                });
            }

            const page = documentData.pages[position] || 1;
            const newRegion = {
                id: position,
                page: page,
                x: pos.x,
                y: pos.y,
                width: pos.width,
                height: pos.height,
                label: label,
                color: '#1faa60'
            };

            Object.keys(formFields).forEach((parent: any) => {
                formFields[parent].forEach((line: any) => {
                    line.forEach((field: any) => {
                        if (field.id === position) {
                            newRegion.color = field.color;
                        }
                    });
                });
            });
            setRegionsList((prevRegions) => [...prevRegions, newRegion]);
        });
    }, [documentData, loadingCustom, loadingFormFields, customFields, formFields]);

    useEffect(() => {
        if (loadingFormFields || formFields.length === 0) return;

        setFieldsZone((prevZones) => {
            const newZones = prevZones.map(zone => ({
                ...zone,
                lines: [...zone.lines],
            }));
            Object.keys(formFields).forEach((parentKey: any) => {
                const zoneIndex = newZones.findIndex(z => z.id === parentKey);
                if (zoneIndex === -1) {
                    return;
                }

                if (formFields[parentKey] !== null) {
                    formFields[parentKey].forEach((line: any) => {
                        newZones[zoneIndex].lines.push(line);
                    });
                }
            });
            return newZones;
        });
    }, [loadingFormFields, formFields]);

    const handlePrev = () => {
        if (currentPage > 1) {
            changePage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            changePage(currentPage + 1);
        }
    };

    const changePage = (page: number) => {
        const extension = currentFilename.split('.').pop();
        const oldCpt = String(currentPage).padStart(3, '0');
        const newCpt = String(page).padStart(3, '0');
        const newFilename = currentFilename.replace(`-${ oldCpt }.${ extension }`, `-${ newCpt }.${ extension }`);
        setCurrentPage(page);
        setCurrentFilename(newFilename);
    }

    const handleDownloadOriginalFile = () => {
        if (!documentData) return;

        const fetchAndDownload = async () => {
            try {
                post(`verifier/getOriginalFile/${ documentId }`, {}).then((response) => {
                    const link = document.createElement('a');
                    link.href = `data:${ response.mime };base64,` + response.file;
                    link.download = documentData.original_filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                });
            } catch (error) {
                console.error("Error downloading original file:", error);
            }
        };
        fetchAndDownload().then();
    };

    const handleChangeIndicatorsVisible = () => {
        setIndicatorsVisible(!indicatorsVisible);
        const annotations = document.querySelectorAll('.annotation');
        annotations.forEach((annotation) => {
            if (indicatorsVisible) {
                annotation.classList.add('hidden');
            } else {
                annotation.classList.remove('hidden');
            }
        });
    }

    const handleFocusField = (id: string, label: string, color: string) => {
        setFocusedField({ 'id': id, 'label': label, 'color': color });
    }

    const handleEnd = async (activeRegion: string, regions: Region[]) => {
        setFocusedField(null);

        if (activeRegion) {
            const region = regions.find(region => region.id === activeRegion);
            const bddRegion = regionsList.find(region => region.id === activeRegion);

            if (!region) return;

            // Check if region is similar to bddRegion
            // If yes, do not launch ocr on fly
            if (region && bddRegion) {
                const delta = 20; // pixels
                if (Math.abs(region.x - bddRegion.x) < delta &&
                    Math.abs(region.y - bddRegion.y) < delta &&
                    Math.abs(region.width - bddRegion.width) < delta &&
                    Math.abs(region.height - bddRegion.height) < delta) {
                    return;
                }
            }

            await ocrOnFly(region);
        }
    }

    // Function to update document data (only array, not on database) and validate fields
    const updateDocumentData = (field: any, value: any) => {
        let error: string | null = null;

        if (field.format === 'date') {
            if (value) {
                const m = moment(value, "YYYY-MM-DD", true);
                if (!m.isValid()) {
                    error = t('FORMS.invalid_date');
                }
                value = moment(value).format("YYYY-MM-DD");
            }
        }

        if (field.required && (!value || value.trim() === '')) {
            error = t('FORMS.field_required');
        }

        if (!error && field.pattern) {
            const regex = new RegExp(patterns[field.format]);
            if (!regex.test(value)) {
                error = t('FORMS.invalid_pattern');
            }
        }

        setErrors((prev) => ({
            ...prev,
            [field.id]: error
        }));

        setDocumentData((prevData: any) => ({
            ...prevData,
            datas: {
                ...prevData.datas,
                [field.id]: value
            }
        }));
    }

    // Function to save document data to database on onBlur event of input
    const prepareDocumentData = (field: any, value: any) => {
        if (documentData.status === 'END') {
            return;
        }

        if (errors[field.id]) {
            return;
        }

        if (tmpDocumentData['datas'][field.id] === value) {
            return;
        }

        if (value === "" || value === null || value === undefined) {
            return;
        }

        const dataToSave: any = {};
        dataToSave[field.id] = value;
        console.log("Saving document data:", dataToSave, documentData['datas'][field.id]);
        return;
        saveDocumentData(dataToSave).then(() => {
            setTmpDocumentData((prevData: any) => ({
                ...prevData,
                datas: {
                    ...prevData.datas,
                    [field.id]: value
                }
            }));
        });
    }

    const saveDocumentData = async (data: any) => {
        setLoadingUpdateDocumentData(true);
        try {
            await put(`verifier/documents/${ documentId }/updateData`, data);
        } catch (error) {
            console.error("Error saving document data:", error);
        } finally {
            setLoadingUpdateDocumentData(false);
        }
    }

    const getWidthLine = (line: any) => {
        return line.length === 1 ? 'w-full' :
            line.length === 2 ? 'w-1/2' :
                line.length === 3 ? 'w-1/3' :
                    line.length === 4 ? 'w-1/4' :
                        'w-1/5';
    }

    async function ocrOnFly(region: Region) {
        try {
            const lang = localStorage.getItem('backendLang') || 'fra';
            // TODO Gérer la lang du fournisseur

            const data = {
                'lang': lang,
                'selection': region,
                'fileName': currentFilename,
                'registerDate': documentData.register_date
            };
            post('verifier/ocrOnFly', data).then((response) => {
                console.log("OCR result:", response);
                if (!response || !response.text) {
                    return;
                }
                setRegionsList((prevRegions) => [...prevRegions, region]);
            });
        } catch (error) {
            console.error("Error during OCR on fly:", error);
        }
    }

    return (
        <div className='flex h-full overflow-hidden'>
            <div className='w-1/2 bg-(--bg-secondary) p-8 h-full flex flex-col'>
                <div className="border-2 border-(--border-secondary) rounded-xl h-full overflow-auto">
                    { !pagesImageB64[currentPage] ? (
                        <div className='w-full h-full flex flex-col items-center justify-center'>
                            <span className='text-(--text-secondary)'>
                                { t('VERIFIER.loading_page', { currentPage: currentPage }) }
                                <Loader/>
                            </span>
                        </div>
                    ) : (
                        <Annotator
                            width={ `${ zoom }%` }
                            currentPage={ currentPage }
                            focusedField={ focusedField }
                            alt={ `Page ${ currentPage }` }
                            imageB64={ pagesImageB64[currentPage] }
                            originalWidth={ documentData['img_width'] }
                            regionsList={ regionsList.filter(region => region.page === currentPage) }
                            onEnd={ handleEnd }
                        />
                    ) }
                </div>
                <div className='flex gap-4 mt-4 items-center'>
                    <div className='w-[48px] flex items-center justify-center bg-(--bg-primary) p-3.5 rounded-full
                                    cursor-pointer border border-(--border-secondary) hover:border-(--border-primary) hover:text-(--color-primary) transition-colors'
                         onClick={ handleDownloadOriginalFile } data-tooltip-id="tooltip"
                         data-tooltip-content={ t('VERIFIER.download_original_file') }>
                        <Download size={ 18 }/>
                    </div>
                    <div className='w-[40%] flex bg-(--bg-primary) p-3.5 rounded-full cursor-pointer border
                                    border-(--border-secondary)'>
                        <ZoomControl zoom={ zoom } setZoom={ setZoom }/>
                    </div>
                    <div className='flex justify-center gap-2 grow basis-0 bg-(--bg-primary) p-3 rounded-full
                                   cursor-pointer border border-(--border-secondary)'>
                        <button onClick={ handlePrev } disabled={ currentPage === 1 }
                                className={ `cursor-pointer rounded-full transition-colors ${
                                    currentPage === 1 ? "text-(--text-secondary) cursor-not-allowed"
                                        : "hover:bg-(--bg-secondary) text-(--text-primary)"
                                }` }>
                            <ChevronLeft size={ 16 }/>
                        </button>

                        <span>
                            { t('VERIFIER.page') } { currentPage } / { totalPages || 1 }
                        </span>

                        <button onClick={ handleNext }
                                disabled={ currentPage === totalPages }
                                className={ `p-1 cursor-pointer rounded-full transition-colors ${
                                    currentPage === totalPages ? "text-(--text-secondary) cursor-not-allowed"
                                        : "hover:bg-(--bg-secondary) text-(--text-primary)"
                                }` }>
                            <ChevronRight size={ 16 }/>
                        </button>
                    </div>
                    <div className='flex justify-center items-center select-none gap-4 grow basis-0 ml-auto
                                    hover:border-(--border-primary) hover:text-(--color-primary) bg-(--bg-primary) p-3
                                    rounded-full cursor-pointer border border-(--border-secondary) transition-colors'
                         onClick={ handleChangeIndicatorsVisible }>
                        { indicatorsVisible ? <Eye size={ 18 }/> : <EyeOff size={ 18 }/> }
                        { t('VERIFIER.indicators') }
                    </div>
                </div>
            </div>
            <div className='w-1/2 bg-(--bg-primary) p-8 h-full border-l-2 border-(--border-secondary) overflow-auto'>
                <Accordion multiple activeIndex={ [0] } className='flex flex-col gap-4'>
                    { fieldsZone.filter((zone: any) => zone.lines.length > 0).map((zone) => (
                        <AccordionTab key={ zone.id } header={ zone.name }>
                            <div className='w-full px-4 pt-6'>
                                { zone.lines.map((line: any, index: number) => (
                                    <div key={ index } className='flex gap-4 mb-1.5'>
                                        { line.map((field: any) => (
                                            <div key={ field.id } className={ `min-w-1/6 ${ getWidthLine(line) }` }>
                                                <Input
                                                    id={ field.id }
                                                    key={ field.id }
                                                    type={ field.type }
                                                    label={ t(field.label) }
                                                    error={ errors[field.id] }
                                                    required={ field.required }
                                                    value={ documentData?.datas?.[field.id] ?? "" }
                                                    onClick={ () => handleFocusField(field.id, field.label, field.color) }
                                                    onChange={ (e) => updateDocumentData(field, e.target.value) }
                                                    onBlur={ (e) => prepareDocumentData(field, e.target.value) }
                                                />
                                            </div>
                                        )) }
                                    </div>
                                )) }
                            </div>
                        </AccordionTab>
                    )) }
                </Accordion>
            </div>
        </div>
    );
}