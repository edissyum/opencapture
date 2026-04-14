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
import { useEffect, useRef, useState } from "react";
import { ContextMenu } from "primereact/contextmenu";
import { InputSwitch } from "primereact/inputswitch";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Copy, EllipsisVertical, Inbox, PencilLine, Plus, Trash } from "lucide-react";

import { Button } from "../../../../components/Button";
import { Loader } from "../../../../components/loader/Loader";
import { showToast } from "../../../../components/ToastProvider";

import { MailCollectProcess } from "./mailcollect-process";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../../../services/hooks/ConfirmDialog";
import { showConfirmDialogWithInput } from "../../../../services/hooks/ConfirmDialogWithInput";

export function SettingsGeneralMailcollect() {
    const { get, post, put, del } = axiosApiCall();

    const cm = useRef({ current: null } as any);
    const [loading, setLoading] = useState(false);
    const [processList, setProcessList] = useState<any[]>([]);

    const [workflows, setWorkflows] = useState<{ verifier: any[]; splitter: any[] }>({
        verifier: [],
        splitter: []
    });
    const [selectedProcess, setSelectedProcess] = useState<any>(null);

    const menuModel: any = [
        {
            label: t('MAILCOLLECT.rename'),
            icon: <PencilLine className='mr-2' size={ 16 }/>,
            command: () => handleRename()
        },
        {
            label: t('MAILCOLLECT.duplicate'),
            icon: <Copy className='mr-2' size={ 16 }/>,
            command: () => handleDuplicate()
        },
        {
            label: <span className='critical'>{ t('MAILCOLLECT.delete') }</span>,
            icon: <Trash className='mr-2' size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const handleRename = () => {
        if (!selectedProcess) return;

        let newName = selectedProcess.name + '_bis';
        showConfirmDialogWithInput({
            value: newName,
            title: t('MAILCOLLECT.rename_process'),
            message: t('MAILCOLLECT.enter_new_process_name', { 'name': selectedProcess.name }),
            confirmText: t('MAILCOLLECT.rename'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: (value) => {
                const renameProcess = async () => {
                    try {
                        await put('/mailcollect/updateProcessName/' + selectedProcess.id, { name: value });
                        showToast(t('MAILCOLLECT.process_renamed'), "success");
                        selectedProcess.name = value;
                        setProcessList([...processList]);
                    } catch (error) {
                        console.error("Error while renaming MailCollect process :", error);
                    }
                }
                renameProcess().then();
            }
        });
    };

    const handleDelete = () => {
        if (!selectedProcess) return;

        showConfirmDialog({
            title: t('MAILCOLLECT.delete_process'),
            message: t('MAILCOLLECT.confirm_delete_process', { name: selectedProcess.name }),
            hint: t('GLOBAL.action_irreversible'),
            confirmText: t('MAILCOLLECT.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                try {
                    await del('/mailcollect/deleteProcess/' + selectedProcess.id);
                    showToast(t('MAILCOLLECT.process_deleted'), "success");
                    setProcessList(processList.filter(p => p.id !== selectedProcess.id));
                } catch (error) {
                    console.error("Erreur lors de la suppression du processus MailCollect :", error);
                }
            }
        })
    }

    const handleDuplicate = () => {
        if (!selectedProcess) return;

        let newName = selectedProcess.name + '_bis';
        showConfirmDialogWithInput({
            value: newName,
            title: t('MAILCOLLECT.duplicate_process'),
            message: t('MAILCOLLECT.enter_new_duplicate_process_name', { 'name': selectedProcess.name }),
            icon: <Copy/>,
            confirmText: t('MAILCOLLECT.duplicate'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: (value) => {
                let newProcess = { ...selectedProcess };
                newProcess.name = value;
                delete newProcess.id;

                const duplicateProcess = async () => {
                    try {
                        const response = await post('/mailcollect/createProcess', newProcess);
                        showToast(t('MAILCOLLECT.process_duplicated'), "success");

                        newProcess.id = response.process;
                        setProcessList([...processList, newProcess]);
                    } catch (error) {
                        console.error("Erreur lors de la duplication du processus MailCollect :", error);
                    }
                }
                duplicateProcess().then();
            }
        });
    };

    useEffect(() => {
        if (loading) return;
        setLoading(true);

        const fetchProcesses = async () => {
            try {
                const response = await get('/mailcollect/getProcesses');
                setProcessList(response.processes);
            } catch (error) {
                console.error("Erreur de récupération des processus MailCollect :", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchVerifierWorkflows = async () => {
            try {
                const response = await get('/workflows/verifier/list');
                setWorkflows(prev => ({ ...prev, verifier: response.workflows }));
            } catch (error) {
                console.error("Erreur de récupération des workflows du Verifier :", error);
            }
        };

        const fetchSplitterWorkflows = async () => {
            try {
                const response = await get('/workflows/splitter/list');
                setWorkflows(prev => ({ ...prev, splitter: response.workflows }));
            } catch (error) {
                console.error("Erreur de récupération des workflows du Splitter :", error);
            }
        }

        fetchProcesses().then();
        fetchVerifierWorkflows().then();
        fetchSplitterWorkflows().then();
    }, []);

    const handleAddProcess = () => {
        showConfirmDialogWithInput({
            value: t('MAILCOLLECT.new_mailcollect_process'),
            title: t('MAILCOLLECT.add_process'),
            message: t('MAILCOLLECT.enter_new_process_name_create'),
            confirmText: t('MAILCOLLECT.create'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: (value) => {
                let newProcess = {
                    id: null,
                    name: value,
                    method: 'imap',
                    enabled: true,
                    folder_destination: '',
                    options: {
                        login: '',
                        port: 993,
                        hostname: '',
                        password: ''
                    },
                    folder_to_crawl: 'INBOX',
                    action_after_process: 'move'
                };

                const addProcess = async () => {
                    try {
                        const response = await post('/mailcollect/createProcess', newProcess);
                        showToast(t('MAILCOLLECT.process_created'), "success");

                        newProcess.id = response.process;
                        setProcessList([...processList, newProcess]);
                    } catch (error) {
                        console.error("Erreur lors de la duplication du processus MailCollect :", error);
                    }
                }
                addProcess().then();
            }
        });
    };

    const handleToggleEnableProcess = (process: any) => {
        let title: string;
        let message: string;
        let confirmText: string;

        if (process.enabled) {
            confirmText = t('GLOBAL.disable');
            title = t('MAILCOLLECT.disable_process');
            message = t('MAILCOLLECT.confirm_disable_process', { 'name': process.name });
        } else {
            confirmText = t('GLOBAL.enable');
            title = t('MAILCOLLECT.enable_process');
            message = t('MAILCOLLECT.confirm_enable_process', { 'name': process.name });
        }
        showConfirmDialog({
            title: title,
            message: message,
            confirmText: confirmText,
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                let route = '/mailcollect/enableProcess/';
                let toastMessage = t('MAILCOLLECT.process_enabled');
                if (process.enabled) {
                    route = '/mailcollect/disableProcess/';
                    toastMessage = t('MAILCOLLECT.process_disabled');
                }
                try {
                    await put(route + process.id);
                    showToast(toastMessage, "success");
                } catch (error) {
                    console.error("Erreur lors du changement de l'état du processus MailCollect :", error);
                }

                process.enabled = !process.enabled;
                setProcessList([...processList]);
            }
        })
    }

    if (loading) return <Loader/>;

    return (
        <div className="p-6 bg-(--bg-secondary) h-full overflow-y-scroll">

            { processList.length !== 0 && (
                <div className="flex justify-end mb-4">
                    <Button size='sm' variant="bg_white" onClick={ handleAddProcess } className="p-2 px-3">
                        <Plus size={ 16 }/>
                        { t("MAILCOLLECT.add_process") }
                    </Button>
                </div>
            ) }

            { processList.length === 0 ? (
                <div className="w-1/3 flex flex-col gap-4 ">
                    <div className='p-2 bg-(--bg-primary) rounded-md w-fit'>
                        <Inbox/>
                    </div>
                    <h1 className="font-semibold text-lg">{ t("MAILCOLLECT.no_process") }</h1>
                    <p className="text-(--text-secondary)">{ t("MAILCOLLECT.no_process_info") }</p>
                    <Button onClick={ handleAddProcess }>
                        { t("MAILCOLLECT.add_process") }
                    </Button>
                </div>
            ) : (
                <Accordion multiple activeIndex={ [0] }>
                    { processList.map((process, idx) => (
                        <AccordionTab header={
                            <span className='flex items-center gap-2'>
                                <span>
                                    { process.name }
                                </span>
                                <span className='flex ml-auto gap-2'>
                                    <InputSwitch
                                        className='-top-0.5'
                                        inputId={ 'enable_' + idx } checked={ process.enabled }
                                        onClick={ (e) => e.stopPropagation() }
                                        onChange={ () => handleToggleEnableProcess(process) }/>
                                    <EllipsisVertical onClick={ (e) => {
                                        setSelectedProcess(process);
                                        e.preventDefault();
                                        e.stopPropagation();
                                        cm.current?.show(e);
                                    } }/>
                                    { menuModel && (
                                        <ContextMenu model={ menuModel } className="w-auto!" ref={ cm }/>
                                    ) }
                                </span>
                            </span>
                        } key={ idx }>
                            <MailCollectProcess key={ idx } process={ process } workflows={ workflows }/>
                        </AccordionTab>
                    )) }
                </Accordion>
            ) }
        </div>
    );
}
