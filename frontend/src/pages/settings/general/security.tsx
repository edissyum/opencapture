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
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Accordion, AccordionTab } from "primereact/accordion";

import { Button } from "../../../components/Button";
import { RadioBox } from "../../../components/RadioBox";
import { DynamicForm } from "../../../components/form/DynamicForm";
import { axiosApiCall } from "../../../services/hooks/axiosApiCall";
import { showToast } from "../../../components/ToastProvider.tsx";

export function SettingsGeneralSecurity() {
    const { get, put, post } = axiosApiCall();

    const hasFetched = useRef(false);

    const [activeIndex, setActiveIndex] = useState<number[]>([]);
    const [defaultAuth, setDefaultAuth] = useState<string>('');
    const [passwordRules, setPasswordRules] = useState<any>(null);
    const [enabledAuth, setEnabledAuth] = useState<string>('default');

    const default_schema = z.object({
        minLength: z.number().min(0).describe(JSON.stringify({
            component: "input",
            type: "number",
            valueAsNumber: true,
            label: t("SECURITY.min_length")
        })),
        numberMandatory: z.boolean().describe(JSON.stringify({
            component: "input_switch",
            label: t("SECURITY.number_mandatory")
        })),
        specialCharMandatory: z.boolean().describe(JSON.stringify({
            component: "input_switch",
            label: t("SECURITY.special_char_mandatory")
        })),
        upperCaseMandatory: z.boolean().describe(JSON.stringify({
            component: "input_switch",
            label: t("SECURITY.upper_case_mandatory")
        }))
    });

    const { control, setValue, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(default_schema),
        defaultValues: {},
        mode: "onChange"
    });

    const currentMinLength = watch('minLength');

    useEffect(() => {
        if (hasFetched.current) return;

        hasFetched.current = true;

        const fetchEnabledAuth = async () => {
            const res = await get('/auth/retrieveLoginMethodName');
            if (res.login_methods) {
                Object.keys(res.login_methods).forEach((key) => {
                    if (res.login_methods[key].enabled) {
                        setDefaultAuth(res.login_methods[key].method_name);
                        setEnabledAuth(res.login_methods[key].method_name);
                        setActiveIndex(res.login_methods[key].method_name === 'default' ? [0] : [1]);
                    }
                });
            }
        }

        const fetchPasswordRules = async () => {
            const res = await get('/config/getConfiguration/passwordRules');
            if (res.configuration) {
                setPasswordRules(res.configuration[0].data.value);
            }
        };

        fetchEnabledAuth().then();
        fetchPasswordRules().then();
    }, [])

    // Fill form when password rules data is loaded
    useEffect(() => {
        if (!passwordRules) return;

        Object.entries(passwordRules).forEach(([key, value]: any) => {
            setValue(key, value);
        });
    }, [passwordRules]);

    const handleUpdate: any = async (data: FormData) => {
        try {
            await put('/config/updateConfiguration/passwordRules', {
                value: data
            });
            showToast(t('SECURITY.password_rules_updated_successfully'), 'success');
        } catch (error) {
            console.error('Error updating password rules:', error);
        }

        if (enabledAuth !== defaultAuth) {
            try {
                await post('/auth/enableLoginMethodName', {
                    method_name: enabledAuth
                });
                showToast(t('SECURITY.enabled_login_method_updated_successfully'), 'success');
            } catch (error) {
                console.error('Error updating enabled authentication method:', error);
            }
        }
    };

    return (
        <div className="p-8 bg-(--bg-secondary) h-full overflow-auto">
            <h3 className={ 'font-semibold text-(--text-primary)' }>
                { t('SECURITY.generate_auth_token') }
            </h3>
            <p className='w-fit text-(--text-secondary) text-sm mb-6 flex items-center gap-0.5 cursor-pointer hover:text-(--color-primary)'>
                { t('SECURITY.here') }
                <ArrowRight size={ 18 }/>
            </p>
            <Accordion multiple activeIndex={ activeIndex } onTabChange={(e) => setActiveIndex(e.index as number[])}>
                <AccordionTab header={
                    <span className='flex items-center '>
                        <span>{ t('SECURITY.default_auth') }</span>
                        <span className='flex ml-auto' onClick={ (e) => e.stopPropagation() }>
                            <RadioBox
                                border={ false }
                                key={ 'default' }
                                value={ enabledAuth }
                                checked={ enabledAuth === 'default' }
                                onChange={ () => setEnabledAuth('default') }/>
                        </span>
                    </span>
                }>
                    <div className='p-4 text-(--text-primary)'>
                        <h1 className='font-semibold text-md mb-6'>
                            { t('SECURITY.password_rules') }
                        </h1>
                        <div className='w-1/3'>
                            <div className='flex items-center mb-6'>
                                <InputSwitch
                                    inputId={ 'enable_min' }
                                    checked={ currentMinLength > 0 }
                                    onChange={ e => {
                                        if (!e.value) {
                                            setValue('minLength', 0);
                                        } else {
                                            setValue('minLength', 8);
                                        }
                                    } }
                                />
                                <label htmlFor={ 'enable_min' } className='cursor-pointer'>
                                    { t('SECURITY.enable_min_length') }
                                </label>
                            </div>

                            <DynamicForm schema={ default_schema } control={ control } errors={ errors } gap={ 0 }/>
                        </div>
                    </div>
                </AccordionTab>

                <AccordionTab header={
                    <span className='flex items-center'>
                        <span>{ t('SECURITY.ldap_auth') }</span>
                        <span className='flex ml-auto' onClick={ (e) => e.stopPropagation() }>
                            <RadioBox
                                border={ false }
                                key={ 'ldap' }
                                value={ enabledAuth }
                                checked={ enabledAuth === 'ldap' }
                                onChange={ () => setEnabledAuth('ldap') }/>
                        </span>
                    </span>
                }>
                </AccordionTab>
            </Accordion>

            <div>
                <Button className='mt-8' onClick={ handleSubmit(handleUpdate) }>
                    { t('GLOBAL.save_settings') }
                </Button>
            </div>
        </div>
    )
}