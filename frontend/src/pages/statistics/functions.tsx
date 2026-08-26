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

export const getUsersHistory = async (history: any, params: any) => {
    const data: any = [];
    const stats = { 'total': 0, 'data': [] };
    params.users.forEach((user: any) => {
        let historyCpt = 0;
        history.forEach((entry: any) => {
            if (user.id === entry.user_id) {
                historyCpt++;
                stats['total'] += 1;
            }
        });
        data.push({
            'name': user.lastname + ' ' + user.firstname,
            'value': historyCpt,
            'fill': 'hsl(' + (data.length / params.users.length) * 360 + ', 70%, 50%)'
        });
    });
    stats['data'] = data;
    return stats;
}

export const statisticsFunctions = {
    verifierDocumentsValidatedPerUser: async (params: any) => {
        const res = await params.get('/history/list', {
            params: {
                module: 'verifier',
                year: params.selectedYear,
                submodule: 'document_validated'
            }
        });

        let stats;
        if (res.history) {
            stats = await getUsersHistory(res.history, params);
        }
        return stats;
    },

    verifierDocumentsValidatedPerForm: async (params: any) => {
        let res = await params.get('/forms/verifier/list');
        const forms = res.forms;

        res = await params.post('/verifier/documents/list', { 'status': 'END' });
        const documents = res.documents;

        const stats = { 'total': 0, 'data': [] };
        const data: any = [];
        forms.forEach((form: any) => {
            let historyCpt = 0;
            documents.forEach((document: any) => {
                const year = new Date(document.register_date).getFullYear();
                if (document.form_id === form.id && year === params.selectedYear) {
                    historyCpt++;
                    stats['total'] += 1;
                }
            });

            data.push({
                'name': form.label,
                'value': historyCpt,
                'fill': 'hsl(' + (data.length / forms.length) * 360 + ', 70%, 50%)'
            });
        });
        stats['data'] = data;

        return stats;
    },

    verifierDocumentsValidatedPerWorkflow: async (params: any) => {
        let res = await params.get('/workflows/verifier/list');
        const workflows = res.workflows;

        res = await params.get('/history/list', {
            params: {
                module: 'verifier',
                submodule: 'upload_file',
                year: params.selectedYear
            }
        });
        const stats = { 'total': 0, 'data': [] };
        if (res.history) {
            const data: any = [];
            workflows.forEach((workflow: any) => {
                let historyCpt = 0;
                res.history.forEach((entry: any) => {
                    if (workflow.id === entry.workflow_id) {
                        historyCpt++;
                        stats['total'] += 1;
                    }
                });
                data.push({
                    'name': workflow.label,
                    'value': historyCpt,
                    'fill': 'hsl(' + (data.length / workflows.length) * 360 + ', 70%, 50%)'
                });
            });
            stats['data'] = data;
        }
        return stats;
    },

    verifierDocumentsUploadedPerUser: async (params: any) => {
        const res = await params.get('/history/list', {
            params: {
                module: 'verifier',
                year: params.selectedYear,
                submodule: 'upload_file'
            }
        });

        let stats;
        if (res.history) {
            params.users[params.users.length - 1] = { 'id': 0, 'lastname': 'Upload', 'firstname': 'API' };
            stats = await getUsersHistory(res.history, params);
        }
        return stats;
    },

    verifierDocumentsUploadedPerMonth: async (params: any) => {
        if (!params.selectedYear) return null;

        const storageLocale = localStorage.getItem('selectedLang');
        let locale = 'fr-FR';
        if (storageLocale === 'eng') {
            locale = 'en-US';
        } else if (storageLocale === 'spa') {
            locale = 'es-ES';
        }

        const res = await params.get('/history/list', {
            params: {
                module: 'verifier',
                year: params.selectedYear,
                submodule: 'upload_file'
            }
        });

        const stats = { 'total': 0, 'data': [] };
        if (res.history) {
            const data: any = [];
            const historyCpt: any = {};
            const monthNames = Array.from({ length: 12 }, (_, i) => {
                const month = new Date(0, i).toLocaleString(locale, { month: 'long' });
                return month.charAt(0).toUpperCase() + month.slice(1);
            });
            monthNames.forEach((month: any) => {
                historyCpt[month] = 0;
            });

            res.history.forEach((entry: any) => {
                const month = new Date(entry.history_date).getMonth() + 1;
                const monthName = monthNames[month - 1];
                if (historyCpt[monthName] !== undefined) {
                    historyCpt[monthName]++;
                    stats['total'] += 1;
                }
            });

            for (const month in historyCpt) {
                data.push({
                    'name': month,
                    'value': historyCpt[month],
                    'fill': 'hsl(' + (data.length / 12) * 360 + ', 70%, 50%)'
                });
            }
            stats['data'] = data;
        }
        return stats;
    },

    verifierDocumentsUploadedPerYear: async (params: any) => {
        const res = await params.get('/history/list', {
            params: {
                module: 'verifier',
                submodule: 'upload_file'
            }
        });

        if (res.history) {
            const stats = { 'total': 0, 'data': [] };
            const data: any = [];
            const historyCpt: any = {};
            res.history.forEach((entry: any) => {
                const year = new Date(entry.history_date).getFullYear();
                if (historyCpt[year]) {
                    historyCpt[year]++;
                } else {
                    historyCpt[year] = 1;
                }
                stats['total'] += 1;
            });

            for (const year in historyCpt) {
                data.push({
                    'name': year,
                    'value': historyCpt[year],
                    'fill': 'hsl(' + (data.length / Object.keys(historyCpt).length) * 360 + ', 70%, 50%)'
                });
            }
            stats['data'] = data;
            return stats;
        }
    },

    splitterDocumentsProcessedPerWorkflow: async (params: any) => {
        let res = await params.get('/workflows/splitter/list');
        const workflows = res.workflows;

        res = await params.get('/history/list', {
            params: {
                module: 'splitter',
                submodule: 'create_document',
                year: params.selectedYear
            }
        });

        const stats = { 'total': 0, 'data': [] };
        if (res.history) {
            const data: any = [];
            workflows.forEach((workflow: any) => {
                let historyCpt = 0;
                res.history.forEach((entry: any) => {
                    if (workflow.id === entry.workflow_id) {
                        historyCpt++;
                        stats['total'] += 1;
                    }
                });

                data.push({
                    'name': workflow.label,
                    'value': historyCpt,
                    'fill': 'hsl(' + (data.length / workflows.length) * 360 + ', 70%, 50%)'
                });
            });
            stats['data'] = data;
        }
        return stats;
    },

    splitterGetUserProcessedDocumentSlitter: async (params: any) => {
        const res = await params.get('/history/list', {
            params: {
                module: 'splitter',
                submodule: 'create_document',
                year: params.selectedYear
            }
        });

        let stats;
        if (res.history) {
            stats = await getUsersHistory(res.history, params);
        }
        return stats;
    },

    splitterGetDocumentsProcessedByMonth: async (params: any) => {
        if (!params.selectedYear) return null;

        const storageLocale = localStorage.getItem('selectedLang');
        let locale = 'fr-FR';
        if (storageLocale === 'eng') {
            locale = 'en-US';
        } else if (storageLocale === 'spa') {
            locale = 'es-ES';
        }

        const res = await params.get('/history/list', {
            params: {
                module: 'splitter',
                submodule: 'create_document',
                year: params.selectedYear
            }
        });

        const stats = { 'total': 0, 'data': [] };
        if (res.history) {
            const data: any = [];
            const historyCpt: any = {};
            const monthNames = Array.from({ length: 12 }, (_, i) => {
                const month = new Date(0, i).toLocaleString(locale, { month: 'long' });
                return month.charAt(0).toUpperCase() + month.slice(1);
            });
            monthNames.forEach((month: any) => {
                historyCpt[month] = 0;
            });

            res.history.forEach((entry: any) => {
                const month = new Date(entry.history_date).getMonth() + 1;
                const monthName = monthNames[month - 1];
                if (historyCpt[monthName] !== undefined) {
                    historyCpt[monthName]++;
                    stats['total'] += 1;
                }
            });

            for (const month in historyCpt) {
                data.push({
                    'name': month,
                    'value': historyCpt[month],
                    'fill': 'hsl(' + (data.length / 12) * 360 + ', 70%, 50%)'
                });
            }
            stats['data'] = data;
        }
        return stats;
    },

    splitterGetDocumentsProcessedByYear: async (params: any) => {
        const res = await params.get('/history/list', {
            params: {
                module: 'splitter',
                submodule: 'create_document'
            }
        });

        if (res.history) {
            const stats = { 'total': 0, 'data': [] };
            const data: any = [];
            const historyCpt: any = {};
            res.history.forEach((entry: any) => {
                const year = new Date(entry.history_date).getFullYear();
                if (historyCpt[year]) {
                    historyCpt[year]++;
                } else {
                    historyCpt[year] = 1;
                }
                stats['total'] += 1;
            });

            for (const year in historyCpt) {
                data.push({
                    'name': year,
                    'value': historyCpt[year],
                    'fill': 'hsl(' + (data.length / Object.keys(historyCpt).length) * 360 + ', 70%, 50%)'
                });
            }
            stats['data'] = data;
            return stats;
        }
    },

    splitterGetBatchesUploadedByMonth: async (params: any) => {
        if (!params.selectedYear) return null;

        const storageLocale = localStorage.getItem('selectedLang');
        let locale = 'fr-FR';
        if (storageLocale === 'eng') {
            locale = 'en-US';
        } else if (storageLocale === 'spa') {
            locale = 'es-ES';
        }

        const res = await params.get('/history/list', {
            params: {
                module: 'splitter',
                submodule: 'upload_file',
                year: params.selectedYear
            }
        });

        const stats = { 'total': 0, 'data': [] };
        if (res.history) {
            const data: any = [];
            const historyCpt: any = {};
            const monthNames = Array.from({ length: 12 }, (_, i) => {
                const month = new Date(0, i).toLocaleString(locale, { month: 'long' });
                return month.charAt(0).toUpperCase() + month.slice(1);
            });
            monthNames.forEach((month: any) => {
                historyCpt[month] = 0;
            });

            res.history.forEach((entry: any) => {
                const month = new Date(entry.history_date).getMonth() + 1;
                const monthName = monthNames[month - 1];
                if (historyCpt[monthName] !== undefined) {
                    historyCpt[monthName]++;
                    stats['total'] += 1;
                }
            });

            for (const month in historyCpt) {
                data.push({
                    'name': month,
                    'value': historyCpt[month],
                    'fill': 'hsl(' + (data.length / 12) * 360 + ', 70%, 50%)'
                });
            }
            stats['data'] = data;
        }
        return stats;
    },

    splitterGetBatchesUploadedByYear: async (params: any) => {
        const res = await params.get('/history/list', {
            params: {
                module: 'splitter',
                submodule: 'upload_file'
            }
        });

        if (res.history) {
            const stats = { 'total': 0, 'data': [] };
            const data: any = [];
            const historyCpt: any = {};
            res.history.forEach((entry: any) => {
                const year = new Date(entry.history_date).getFullYear();
                if (historyCpt[year]) {
                    historyCpt[year]++;
                } else {
                    historyCpt[year] = 1;
                }
                stats['total'] += 1;
            });

            for (const year in historyCpt) {
                data.push({
                    'name': year,
                    'value': historyCpt[year],
                    'fill': 'hsl(' + (data.length / Object.keys(historyCpt).length) * 360 + ', 70%, 50%)'
                });
            }
            stats['data'] = data;
            return stats;
        }
    }
};