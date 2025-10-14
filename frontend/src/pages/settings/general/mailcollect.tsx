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
import { ArrowLeft, Inbox } from "lucide-react";
import { Stepper } from "primereact/stepper";
import React, { useEffect, useRef, useState } from "react";
import { StepperPanel } from "primereact/stepperpanel";
import { Accordion, AccordionTab } from "primereact/accordion";

import { Button } from "../../../components/Button";
import { Loader } from "../../../components/loader/Loader";
import { axiosApiCall } from "../../../services/hooks/axiosApiCall";


export function SettingsGeneralMailcollect() {
    const { get } = axiosApiCall();
    const stepperRef = useRef(null);

    const authMethods = [
        {
            label: t('MAILCOLLECT.imap'),
            value: 'imap',
            options: {
                port: {
                    label: t('SMTP.port'),
                    placeholder: 'MAILCOLLECT.imap_port_placeholder',
                    type: 'number'
                },
                login: {
                    label: t('SMTP.login'),
                    placeholder: 'MAILCOLLECT.imap_login_placeholder',
                    type: 'text'
                },
                hostname: {
                    label: t('SMTP.host'),
                    placeholder: 'MAILCOLLECT.imap_hostname_placeholder',
                    type: 'text'
                },
                password: {
                    label: t('SMTP.password'),
                    placeholder: 'MAILCOLLECT.imap_password_placeholder',
                    type: 'password'
                }
            }
        },
        { label: t('MAILCOLLECT.oauth'), value: 'oauth' },
        { label: t('MAILCOLLECT.graphql'), value: 'graphql' }
    ];

    const [loading, setLoading] = useState(false);
    const [processList, setProcessList] = useState<any[]>([]);

    useEffect(() => {
        if (loading) return;
        setLoading(true);

        const fetchProcesses = async () => {
            try {
                const response = await get('/mailcollect/getProcesses');
                console.log(response);
                setProcessList(response.processes);
            } catch (error) {
                console.error('Erreur de récupération des processus MailCollect :', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProcesses().then();
    }, []);

    const handleAddProcess = () => {
        setProcessList([...processList, { 'name': 'Nouveau Processus' }]);
        console.log(processList)
    }

    const handleNextStep = () => {
        if (stepperRef.current) {
            // @ts-ignore
            stepperRef.current.nextCallback();
        }
    }

    const handlePreviousStep = () => {
        if (stepperRef.current) {
            // @ts-ignore
            stepperRef.current.prevCallback();
        }
    }

    const handleAuthMethodChange = (auth_method: any, process_id: number) => {
        const updatedProcesses = processList.map((process) => {
            if (process.id === process_id) {
                return { ...process, method: auth_method };
            }
            return process;
        });
        setProcessList(updatedProcesses);
        console.log(updatedProcesses);
    }

    if (loading) {
        return (
            <Loader/>
        );
    }

    return (
        <div className="p-6 bg-(--bg-secondary) h-full">
            <div className='flex justify-end mb-4'>
                <Button variant='secondary' onClick={ handleAddProcess }
                        className='px-6 bg-transparent hover:bg-(--color-primary)'>
                    { t('MAILCOLLECT.add_process') }
                </Button>
            </div>
            { processList.length === 0 ? (
                <div className='w-1/3'>
                    <Inbox className='mb-4'/>
                    <h1 className='mb-2 font-semibold text-lg'>
                        { t('MAILCOLLECT.no_process') }
                    </h1>
                    <p className='text-(--text-secondary)'>
                        { t('MAILCOLLECT.no_process_info') }
                    </p>
                    <Button className='mt-4' onClick={ handleAddProcess }>
                        { t('MAILCOLLECT.add_process') }
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <Accordion multiple activeIndex={ [0] }>
                        { processList.map((process, _idx) => (
                            <AccordionTab header={ process.name } key={ _idx }>
                                <Stepper ref={ stepperRef } linear>
                                    <StepperPanel header={ t('MAILCOLLECT.connection') }>
                                        <h1 className='text-xl font-bold'>{ t('MAILCOLLECT.auth_method') }</h1>
                                        <div className='flex gap-4 mt-6'>
                                            { authMethods.map((method) => (
                                                <div key={ method.label }
                                                     onClick={ () => handleAuthMethodChange(method.value, process.id) }
                                                     className={ `
                                                        border-3 border-(--border-secondary) hover:border-(--color-primary) transition-colors duration-200
                                                        rounded-lg px-8 py-3 cursor-pointer flex items-center justify-center gap-4
                                                        ${ process.method === method.value ? 'bg-(--color-primary)/20 border-(--color-primary)' : '' } 
                                                    ` }>
                                                    <p className='text-lg font-semibold'>{ method.label }</p>
                                                </div>
                                            )) }
                                        </div>

                                        <div className='flex justify-end'>
                                            <Button onClick={ handleNextStep } className='px-12'>
                                                { t('MAILCOLLECT.next') }
                                            </Button>
                                        </div>
                                    </StepperPanel>
                                    <StepperPanel header={ t('MAILCOLLECT.folders') }>
                                        <div className='flex justify-between'>
                                            <Button onClick={ handlePreviousStep } variant='no_bg'
                                                    className='mr-2 px-12 text-(--color-primary) border-transparent hover:border-(--color-primary)'>
                                                <ArrowLeft/> { t('MAILCOLLECT.previous') }
                                            </Button>
                                            <Button onClick={ handleNextStep } className='ml-auto px-12'>
                                                { t('MAILCOLLECT.next') }
                                            </Button>
                                        </div>
                                    </StepperPanel>
                                    <StepperPanel header={ t('MAILCOLLECT.options') }>
                                        <div className='flex justify-between'>
                                            <Button onClick={ handlePreviousStep } variant='no_bg'
                                                    className='mr-2 px-12 text-(--color-primary) border-transparent hover:border-(--color-primary)'>
                                                <ArrowLeft/> { t('MAILCOLLECT.previous') }
                                            </Button>
                                            <Button onClick={ handleNextStep } className='ml-auto px-12'>
                                                { t('MAILCOLLECT.save') }
                                            </Button>
                                        </div>
                                    </StepperPanel>
                                </Stepper>
                            </AccordionTab>
                        )) }
                    </Accordion>
                </div>
            ) }
        </div>
    );
}