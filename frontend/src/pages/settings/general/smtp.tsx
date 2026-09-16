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
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Input from "../../../components/Input";
import { Button } from "../../../components/Button";
import { RadioBox } from "../../../components/RadioBox";
import { showToast } from "../../../components/ToastProvider";
import { InputSwitch } from "../../../components/InputSwitch";

import { emptyToUndefined } from "../../../services/zod";
import { AxiosApiCall } from "../../../services/hooks/AxiosApiCall";


export function SettingsGeneralSMTP() {
    const { get, post, put } = AxiosApiCall();

    const smtpProtocoleSecureEnum = z.enum(['ssl', 'tls', 'none']);

    const schema: any = z.object({
        smtpHost: z.string().min(1, { message: t('SMTP.smtp_host_required') }),
        smtpPort: z.number().min(1).max(65535),
        smtpProtocoleSecure: smtpProtocoleSecureEnum,
        smtpAuth: z.boolean(),
        smtpLogin: z.string().optional(),
        smtpPwd: z.string().optional(),
        smtpNotifOnError: z.boolean(),
        smtpFromMail: emptyToUndefined(z.email().optional()),
        smtpDestAdminMail: emptyToUndefined(z.email().optional()),
        smtpDelay: z.string().optional()
    });
    type FormData = z.infer<typeof schema>;

    const {
        control,
        watch,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            smtpHost: "smtp.gmail.com",
            smtpPort: 465,
            smtpProtocoleSecure: 'ssl',
            smtpDelay: '30',
            smtpAuth: true,
            smtpFromMail: "",
            smtpDestAdminMail: ""
        }
    });

    const [selectedProvider, setSelectedProvider] = useState('Gmail');
    const [selectedEncryption, setSelectedEncryption] = useState('tls');
    const [destinationTestEmail, setDestinationTestEmail] = useState('');
    const [statusTestEmail, setStatusTestEmail] = useState('');
    const [statusLoadingTestEmail, setStatusLoadingTestEmail] = useState(false);
    const [statusTestEmailMessage, setStatusTestEmailMessage] = useState('');

    const smtpAuth = watch('smtpAuth');
    const smtpNotifOnError = watch('smtpNotifOnError');

    useEffect(() => {
        async function fetchData() {
            await get('config/getConfiguration/smtp').then((response) => {
                if (response && response.configuration && response.configuration.length > 0) {
                    Object.keys(response.configuration[0].data.value).forEach((key: any) => {
                        const value = response.configuration[0].data.value[key];
                        setValue(key, value);
                        if (key === 'smtpProtocoleSecure') {
                            setSelectedEncryption(response.configuration[0].data.value[key]);
                        }
                        if (key === 'smtpHost') {
                            const provider = providers.find(p => p.host === response.configuration[0].data.value[key]);
                            if (provider) {
                                setSelectedProvider(provider.name);
                            } else {
                                setSelectedProvider(t('SMTP.other_provider'));
                            }
                        }
                    });
                }
            });
        }

        fetchData().then();
    }, []);

    const providers = [
        { name: "Gmail", host: "smtp.gmail.com", port: 465, secure: 'ssl', logo: "/imgs/smtp/gmail.svg" },
        {
            name: "Outlook",
            host: "smtp-mail.outlook.com",
            port: 587,
            secure: 'tls',
            logo: "/imgs/smtp/outlook.svg"
        },
        { name: t('SMTP.other_provider'), host: "", port: 587, secure: 'none' }
    ];

    const handleProviderChange = (providerName: string) => {
        setSelectedProvider(providerName);

        const provider = providers.find(p => p.name === providerName);
        if (provider) {
            setValue('smtpHost', provider.host);
            setValue('smtpPort', provider.port);
            setSelectedEncryption(provider.secure as string);
            setValue('smtpProtocoleSecure', provider.secure as any);
        }
    }

    const onSubmit = async (data: FormData) => {
        const completeData = {
            smtpHost: data.smtpHost || "",
            smtpPort: data.smtpPort || 0,
            smtpProtocoleSecure: data.smtpProtocoleSecure || "none",
            smtpAuth: data.smtpAuth ?? false,
            smtpLogin: data.smtpLogin || "",
            smtpPwd: data.smtpPwd || "",
            smtpNotifOnError: data.smtpNotifOnError ?? false,
            smtpFromMail: data.smtpFromMail || "",
            smtpDestAdminMail: data.smtpDestAdminMail || "",
            smtpDelay: data.smtpDelay.toString() || '0'
        };

        try {
            await put('config/updateConfiguration/smtp', {
                value: completeData
            });
            showToast(t('SMTP.settings_saved'), 'success');
        } catch (err) {
            console.error("Erreur modification des paramètres SMTP :", err);
        }
    };

    const handleTestEmail = async () => {
        setStatusLoadingTestEmail(true);
        setStatusTestEmailMessage('');
        try {
            await post('smtp/test', { email: destinationTestEmail }, { showErrorToast: false });
            setStatusTestEmail('success');
            setStatusLoadingTestEmail(false);
        } catch (err: any) {
            setStatusTestEmail('error');
            setStatusTestEmailMessage(err?.response?.data?.message);
            setStatusLoadingTestEmail(false);
            console.error("Erreur envoi email de test :", err);
        }
    }

    return (
        <div className='flex h-full overflow-hidden'>
            <div className='border-r border-(--border-secondary) w-full overflow-y-auto'>
                <div className='p-6 flex flex-col gap-8'>
                    <div>
                        <h3 className='text-xl font-bold'>{ t('SMTP.provider') }</h3>
                        <div className='flex gap-4 mt-4'>
                            { providers.map((provider) => (
                                <div key={ provider.name }
                                     onClick={ () => handleProviderChange(provider.name) }
                                     className={ `border border-(--border-secondary) hover:border-(--border-primary) transition-colors
                             rounded-lg px-8 py-3 cursor-pointer flex items-center justify-center gap-4
                             ${ selectedProvider === provider.name ? 'bg-(--bg-selected) border-(--border-primary)!' : '' } ` }>
                                    { provider.logo &&
                                        <img src={ provider.logo } alt={ provider.name } className='h-5'/> }
                                    <p className='text-lg font-semibold'>{ provider.name }</p>
                                </div>
                            )) }
                        </div>
                    </div>

                    <div className='flex flex-col gap-4 w-1/2'>
                        <div className='flex flex-col gap-4'>
                            <h3 className='text-xl font-bold'>{ t('SMTP.settings') }</h3>
                            <div className='flex items-center gap-4'>
                                <div className='w-full'>
                                    <Controller
                                        control={ control }
                                        name='smtpHost'
                                        render={ ({ field }) => (
                                            <Input
                                                required
                                                { ...field }
                                                placeholder='smtp.example.com'
                                                label={ t("SMTP.host") }
                                                error={ errors.smtpHost?.message }
                                            />
                                        ) }
                                    />
                                </div>
                                <div className='w-2/12'>
                                    <Controller
                                        control={ control }
                                        name='smtpPort'
                                        render={ ({ field }) => (
                                            <Input
                                                required
                                                { ...field }
                                                placeholder='587'
                                                label={ t("SMTP.port") }
                                                error={ errors.smtpPort?.message }
                                            />
                                        ) }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <h3 className='text-xl font-bold'>{ t('SMTP.authentication') }</h3>
                            <div className='flex flex-col gap-4'>
                                <Controller
                                    control={ control }
                                    name='smtpAuth'
                                    render={ ({ field }) => (
                                        <div className='flex gap-1'>
                                            <InputSwitch
                                                id='smtp_auth'
                                                checked={ field.value }
                                                label={ t('SMTP.smtp_auth') }
                                                onChange={ (value) => field.onChange(value) }
                                            />
                                        </div>
                                    ) }
                                />
                                <div className='flex items-center gap-4'>
                                    <div className='w-1/2'>
                                        <Controller
                                            control={ control }
                                            name='smtpLogin'
                                            render={ ({ field }) => (
                                                <Input
                                                    id='smtpLogin'
                                                    value={ field.value }
                                                    disabled={ !smtpAuth }
                                                    onChange={ (value) => field.onChange(value) }
                                                    label={ t('SMTP.login') } autoComplete='new-mail'
                                                    error={ errors.smtpLogin?.message }/>
                                            ) }
                                        />
                                    </div>
                                    <div className='w-1/2'>
                                        <Controller
                                            control={ control }
                                            name='smtpPwd'
                                            render={ ({ field }) => (
                                                <Input
                                                    id='smtpPwd'
                                                    value={ field.value }
                                                    disabled={ !smtpAuth } type='password'
                                                    onChange={ (value) => field.onChange(value) }
                                                    label={ t('SMTP.password') } autoComplete='new-password'
                                                    error={ errors.smtpPwd?.message }/>
                                            ) }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <h3 className='text-xl font-bold'>{ t('SMTP.encryption') }</h3>
                            <div className='flex gap-4'>
                                { smtpProtocoleSecureEnum.options.map((option: any) => (
                                    <Controller
                                        key={ option }
                                        control={ control }
                                        name='smtpProtocoleSecure'
                                        render={ ({ field }) => (
                                            <RadioBox
                                                label={ option === 'none' ? t('SMTP.secure_none') : option.toUpperCase() }
                                                value={ field.value ?? '' }
                                                checked={ selectedEncryption === option }
                                                onChange={ () => {
                                                    field.onChange(option);
                                                    setSelectedEncryption(option)
                                                } }
                                            />
                                        ) }
                                    />
                                )) }
                            </div>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <h3 className='text-xl font-bold'>{ t('SMTP.error_notifications') }</h3>
                            <div className='flex flex-col gap-4'>
                                <Controller
                                    control={ control }
                                    name='smtpNotifOnError'
                                    render={ ({ field }) => (
                                        <div className='flex gap-1'>
                                            <InputSwitch
                                                id='enable_error_notifications' checked={ field.value }
                                                label={ t('SMTP.enable_error_notifications') }
                                                onChange={ (value) => field.onChange(value) }
                                            />
                                        </div>
                                    ) }
                                />
                                <div className='flex gap-4'>
                                    <Controller
                                        control={ control }
                                        name='smtpFromMail'
                                        render={ ({ field }) => (
                                            <Input
                                                { ...field }
                                                className='w-1/2'
                                                autoComplete='new-mail'
                                                disabled={ !smtpNotifOnError }
                                                label={ t("SMTP.from_mail") }
                                                error={ errors.smtpFromMail?.message }
                                            />
                                        ) }
                                    />
                                    <Controller
                                        control={ control }
                                        name='smtpDestAdminMail'
                                        render={ ({ field }) => (
                                            <Input
                                                { ...field }
                                                className='w-1/2'
                                                autoComplete='new-mail'
                                                disabled={ !smtpNotifOnError }
                                                label={ t("SMTP.destination_admin_mail") }
                                                error={ errors.smtpDestAdminMail?.message }
                                            />
                                        ) }
                                    />
                                </div>

                                <Controller
                                    control={ control }
                                    name='smtpDelay'
                                    render={ ({ field }) => (
                                        <Input
                                            required
                                            { ...field }
                                            className='w-[5rem]'
                                            autoComplete='new-mail'
                                            disabled={ !smtpNotifOnError }
                                            error={ errors.smtpDestAdminMail?.message }
                                            label={ t("SMTP.delay_between_emails") }
                                            hint={ t('SMTP.delay_between_emails_infos') }
                                        />
                                    ) }
                                />

                                {/*<Input id='smtpDelay' disabled={ !smtpNotifOnError }*/}
                                {/*       { ...register('smtpDelay') }*/}
                                {/*       placeholder='30' label={ t('SMTP.delay_between_emails') }*/}
                                {/*       hint={ t('SMTP.delay_between_emails_infos') } className='w-[5rem]'*/}
                                {/*/>*/}
                            </div>
                        </div>
                    </div>

                    <Button type='submit' disabled={ isSubmitting } onClick={ handleSubmit(onSubmit) }>
                        { isSubmitting ? t('GLOBAL.saving') + "..." : t('GLOBAL.save_settings') }
                    </Button>
                </div>
            </div>
            <div className='w-[40rem] bg-(--border-secondary)'>
                <div className='bg-(--bg-primary)'>
                    <div className='flex flex-col gap-4 p-6'>
                        <div>
                            <h3 className='text-xl font-bold'>{ t('SMTP.send_test') }</h3>
                            <p className='mt-2 text-(--text-secondary)'>{ t('SMTP.send_test_infos') }</p>
                        </div>
                        <Input id='testEmail' type='email' value={ destinationTestEmail }
                               label={ t('SMTP.destination_test_email') }
                               onChange={ (e) => setDestinationTestEmail(e.target.value) }/>

                        <Button disabled={ destinationTestEmail === '' || statusLoadingTestEmail }
                                onClick={ handleTestEmail }>
                            { statusLoadingTestEmail ? t('SMTP.sending') + "..." : t('SMTP.send_test_email') }
                        </Button>
                    </div>
                </div>
                <div className='flex flex-col justify-center p-6'>
                    { statusTestEmail === 'error' && (
                        <div className='flex items-center gap-4 mb-8'>
                            <img src="/imgs/smtp/smtp_fail.svg" alt="Error" className='h-9'/>
                            <h1 className='text-xl font-bold text-(--text-error)'>{ t('SMTP.test_email_error') }</h1>
                        </div>
                    ) }
                    { statusTestEmail === 'success' && (
                        <div className='flex items-center gap-4 mb-8'>
                            <img src="/imgs/smtp/smtp_success.svg" alt="Error" className='h-9'/>
                            <h1 className='text-xl font-bold text-(--color-success)'>{ t('SMTP.test_email_success') }</h1>
                        </div>
                    ) }
                    { statusTestEmail === 'error' && (
                        <div className='w-full bg-[#212528] h-48 rounded-lg'>
                            <div className='p-4 text-(--text-secondary)'>
                                <p>
                                    { statusTestEmailMessage.split(',').map((msg, index) => (
                                        <span key={ index }>{ msg }<br/></span>
                                    )) }
                                </p>
                            </div>
                        </div>
                    ) }
                </div>
            </div>
        </div>
    );
}