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
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Accordion, AccordionTab } from "primereact/accordion";

import { emptyToUndefined } from "../../services/zod";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";

import { Button } from "../../components/Button";
import { Loader } from "../../components/loader/Loader";
import { showToast } from "../../components/ToastProvider";
import { DynamicForm } from "../../components/form/DynamicForm";

type SupplierEditorProps = {
    newDatas?: any;
    supplierId?: number;
    onCreated?: (supplier: any) => void;
    onUpdated?: () => void;
    onClose?: () => void;
};

export function SupplierEditor({
    newDatas,
    supplierId: supplierIdProp,
    onCreated,
    onUpdated,
    onClose
}: SupplierEditorProps) {
    const { get, post, put } = axiosApiCall();
    const navigate = useNavigate();

    const { supplierId: supplierIdFromRoute } = useParams<{ supplierId: string }>();
    const supplierId = supplierIdProp ?? supplierIdFromRoute;

    const [forms, setForms] = useState<any[]>([]);
    const [regexes, setRegexes] = useState<any[]>([]);
    const [civilities, setCivilities] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [address, setAddress] = useState<any>(null);
    const [supplier, setSupplier] = useState<any>(null);
    const [accountingPlans, setAccountingPlans] = useState<any[]>([]);
    const [vatMandatory, setVatMandatory] = useState<boolean>(true);
    const [informalContact, setInformalContact] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(true);
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);

    // fetch supplier data and currencies and forms and civilities and accounting plans and regex
    useEffect(() => {
        const fetchSupplier = async () => {
            try {
                const response = await get(`/accounts/suppliers/getById/${ supplierId }`);
                if (response) {
                    setSupplier(response);
                    if (response.address_id) {
                        const addressResponse = await get(`/accounts/getAdressById/${ response.address_id }`);
                        if (addressResponse) {
                            setAddress(addressResponse);
                            setSupplier((prev: any) => ({ ...prev, address: addressResponse }));
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching supplier data:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchCurrencies = async () => {
            try {
                const response = await get('/accounts/customers/getCurrencyCode');
                if (response) {
                    Object.keys(response).forEach(((currency: any) => {
                        setCurrencies((prevCurrencies) => [...prevCurrencies, {
                            label: response[currency],
                            value: response[currency]
                        }]);
                    }))
                }
            } catch (error) {
                console.error('Error fetching currencies:', error);
            }
        };

        const fetchForms = async () => {
            try {
                const response = await get('/forms/verifier/list');
                if (response && response.forms) {
                    setForms(response.forms);
                }
            } catch (error) {
                console.error('Error fetching forms:', error);
            }
        };

        const fetchCivilities = async () => {
            try {
                const response = await get('/accounts/civilities/list');
                if (response && response.civilities) {
                    setCivilities(response.civilities);
                }
            } catch (error) {
                console.error('Error fetching civilities:', error);
            }
        }

        const fetchAccountingPlans = async () => {
            try {
                const response = await get('/accounts/customers/getDefaultAccountingPlan');
                if (response) {
                    response.forEach((plan: any) => {
                        setAccountingPlans((prevPlans) => [...prevPlans, {
                            label: plan.compte_num + ' - ' + plan.compte_lib,
                            value: plan.id
                        }]);
                    });
                }
            } catch (error) {
                console.error('Error fetching accounting plans:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchRegex = async () => {
            try {
                const response = await get('/config/getRegexById/vat_number');
                if (response && response.regex) {
                    setRegexes((prevRegexes) => [...prevRegexes, {
                        id: 'vat_number',
                        content: response.regex[0].content
                    }]);
                }

                const response_duns = await get('/config/getRegexById/duns');
                if (response_duns && response_duns.regex) {
                    setRegexes((prevRegexes) => [...prevRegexes, {
                        id: 'duns',
                        content: response_duns.regex[0].content
                    }]);
                }
            } catch (error) {
                console.error('Error fetching regex:', error);
            }
        };

        fetchRegex().then();
        fetchForms().then();
        if (supplierId) {
            fetchSupplier().then();
        }
        fetchCivilities().then();
        fetchCurrencies().then();
        fetchAccountingPlans().then();
    }, [supplierId]);

    // set form default values
    useEffect(() => {
        const applyValues = (source: Record<string, any> | null) => {
            if (!source) return;

            Object.entries(source).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    setValue(key as any, value);
                }
            });
        };

        applyValues(supplier);
        applyValues(address);
        applyValues(newDatas);
    }, [supplier, address, newDatas]);

    const supplierBooleansSchema = z.object({
        get_only_raw_footer: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("ACCOUNTS.get_only_raw_footer")
        })),
        informal_contact: z.boolean().optional().describe(JSON.stringify({
            component: "input_switch",
            label: t("ACCOUNTS.informal_contact")
        }))
    });

    const supplierSchema = z.object({
        name: z.string().optional().describe(JSON.stringify({
            component: "input",
            className: "col-span-3",
            required: !informalContact,
            type: "text",
            label: t("ACCOUNTS.name")
        })),
        email: emptyToUndefined(z.email()).optional().describe(JSON.stringify({
            component: "input",
            className: "col-span-2",
            type: "email",
            label: t("USERS.email")
        })),
        phone: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "phone",
            label: t("ACCOUNTS.phone")
        })),
        civility: z.string().optional().describe(JSON.stringify({
            component: "dropdown",
            options: civilities.map((civility) => ({
                label: civility.label,
                value: civility.id.toString()
            })),
            label: t("USERS.civility")
        })),
        lastname: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            required: informalContact,
            className: "col-span-2",
            label: t("ACCOUNTS.lastname")
        })),
        firstname: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            className: "col-span-2",
            label: t("USERS.firstname")
        })),
        function: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ACCOUNTS.function")
        })),
        vat_number: z.string().optional().refine((value) => {
                if (!value) return true;
                const regex = regexes.find(r => r.id === "vat_number")?.content;
                if (!regex) return true;

                return new RegExp(regex).test(value);
            },
            {
                message: t("ACCOUNTS.invalid_vat_number"),
            }
        ).describe(JSON.stringify({
            component: "input",
            type: "text",
            required: vatMandatory,
            className: "col-span-2",
            label: t("ACCOUNTS.vat_number")
        })),
        siren: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ACCOUNTS.siren")
        })),
        siret: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ACCOUNTS.siret")
        })),
        duns: z.string().refine((value) => {
                if (!value) return true;
                const regex = regexes.find(r => r.id === "duns")?.content;
                if (!regex) return true;

                return new RegExp(regex).test(value);
            },
            {
                message: t("ACCOUNTS.invalid_duns"),
            }
        ).describe(JSON.stringify({
            component: "input",
            type: "text",
            required: !vatMandatory && !informalContact,
            label: t("ACCOUNTS.duns")
        })),
        iban: z.string().optional().describe(JSON.stringify({
            component: "input",
            required: false,
            type: "text",
            label: t("ACCOUNTS.iban")
        })),
        bic: z.string().optional().describe(JSON.stringify({
            component: "input",
            required: false,
            type: "text",
            label: t("ACCOUNTS.bic")
        })),
        rccm: z.string().optional().describe(JSON.stringify({
            component: "input",
            required: false,
            type: "text",
            label: t("ACCOUNTS.rccm")
        })),
        document_lang: z.string().describe(JSON.stringify({
            component: "dropdown",
            options: [
                { label: t('GLOBAL.french'), value: "fra" },
                { label: t('GLOBAL.english'), value: "eng" }
            ],
            label: t("ACCOUNTS.document_lang")
        })),
        default_currency: z.string().optional().describe(JSON.stringify({
            component: "dropdown",
            options: currencies,
            label: t("ACCOUNTS.default_currency")
        })),
        form_id: z.number().optional().describe(JSON.stringify({
            component: "dropdown",
            options: forms.map((form) => ({
                label: form.label,
                value: form.id
            })),
            className: "col-span-2",
            label: t("FORMS.form_name")
        })),
        default_accounting_plan: z.number().optional().describe(JSON.stringify({
            component: "dropdown",
            filter: true,
            options: accountingPlans,
            className: "col-span-6",
            label: t("ACCOUNTS.default_accounting_plan")
        }))
    });

    const addressSchema = z.object({
        address1: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ADDRESSES.address1")
        })),
        address2: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ADDRESSES.address2")
        })),
        postal_code: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ADDRESSES.postal_code")
        })),
        city: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ADDRESSES.city")
        })),
        country: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ADDRESSES.country")
        }))
    });

    const { control, watch, setValue, setError, clearErrors, handleSubmit, formState: { errors } } = useForm({
        mode: "onChange",
        resolver: zodResolver(supplierSchema.safeExtend(addressSchema.shape).extend(supplierBooleansSchema.shape)),
        defaultValues: {
            email: "",
            phone: "",
            civility: "",
            lastname: "",
            firstname: "",
            function: "",
            vat_number: "",
            siren: "",
            siret: "",
            duns: "",
            iban: "",
            bic: "",
            rccm: "",
            document_lang: "",
            default_currency: "",
            form_id: undefined,
            default_accounting_plan: undefined,
            address1: "",
            address2: "",
            postal_code: "",
            city: "",
            country: ""
        }
    });

    const duns = watch("duns");
    const vat = watch("vat_number");
    const informal_contact: any = watch("informal_contact");

    useEffect(() => {
        setInformalContact(informal_contact);
        if (informal_contact) {
            setVatMandatory(false);
            clearErrors("vat_number");
            clearErrors("duns");
            return;
        } else {
            if (vat && !duns) {
                setVatMandatory(true);
            } else if (!vat && duns) {
                setVatMandatory(false);
            }

            if (!vat && !duns) {
                setVatMandatory(true);
                setError("vat_number", {
                    type: "manual",
                    message: t("ACCOUNTS.vat_or_duns_required")
                });
                setError("duns", {
                    type: "manual",
                    message: t("ACCOUNTS.vat_or_duns_required")
                });
            } else {
                clearErrors("vat_number");
                clearErrors("duns");
            }
        }
    }, [vat, duns, informal_contact]);

    const onSubmit = async (data: any) => {
        try {
            setLoadingSubmit(true);
            const addressData: any = {};
            const supplierData: any = {};

            for (const key in data) {
                if (data[key]) {
                    if (key in addressSchema.shape) {
                        addressData[key] = data[key];
                    } else {
                        supplierData[key] = data[key];
                    }
                }
            }

            if (supplier?.address_id) {
                await put(`/accounts/addresses/update/${ supplier?.address_id }`, addressData);
            } else {
                const addressResponse = await post('/accounts/addresses/create', addressData);
                if (addressResponse && addressResponse.id) {
                    supplierData.address_id = addressResponse.id;
                }
            }

            if (!supplierId) {
                const res = await post(`/accounts/suppliers/create`, supplierData);
                if (res && res.id && !onCreated) {
                    navigate(`/suppliers/edit/${ res.id }`);
                }

                showToast(t('ACCOUNTS.supplier_created'), 'success');

                if (onCreated) {
                    onCreated(res);
                }
                return;
            } else {
                await put(`/accounts/suppliers/update/${ supplierId }`, supplierData);
                showToast(t('ACCOUNTS.supplier_updated'), 'success');

                if (onUpdated) {
                    onUpdated();
                }
            }
        } catch (error) {
            console.error("Error updating supplier:", error);
        } finally {
            setLoadingSubmit(false);
        }
    }

    if (loading) return <Loader/>

    return (
        <div className="p-6 bg-(--bg-primary) h-full overflow-y-auto flex flex-col gap-4">
            { onClose && (
                <div className='flex items-center gap-1 text-(--text-secondary) cursor-pointer w-fit'
                     onClick={ () => {
                         onClose();
                     } }>
                    <ArrowLeft/>
                    { t('VERIFIER.back_to_form') }
                </div>
            ) }
            <DynamicForm grid={ 2 } errors={ errors } control={ control } schema={ supplierBooleansSchema }/>
            <Accordion multiple activeIndex={ 0 }>
                <AccordionTab header={ t("ACCOUNTS.supplier_information") }>
                    <div className='p-6'>
                        <DynamicForm grid={ 6 } errors={ errors } control={ control } schema={ supplierSchema }/>
                    </div>
                </AccordionTab>
                <AccordionTab header={ t("ACCOUNTS.supplier_address") }>
                    <div className='p-6'>
                        <DynamicForm grid={ 2 } errors={ errors } control={ control } schema={ addressSchema }/>
                    </div>
                </AccordionTab>
            </Accordion>

            <div className="w-fit">
                { supplierId ? (
                    <Button onClick={ handleSubmit(onSubmit) }
                            disabled={ loadingSubmit || Object.keys(errors).length > 0 }>
                        { loadingSubmit ? t('GLOBAL.updating') : t('ACCOUNTS.update_supplier') }
                    </Button>
                ) : (
                    <Button onClick={ handleSubmit(onSubmit) }
                            disabled={ loadingSubmit || Object.keys(errors).length > 0 }>
                        { loadingSubmit ? t('GLOBAL.creating') : t('ACCOUNTS.create_supplier') }
                    </Button>
                ) }
            </div>
        </div>
    );
}