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
    { id: 'export_opencrm', function: "testOpenCRMConnection" },
]

const functionsMap: { [key: string]: () => Promise<{ success: boolean, message: string }> } = {
    testMEMConnection: async (args) => {
        // Simulate an API call with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: "MEM connection successful!" };
    },
    testCOOGConnection: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: "COOG connection successful!" };
    },
    testCMISConnection: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: "CMIS connection successful!" };
    },
    testOpenCRMConnection: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: "OpenCRM connection successful!" };
    }
};

export const executeAuthFunction = async (functionName: string, functionArgs: any) => {
    const func = functionsMap[functionName];
    if (func) {
        try {
            return await func(functionArgs);
        } catch (error) {
            return { success: false, message: "An error occurred while testing the connection." };
        }
    } else {
        return { success: false, message: "Function not found." };
    }
};
