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
import { CircleQuestionMark, Copy, EllipsisVertical, Inbox, PencilLine, Trash } from "lucide-react";

import { Button } from "../../../../components/Button";
import { Loader } from "../../../../components/loader/Loader";
import { showToast } from "../../../../components/ToastProvider";

import { MailCollectProcess } from "./mailcollect-process";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";
import { showConfirmDialog } from "../../../../services/hooks/ConfirmDialog";

export function SettingsGeneralMailcollect() {
    const { get, put } = axiosApiCall();

    const cm = useRef(null);
    const [loading, setLoading] = useState(false);
    const [processList, setProcessList] = useState<any[]>([]);

    const [workflows, setWorkflows] = useState<{ verifier: any[]; splitter: any[] }>({
        verifier: [],
        splitter: []
    });

    const menuModel = [
        { label: t('MAILCOLLECT.rename'), icon: <PencilLine className='mr-2' size={ 16 }/> },
        { label: t('MAILCOLLECT.duplicate'), icon: <Copy className='mr-2' size={ 16 }/> },
        { label: <span className='critical'>{ t('MAILCOLLECT.delete') }</span>, icon: <Trash className='mr-2' size={ 16 }/> }
    ];

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
        setProcessList([...processList, { name: "Nouveau Processus", authMethod: "imap" }]);
    };

    const handleToggleEnableProcess = (process: any) => {
        let title: string;
        let message: string;
        let confirmText: string;

        if (process.enabled) {
            confirmText = t('GLOBAL.disable');
            title = t('MAILCOLLECT.disable_process');
            message = t('MAILCOLLECT.confirm_disable_process');
        } else {
            confirmText = t('GLOBAL.enable');
            title = t('MAILCOLLECT.enable_process');
            message = t('MAILCOLLECT.confirm_enable_process');
        }
        showConfirmDialog({
            icon: <CircleQuestionMark/>,
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
                    await put(route + process.name);
                    showToast(toastMessage, "success");
                } catch (error) {
                    console.error("Erreur lors du changement de l'état du processus MailCollect :", error);
                }

                process.enabled = !process.enabled;
                setProcessList([...processList]);
            },
            onCancel: () => {
            }
        })
    }

    if (loading) return <Loader/>;

    return (
        <div className="p-6 bg-(--bg-secondary) h-full overflow-y-scroll">
            <div className="flex justify-end mb-4">
                <Button variant="secondary" onClick={ handleAddProcess }
                        className="px-6 bg-transparent hover:bg-(--color-primary)">
                    { t("MAILCOLLECT.add_process") }
                </Button>
            </div>

            { processList.length === 0 ? (
                <div className="w-1/3">
                    <Inbox className="mb-4"/>
                    <h1 className="mb-2 font-semibold text-lg">{ t("MAILCOLLECT.no_process") }</h1>
                    <p className="text-(--text-secondary)">{ t("MAILCOLLECT.no_process_info") }</p>
                    <Button className="mt-4" onClick={ handleAddProcess }>
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
                                <span className='flex ml-auto'>
                                    <InputSwitch inputId={ 'enable_' + idx } checked={ process.enabled }
                                                 onClick={ (e) => e.stopPropagation() }
                                                 onChange={ () => handleToggleEnableProcess(process) }/>
                                    <EllipsisVertical onClick={ (e) => {
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
