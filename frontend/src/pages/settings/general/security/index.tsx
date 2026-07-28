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
import { Stepper } from "primereact/stepper";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { StepperPanel } from "primereact/stepperpanel";
import { Accordion as AccordionMantine } from "@mantine/core";

import { Button } from "../../../../components/Button";
import { RadioBox } from "../../../../components/RadioBox";
import { showToast } from "../../../../components/ToastProvider";
import { InputSwitch } from "../../../../components/InputSwitch";
import { DynamicForm } from "../../../../components/form/DynamicForm";

import { useUser } from "../../../../services/hooks/useUser";
import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { useNavigate } from "react-router-dom";
import { Loader } from "../../../../components/loader/Loader.tsx";

export function SettingsGeneralSecurity() {
    const navigate = useNavigate();
    const { user, loadingUser } = useUser();
    const { get, put, post } = axiosApiCall();

    const hasFetched = useRef(false);
    const stepperRef = useRef<any>(null);

    const [roles, setRoles] = useState<any>([]);
    const [activeIndex, setActiveIndex] = useState<string[]>([]);
    const [stepperIndex, setStepperIndex] = useState(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [defaultAuth, setDefaultAuth] = useState<string>('');
    const [loadingLdap, setLoadingLdap] = useState<boolean>(false);
    const [enabledAuth, setEnabledAuth] = useState<string>('default');

    useEffect(() => {
        if (loadingUser) return;

        const fetchRoles = async () => {
            try {
                const response = await get(`/roles/list/user/${ user.id }`, {});
                setRoles(response.roles);
            } catch (error) {
                console.error('Error while fetching roles :', error);
            }
        }
        fetchRoles().then();
    }, [user, loadingUser]);

    const defaultSchema = z.object({
        minLength: z.number().describe(JSON.stringify({
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

    const ldapConnectionSchema = z.object({
        typeAD: z.enum(['openLDAP', 'adLDAP']).describe(JSON.stringify({
            component: "select",
            required: enabledAuth === 'ldap',
            label: t("SECURITY.ldap_ad_type"),
            options: [
                { label: 'openLDAP', value: 'openLDAP' },
                { label: 'adLDAP', value: 'adLDAP' }
            ]
        })),
        host: z.string().min(1).describe(JSON.stringify({
            component: "input",
            required: enabledAuth === 'ldap',
            label: t("SECURITY.ldap_host")
        })),
        port: z.number().min(1).max(65535).describe(JSON.stringify({
            type: "number",
            component: "input",
            valueAsNumber: true,
            required: enabledAuth === 'ldap',
            label: t("SECURITY.ldap_port")
        })),
        loginAdmin: z.string().min(1).describe(JSON.stringify({
            component: "input",
            required: enabledAuth === 'ldap',
            label: t("SECURITY.ldap_admin_login")
        })),
        passwordAdmin: z.string().min(1).describe(JSON.stringify({
            type: "password",
            component: "input",
            required: enabledAuth === 'ldap',
            label: t("SECURITY.ldap_admin_password")
        })),
        baseDN: z.string().min(1).describe(JSON.stringify({
            component: "input",
            required: enabledAuth === 'ldap',
            label: t("SECURITY.ldap_base_dn"),
            hint: t('SECURITY.ldap_base_dn_hint')
        })),
        prefix: z.string().optional().describe(JSON.stringify({
            required: false,
            component: "input",
            label: t("SECURITY.ldap_prefix"),
            hint: t('SECURITY.ldap_prefix_hint')
        })),
        suffix: z.string().optional().describe(JSON.stringify({
            required: false,
            component: "input",
            label: t("SECURITY.ldap_suffix"),
            hint: t('SECURITY.ldap_suffix_hint')
        }))
    });

    const getZodString = () => {
        return enabledAuth === 'ldap' && stepperIndex == 1
            ? z.string().min(1)
            : z.string().optional();
    };
    const ldapSynchronisationSchema = z.object({
        attributSourceUser: getZodString().describe(JSON.stringify({
            component: "input",
            required: enabledAuth === 'ldap' && stepperIndex == 1,
            label: t("SECURITY.ldap_attribut_source_user"),
            hint: t('SECURITY.ldap_attribut_source_user_hint')
        })),
        classObject: z.string().optional().describe(JSON.stringify({
            component: "input",
            label: t("SECURITY.ldap_class_object"),
            hint: t('SECURITY.ldap_class_object_hint')
        })),
        classUser: z.string().optional().describe(JSON.stringify({
            component: "input",
            label: t("SECURITY.ldap_class_user"),
            hint: t('SECURITY.ldap_class_user_hint')
        })),
        attributFirstName: getZodString().describe(JSON.stringify({
            component: "input",
            required: enabledAuth === 'ldap' && stepperIndex == 1,
            label: t("SECURITY.ldap_attribute_first_name"),
            hint: t('SECURITY.ldap_attribute_first_name_hint')
        })),
        attributLastName: getZodString().describe(JSON.stringify({
            component: "input",
            required: enabledAuth === 'ldap' && stepperIndex == 1,
            label: t("SECURITY.ldap_attribute_last_name"),
            hint: t('SECURITY.ldap_attribute_last_name_hint')
        })),
        usersDN: z.string().optional().describe(JSON.stringify({
            component: "input",
            label: t("SECURITY.ldap_users_dn"),
            hint: t('SECURITY.ldap_users_dn_hint')
        })),
        attributRoleDefault: z.number().describe(JSON.stringify({
            component: "select",
            required: enabledAuth === 'ldap' && stepperIndex == 1,
            label: t("SECURITY.attribut_role_default"),
            options: roles.map((role: any) => ({
                value: role.id,
                label: role.label
            }))
        }))
    });

    const {
        control: defaultControl,
        setValue: defaultSetValue,
        handleSubmit: defaultHandleSubmit,
        watch: defaultWatch,
        formState: { errors: defaultErrors }
    } = useForm({
        resolver: zodResolver(defaultSchema),
        defaultValues: {
            numberMandatory: false,
            upperCaseMandatory: false,
            specialCharMandatory: false
        },
        mode: "onChange"
    });

    const {
        control: ldapControl,
        setValue: ldapSetValue,
        handleSubmit: ldapHandleSubmit,
        formState: { errors: ldapErrors }
    } = useForm({
        resolver: zodResolver(ldapConnectionSchema.extend(ldapSynchronisationSchema.shape)),
        defaultValues: {},
        mode: "onChange"
    });

    const currentMinLength = defaultWatch('minLength');

    // Fetch enabled authentication method, password rules and ldap settings
    useEffect(() => {
        if (hasFetched.current) return;

        hasFetched.current = true;

        const fetchEnabledAuth = async () => {
            const res = await get('/auth/getEnabledLoginMethod');
            if (res.login_method_name) {
                setDefaultAuth(res.login_method_name[0].method_name);
                setEnabledAuth(res.login_method_name[0].method_name);
                setActiveIndex(res.login_method_name[0].method_name === 'default' ? ['default'] : ['ldap']);
            }
        }

        const fetchPasswordRules = async () => {
            const res = await get('/config/getConfiguration/passwordRules');
            if (res.configuration) {
                Object.entries(res.configuration[0].data.value).forEach(([key, value]: any) => {
                    defaultSetValue(key, value);
                });
            }
            setLoading(false);
        };

        const fetchLdapSettings = async () => {
            const res = await get('/auth/retrieveLdapConfigurations');
            if (res.ldap_configurations) {
                Object.entries(res.ldap_configurations[0].data).forEach(([key, value]: any) => {
                    if (key === 'port') {
                        value = Number(value);
                    }
                    ldapSetValue(key, value);
                });
            }
        };

        fetchEnabledAuth().then();
        fetchLdapSettings().then();
        fetchPasswordRules().then();
    }, [])

    const handleUpdate: any = async (data: FormData) => {

        if (enabledAuth === 'default') {
            try {
                await put('/config/updateConfiguration/passwordRules', { value: data });
                showToast(t('SECURITY.password_rules_updated_successfully'), 'success');
            } catch (error) {
                console.error('Error updating password rules :', error);
            }
        } else if (enabledAuth === 'ldap') {
            try {
                await post('/auth/saveLoginMethodConfig', data);
                showToast(t('SECURITY.ldap_settings_updated_successfully'), 'success');
            } catch (error) {
                console.error('Error updating LDAP settings :', error);
            }
        }

        if (enabledAuth !== defaultAuth) {
            try {
                await post('/auth/enableLoginMethodName', { method_name: enabledAuth });
                showToast(t('SECURITY.enabled_login_method_updated_successfully'), 'success');
            } catch (error) {
                console.error('Error updating enabled authentication method :', error);
            }
        }
    };

    const handleNextStep: any = (data: FormData) => {
        if (data && Object.keys(ldapErrors).length > 0) {
            return;
        }
        stepperRef.current?.nextCallback();
    }

    const handlePreviousStep = () => stepperRef.current?.prevCallback();

    const handleTestConnexion: any = async (data: FormData) => {
        setLoadingLdap(true);

        try {
            await post('/auth/connectionLdap', data);
            handleNextStep(data);
            showToast(t('MAILCOLLECT.ldap_connection_successful'), 'success');
            setLoadingLdap(false);
        } catch (error) {
            setLoadingLdap(false);
            console.error('Error testing LDAP connection :', error);
        }
    };

    const launchSync: any = async (data: FormData) => {
        setLoadingLdap(true);
        try {
            const res = await post('/auth/ldapSynchronization', data);

            let message = t('SECURITY.ldap_synchronization_successful') + '<br><br> <strong>';
            if (res.create_users !== undefined) {
                message += t('SECURITY.ldap_synchronization_create_users', { count: res.create_users }) + '<br> ';
            }
            if (res.disabled_users !== undefined) {
                message += t('SECURITY.ldap_synchronization_disabled_users', { count: res.disabled_users }) + '<br> ';
            }
            if (res.update_users !== undefined) {
                message += t('SECURITY.ldap_synchronization_updated_users', { count: res.update_users }) + '<br> ';
            }
            message += '</strong>';
            showToast(message, 'success');
        } catch (error) {
            console.error('Error launching LDAP synchronization :', error);
        } finally {
            setLoadingLdap(false);
        }
    }

    if (loading) return <Loader/>;

    return (
        <div className="p-6 bg-(--bg-secondary) h-full overflow-auto">
            <h3 className='font-semibold text-(--text-primary)'>
                { t('SECURITY.generate_auth_token') }
            </h3>
            <div onClick={ () => navigate('/settings/general/security/token') }
                 className='w-fit text-(--text-secondary) text-sm mb-6 flex items-center gap-0.5 cursor-pointer hover:text-(--color-primary)'>
                { t('SECURITY.here') }
                <ArrowRight size={ 18 }/>
            </div>

            <AccordionMantine chevronPosition="left" variant="separated" multiple defaultValue={ activeIndex }
                              onChange={ (e) => setActiveIndex(e) }>
                <AccordionMantine.Item key='default' value='default'>
                    <div className='flex items-center'>
                        <AccordionMantine.Control>
                            { t('SECURITY.default_auth') }
                        </AccordionMantine.Control>
                        <span className='flex ml-auto mr-4' onClick={ (e) => e.stopPropagation() }>
                        <RadioBox
                            border={ false }
                            key={ 'default' }
                            value={ enabledAuth }
                            checked={ enabledAuth === 'default' }
                            onChange={ () => setEnabledAuth('default') }/>
                    </span>
                    </div>
                    <AccordionMantine.Panel>
                        <div className='p-6 text-(--text-primary) flex flex-col gap-4'>
                            <h1 className='font-semibold text-md'>
                                { t('SECURITY.password_rules') }
                            </h1>
                            <div className='w-1/3 flex flex-col gap-4'>
                                <div className='flex items-center'>
                                    <InputSwitch
                                        id='enable_min'
                                        label={ t('SECURITY.enable_min_length') }
                                        checked={ currentMinLength > 0 }
                                        onChange={ (value) => {
                                            if (!value) {
                                                defaultSetValue('minLength', 0);
                                            } else {
                                                defaultSetValue('minLength', 8);
                                            }
                                        } }
                                    />
                                </div>
                                <DynamicForm schema={ defaultSchema } control={ defaultControl }
                                             errors={ defaultErrors }
                                             gap={ 2 }/>
                            </div>
                        </div>
                    </AccordionMantine.Panel>
                </AccordionMantine.Item>
                <AccordionMantine.Item key='ldap' value='ldap'>
                    <div className='flex items-center'>
                        <AccordionMantine.Control>
                            { t('SECURITY.ldap_auth') }
                        </AccordionMantine.Control>
                        <span className='flex ml-auto mr-4' onClick={ (e) => e.stopPropagation() }>
                        <RadioBox
                            border={ false }
                            key={ 'ldap' }
                            value={ enabledAuth }
                            checked={ enabledAuth === 'ldap' }
                            onChange={ () => setEnabledAuth('ldap') }/>
                    </span>
                    </div>

                    <AccordionMantine.Panel>
                        <Stepper ref={ stepperRef } linear className='p-4 pb-0' activeStep={ stepperIndex }
                                 onChangeStep={ (e: any) => setStepperIndex(e.index) }>
                            <StepperPanel header={ t("MAILCOLLECT.connection") }>
                                <DynamicForm schema={ ldapConnectionSchema } control={ ldapControl }
                                             errors={ ldapErrors }
                                             grid={ 4 }/>
                                <div className="flex justify-end mt-6">
                                    <Button onClick={ ldapHandleSubmit(handleTestConnexion) }
                                            className="ml-auto px-12"
                                            data-tooltip-id='tooltip'
                                            data-tooltip-content={ t("MAILCOLLECT.test_connexion_next") }
                                            disabled={ loadingLdap || Object.keys(ldapErrors).length > 0 }>
                                        { loadingLdap ? (
                                            t("MAILCOLLECT.loading_test_connexion")
                                        ) : (
                                            t("GLOBAL.next")
                                        ) }
                                    </Button>
                                </div>
                            </StepperPanel>
                            <StepperPanel header={ t("SECURITY.synchronisation") }>
                                <DynamicForm schema={ ldapSynchronisationSchema } control={ ldapControl }
                                             errors={ ldapErrors } grid={ 4 }/>

                                <div className="flex justify-between mt-6">
                                    <Button onClick={ handlePreviousStep } variant="no_bg"
                                            className="mr-2 px-0! text-(--color-primary) border-transparent hover:text-(--text-primary)">
                                        <ArrowLeft/> { t("MAILCOLLECT.previous") }
                                    </Button>
                                    <Button onClick={ ldapHandleSubmit(launchSync) }
                                            disabled={ Object.keys(ldapErrors).length > 0 || loadingLdap }
                                            className="ml-auto px-12">
                                        { loadingLdap ? (
                                            t("SECURITY.test_sync_loading")
                                        ) : (
                                            t("SECURITY.test_sync")
                                        ) }
                                    </Button>
                                </div>
                            </StepperPanel>
                        </Stepper>
                    </AccordionMantine.Panel>
                </AccordionMantine.Item>
            </AccordionMantine>

            <div>
                <Button className='mt-8'
                        onClick={ enabledAuth === 'default' ? defaultHandleSubmit(handleUpdate) : ldapHandleSubmit(handleUpdate) }>
                    { t('GLOBAL.save_settings') }
                </Button>
            </div>
        </div>
    )
}