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
import { useEffect, useState } from "react";

import { Select } from "../../../../components/Select";
import { Loader } from "../../../../components/loader/Loader";
import { QrSeparator } from "../../../../components/settings/doctypes/qrSeparator";
import { DoctypesTree } from "../../../../components/settings/doctypes/doctypesTree";

import { AxiosApiCall } from "../../../../services/hooks/AxiosApiCall";

export function SettingsSplitterSeparator() {
    const { get } = AxiosApiCall();
    const [loading, setLoading] = useState(true);

    const [forms, setForms] = useState<any[]>([]);
    const [selectedForm, setSelectedForm] = useState<number>();
    const [selectedDoctype, setSelectedDoctype] = useState<any>(null);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const response = await get(`/forms/splitter/list`);
                if (response && response.forms) {
                    setForms(response.forms);
                    response.forms.forEach((form: any) => {
                        if (form.default_form) {
                            setSelectedForm(form.id);
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching forms :', error);
            } finally {
                setLoading(false);
            }
        };

        fetchForms().then();
    }, [])

    if (loading) return <Loader/>;

    return (
        <div className="flex flex-col h-full gap-4">
            <div className='p-6 pb-2'>
                <Select
                    id='select-form'
                    value={ selectedForm }
                    label={ t('SEPARATOR.form_choice') }
                    options={ forms.map((form: any) => ({ label: form.label, value: form.id })) }
                    onChange={ (value: any) => setSelectedForm(value) }
                />
            </div>

            <div className="flex flex-1 min-h-0 border-t border-(--border-secondary)">
                <div className="flex-1 min-w-0 overflow-auto border-r border-(--border-secondary)">
                    { selectedForm ? (
                        <DoctypesTree
                            key='doctypes' formId={ selectedForm }
                            selectedDoctype={ selectedDoctype } editor={ true }
                            onSelect={ (node) => setSelectedDoctype(node) }
                        />
                    ) : (
                        <div className="p-6 flex justify-center text-(--text-secondary)">
                            { t("SEPARATOR.select_form") }
                        </div>
                    ) }
                </div>

                <div className="w-[30rem] shrink-0 flex flex-col overflow-auto p-6">
                    <QrSeparator selectedDoctype={ selectedDoctype }/>
                </div>
            </div>
        </div>
    );
}