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
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Ban, CornerUpRight, Trash } from "lucide-react";

import { Stepper } from "primereact/stepper";
import { FloatLabel } from "primereact/floatlabel";
import { InputSwitch } from "primereact/inputswitch";
import { StepperPanel } from "primereact/stepperpanel";

import Input from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { RadioBox } from "../../../../components/RadioBox";
import { Dropdown } from "../../../../components/Dropdown";
import { showToast } from "../../../../components/ToastProvider";

import { getSchemaForAuthMethod } from "./authSchema";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";

export function MailCollectProcess({ process, workflows }: { process: any, workflows: any }) {
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
    const modules = [
        { label: t('MAILCOLLECT.verifier'), value: 'verifier' },
        { label: t('MAILCOLLECT.splitter'), value: 'splitter' },
    ];
    const [selectedModule, setSelectedModule] = useState<string>(
        process.is_splitter ? 'splitter' : 'verifier'
    );

    const [authMethod, setAuthMethod] = useState<"imap" | "oauth" | "graphql">(
        (process.authMethod as any) || "imap"
    );

    const [folders, setFolders] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const actionsAfterProcessValues = [
        { label: t('MAILCOLLECT.none'), hint: t('MAILCOLLECT.none_hint'), value: 'none', logo: <Ban/> },
        { label: t('MAILCOLLECT.move'), hint: t('MAILCOLLECT.move_hint'), value: 'move', logo: <CornerUpRight/> },
        { label: t('MAILCOLLECT.delete'), hint: t('MAILCOLLECT.delete_hint'), value: 'delete', logo: <Trash/> }
    ];

    const modulesSchema: any = z.object({
        module: z.enum(['verifier', 'splitter']).default('verifier'),
        is_splitter: z.boolean().default(false),
        verifier_insert_body_as_doc: z.boolean().optional(),
        verifier_workflow_id: z.any().optional(),
        splitter_insert_body_as_doc: z.boolean().optional(),
        splitter_workflow_id: z.any().optional()
    });
    const {
        control: modulesControl,
        setValue: setValueModules,
        handleSubmit: handleSubmitModules,
        formState: { errors: moduleErrors }
    } = useForm({
        resolver: zodResolver(modulesSchema),
    });

    const foldersSchema: any = z.object({
        folder_to_crawl: z.string().min(1),
        folder_destination: z.string().min(1),
        action_after_process: z.enum(['none', 'move', 'delete']).default('move')
    });
    const {
        control: foldersControl,
        setValue: setValuFolders,
        handleSubmit: handleSubmitFolders
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
        defaultValues: { authMethod }
    });

    useEffect(() => {
        setValueAuth("securedConnection", process.secured_connection);
        Object.keys(process.options).forEach((key: any) => {
            if (authSchema.shape[key] && [null, undefined].indexOf(process.options[key]) === -1) {
                setValueAuth(key, process.options[key]);
            }
        });

        Object.keys(process).forEach((key: any) => {
            if (foldersSchema.shape[key] && [null, undefined].indexOf(process[key]) === -1) {
                setValuFolders(key, process[key]);
            }
            if (modulesSchema.shape[key] && [null, undefined].indexOf(process[key]) === -1) {
                setValueModules(key, process[key]);
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
        try {
            data['method'] = authMethod;
            data['secured_connection'] = data['securedConnection'];
            let response = await post('mailcollect/retrieveFolders', data);

            if (response.length === 0) {
                showToast(t("MAILCOLLECT.no_folders_found"), "error");
            } else {
                setFolders(response || []);
                showToast(t("MAILCOLLECT.connexion_successful"), "success");
                handleNextStep(data);
            }
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.error("Connection test failed : " + err);
        }
    }

    const handleNextStep = (data: any) => {
        Object.keys(data).forEach((key) => {
            if (process[key] !== undefined) {
                process[key] = data[key];
            }
        });
        stepperRef.current?.nextCallback();
    }
    const handlePreviousStep = () => stepperRef.current?.prevCallback();

    const onSubmit = async (data: any) => {
        if (loading) return;

        Object.keys(data).forEach((key) => {
            if (data[key] !== undefined) {
                process[key] = data[key];
            }
        });
        delete process['module'];

        setLoading(true);
        try {
            if (process.id) {
                await post('/mailcollect/updateProcess/' + process['id'], process);
                showToast(t("MAILCOLLECT.process_updated_successfully"), "success");
            }
        } catch (err) {
            console.error("Erreur lors de la mise à jour du process : " + err);
        }
        setLoading(false);

    }

    return (
        <Stepper ref={ stepperRef } linear className='p-4'>
            <StepperPanel header={ t("MAILCOLLECT.connection") }>
                <h1 className="text-xl font-bold mb-4">{ t("MAILCOLLECT.auth_method") }</h1>
                <div className="flex gap-4 mb-4">
                    { authMethods.map((method) => (
                        <Controller
                            key={ method.value }
                            control={ modulesControl }
                            name='authMethod'
                            render={ ({ field }) => (
                                <RadioBox
                                    label={ method.label }
                                    value={ method.value }
                                    checked={ authMethod === method.value }
                                    onChange={ () => {
                                        field.onChange(method.value);
                                        setAuthMethod(method.value as any)
                                    } }/>
                            ) }
                        />
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
                                    <label htmlFor='secured_connection'
                                           className="flex items-center gap-4 cursor-pointer select-none text-(--text-primary)">
                                        { t('MAILCOLLECT.secured_connection') }
                                    </label>
                                </>
                            ) }
                        />
                    ) }
                </div>

                { authMethod === "imap" && (
                    <div className='grid grid-cols-2 gap-4'>
                        <Input { ...registerAuth("hostname") }
                               label={ t("SMTP.host") }
                               error={ authErrors.hostname?.message }/>
                        <Input className={ 'w-1/9' }
                               { ...registerAuth("port") }
                               label={ t("SMTP.port") }
                               error={ authErrors.port?.message }/>
                        <Input { ...registerAuth("login") }
                               autoComplete='new-mail'
                               label={ t("SMTP.login") }
                               error={ authErrors.login?.message }/>
                        <Input className={ 'w-1/2' }
                               { ...registerAuth("password") }
                               autoComplete='new-password'
                               label={ t("SMTP.password") }
                               type="password"
                               error={ authErrors.password?.message }/>
                    </div>
                ) }

                { authMethod === "oauth" && (
                    <div className='grid grid-cols-4 gap-4'>
                        <Input id='hostname' { ...registerAuth("hostname") }
                               label={ t("SMTP.host") }
                               error={ authErrors.hostname?.message }/>
                        <Input id='login' { ...registerAuth("login") }
                               label={ t("SMTP.login") }
                               error={ authErrors.login?.message }/>
                        <Input id='scopes' { ...registerAuth("scopes") }
                               label={ t("MAILCOLLECT.scope") }
                               error={ authErrors.scopes?.message }/>
                        <Input id='authority_url' { ...registerAuth("authority_url") }
                               label={ t("MAILCOLLECT.authority_url") }
                               error={ authErrors.authority_url?.message }/>
                        <Input id='client_id' { ...registerAuth("client_id") }
                               label={ t("MAILCOLLECT.client_id") }
                               error={ authErrors.client_id?.message }/>
                        <Input id='tenant_id' { ...registerAuth("tenant_id") }
                               label={ t("MAILCOLLECT.tenant_id") }
                               error={ authErrors.tenant_id?.message }/>
                        <Input id='client_secret' { ...registerAuth("client_secret") }
                               label={ t("MAILCOLLECT.client_secret") }
                               error={ authErrors.client_secret?.message }/>
                    </div>
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
                            data-tooltip-id='tooltip' data-tooltip-content={ t("MAILCOLLECT.test_connexion_next") }
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
                        <Dropdown
                            filter={ true }
                            id="folder_to_crawl"
                            value={ field.value }
                            label={ t("MAILCOLLECT.folder_to_crawl") }
                            options={ folders.map((folder) => ({ label: folder, value: folder })) }
                            onChange={ (e) => field.onChange(e.value) }
                            className="w-full"
                            disabled={ folders.length === 0 }
                        />
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
                                     className={ `cursor-pointer border-2 w-1/3 py-5 rounded-md text-(--text-primary)
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
                        <Dropdown
                            filter={ true }
                            value={ field.value }
                            id="folder_destination"
                            className="w-full mb-2"
                            disabled={ folders.length === 0 }
                            label={ t("MAILCOLLECT.folder_destination") }
                            options={ folders.map((folder) => ({ label: folder, value: folder })) }
                            onChange={ (e) => field.onChange(e.value) }
                        />
                    ) }
                />

                <div className="flex justify-between mt-6">
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
                <h1 className="text-xl font-bold mb-4">{ t("MAILCOLLECT.module") }</h1>

                <div className="flex gap-4 mb-4">
                    { modules.map((module) => (
                        <Controller
                            control={ modulesControl }
                            name='is_splitter'
                            render={ ({ field }) => (
                                <RadioBox
                                    label={ module.label }
                                    value={ module.value }
                                    checked={ selectedModule === module.value }
                                    onChange={ () => {
                                        field.onChange(module.value == 'splitter');
                                        setSelectedModule(module.value);
                                    } }/>
                            ) }
                        />
                    )) }
                </div>

                <div>
                    { selectedModule === 'verifier' && (
                        <>
                            <Controller
                                name="verifier_insert_body_as_doc"
                                control={ modulesControl }
                                render={ ({ field }) => (
                                    <div className='mb-6 flex gap-2'>
                                        <InputSwitch inputId={ 'verifier_insert_body_as_doc' } checked={ field.value }
                                                     onChange={ (e) => field.onChange(e.value) }/>
                                        <label htmlFor='verifier_insert_body_as_doc'
                                               className="flex items-center gap-4 cursor-pointer select-none">
                                            { t('MAILCOLLECT.insert_body_as_doc') }
                                        </label>
                                    </div>
                                ) }
                            />
                            <Controller
                                name="verifier_workflow_id"
                                control={ modulesControl }
                                render={ ({ field }) => (
                                    <>
                                        <FloatLabel>
                                            <Dropdown
                                                filter
                                                id="verifier_workflow_id"
                                                value={ field.value }
                                                options={ workflows['verifier'].map((workflow: any) => ({
                                                    label: workflow.label,
                                                    value: workflow.workflow_id
                                                })) }
                                                onChange={ (e) => field.onChange(e.value) }
                                                className="w-full"
                                            />
                                            <label
                                                htmlFor="verifier_workflow_id">{ t("MAILCOLLECT.select_workflow") }</label>
                                        </FloatLabel>
                                        { moduleErrors && moduleErrors['verifier_workflow_id'] && (
                                            <p className="text-(--text-error) mt-2">
                                                { moduleErrors['verifier_workflow_id']?.message as string }
                                            </p>
                                        ) }
                                    </>
                                ) }
                            />
                        </>
                    ) }
                    { selectedModule === 'splitter' && (
                        <>
                            <Controller
                                name="splitter_insert_body_as_doc"
                                control={ modulesControl }
                                render={ ({ field }) => (
                                    <div className='mb-6 flex gap-2'>
                                        <InputSwitch inputId={ 'splitter_insert_body_as_doc' } checked={ field.value }
                                                     onChange={ (e) => field.onChange(e.value) }/>
                                        <label htmlFor='splitter_insert_body_as_doc'
                                               className="flex items-center gap-4 cursor-pointer select-none">
                                            { t('MAILCOLLECT.insert_body_as_doc') }
                                        </label>
                                    </div>
                                ) }
                            />
                            <Controller
                                name="splitter_workflow_id"
                                control={ modulesControl }
                                render={ ({ field }) => (
                                    <>
                                        <FloatLabel>
                                            <Dropdown
                                                filter
                                                id="splitter_workflow_id"
                                                value={ field.value }
                                                options={ workflows['splitter'].map((workflow: any) => ({
                                                    label: workflow.label,
                                                    value: workflow.workflow_id
                                                })) }
                                                onChange={ (e) => field.onChange(e.value) }
                                                className="w-full"
                                            />
                                            <label
                                                htmlFor="splitter_workflow_id">{ t("MAILCOLLECT.select_workflow") }</label>
                                        </FloatLabel>
                                        { moduleErrors && moduleErrors['splitter_workflow_id'] && (
                                            <p className="text-(--text-error) mt-2">
                                                { moduleErrors['splitter_workflow_id']?.message as string }
                                            </p>
                                        ) }
                                    </>
                                ) }
                            />
                        </>
                    ) }
                </div>

                <div className="flex justify-between mt-6">
                    <Button onClick={ handlePreviousStep } variant="no_bg"
                            className="mr-2 px-12 text-(--color-primary) border-transparent hover:border-(--color-primary)">
                        <ArrowLeft/> { t("MAILCOLLECT.previous") }
                    </Button>
                    <Button type="submit" className="ml-auto px-12" onClick={ handleSubmitModules(onSubmit) }
                            disabled={ loading }>
                        { loading ? (
                            t("MAILCOLLECT.loading_save")
                        ) : (
                            t("MAILCOLLECT.save")
                        ) }
                    </Button>
                </div>
            </StepperPanel>
        </Stepper>
    )
        ;
}
