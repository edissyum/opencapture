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
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Accordion, AccordionTab } from "primereact/accordion";

import { emptyToUndefined } from "../../services/zod";
import { axiosApiCall } from "../../services/hooks/axiosApiCall";

import { Button } from "../../components/Button";
import { DynamicForm } from "../../components/form/DynamicForm";

export function SupplierEditor() {
    const { get } = axiosApiCall();
    const { supplierId } = useParams<{ supplierId: any }>();

    const [forms, setForms] = useState<any[]>([]);
    const [civilities, setCivilities] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [address, setAddress] = useState<any>(null);
    const [supplier, setSupplier] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [accountingPlans, setAccountingPlans] = useState<any[]>([]);
    const [vatMandatory, setVatMandatory] = useState<boolean>(true);

    // fetch supplier data and currencies and forms and civilities and accounting plans
    useEffect(() => {
        if (!supplierId) return;

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
            }
        };

        fetchForms().then();
        fetchSupplier().then();
        fetchCivilities().then();
        fetchCurrencies().then();
        fetchAccountingPlans().then();
    }, []);

    // set form default values
    useEffect(() => {
        if (supplier) {
            for (const [key, value] of Object.entries(supplier)) {
                setValue(key as any, value);
            }
        }
        if (address) {
            for (const [key, value] of Object.entries(address)) {
                setValue(key as any, value);
            }
        }
    }, [supplier, address]);

    const supplierSchema = z.object({
        name: z.string().min(1).optional().describe(JSON.stringify({
            component: "input",
            className: "col-span-3",
            type: "text",
            label: t("ACCOUNTS.name")
        })),
        email: emptyToUndefined(z.email().optional()).describe(JSON.stringify({
            component: "input",
            className: "col-span-2",
            type: "email",
            label: t("USERS.email")
        })),
        phone: emptyToUndefined(z.string().min(1)).optional().describe(JSON.stringify({
            component: "input",
            type: "phone",
            label: t("ACCOUNTS.phone")
        })),
        civility: emptyToUndefined(z.number().optional()).describe(JSON.stringify({
            component: "dropdown",
            options: civilities.map((civility) => ({
                label: civility.label,
                value: civility.id
            })),
            label: t("USERS.civility")
        })),
        lastname: emptyToUndefined(z.string().min(1)).optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            className: "col-span-2",
            label: t("ACCOUNTS.lastname")
        })),
        firstname: emptyToUndefined(z.string().min(1)).describe(JSON.stringify({
            component: "input",
            type: "text",
            className: "col-span-2",
            label: t("USERS.firstname")
        })),
        function: emptyToUndefined(z.string().min(1)).describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ACCOUNTS.function")
        })),
        vat_number: z.string().optional().describe(JSON.stringify({
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
        duns: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            required: !vatMandatory,
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
                { label: t('GLOBAL.english'), value: "eng" },
                { label: t('GLOBAL.french'), value: "fra" }
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
    }).superRefine((data, ctx) => {
        console.log("Both VAT number and DUNS are missing");
        if (!data.vat_number && !data.duns) {
            ctx.addIssue({
                path: ["vat_number"],
                message: t("ACCOUNTS.vat_or_duns_required"),
                code: z.ZodIssueCode.custom,
            });

            ctx.addIssue({
                path: ["duns"],
                message: t("ACCOUNTS.vat_or_duns_required"),
                code: z.ZodIssueCode.custom,
            });
        }
    });

    const addressSchema = z.object({
        address1: z.string().min(1).optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ADDRESSES.address1")
        })),
        address2: z.string().min(1).optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ADDRESSES.address2")
        })),
        postal_code: z.string().min(1).optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ADDRESSES.postal_code")
        })),
        city: z.string().min(1).optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ADDRESSES.city")
        })),
        country: z.string().min(1).optional().describe(JSON.stringify({
            component: "input",
            type: "text",
            label: t("ADDRESSES.country")
        }))
    });

    const { control, watch, setValue, setError, clearErrors, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(supplierSchema.safeExtend(addressSchema.shape)),
        defaultValues: {},
        mode: "onChange"
    });

    const vat = watch("vat_number");
    const duns = watch("duns");

    useEffect(() => {
        if (vat && !duns) {
            setVatMandatory(true);
        } else if (!vat && duns) {
            setVatMandatory(false);
        }
    }, [vat, duns]);

    const handleUpdate = (data: any) => {
        console.log("Form submitted with data:", data);
    }

    return (
        <div className="p-8 bg-(--bg-primary) h-full overflow-y-auto">
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

            <div className="mt-6 w-fit">
                { supplierId ? (
                    <Button onClick={ handleSubmit(handleUpdate) }
                            disabled={ loading || Object.keys(errors).length > 0 }>
                        { loading ? t('ACCOUNTS.updating') : t('ACCOUNTS.update_supplier') }
                    </Button>
                ) : (
                    <div></div>
                    // <Button onClick={ handleSubmit(handleCreate) }
                    //         disabled={ loading || Object.keys(errors).length > 0 }>
                    //     { loading ? t('USERS.creating') : t('USERS.create_user') }
                    // </Button>
                ) }
            </div>
        </div>
    );
}