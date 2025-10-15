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
import { ArrowLeft, Ban, CornerUpRight, Trash } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";

import { Input } from "../../../../components/Input";
import { Button } from "../../../../components/Button";

import { getSchemaForAuthMethod } from "./schema";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { showToast } from "../../../../components/ToastProvider.tsx";
import { z } from "zod";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { InputSwitch } from "primereact/inputswitch";

export function MailCollectProcess({ process }: { process: any }) {
    const { post } = axiosApiCall();
    const stepperRef = useRef<any>(null);
    const authMethods = [
        {
            label: t('MAILCOLLECT.imap'),
            value: 'imap'
        },
        { label: t('MAILCOLLECT.oauth'), value: 'oauth' },
        { label: t('MAILCOLLECT.graphql'), value: 'graphql' }
    ];

    const [authMethod, setAuthMethod] = useState<"imap" | "oauth" | "graphql">(
        (process.authMethod as any) || "imap"
    );

    const [folders, setFolders] = useState<string[]>([]);
    const [tested, setTested] = useState(false);
    const [loading, setLoading] = useState(false);

    const actionsAfterProcessValues = [
        { label: t('MAILCOLLECT.none'), hint: t('MAILCOLLECT.none_hint'), value: 'none', logo: <Ban/> },
        { label: t('MAILCOLLECT.move'), hint: t('MAILCOLLECT.move_hint'), value: 'move', logo: <CornerUpRight/> },
        { label: t('MAILCOLLECT.delete'), hint: t('MAILCOLLECT.delete_hint'), value: 'delete', logo: <Trash/> }
    ];
    const foldersSchema: any = z.object({
        name: z.string().min(1),
        enabled: z.boolean().default(true),
        folder_to_crawl: z.string().min(1),
        folder_destination: z.string().min(1),
        action_after_process: z.enum(['none', 'move', 'delete']).default('move')
    });
    const {
        control: foldersControl,
        register: registerFolders,
        setValue: setValueFolders,
        handleSubmit: handleSubmitFolders,
        formState: { errors: foldersErrors }
    } = useForm({
        resolver: zodResolver(foldersSchema),
    });

    const authSchema: any = getSchemaForAuthMethod(authMethod);
    const {
        control: controlAuth,
        register: registerAuth,
        setValue: setValueAuth,
        getValues: getValuesAuth,
        handleSubmit: handleSubmitAuth,
        formState: { errors: authErrors }
    } = useForm({
        resolver: zodResolver(authSchema),
        defaultValues: { authMethod },
    });

    useEffect(() => {
        setValueAuth("securedConnection", process.secured_connection);
        Object.keys(process.options).forEach((key: any) => {
            if (authSchema.shape[key]) {
                setValueAuth(key, process.options[key]);
            }
        });

        Object.keys(process).forEach((key: any) => {
            if (foldersSchema.shape[key]) {
                setValueFolders(key, process[key]);
            }
        });
    }, [process]);

    useEffect(() => {
        Object.keys(authSchema.shape).forEach((key: any) => {
            if (!getValuesAuth(key)) {
                if (authSchema.shape[key]._def.defaultValue !== undefined) {
                    setValueAuth(key, authSchema.shape[key]._def.defaultValue);
                }
            }
        });
    }, [authMethod]);

    const handleTestConnexion = async (data: any) => {
        if (loading) return;

        setLoading(true);
        setFolders([]);
        setTested(false);
        try {
            data['method'] = authMethod;
            data['secured_connection'] = data['securedConnection'];
            let response = await post('mailcollect/retrieveFolders', data);

            if (response.length === 0) {
                showToast(t("MAILCOLLECT.no_folders_found"), "error");
            } else {
                setTested(true);
                setFolders(response || []);
                showToast(t("MAILCOLLECT.connexion_successful"), "success");
                handleNextStep();
            }
            setLoading(false);
        } catch (err) {
            setLoading(false);
            setTested(false);
            console.error("Connection test failed : " + err);
        }
    }

    const handleNextStep = (data: any) => {
        console.log("Next step", data);
        stepperRef.current?.nextCallback();
    }
    const handlePreviousStep = () => stepperRef.current?.prevCallback();

    return (
        <Stepper ref={ stepperRef } linear>
            <StepperPanel header={ t("MAILCOLLECT.connection") }>
                <h1 className="text-xl font-bold mb-4">{ t("MAILCOLLECT.auth_method") }</h1>
                <div className="flex gap-4 mb-2">
                    { authMethods.map((method) => (
                        <label key={ method.value } className={ `peer peer-checked:bg-(--color-primary) accent-(--color-primary) border-3 border-(--border-secondary) hover:border-(--color-primary) transition-colors duration-200
                                rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center gap-1
                                ${ authMethod === method.value ? 'bg-(--color-primary)/20 border-(--color-primary)' : '' }` }>
                            <input type="radio" key={ method.value }
                                   checked={ authMethod === method.value }
                                   value={ method.value } onChange={ () => setAuthMethod(method.value as any) }/>
                            { method.label }
                        </label>
                    )) }
                </div>
                <div className='mb-6 flex gap-2'>
                    { authMethod === "imap" && (
                        <Controller
                            control={ controlAuth }
                            name='securedConnection'
                            render={ ({ field }) => (
                                <>
                                    <InputSwitch inputId={ 'secured_connection' } checked={ field.value }
                                                onChange={ (e) => setValueAuth("securedConnection", e.value) }/>
                                    <label htmlFor='secured_connection' className="flex items-center gap-4">
                                        { t('MAILCOLLECT.secured_connection') }
                                    </label>
                                </>
                    ) }
                />
                ) }
            </div>

            { authMethod === "imap" && (
                <div className='flex gap-4'>
                    <Input className={ 'w-1/3' }
                           { ...registerAuth("hostname") }
                           label={ t("SMTP.host") }
                           error={ authErrors.hostname?.message }/>
                    <Input className={ 'w-1/9' }
                           { ...registerAuth("port") }
                           label={ t("SMTP.port") }
                           error={ authErrors.port?.message }/>
                    <Input className={ 'w-1/3' }
                           { ...registerAuth("login") }
                           autoComplete='new-mail'
                           label={ t("SMTP.login") }
                           error={ authErrors.login?.message }/>
                    <Input className={ 'w-1/3' }
                           { ...registerAuth("password") }
                           autoComplete='new-password'
                           label={ t("SMTP.password") }
                           type="password"
                           error={ authErrors.password?.message }/>
                </div>
            ) }

            { authMethod === "oauth" && (
                <>
                    <Input { ...registerAuth("clientId") } label="Client ID"
                           error={ authErrors.clientId?.message }/>
                    <Input { ...registerAuth("clientSecret") } label="Client Secret"
                           error={ authErrors.clientSecret?.message }/>
                    <Input { ...registerAuth("redirectUri") } label="Redirect URI"
                           error={ authErrors.redirectUri?.message }/>
                </>
            ) }

            { authMethod === "graphql" && (
                <div className='grid grid-cols-3 gap-4'>
                    <Input id='login'
                           { ...registerAuth("login") }
                           autoComplete='new-mail'
                           label={ t("SMTP.login") }
                           error={ authErrors.login?.message }/>
                    <Input id='grant_type'
                           { ...registerAuth("grant_type") }
                           label={ t("MAILCOLLECT.grant_type") }
                           error={ authErrors.grant_type?.message }/>
                    <Input id='scope'
                           { ...registerAuth("scope") }
                           label={ t("MAILCOLLECT.scope") }
                           error={ authErrors.scope?.message }/>
                    <Input id='users_url'
                           { ...registerAuth("users_url") }
                           label={ t("MAILCOLLECT.users_url") }
                           error={ authErrors.users_url?.message }/>
                    <Input id='message_url'
                           { ...registerAuth("message_url") }
                           label={ t("MAILCOLLECT.message_url") }
                           error={ authErrors.message_url?.message }/>
                    <Input id='get_token_url'
                           { ...registerAuth("get_token_url") }
                           label={ t("MAILCOLLECT.get_token_url") }
                           error={ authErrors.get_token_url?.message }/>
                    <Input id='client_id'
                           { ...registerAuth("client_id") }
                           label={ t("MAILCOLLECT.client_id") }
                           error={ authErrors.client_id?.message }/>
                    <Input id='tenant_id'
                           { ...registerAuth("tenant_id") }
                           label={ t("MAILCOLLECT.tenant_id") }
                           error={ authErrors.tenant_id?.message }/>
                    <Input id='client_secret'
                           { ...registerAuth("client_secret") }
                           label={ t("MAILCOLLECT.client_secret") }
                           error={ authErrors.client_secret?.message }/>
                </div>
            ) }
            <div className="flex justify-end mt-6">
                <Button onClick={ handleSubmitAuth(handleTestConnexion) } className="ml-auto px-12"
                        disabled={ loading }>
                    { loading ? (
                        t("MAILCOLLECT.loading_test_connexion")
                    ) : (
                        t("MAILCOLLECT.next")
                    ) }
                </Button>
            </div>
        </StepperPanel>

    <StepperPanel header={ t("MAILCOLLECT.folders") }>
        <Controller
            name="folder_to_crawl"
            control={ foldersControl }
            render={ ({ field }) => (
                <FloatLabel>
                    <Dropdown
                        id="folder_to_crawl"
                        value={ field.value }
                        options={ folders.map((folder) => ({ label: folder, value: folder })) }
                        onChange={ (e) => field.onChange(e.value) }
                        className="w-full"
                        disabled={ folders.length === 0 }
                    />
                    <label htmlFor="folder_to_crawl">{ t("MAILCOLLECT.folder_to_crawl") }</label>
                </FloatLabel>
            ) }
        />

        <Controller
            name="action_after_process"
            control={ foldersControl }
            render={ ({ field }) => (
                <div className='flex gap-4 my-6'>
                    { actionsAfterProcessValues.map((action: any) => (
                        <div key={ action.value }
                             onClick={ () => field.onChange(action.value) }
                             className={ `cursor-pointer border-2 w-1/3 py-5 rounded-md
                                                ${ field.value === action.value ? "bg-(--color-primary)/20 border-(--color-primary)" : "border-(--border-secondary) hover:border-(--text-secondary)" }
                                                text-center duration-200` }>
                            <div className="flex justify-center mb-2">
                                { action.logo }
                            </div>
                            <span className='font-semibold'>
                                        { action.label }
                                    </span>
                            <p className="text-(--text-secondary) text-sm">{ action.hint }</p>
                        </div>
                    )) }
                </div>
            ) }
        />

        <Controller
            name="folder_destination"
            control={ foldersControl }
            render={ ({ field }) => (
                <FloatLabel>
                    <Dropdown
                        id="folder_destination"
                        value={ field.value }
                        options={ folders.map((folder) => ({ label: folder, value: folder })) }
                        onChange={ (e) => field.onChange(e.value) }
                        className="w-full mb-2"
                        disabled={ folders.length === 0 }
                    />
                    <label htmlFor="folder_destination">{ t("MAILCOLLECT.folder_destination") }</label>
                </FloatLabel>
            ) }
        />

        <div className="flex justify-between">
            <Button onClick={ handlePreviousStep } variant="no_bg"
                    className="mr-2 px-12 text-(--color-primary) border-transparent hover:border-(--color-primary)">
                <ArrowLeft/> { t("MAILCOLLECT.previous") }
            </Button>
            <Button onClick={ handleSubmitFolders(handleNextStep) } className="ml-auto px-12">
                { t("MAILCOLLECT.next") }
            </Button>
        </div>
    </StepperPanel>

    <StepperPanel header={ t("MAILCOLLECT.options") }>
        <div className="flex justify-between">
            <Button onClick={ handlePreviousStep } variant="no_bg"
                    className="mr-2 px-12 text-(--color-primary) border-transparent hover:border-(--color-primary)">
                <ArrowLeft/> { t("MAILCOLLECT.previous") }
            </Button>
            <Button type="submit" className="ml-auto px-12">
                { t("MAILCOLLECT.save") }
            </Button>
        </div>
    </StepperPanel>
</Stepper>
)
    ;
}
