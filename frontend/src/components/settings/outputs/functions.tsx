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
    { id: 'export_openads', function: "testOpenadsConnection" },
    { id: 'export_opencrm', function: "testOpenCRMConnection" },
    { id: 'export_opencaptureformem', function: "testOpenCaptureForMemConnection" }
]

const createAuthFunctionsMap: any = ({ post }: any) => ({
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
    },
    testOpenadsConnection: async (args: any) => {
        const res = await post('/splitter/openads/testConnection', args);
        if (!res.status[0]) {
            return { success: false, message: `<strong>${ t('OUTPUTS.openads_connection_ko') }</strong> : ${ res.status[1] }` };
        } else {
            return { success: true, message: `<strong>${ t('OUTPUTS.openads_connection_ok') }</strong>` };
        }
    },
    testOpenCaptureForMemConnection: async (args: any) => {
        const res = await post('/opencaptureformem/getAccessToken', args);
        if (!res.status[0]) {
            return { success: false, message: `<strong>${ t('OUTPUTS.opencaptureformem_connection_ko') }</strong> : ${ res.status[1] }` };
        } else {
            return { success: true, message: `<strong>${ t('OUTPUTS.opencaptureformem_connection_ok') }</strong>` };
        }
    }
});

const createMEMFunctionsMap: any = ({ post }: any) => ({
    getDoctypesFromMem: async (args: any) => {
        const res = await post('/mem/getDoctypes', args);
        if (res && res.doctypes) {
            let doctypesOptions: any = [];
            for (const doctype of res.doctypes) {
                doctypesOptions.push({ value: doctype.type_id, label: doctype.description });
            }
            return { success: true, data: doctypesOptions };
        }
    },
    getStatusesFromMem: async (args: any) => {
        const res = await post('/mem/getStatuses', args);
        if (res && res.statuses) {
            let statusesOptions: any = [];
            for (const status of res.statuses) {
                statusesOptions.push({ value: status.id, label: status.label_status });
            }
            return { success: true, data: statusesOptions };
        }
    },
    getUsersFromMem: async (args: any) => {
        const res = await post('/mem/getUsers', args);
        if (res && res.users) {
            let usersOptions: any = [];
            for (const user of res.users) {
                usersOptions.push({ value: user.id, label: user.firstname + ' ' + user.lastname });
            }
            return { success: true, data: usersOptions };
        }
    },
    getPrioritiesFromMem: async (args: any) => {
        const res = await post('/mem/getPriorities', args);
        if (res && res.priorities) {
            let prioritiesOptions: any = [];
            for (const priority of res.priorities) {
                prioritiesOptions.push({ value: priority.id, label: priority.label });
            }
            return { success: true, data: prioritiesOptions };
        }
    },
    getEntitiesFromMem: async (args: any) => {
        const res = await post('/mem/getEntities', args);
        if (res && res.entities) {
            let entitiesOptions: any = [];
            for (const entity of res.entities) {
                entitiesOptions.push({ value: entity.serialId, label: entity.entity_label });
            }
            return { success: true, data: entitiesOptions };
        }
    },
    getIndexingModelsFromMem: async (args: any) => {
        const res = await post('/mem/getIndexingModels', args);

        if (res && res.indexingModels) {
            let indexingModelsOptions: any = [];
            for (const model of res.indexingModels) {
                indexingModelsOptions.push({ value: model.id, label: model.label });
            }
            return { success: true, data: indexingModelsOptions };
        }
    },
    getContactsCustomFieldsFromMem: async (args: any) => {
        const res = await post('/mem/getContactsCustomFields', args);
        if (res && res.customFields) {
            let customFieldsOptions: any = [];
            for (const field of res.customFields) {
                customFieldsOptions.push({ value: field.id, label: field.label });
            }
            return { success: true, data: customFieldsOptions };
        }
    },
    getCustomFieldsFromMem: async (args: any) => {
        const res = await post('/mem/getCustomFields', args);
        if (res && res.customFields) {
            let customFieldsOptions: any = [];
            for (const field of res.customFields) {
                customFieldsOptions.push({ value: field.id, label: field.label });
            }
            return { success: true, data: customFieldsOptions };
        }
    }
});

export const executeAuthFunction = async (functionName: string, functionArgs: any, api: any) => {
    const functionsMap: any = createAuthFunctionsMap(api);
    const func = functionsMap[functionName];

    if (func) {
        try {
            return await func(functionArgs);
        } catch (error) {
            console.error(error);
        }
    } else {
        return { success: false, message: "Function not found." };
    }
};

export const executeMEMFunction = async (functionName: string, functionArgs: any, api: any) => {
    const functionsMap: any = createMEMFunctionsMap(api);
    const func = functionsMap[functionName];

    if (func) {
        try {
            return await func(functionArgs);
        } catch (error) {
            console.error(error);
        }
    } else {
        return { success: false, message: "Function not found." };
    }
};
