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
import { Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";

import { Button } from "../../../../components/Button";
import { Loader } from "../../../../components/loader/Loader";

import { MailCollectProcess } from "./mailcollect-process";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";

export function SettingsGeneralMailcollect() {
    const { get } = axiosApiCall();
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
                console.error("Erreur de récupération des processus MailCollect :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProcesses().then();
    }, []);

    const handleAddProcess = () => {
        setProcessList([...processList, { name: "Nouveau Processus", authMethod: "imap" }]);
    };

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
                        <AccordionTab header={ process.name } key={ idx }>
                            <MailCollectProcess process={ process } index={ idx }/>
                        </AccordionTab>
                    )) }
                </Accordion>
            ) }
        </div>
    );
}
