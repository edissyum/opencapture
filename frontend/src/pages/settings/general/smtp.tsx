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
import React, { useEffect, useState } from "react";
import { CircleCheck, CircleX } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { Checkbox } from "../../../components/Checkbox";
import { showToast } from "../../../components/ToastProvider";
import { axiosApiCall } from "../../../services/hooks/axiosApiCall";

import { emptyToUndefined } from "../../../services/zod";

export function SettingsGeneralSMTP() {
    const { get, post, put } = axiosApiCall();

    const smtpProtocoleSecureEnum = z.enum(['ssl', 'tls', 'none']);

    const schema = z.object({
        smtpHost: z.string().min(1, { message: t('SMTP.smtp_host_required') }),
        smtpPort: z.number().min(1).max(65535),
        smtpProtocoleSecure: smtpProtocoleSecureEnum,
        smtpAuth: z.boolean(),
        smtpLogin: z.string().optional(),
        smtpPwd: z.string().optional(),
        smtpNotifOnError: z.boolean(),
        smtpFromMail: emptyToUndefined(z.email().optional()),
        smtpDestAdminMail: emptyToUndefined(z.email().optional()),
        smtpDelay: z.number().min(1).max(1440).optional()
    });
    type FormData = z.infer<typeof schema>;

    const {
        control,
        watch,
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormData>({
        // @ts-ignore
        resolver: zodResolver(schema),
        defaultValues: {
            smtpHost: "smtp.gmail.com",
            smtpPort: 465,
            smtpProtocoleSecure: 'ssl',
            smtpAuth: true
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
                        let value = response.configuration[0].data.value[key];
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
        { name: "Gmail", host: "smtp.gmail.com", port: 465, secure: 'ssl', logo: "/src/assets/imgs/smtp/gmail.svg" },
        {
            name: "Outlook",
            host: "smtp-mail.outlook.com",
            port: 587,
            secure: 'tls',
            logo: "/src/assets/imgs/smtp/outlook.svg"
        },
        { name: t('SMTP.other_provider'), host: "", port: 587, secure: 'none' }
    ];

    const handleProviderChange = (providerName: string) => {
        setSelectedProvider(providerName);

        const provider = providers.find(p => p.name === providerName);
        if (provider) {
            setValue('smtpHost', provider.host);
            setValue('smtpPort', provider.port);
            setValue('smtpProtocoleSecure', provider.secure as any);
            setSelectedEncryption(provider.secure as string);
        }
    }

    const handleEncryptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSelectedEncryption(value);
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
            smtpDelay: data.smtpDelay || 0
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
        <div className='flex'>
            <div className='border-r-2 border-(--border-secondary) w-full overflow-y-scroll h-[calc(100vh-64px)]'>
                <div className='p-8'>
                    <h1 className='text-2xl font-bold'>{ t('SMTP.provider') }</h1>
                    <div className='flex gap-4 mt-6'>
                        { providers.map((provider) => (
                            <div key={ provider.name }
                                 onClick={ () => handleProviderChange(provider.name) }
                                 className={ `border-3 border-(--border-secondary) hover:border-(--color-primary) transition-colors duration-200
                             rounded-lg px-8 py-3 cursor-pointer flex items-center justify-center gap-4
                             ${ selectedProvider === provider.name ? 'bg-(--color-primary)/20 border-(--color-primary)' : '' } ` }>
                                { provider.logo && <img src={ provider.logo } alt={ provider.name } className='h-5'/> }
                                <p className='text-lg font-semibold'>{ provider.name }</p>
                            </div>
                        )) }
                    </div>

                    {/* @ts-ignore */ }
                    <form onSubmit={ handleSubmit(onSubmit) }>
                        <h1 className='text-2xl font-bold mt-10'>{ t('SMTP.settings') }</h1>
                        <div className='flex items-center mt-6 gap-4'>
                            <div className='w-1/4'>
                                <Input id='smtpHost' { ...register('smtpHost', { required: true }) }
                                       required
                                       placeholder='smtp.example.com'
                                       error={ errors.smtpHost?.message }
                                       label={ t('SMTP.host') }/>
                            </div>
                            <div className='w-[4rem]'>
                                <Input id='smtpPort' { ...register('smtpPort', {
                                    required: true,
                                    valueAsNumber: true
                                }) }
                                       placeholder='587' required
                                       error={ errors.smtpPort?.message }
                                       label={ t('SMTP.port') }/>
                            </div>
                        </div>

                        <h1 className='text-2xl font-bold mt-4'>{ t('SMTP.authentication') }</h1>
                        <div className='mt-6'>
                            <Controller
                                control={ control }
                                name='smtpAuth'
                                render={ ({ field }) => (
                                    <Checkbox checked={ field.value } label={ t('SMTP.smtp_auth') }
                                              onChange={ (checked: boolean) => field.onChange(checked) }/>
                                ) }
                            />
                            <div className='flex items-center gap-4 mt-4'>
                                <div className='w-1/4'>
                                    <Input id='smtpLogin' { ...register('smtpLogin') } placeholder=''
                                           disabled={ !smtpAuth }
                                           label={ t('SMTP.login') } autoComplete='new-mail'
                                           error={ errors.smtpLogin?.message }/>
                                </div>
                                <div className='w-1/4'>
                                    <Input id='smtpPwd' type='password' { ...register('smtpPwd') }
                                           disabled={ !smtpAuth }
                                           label={ t('SMTP.password') } autoComplete='new-password'
                                           error={ errors.smtpPwd?.message }/>
                                </div>
                            </div>
                        </div>

                        <h1 className='text-2xl font-bold mt-4'>{ t('SMTP.encryption') }</h1>
                        <div className='flex gap-4 mt-6'>
                            { smtpProtocoleSecureEnum.options.map((option: any) => (
                                <label key={ option } className={ `peer peer-checked:bg-(--color-primary) accent-(--color-primary) border-3 border-(--border-secondary) hover:border-(--color-primary) transition-colors duration-200
                                rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center gap-1
                                ${ selectedEncryption === option ? 'bg-(--color-primary)/20 border-(--color-primary)' : '' }` }>
                                    <input { ...register("smtpProtocoleSecure") } type="radio" key={ option }
                                           checked={ selectedEncryption === option }
                                           value={ option } onChange={ handleEncryptionChange }/>
                                    { option === 'none' ? t('SMTP.secure_none') : option.toUpperCase() }
                                </label>
                            )) }
                        </div>

                        <h1 className='text-2xl font-bold mt-10'>{ t('SMTP.error_notifications') }</h1>
                        <div className='mt-6'>
                            <Controller
                                control={ control }
                                name='smtpNotifOnError'
                                render={ ({ field }) => (
                                    <Checkbox checked={ field.value } label={ t('SMTP.enable_error_notifications') }
                                              onChange={ (checked: boolean) => field.onChange(checked) }/>
                                ) }
                            />
                            <div className='flex items-center gap-4 mt-4'>
                                <div className='w-1/4'>
                                    <Input id='smtpFromMail' { ...register('smtpFromMail') } placeholder=''
                                           disabled={ !smtpNotifOnError }
                                           error={ errors.smtpFromMail?.message }
                                           label={ t('SMTP.from_mail') } autoComplete='new-mail'/>
                                </div>
                                <div className='w-1/4'>
                                    <Input id='smtpDestAdminMail' { ...register('smtpDestAdminMail') } placeholder=''
                                           disabled={ !smtpNotifOnError }
                                           error={ errors.smtpDestAdminMail?.message }
                                           label={ t('SMTP.destination_admin_mail') } autoComplete='new-mail'/>
                                </div>
                            </div>
                            <div className='w-[4rem] mt-4'>
                                <Input type='string' id='smtpDelay' disabled={ !smtpNotifOnError }
                                       { ...register('smtpDelay', { valueAsNumber: true }) }
                                       placeholder='30' label={ t('SMTP.delay_between_emails') }/>
                            </div>
                            <p className='-mt-4 text-(--text-secondary)'>{ t('SMTP.delay_between_emails_infos') }</p>
                        </div>

                        <Button type='submit' className='mt-10' disabled={ isSubmitting }>
                            { isSubmitting ? t('SMTP.saving') + "..." : t('SMTP.save_settings') }
                        </Button>
                    </form>
                </div>
            </div>
            <div className='w-[40rem] bg-(--border-secondary)'>
                <div className='bg-(--bg-primary)'>
                    <div className='p-8'>
                        <h1 className='text-2xl font-bold'>{ t('SMTP.send_test') }</h1>
                        <p className='mt-2 text-(--text-secondary)'>{ t('SMTP.send_test_infos') }</p>
                        <div className='mt-8'>
                            <Input id='testEmail' type='email' value={ destinationTestEmail }
                                   label={ t('SMTP.destination_test_email') }
                                   onChange={ (e) => setDestinationTestEmail(e.target.value) }/>

                            <Button disabled={ destinationTestEmail === '' || statusLoadingTestEmail }
                                    onClick={ handleTestEmail }>
                                { statusLoadingTestEmail ? t('SMTP.sending') + "..." : t('SMTP.send_test_email') }
                            </Button>
                        </div>
                    </div>
                </div>
                <div>
                    <div className='flex flex-col items-center justify-center'>
                        { statusTestEmail === 'error' && (
                            <div className='flex items-center mt-4 gap-1'>
                                <CircleX className='text-(--text-error)'/>
                                <h1 className='text-2xl font-bold text-(--color-danger)'>{ t('SMTP.test_email_error') }</h1>
                            </div>
                        ) }
                        { statusTestEmail === 'success' && (
                            <div className='flex items-center mt-4 gap-1'>
                                <CircleCheck className='text-(--text-success)'/>
                                <h1 className='text-2xl font-bold text-(--color-success)'>{ t('SMTP.test_email_success') }</h1>
                            </div>
                        ) }
                        <div className='w-8/12 bg-[#212528] h-48 overflow-y-scroll rounded-lg mt-4'>
                            { statusTestEmail === 'error' && (
                                <div className='p-4 text-(--text-secondary)'>
                                    <p>
                                        { statusTestEmailMessage.split(',').map((msg, index) => (
                                            <span key={ index }>{ msg }<br/></span>
                                        )) }
                                    </p>
                                </div>
                            ) }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}