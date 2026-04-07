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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Accordion, AccordionTab } from "primereact/accordion";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Download, Edit, Eye, EyeOff, Paperclip, SquarePlus } from "lucide-react";

import { SupplierEditor } from "../suppliers/editor";

import Input from "../../components/Input";
import { Button } from "../../components/Button";
import ISOCalendar from "../../components/Calendar";
import { Dropdown } from "../../components/Dropdown";
import { Loader } from "../../components/loader/Loader";
import { showToast } from "../../components/ToastProvider";
import { ZoomControl } from "../../components/ZoomControl";
import AutocompleteInput from "../../components/Autocomplete";
import { Annotator, type Region } from "../../components/Annotator";
import { AttachmentsList } from "../../components/attachments/list";

import { useUser } from "../../services/hooks/useUser";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";
import { useFormFields } from "../../services/hooks/useFormFields";
import { useCustomFields } from "../../services/hooks/useCustomFields";
import { useHistoryLogger } from "../../services/hooks/useHistoryLogger";

export function VerifierViewerPage() {
    const { get, post, put } = axiosApiCall();
    const { documentId } = useParams<{ documentId: string }>();

    const [documentData, setDocumentData] = useState<any>(null);
    const [documentDataLoading, setDocumentDataLoading] = useState<boolean>(true);

    const [currentForm, setCurrentForm] = useState<any>(null);

    const [formHasError, setFormHasError] = useState<boolean>(false);
    const [tmpDocumentData, setTmpDocumentData] = useState<any>(null);

    const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
    const [suggestionsSuppliers, setSuggestionsSuppliers] = useState<any[]>([]);

    const [currentSupplier, setCurrentSupplier] = useState<any>(null);
    const [showSupplierEditor, setShowSupplierEditor] = useState(false);
    const [supplierExists, setSupplierExists] = useState<boolean>(true);
    const [supplierChanged, setSupplierChanged] = useState<boolean>(false);
    const [originalCurrentSupplier, setOriginalCurrentSupplier] = useState<any>(null);

    const [loadingUpdateRefuse, setLoadingUpdateRefuse] = useState<boolean>(false);
    const [loadingUpdateValidate, setLoadingUpdateValidate] = useState<boolean>(false);
    const [loadingUpdateData, setLoadingUpdateDocumentData] = useState<boolean>(false);

    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

    const { customFields, loading: loadingCustom } = useCustomFields("verifier");
    const { formFields, loading: loadingFormFields } = useFormFields(documentData ? documentData.form_id : 0);

    const [fieldsZone, setFieldsZone] = useState(() => ([
        { id: "supplier", name: t('FORMS.supplier'), lines: [] as any[] },
        { id: "lines", name: t('VERIFIER.lines'), lines: [] as any[] },
        { id: "facturation", name: t('FORMS.facturation'), lines: [] as any[] },
        { id: "other", name: t('FORMS.other'), lines: [] as any[] }
    ]));
    const [disableFields, setDisableFields] = useState<boolean>(false);
    const [fieldsZoneFilled, setFieldsZoneFilled] = useState<boolean>(false);

    const patterns: any = {
        alphanum: '^[\\-?0-9a-zA-Z\\s\'‘]*$',
        alphanum_extended: '^[\\-?0-9a-zA-Z\\\/#,\\.\'‘\\s\\(\\)_\\+:]*$',
        alphanum_extended_with_accent: '^[\\-?0-9a-zA-Z\\u00C0-\\u017F\\\/#,\'‘\\.\\s\\(\\)_&°"%\\+:€$£]*$',
        number_int: '^[\\-?0-9]*$',
        number_float: '^[\\-?0-9]*([.][0-9]*)*$',
        char: '^[A-Za-z\\s]*$',
        email: '^[A-Za-z0-9._\\%+\\-]{1,64}@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,252}$'
    };

    const [pagesList, setPagesList] = useState<number[]>([]);
    const totalPages = useMemo(() => pagesList.length, [pagesList]);

    const [zoom, setZoom] = useState(100);
    const [attachmentsCount, setAttachmentsCount] = useState<number>(0);
    const [showAttachments, setShowAttachments] = useState<boolean>(false);
    const [indicatorsVisible, setIndicatorsVisible] = useState<boolean>(true);
    const [enableAttachments, setEnableAttachments] = useState<boolean>(true);

    const [regionsList, setRegionsList] = useState<any[]>([]);
    const [focusedField, setFocusedField] = useState<any>(null);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [currentFilename, setCurrentFilename] = useState<string>("");
    const [pagesImageB64, setPagesImageB64] = useState<{ [key: number]: string }>({});

    const lang = localStorage.getItem("selectedLang") || "en";
    useEffect(() => {
        moment.locale(lang.startsWith("fr") ? "fr" : lang.startsWith("es") ? "es" : "en");
    }, [lang]);

    const { user, loadingUser } = useUser();
    const { logHistory } = useHistoryLogger();
    const navigate = useNavigate();

    // Fetch document data
    useEffect(() => {
        if (loadingUser || !documentId) return;

        logHistory({
            module: 'verifier',
            submodule: 'viewer',
            desc: t('HISTORY.viewer', { documentId: documentId })
        });

        const fetchDocumentData = async () => {
            try {
                get(`verifier/documents/${ documentId }`, {}).then((response) => {
                    setDocumentData(response);
                    setTmpDocumentData(response);
                    setCurrentFilename(response.full_jpg_filename);
                    setPagesList([...Array(response.nb_pages).keys()].map(i => i + 1));
                    setDocumentDataLoading(false);
                });
                if (user && user.id) {
                    updateDocument({ locked: true, locked_by: user.id }).then();
                }
            } catch (error) {
                console.error("Error fetching document data:", error);
            }
        };
        fetchDocumentData().then();
    }, [documentId, loadingUser]);

    // Fetch form settings
    useEffect(() => {
        if (!documentData) return;

        const fetchEnableAttachments = async () => {
            try {
                const res = await get('config/getConfigurationNoAuth/enableAttachments');
                if (res && res.configuration) {
                    setEnableAttachments(res.configuration[0].data.value);
                }
            } catch (error) {
                console.error("Error fetching enable attachments config:", error);
            }
        }

        const fetchForm = async () => {
            try {
                get(`/forms/verifier/getById/${ documentData.form_id }`).then((response) => {
                    if (!response) return;
                    setCurrentForm(response);
                });
            } catch (error) {
                console.error("Error fetching form settings:", error);
            }
        };

        fetchForm().then();
        fetchEnableAttachments().then();
    }, [documentDataLoading]);

    // Retrieve all third parties for autocomplete
    useEffect(() => {
        const fetchAllSuppliers = async () => {
            try {
                get(`accounts/suppliers/list`).then((response) => {
                    setAllSuppliers(response.suppliers || []);
                    setSuggestionsSuppliers(response.suppliers.slice(0, 100) || []);
                });
            } catch (error) {
                console.error("Error fetching all third parties:", error);
            }
        }

        fetchAllSuppliers().then();
    }, []);

    async function fetchThirdParty(supplierId?: number) {
        try {
            const idToUse = supplierId ? supplierId : documentData.supplier_id;
            get(`accounts/suppliers/getById/${ idToUse }`, {}).then((response) => {
                if (!response) return;

                get(`accounts/getAdressById/${ response.address_id }`, {}).then((addressResponse) => {
                    delete addressResponse.id;
                    const supplierFull = {
                        ...response,
                        ...addressResponse
                    }

                    setCurrentSupplier(supplierFull);
                    setOriginalCurrentSupplier(supplierFull);

                    Object.keys(supplierFull).forEach((data: any) => {
                        if (supplierFull[data] && (supplierId || (!tmpDocumentData?.datas?.[data] || tmpDocumentData?.datas?.[data] === ''))) {
                            updateDocumentData({ id: data }, supplierFull[data]);
                            prepareDocumentData({ id: data }, supplierFull[data], supplierId);
                        }
                    });
                });
            });
        } catch (error) {
            console.error("Error fetching third party:", error);
        }
    }

    // Function to retrieve third party
    useEffect(() => {
        if (!documentData) return;
        if (!documentData.supplier_id) return;

        fetchThirdParty().then();
    }, [documentDataLoading]);

    // Function to fetch page image in base64
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
    }, [documentDataLoading, currentFilename]);

    // Create regions of ocr on fly
    useEffect(() => {
        if (!documentData || loadingCustom || loadingFormFields || formFields.length === 0) return;

        if (regionsList.length > 0 || documentData.positions.length === 0 || !fieldsZoneFilled) return;

        Object.keys(documentData.positions).forEach((position) => {
            let label = '';
            const pos = documentData.positions[position];
            if (!pos) return;

            if (position.includes('custom_')) {
                label = customFields.find((field) => `custom_${ field.id }` === position)?.label || position;
            } else {
                Object.keys(formFields).forEach((parent: any) => {
                    formFields[parent].forEach((line: any) => {
                        Object.values(line).filter((field: any) => typeof field !== 'boolean').forEach((field: any) => {
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
                color: '#19864B'
            };

            Object.keys(formFields).forEach((parent: any) => {
                formFields[parent].forEach((line: any) => {
                    Object.values(line).filter((field: any) => typeof field !== 'boolean').forEach((field: any) => {
                        if (field.id === position) {
                            newRegion.color = field.color;
                        }
                    });
                });
            });
            setRegionsList((prevRegions) => [...prevRegions, newRegion]);
        });
    }, [fieldsZoneFilled]);

    // Fill form
    useEffect(() => {
        if (loadingFormFields || formFields.length === 0 || fieldsZoneFilled) return;

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
                        Object.values(line).filter((field: any) => typeof field !== 'boolean').forEach((field: any) => {
                            if (field.id.includes('custom_') && !field.settings) {
                                const customField: any = customFields.find((f) => `custom_${ f.id }` === field.id);
                                if (customField) {
                                    field.settings = customField.settings;
                                }
                            }

                            if (field.default_value && (!tmpDocumentData?.datas?.[field.id] || tmpDocumentData?.datas?.[field.id] === '')) {
                                let value = field.default_value;
                                if (field.type === 'date') {
                                    if (value === 'default_today') {
                                        value = moment().format('YYYY-MM-DD');
                                    } else {
                                        value = moment(field.default_value, 'YYYY-MM-DD');
                                    }
                                }

                                updateDocumentData(field, value);
                                if (errors[field.id]) return;

                                prepareDocumentData(field, value);
                            }
                        });
                        newZones[zoneIndex].lines.push(line);
                    });
                }
            });

            // Handle duplicable lines
            newZones.forEach((zone) => {
                const duplicableLines = newZones.find(z => z.id === zone.id)?.lines.filter((line: any) => line.duplicable && !line.duplicated);
                if (duplicableLines && duplicableLines.length > 0) {
                    duplicableLines.forEach((line: any) => {
                        const lineIndex = newZones.find(z => z.id === zone.id)?.lines.indexOf(line) || -1;
                        line.duplicated = true;

                        const duplicableFields = Object.values(line).filter((field: any) => typeof field !== 'boolean');

                        let newLineAdded = false;
                        duplicableFields.forEach((field: any) => {
                            // check if documentData.datas has multiple entries for this base field using regex
                            const regex = new RegExp(`^${ field.id.replace(/_\d+$/, '') }_(\\d+)$`);
                            const matchingFields = Object.keys(tmpDocumentData?.datas || {}).filter((dataFieldId) => regex.test(dataFieldId));

                            if (matchingFields.length > 0 && !newLineAdded) {
                                const maxCpt = matchingFields.length;
                                for (let i = 1; i <= maxCpt; i++) {
                                    newLineAdded = true;
                                    handleDuplicateLine(line, zone, lineIndex);
                                }
                            }
                        });
                    });
                }
            });

            setFieldsZoneFilled(true);
            return newZones;
        });
    }, [formFields]);

    // Check if form has errors to disable validate button
    useEffect(() => {
        const hasError = Object.values(errors).some((error) => error !== null);
        setFormHasError(hasError);
    }, [errors]);

    // Unlock document (when leaving page)
    useEffect(() => {
        const handleBeforeUnload = () => {
            updateDocument({ locked: false, locked_by: null }).then();
        };

        return () => {
            // When component unmounts
            updateDocument({ locked: false, locked_by: null }).then();
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    // Disable fields
    useEffect(() => {
        if (!documentData) return;

        if (loadingUpdateValidate || loadingUpdateRefuse || documentData.status === 'END') {
            setDisableFields(true);
        } else {
            setDisableFields(false);
        }
    }, [loadingUpdateValidate, loadingUpdateRefuse, documentData]);

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
                annotation.classList.add('hidden!');
            } else {
                annotation.classList.remove('hidden!');
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

            await ocrOnFly(activeRegion, region);
        }
    }

    const handleDuplicateLine = (line: any, zone: any, lineIndex: number) => {
        const fields = Object.values(line).filter((field: any) => typeof field !== 'boolean');
        setFieldsZone((prevZones) => {
            const newZones = prevZones.map(z => ({
                ...z,
                lines: [...z.lines],
            }));

            const zoneIndex = newZones.findIndex(z => z.id === zone.id);
            if (zoneIndex === -1) {
                return prevZones;
            }

            const newLine: any = {};
            fields.forEach((field: any, index: number) => {
                const cpt = newZones[zoneIndex].lines.reduce((acc, curr) => {
                    const lineFields = Object.values(curr).filter((f: any) => typeof f !== 'boolean');
                    lineFields.forEach((f: any) => {
                        if (f.id.startsWith(field.id.replace(/_\d+$/, ''))) {
                            acc++;
                        }
                    });
                    return acc;
                }, 0);

                const fieldCpt = field.id.split('_')[field.id.split('_').length - 1];
                let fieldWithoutCpt = field.id;
                let labelWithoutCpt = t(field.label);
                if (!isNaN(parseInt(fieldCpt))) {
                    fieldWithoutCpt = field.id.replace(`_${ fieldCpt }`, '');
                    labelWithoutCpt = field.label.replace(` ${ fieldCpt }`, '');
                }
                newLine[index] = {
                    ...field,
                    value: '',
                    id: `${ fieldWithoutCpt }_${ cpt }`,
                    label: labelWithoutCpt + ` ${ cpt }`
                };
            });

            formFields[zone.id.replace('zone-')].push(newLine);

            const insertIndex = lineIndex !== -1 ? lineIndex + 1 : newZones[zoneIndex].lines.length;

            newZones[zoneIndex].lines.splice(insertIndex, 0, newLine);
            return newZones;
        });
    }

    // Function to update document data (only array, not on database) and validate fields
    const updateDocumentData = (field: any, value: any) => {
        field.error = errorCheck(field, value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            [field.id]: field.error
        }));

        setTmpDocumentData((prevData: any) => ({
            ...prevData,
            datas: {
                ...prevData.datas,
                [field.id]: value
            }
        }));

        // Detect supplier change
        let supplierExists = true;
        let supplierChange = false;
        if (checkIfFieldIsSupplierField(field.id)) {
            if (value === null || value === undefined || value === '') {
                value = null;
            }

            if (originalCurrentSupplier && value !== originalCurrentSupplier[field.id]) {
                supplierChange = true;
            }

            if (!originalCurrentSupplier && value) {
                supplierExists = false;
            }
        }
        setSupplierExists(supplierExists);
        setSupplierChanged(supplierChange);

        // onBlur doesn't work well with date picker and dropdown, so we save directly here for date fields
        if (['date', 'select'].includes(field.type) && value && !field.error) {
            prepareDocumentData(field, value);
        }
    }

    function errorCheck(field: any, value: any) {
        let error: string | null = null;

        if (field.required && (!value || value.toString().trim() === '')) {
            error = t('FORMS.field_required');
        }

        if (field.type === 'date' && !error) {
            if (value) {
                const dateValue = moment(value, 'YYYY-MM-DD', true);
                if (!dateValue.isValid()) {
                    error = t('FORMS.invalid_date');
                }
            }
        }

        if (!error && (value && field.format)) {
            const regex = new RegExp(patterns[field.format]);
            if (!regex.test(value)) {
                error = t('FORMS.invalid_pattern');
            }
        }

        return error;
    }

    function checkIfFieldIsSupplierField(fieldId: string) {
        const supplierFields = fieldsZone.find(zone => zone.id === 'supplier')?.lines.flat();
        let fieldIsSupplierField = false;
        supplierFields?.forEach((field: any) => {
            if (Object.values(field).filter((l: any) => typeof l !== 'boolean').find((f: any) => f.id === fieldId)) {
                fieldIsSupplierField = true;
            }
        });
        return !!(supplierFields && fieldIsSupplierField);
    }

    // Function to save document data to database on onBlur event of input
    // supplierId is used when updating supplier to force database update
    const prepareDocumentData = (field: any, value: any, supplierId?: number | undefined) => {
        if (documentData.status === 'END') {
            return;
        }

        if (errors[field.id]) {
            return;
        }

        if (documentData['datas'][field.id] === value) {
            return;
        }

        if (value === null || value === undefined) {
            return;
        }

        // Do not save supplier data if supplier changed and still not updated
        if (checkIfFieldIsSupplierField(field.id) && (supplierChanged || !supplierExists) && !supplierId) {
            return;
        }

        const dataToSave: any = {};
        dataToSave[field.id] = value;
        saveDocumentData(dataToSave).then(() => {
            setDocumentData((prevData: any) => ({
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

    async function updateDocument(data: any) {
        setLoadingUpdateDocumentData(true);
        try {
            const res = await put(`verifier/documents/${ documentId }/update`, data);
            setLoadingUpdateDocumentData(false);
            return res;
        } catch (error) {
            console.error("Error updating document:", error);
        }
    }

    const saveDocumentPosition = async (data: any) => {
        setLoadingUpdateDocumentData(true);
        try {
            await put(`verifier/documents/${ documentId }/updatePosition`, data);

            if (documentData.supplier_id && currentSupplier) {
                data['form_id'] = documentData.form_id;
                await put(`accounts/supplier/${ documentData.supplier_id }/updatePosition`, data);
            }
        } catch (error) {
            console.error("Error saving document position:", error);
        } finally {
            setLoadingUpdateDocumentData(false);
        }
    }

    const saveDocumentPage = async (data: any) => {
        setLoadingUpdateDocumentData(true);
        try {
            await put(`verifier/documents/${ documentId }/updatePage`, data);

            if (documentData.supplier_id && currentSupplier) {
                data['form_id'] = documentData.form_id;
                await put(`accounts/supplier/${ documentData.supplier_id }/updatePage`, data);
            }
        } catch (error) {
            console.error("Error saving document page:", error);
        } finally {
            setLoadingUpdateDocumentData(false);
        }
    }

    const getWidthLine = useCallback((line: any) => {
        const fields = Object.values(line).filter((f: any) => typeof f !== 'boolean');

        switch (fields.length) {
            case 1:
                return 'w-full';
            case 2:
                return 'w-1/2';
            case 3:
                return 'w-1/3';
            case 4:
                return 'w-1/4';
            default:
                return 'w-1/5';
        }
    }, []);

    function retrieveFieldById(fieldId: string) {
        let field = null;
        Object.keys(formFields).forEach((parentKey: any) => {
            formFields[parentKey].forEach((line: any) => {
                Object.values(line).filter((l: any) => typeof l !== 'boolean').forEach((l_field: any) => {
                    if (l_field.id === fieldId) {
                        field = l_field;
                    }
                });
            });
        });

        return field;
    }

    const handleSupplierSearch = (e: any, fieldId: string) => {
        if (!e.query || e.query.trim() === '') {
            setSuggestionsSuppliers(allSuppliers.slice(0, 100));
            return;
        }
        const query = e.query.toLowerCase();
        const filtered = allSuppliers.filter((supplier) =>
            fieldId === 'name' ? supplier.name?.toLowerCase().includes(query) : supplier.lastname?.toLowerCase().includes(query)
        );
        setSuggestionsSuppliers(filtered.slice(0, 100));
    }

    const handleSupplierChange = async (field: any, value: any) => {
        if (typeof value === 'object' && value !== null) {
            const newSupplier = value;
            value = value[field.id];

            await updateDocument({ 'supplier_id': newSupplier.id }).then(() => {
                documentData.supplier_id = newSupplier.id;
                fetchThirdParty().then(() => {
                    showToast(t('VERIFIER.supplier_associated_success'), 'success');
                });
            });
        }
        updateDocumentData({ id: field.id }, value);
    }

    async function ocrOnFly(fieldId: string, region: Region) {
        try {
            let lang = localStorage.getItem('backendLang') || 'fra';
            if (currentSupplier && currentSupplier.document_lang && currentSupplier.document_lang !== '') {
                lang = currentSupplier.document_lang;
            }

            let field: any = retrieveFieldById(fieldId);
            if (!field) return;

            let removeSpaces = false;
            if (fieldId.includes('custom_')) {
                const customField: any = customFields.find((field) => `custom_${ field.id }` === fieldId && field.type === 'regex');
                if (customField) {
                    if (customField.settings && customField.settings.regex) {
                        removeSpaces = customField.settings.regex.remove_spaces ? customField.settings.regex.remove_spaces : false;
                    }
                }
            }

            const data = {
                'lang': lang,
                'selection': region,
                'fileName': currentFilename,
                'removeSpaces': removeSpaces,
                'registerDate': documentData.register_date
            };
            post('verifier/ocrOnFly', data).then((response) => {
                if (!response || !response.result) {
                    return;
                }

                updateDocumentData(field, response.result);
                if (field.error) return;

                if (!checkIfFieldIsSupplierField(field.id)) {
                    prepareDocumentData(field, response.result);

                    if (currentForm.settings.allow_learning) {
                        const positionData: any = {};
                        positionData[fieldId] = {
                            x: region.x,
                            y: region.y,
                            width: region.width,
                            height: region.height
                        };
                        saveDocumentPosition(positionData).then();

                        const pageData: any = {};
                        pageData[fieldId] = region.page;
                        saveDocumentPage(pageData).then();
                        showToast(t('VERIFIER.ocr_on_fly_success'), 'success');
                    }
                }

                setRegionsList((prevRegions) => {
                    const existingIndex = prevRegions.findIndex(
                        (r) => r.id === region.id
                    );

                    if (existingIndex !== -1) {
                        const updatedRegions = [...prevRegions];
                        updatedRegions[existingIndex] = region;
                        return updatedRegions;
                    }

                    return [...prevRegions, region];
                });

            });
        } catch (error) {
            console.error("Error during OCR on fly:", error);
        }
    }

    const validateDocument = async () => {
        setLoadingUpdateValidate(true);

        // Final error check before validate
        let hasError = false;
        Object.keys(formFields).forEach((parentKey: any) => {
            formFields[parentKey].forEach((line: any) => {
                Object.values(line).filter((l: any) => typeof l !== 'boolean').forEach((field: any) => {
                    const value = tmpDocumentData?.datas?.[field.id];
                    const error = errorCheck(field, value);
                    if (error) {
                        hasError = true;
                        showToast(t('VERIFIER.correct_errors_before_validate'), 'error');
                        setErrors((prevErrors) => ({
                            ...prevErrors,
                            [field.id]: error
                        }));
                    }
                });
            });
        });

        if (hasError) {
            setLoadingUpdateValidate(false);
            return;
        }

        if (currentForm.outputs && currentForm.outputs.length > 0) {
            let outputError = false;
            let cpt = 0;
            for (const output_id of currentForm.outputs) {
                try {
                    const output = await get(`outputs/verifier/getById/${ output_id }`);
                    if (!output) return;

                    await post(`verifier/documents/${ documentId }/${ output.output_type_id }`, output);
                    cpt += 1;
                    showToast(t('VERIFIER.output_executed_successfully', { 'output_label': output.output_label }), 'success');

                    if (outputError) {
                        showToast(t('VERIFIER.output_error'), 'error');
                        setLoadingUpdateValidate(false);
                        return;
                    }

                    logHistory({
                        module: 'verifier',
                        submodule: 'output_executed',
                        desc: t('HISTORY.output_executed', { outputLabel: output.output_label, documentId: documentId })
                    });

                    if (cpt === currentForm.outputs.length) {
                        logHistory({
                            module: 'verifier',
                            submodule: 'document_validated',
                            desc: t('HISTORY.document_validated', { documentId: documentId })
                        });

                        await updateDocument({ 'status': 'END', 'locked': false, 'locked_by': null }).then(() => {
                            setLoadingUpdateValidate(false);
                            showToast(t('VERIFIER.document_validated'), 'success');
                            navigate('/home');
                        });
                    }
                } catch (error) {
                    cpt += 1;
                    outputError = true;
                    console.error("Error executing output on validate:", error);
                }
            }
        }
        setLoadingUpdateValidate(false);
    }

    const refuseDocument = async () => {
        setLoadingUpdateRefuse(true);
        logHistory({
            module: 'verifier',
            submodule: 'document_refused',
            desc: t('HISTORY.document_refused', { documentId: documentId })
        })

        await updateDocument({ 'status': 'ERR', 'locked': false, 'locked_by': null }).then(() => {
            showToast(t('VERIFIER.document_refused'), 'success');
            setLoadingUpdateRefuse(false);
            navigate('/home');
        });
    }

    const getFilteredConditionalOptions = (field: any) => {
        if (!field.settings?.options) return []
        if (!field.settings?.conditional) return field.settings.options;

        const options: any[] = [];
        field.settings.options.forEach((option: any) => {
            const conditionalCustomField = customFields.find((f) => f.id === option.conditional_custom_field);
            if (conditionalCustomField) {
                const conditionalFieldId = 'custom_' + String(option.conditional_custom_field);
                let conditionalFieldValue = tmpDocumentData?.datas?.[conditionalFieldId];
                if (conditionalCustomField.type === 'select') {
                    const conditionalOption = conditionalCustomField.settings.options.find((o: any) => o.id === conditionalFieldValue.id);
                    if (conditionalOption) {
                        conditionalFieldValue = conditionalOption.label;
                    }
                }

                if (conditionalFieldValue === option.conditional_custom_value) {
                    options.push({
                        'value': option.id,
                        'label': option.label
                    });
                }
            }
        });
        return options;
    };

    if (documentDataLoading || !documentData) return <Loader/>;

    return (
        <div className='flex h-full overflow-hidden'>
            { showSupplierEditor && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60"/>
                    <div className="absolute top-0 right-0 h-full w-[70%] bg-(--bg-primary) animate-slide-in-right">
                        <SupplierEditor
                            supplierId={ currentSupplier?.id }
                            newDatas={ tmpDocumentData?.datas || {} }
                            onClose={ () => setShowSupplierEditor(false) }
                            onUpdated={ () => {
                                if (documentData.supplier_id) {
                                    fetchThirdParty(documentData.supplier_id).then();
                                    setShowSupplierEditor(false);
                                }
                            } }
                            onCreated={ (res: any) => {
                                setDocumentData((prevData: any) => ({
                                    ...prevData,
                                    'supplier_id': res.id
                                }));
                                setTmpDocumentData((prevData: any) => ({
                                    ...prevData,
                                    'supplier_id': res.id
                                }));
                                updateDocument({ 'supplier_id': res.id }).then();
                                fetchThirdParty(res.id).then();
                                setShowSupplierEditor(false);
                            } }
                        />
                    </div>
                </div>
            ) }

            <div className={ `w-1/2 h-full flex flex-col ${ showAttachments && enableAttachments ? '' : 'hidden' }` }>
                <AttachmentsList
                    module="verifier"
                    disabled={ disableFields }
                    documentId={ documentId }
                    onAttachmentsCountChange={ setAttachmentsCount }
                    onClose={ () => setShowAttachments(false) }
                />
            </div>
            { !showAttachments && (
                <div className='w-1/2'>
                    <div className='pt-6 pl-8 pb-4'>
                        <Button size='sm' variant="bg_white_rounded"
                                icon={ <ArrowLeft size={ 16 }/> } onClick={ () => navigate('/home') }>
                            { t('GLOBAL.back') }
                        </Button>
                    </div>
                    <div className='bg-(--bg-secondary) px-8 pb-24 h-full flex flex-col'>
                        <div className="border border-(--border-secondary) rounded-xl h-full overflow-auto">
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
                                    regionsList={ regionsList }
                                    onEnd={ handleEnd }
                                />
                            ) }
                        </div>
                        <div className="flex flex-wrap gap-4 mt-4 items-center">
                            { enableAttachments && (
                                <div className="flex items-center justify-center bg-(--bg-primary) p-3.5 rounded-full
                                    cursor-pointer border border-(--border-secondary) hover:border-(--border-primary)
                                    hover:text-(--color-primary) transition-colors shrink-0 relative"
                                     onClick={ () => setShowAttachments(true) }
                                     data-tooltip-id="tooltip"
                                     data-tooltip-content={ t('VERIFIER.show_attachments') }>
                                    <Paperclip size={ 18 }/>
                                    { attachmentsCount > 0 && (
                                        <div
                                            className="z-1 absolute top-0 right-0 size-3 rounded-full bg-(--color-primary)"/>
                                    ) }
                                </div>
                            ) }
                            <div className="flex items-center justify-center bg-(--bg-primary) p-3.5 rounded-full
                                    cursor-pointer border border-(--border-secondary) hover:border-(--border-primary)
                                    hover:text-(--color-primary) transition-colors shrink-0"
                                 onClick={ handleDownloadOriginalFile }
                                 data-tooltip-id="tooltip"
                                 data-tooltip-content={ t('VERIFIER.download_original_file') }>
                                <Download size={ 18 }/>
                            </div>

                            <div className="flex bg-(--bg-primary) p-3.5 rounded-full cursor-pointer border
                                    border-(--border-secondary) grow-5 min-w-[180px]">
                                <ZoomControl zoom={ zoom } setZoom={ setZoom }/>
                            </div>

                            <div className="flex justify-center items-center gap-3 bg-(--bg-primary) p-3 rounded-full
                                    cursor-pointer border border-(--border-secondary) grow min-w-[160px] whitespace-nowrap">
                                <button onClick={ handlePrev }
                                        disabled={ currentPage === 1 }
                                        className={ `cursor-pointer rounded-full transition-colors 
                                                    ${ currentPage === 1 ? "text-(--text-secondary) cursor-not-allowed"
                                            : "hover:bg-(--bg-secondary) text-(--text-primary)" }` }
                                >
                                    <ChevronLeft size={ 16 }/>
                                </button>

                                <span className="whitespace-nowrap">
                                    { t('VERIFIER.page') } { currentPage } / { totalPages || 1 }
                                </span>

                                <button
                                    onClick={ handleNext }
                                    disabled={ currentPage === totalPages }
                                    className={ `cursor-pointer rounded-full transition-colors 
                                ${ currentPage === totalPages ? "text-(--text-secondary) cursor-not-allowed"
                                        : "hover:bg-(--bg-secondary) text-(--text-primary)" }` }>
                                    <ChevronRight size={ 16 }/>
                                </button>
                            </div>

                            <div className="flex justify-center items-center select-none gap-3 bg-(--bg-primary) p-3
                                    rounded-full cursor-pointer border border-(--border-secondary)
                                    hover:border-(--border-primary) hover:text-(--color-primary)
                                    transition-colors shrink-0"
                                 data-tooltip-id="tooltip"
                                 data-tooltip-content={ indicatorsVisible ? t('VERIFIER.hide_indicators') : t('VERIFIER.show_indicators') }
                                 onClick={ handleChangeIndicatorsVisible }>
                                { indicatorsVisible ? <Eye size={ 18 }/> : <EyeOff size={ 18 }/> }
                            </div>
                        </div>
                    </div>
                </div>
            ) }

            <div className='w-1/2 bg-(--bg-primary) p-8 h-full border-l border-(--border-secondary) overflow-auto'>
                { documentDataLoading || formFields.length === 0 ? (
                    <Loader/>
                ) : (
                    <>
                        <Accordion multiple activeIndex={ [0] } className='flex flex-col gap-4'>
                            { fieldsZone.filter((zone: any) => zone.lines.length > 0).map((zone) => (
                                <AccordionTab key={ zone.id } header={
                                    <span className='flex items-center gap-2 h-[20px]'>
                                        <span>
                                            { zone.name }
                                        </span>
                                        <span className='flex ml-auto'>
                                            { supplierChanged && zone.id === 'supplier' && (
                                                <Edit size={ 20 } data-tooltip-id="tooltip"
                                                      onClick={ (e) => {
                                                          e.preventDefault();
                                                          e.stopPropagation();
                                                          setShowSupplierEditor(true);
                                                      } }
                                                      data-tooltip-content={ t('VERIFIER.supplier_changed') }/>
                                            ) }

                                            { !supplierExists && zone.id === 'supplier' && (
                                                <SquarePlus size={ 20 } data-tooltip-id="tooltip"
                                                            onClick={ (e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setShowSupplierEditor(true);
                                                            } }
                                                            data-tooltip-content={ t('VERIFIER.create_supplier') }/>
                                            ) }
                                        </span>
                                    </span>
                                }>
                                    <div className='w-full px-4 pt-6'>
                                        { zone.lines.map((line: any, index: number) => (
                                            <div key={ index } className={ `flex gap-4 mb-2` }>
                                                { Object.values(line).filter((field: any) => typeof field !== 'boolean').map((field: any) => (
                                                    <div key={ field.id }
                                                         className={ `min-w-1/6 ${ getWidthLine(line) }` }>
                                                        { field.type === 'date' && (
                                                            <ISOCalendar
                                                                id={ field.id }
                                                                label={ t(field.label) }
                                                                error={ errors[field.id] }
                                                                disabled={ disableFields }
                                                                required={ field.required }
                                                                value={ tmpDocumentData?.datas?.[field.id] }
                                                                onChange={ (e) => updateDocumentData(field, e) }
                                                                onClick={ () => handleFocusField(field.id, field.label, field.color) }
                                                            />
                                                        ) }

                                                        { field.type === 'select' && field.settings?.options && (
                                                            <Dropdown
                                                                id={ field.id }
                                                                label={ t(field.label) }
                                                                required={ field.required }
                                                                disabled={ disableFields }
                                                                value={ tmpDocumentData?.datas?.[field.id] }
                                                                options={ getFilteredConditionalOptions(field) }
                                                                onChange={ (e) => updateDocumentData(field, e.value) }
                                                            />
                                                        ) }

                                                        { field.type === 'text' && (
                                                            <>
                                                                { (zone.id === 'supplier' && (field.id === 'lastname' || field.id === 'name') ? (
                                                                        <AutocompleteInput
                                                                            id={ field.id }
                                                                            label={ t(field.label) }
                                                                            required={ field.required }
                                                                            disabled={ disableFields }
                                                                            suggestions={ suggestionsSuppliers }
                                                                            value={ tmpDocumentData?.datas?.[field.id] ?? "" }
                                                                            optionLabel={ field.id === 'name' ? 'name' : 'lastname' }
                                                                            search={ (e) => handleSupplierSearch(e, field.id) }
                                                                            onChange={ (value) => handleSupplierChange(field, value) }
                                                                            itemTemplate={ (supplier: any) => (
                                                                                <div>
                                                                                    { field.id === 'name' ? supplier.name : supplier.lastname }
                                                                                    { field.id === 'lastname' && supplier.firstname ? ` ${ supplier.firstname }` : '' }
                                                                                    <span
                                                                                        className='text-(--text-secondary)'>
                                                                                        { field.id === 'lastname' && supplier.name ? ` (${ supplier.name })` : '' }
                                                                                    </span>
                                                                                </div>
                                                                            ) }
                                                                        />
                                                                    ) : (
                                                                        <Input
                                                                            id={ field.id }
                                                                            key={ field.id }
                                                                            type={ field.type }
                                                                            label={ t(field.label) }
                                                                            error={ errors[field.id] }
                                                                            required={ field.required }
                                                                            value={ tmpDocumentData?.datas?.[field.id] ?? "" }
                                                                            disabled={ disableFields }
                                                                            onClick={ () => handleFocusField(field.id, field.label, field.color) }
                                                                            onChange={ (e) => updateDocumentData(field, e.target.value) }
                                                                            onBlur={ (e) => {
                                                                                prepareDocumentData(field, e.target.value)
                                                                            } }
                                                                        />
                                                                    )
                                                                ) }
                                                            </>
                                                        ) }
                                                    </div>
                                                )) }
                                                { line.duplicable && (
                                                    <div data-tooltip-id="tooltip"
                                                         data-tooltip-content={ t('FORMS.duplicate_line') }
                                                         className='flex items-center justify-center -mt-4 cursor-pointer'
                                                         onClick={ () => {
                                                             handleDuplicateLine(line, zone, index)
                                                         } }>
                                                        <Copy size={ 18 }/>
                                                    </div>
                                                ) }
                                            </div>
                                        )) }
                                    </div>
                                </AccordionTab>
                            )) }
                        </Accordion>
                        <div className='flex mt-6 w-full items-center gap-4'>
                            <div className='grow basis-0 w-full' data-tooltip-id="tooltip"
                                 data-tooltip-content={ supplierChanged ? t('VERIFIER.save_supplier_modification') : '' }>
                                <Button className='w-full' variant='danger' onClick={ () => refuseDocument() }
                                        disabled={ loadingUpdateData || supplierChanged || !supplierExists || formHasError || disableFields }>
                                    { !loadingUpdateRefuse ? t('FORMS.refuse') : t('FORMS.refuse_loading') }
                                </Button>
                            </div>
                            <div className='grow basis-0 w-full' data-tooltip-id="tooltip"
                                 data-tooltip-content={ supplierChanged ? t('VERIFIER.save_supplier_modification') : '' }>
                                <Button
                                    disabled={ loadingUpdateData || supplierChanged || !supplierExists || formHasError || disableFields }
                                    className='w-full' onClick={ () => validateDocument() }>
                                    { loadingUpdateValidate && !formHasError ? t('FORMS.validate_loading') : t('FORMS.validate') }
                                </Button>
                            </div>
                        </div>
                    </>
                ) }
            </div>
        </div>
    );
}
