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

export const getTestConnectionMapping = () => [
    { id: 'export_mem', function: "testMEMConnection" },
    { id: 'export_coog', function: "testCOOGConnection" },
    { id: 'export_cmis', function: "testCMISConnection" },
    { id: 'export_opencrm', function: "testOpenCRMConnection" }
]

export const createFunctionsMap = ({ get, post, put }: any) => ({
    testMEMConnection: async (args: any) => {
        const res = await post('/mem/testConnection', args);
        console.log(res)
        return { success: true, message: "MEM connection successful!" };
    },

    testCOOGConnection: async (args: any) => {
        const res = await post('/coog/test', args);
        return { success: true, message: "COOG connection successful!" };
    },

    testCMISConnection: async (args: any) => {
        const res = await post('/cmis/test', args);
        return { success: true, message: "CMIS connection successful!" };
    },

    testOpenCRMConnection: async (args: any) => {
        const res = await post('/opencrm/test', args);
        return { success: true, message: "OpenCRM connection successful!" };
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
