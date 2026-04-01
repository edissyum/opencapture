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

export const getTestConnectionMapping = () => [
    { id: 'export_mem', function: "testMEMConnection" },
    { id: 'export_coog', function: "testCOOGConnection" },
    { id: 'export_cmis', function: "testCMISConnection" },
    { id: 'export_opencrm', function: "testOpenCRMConnection" }
]

export const createFunctionsMap = ({ post }: any) => ({
    testMEMConnection: async (args: any) => {
        const res = await post('/mem/testConnection', args);
        if (!res.status[0]) {
            return { success: false, message: `<strong>${ t('OUTPUTS.mem_connection_ko') }</strong> : ${ res.status[1] }` };
        } else {
            return { success: true, message: `<strong>${ t('OUTPUTS.mem_connection_ok') }</strong>` };
        }
    },
    testCOOGConnection: async (args: any) => {
        const res = await post('/coog/getAccessToken', args);
        if (!res.status[0]) {
            return { success: false, message: `<strong>${ t('OUTPUTS.coog_connection_ko') }</strong> : ${ res.status[1] }` };
        } else {
            return { success: true, message: `<strong>${ t('OUTPUTS.coog_connection_ok') }</strong>` };
        }
    },
    testCMISConnection: async (args: any) => {
        const res = await post('/splitter/cmis/testConnection', args);
        if (!res.status[0]) {
            return { success: false, message: `<strong>${ t('OUTPUTS.cmis_connection_ko') }</strong> : ${ res.status[1] }` };
        } else {
            return { success: true, message: `<strong>${ t('OUTPUTS.cmis_connection_ok') }</strong>` };
        }
    },
    testOpenCRMConnection: async (args: any) => {
        const res = await post('/opencrm/getAccessToken', args);
        if (!res.status[0]) {
            return { success: false, message: `<strong>${ t('OUTPUTS.opencrm_connection_ko') }</strong> : ${ res.status[1] }` };
        } else {
            return { success: true, message: `<strong>${ t('OUTPUTS.opencrm_connection_ok') }</strong>` };
        }
    }
});

export const executeAuthFunction = async (functionName: string, functionArgs: any, api: any) => {
    const functionsMap: any = createFunctionsMap(api);
    const func = functionsMap[functionName];

    if (func) {
        try {
            return await func(functionArgs);
        } catch (error) {
            console.log(error);
            return { success: false, message: "An error occurred while testing the connection." };
        }
    } else {
        return { success: false, message: "Function not found." };
    }
};
