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

import { axiosApiCall } from "../../services/hooks/axiosApiCall";

import { Button } from "../../components/Button";
import { showToast } from "../../components/ToastProvider";
import { DynamicForm } from "../../components/form/DynamicForm";

export function CustomerEditor() {
    const { get, post, put } = axiosApiCall();
    const navigate = useNavigate();
    const { customerId } = useParams<{ customerId: any }>();

    const [address, setAddress] = useState<any>(null);
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // fetch customer data
    useEffect(() => {
        if (!customerId) return;

        const fetchCustomer = async () => {
            try {
                const response = await get(`/accounts/customers/getById/${ customerId }`);
                if (response) {
                    setCustomer(response);
                    if (response.address_id) {
                        const addressResponse = await get(`/accounts/getAdressById/${ response.address_id }`);
                        if (addressResponse) {
                            setAddress(addressResponse);
                            setCustomer((prev: any) => ({ ...prev, address: addressResponse }));
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching customer data:', error);
            }
        };

        fetchCustomer().then();
    }, []);

    // set form default values
    useEffect(() => {
        if (customer) {
            for (const [key, value] of Object.entries(customer)) {
                setValue(key as any, value);
            }
        }
        if (address) {
            for (const [key, value] of Object.entries(address)) {
                setValue(key as any, value);
            }
        }
    }, [customer, address]);

    const customerSchema = z.object({
        name: z.string().min(1).describe(JSON.stringify({
            component: "input",
            required: true,
            type: "text",
            label: t("ACCOUNTS.name")
        })),
        vat_number: z.string().optional().describe(JSON.stringify({
            component: "input",
            type: "text",
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
        company_number: z.string().optional().describe(JSON.stringify({
            component: "input",
            required: false,
            type: "text",
            label: t("ACCOUNTS.iban")
        })),
        module: z.string().describe(JSON.stringify({
            component: "dropdown",
            options: [
                { label: 'Verifier', value: "verifier" },
                { label: 'Splitter', value: "splitter" }
            ],
            label: t("MAILCOLLECT.module")
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

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(customerSchema.safeExtend(addressSchema.shape)),
        defaultValues: {
            name: "",
            vat_number: "",
            siren: "",
            siret: "",
            company_number: "",
            module: "",
            address1: "",
            address2: "",
            postal_code: "",
            city: "",
            country: ""
        },
        mode: "onChange"
    });

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            const addressData: any = {};
            const customerData: any = {};

            for (const key in data) {
                if (key in addressSchema.shape) {
                    addressData[key] = data[key];
                } else {
                    customerData[key] = data[key];
                }
            }

            if (customer?.address_id) {
                await put(`/accounts/addresses/update/${ customer?.address_id }`, addressData);
            } else {
                const addressResponse = await post('/accounts/addresses/create', addressData);
                if (addressResponse && addressResponse.id) {
                    customerData.address_id = addressResponse.id;
                }
            }

            if (!customerId) {
                const res = await post(`/accounts/customers/create`, customerData);
                if (res && res.id) {
                    navigate(`/customers/edit/${ res.id }`);
                }
                showToast(t('ACCOUNTS.customer_created'), 'success');
                return;
            } else {
                await put(`/accounts/customers/update/${ customerId }`, customerData);
                showToast(t('ACCOUNTS.customer_updated'), 'success');
            }
        } catch (error) {
            console.error("Error updating customer:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-8 bg-(--bg-primary) h-full overflow-y-auto">
            <div className='flex items-center gap-1 text-(--text-secondary) cursor-pointer mb-6 w-fit'
                 onClick={ () => navigate('/customers') }>
                <ArrowLeft/>
                { t('ACCOUNTS.customers_list') }
            </div>
            <Accordion multiple activeIndex={ 0 }>
                <AccordionTab header={ t("ACCOUNTS.customer_information") }>
                    <div className='p-6'>
                        <DynamicForm grid={ 3 } errors={ errors } control={ control } schema={ customerSchema }/>
                    </div>
                </AccordionTab>
                <AccordionTab header={ t("ACCOUNTS.customer_address") }>
                    <div className='p-6'>
                        <DynamicForm grid={ 2 } errors={ errors } control={ control } schema={ addressSchema }/>
                    </div>
                </AccordionTab>
            </Accordion>

            <div className="mt-6 w-fit">
                { customerId ? (
                    <Button onClick={ handleSubmit(onSubmit) }
                            disabled={ loading || Object.keys(errors).length > 0 }>
                        { loading ? t('GLOBAL.updating') : t('ACCOUNTS.update_customer') }
                    </Button>
                ) : (
                    <Button onClick={ handleSubmit(onSubmit) }
                            disabled={ loading || Object.keys(errors).length > 0 }>
                        { loading ? t('GLOBAL.creating') : t('ACCOUNTS.create_customer') }
                    </Button>
                ) }
            </div>
        </div>
    );
}