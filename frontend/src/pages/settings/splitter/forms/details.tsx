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
import { InputSwitch } from "primereact/inputswitch";

import Input from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { Dropdown } from "../../../../components/Dropdown";
import MultiSelectInput from "../../../../components/MultiSelect";

import { axiosApiCall } from "../../../../services/hooks/axiosApiCall";

export function SettingsSplitterFormsDetails({
    submit,
    submitLabel,
    isSubmitting,
    formSettings,
    setFormSettings,
    submitLabelLoading
}: {
    formSettings: any;
    submitLabel: string;
    isSubmitting?: boolean;
    submitLabelLoading: string;
    submit: (form: any) => void;
    setFormSettings: (formSettings: any) => void;
}) {
    const { get } = axiosApiCall();

    const [outputs, setOutputs] = useState<any[]>([]);
    const [metadataMethods, setMetadataMethods] = useState<any[]>([]);

    // Retrieve outputs and metadata settings
    useEffect(() => {
        const retrieveOutputs = async () => {
            try {
                const response = await get('outputs/splitter/list');
                setOutputs(response.outputs || []);
            } catch (error) {
                console.error("Error retrieving form outputs:", error);
            }
        };

        const retrieveMetadataMethods = async () => {
            try {
                const response = await get('splitter/metadataMethods');
                setMetadataMethods(response.metadataMethods || []);
            } catch (error) {
                console.error("Error retrieving form outputs:", error);
            }
        };

        retrieveMetadataMethods().then();
        retrieveOutputs().then();
    }, []);

    const handleSubmit = () => {
        if (submit) submit(formSettings);
    }

    return (
        <div className='p-6'>
            <div>
                <h2 className='text-(--text-primary)'>{ t('SETTINGS.general') }</h2>
                <Input
                    type="text"
                    id="form_label"
                    required={ true }
                    className="mt-4 w-1/2"
                    value={ formSettings.label }
                    label={ t('FORMS.form_name') }
                    error={ formSettings.label === '' ? t('FORMS.label_required') : '' }
                    onChange={ (e) => setFormSettings({
                        ...formSettings,
                        label: e.target.value
                    }) }
                />

                <div className='flex items-center gap-2'>
                    <InputSwitch id="default_form"
                                 checked={ formSettings.default_form }
                                 onChange={ (e) => setFormSettings({
                                     ...formSettings,
                                     default_form: e.value
                                 }) }/>
                    <label htmlFor='default_form'>{ t('FORMS.default_form') }</label>
                </div>
            </div>
            <div>
                <h2 className="text-(--text-primary) mt-6">{ t('OUTPUTS.outputs') }</h2>

                <div className='w-1/2 mt-4'>
                    <MultiSelectInput
                        optionValue="id"
                        id="output_select"
                        required={ true }
                        options={ outputs }
                        optionLabel="output_label"
                        invalid={ formSettings.outputs?.length === 0 }
                        value={ formSettings.outputs?.map(Number) ?? [] }
                        placeholder={ t('OUTPUTS.select_outputs') }
                        onChange={ (e) =>
                            setFormSettings({
                                ...formSettings,
                                outputs: e.value
                            })
                        }
                    />
                </div>
            </div>
            <div>
                <h2 className="text-(--text-primary) mt-6">{ t('SETTINGS.advanced') }</h2>
                <div className='flex items-center gap-2'>
                    <Input
                        id="export_zip_file"
                        className="w-1/2"
                        value={ formSettings.settings.export_zip_file || '' }
                        label={ t('SETTINGS.export_zip_file_name') }
                        hint={ t('SETTINGS.export_zip_file_name_hint') }
                        onChange={ (e) => setFormSettings({
                                ...formSettings,
                                settings: {
                                    ...formSettings.settings,
                                    export_zip_file: e.target.value
                                }
                            }
                        ) }
                    />
                </div>
                <div className='flex items-center gap-2'>
                    <Dropdown
                        filter={ true }
                        className="w-1/2"
                        id="metadata_method"
                        label={ t('FORMS.select_metadata_method') }
                        options={ metadataMethods.map((metadataMethod: any) => ({
                            value: metadataMethod.id,
                            label: metadataMethod.label
                        })) }
                        value={ formSettings.settings.metadata_method }
                        onChange={ (e) => setFormSettings({
                            ...formSettings,
                            settings: {
                                ...formSettings.settings,
                                metadata_method: e.value
                            }
                        }) }
                    />
                </div>
            </div>

            <Button className="mt-6" variant="primary" onClick={ handleSubmit }
                    disabled={ isSubmitting || formSettings.label === '' || !formSettings.outputs || formSettings.outputs.length === 0 }>
                { isSubmitting ? submitLabelLoading + "..." : submitLabel }
            </Button>
        </div>
    );
}