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

import { z } from "zod";
import { t } from "i18next";
import { useForm } from "react-hook-form";
import { Stepper } from "primereact/stepper";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { StepperPanel } from "primereact/stepperpanel";
import { TabPanel, TabView } from "primereact/tabview";

import { getCompressTypeOptions, getSystemFieldsOptions } from "./helpers";

import { Loader } from "../../loader/Loader";
import { DynamicForm } from "../../form/DynamicForm";
import { axiosApiCall } from "../../../services/hooks/axiosApiCall";
import { useCustomFields } from "../../../services/hooks/useCustomFields.tsx";
import { Button } from "../../Button.tsx";
import { ArrowLeft } from "lucide-react";
import { useParams } from "react-router-dom";

export function OutputEditor({ module }: { module: string }) {
    const { get, post, del } = axiosApiCall();
    const { outputId } = useParams<{ outputId: any }>();

    const [loading, setLoading] = useState(true);
    const stepperRef = useRef<any>(null);
    const [stepperIndex, setStepperIndex] = useState(0);

    const [outputTypes, setOutputTypes] = useState([]);
    const [outputType, setOutputType] = useState('');

    const { customFields } = useCustomFields(module);

    // Fetch output types for dropdown
    useEffect(() => {
        const fetchOutputTypes = async () => {
            try {
                const response = await get(`/outputs/${ module }/getOutputsTypes`);
                if (response && response.outputs_types) {
                    setOutputTypes(response.outputs_types);
                }
            } catch (error) {
                console.error("Error fetching output types:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOutputTypes().then();
    }, []);

    const detailSchema = z.object({
        output_type_id: z.string().min(3).describe(JSON.stringify({
            required: true,
            component: "dropdown",
            label: t("OUTPUTS.type"),
            options: outputTypes.map((o: any) => ({ label: o.output_type_label, value: o.output_type_id }))
        })),
        output_label: z.string().min(3).describe(JSON.stringify({
            required: true,
            component: "input",
            label: t("GLOBAL.label")
        })),
        compress_type: z.string().describe(JSON.stringify({
            required: false,
            component: "dropdown",
            disabled: !['export_pdf', 'export_cmis', 'export_openads'].includes(outputType),
            label: t("OUTPUTS.compress_type"),
            options: getCompressTypeOptions().map((o: any) => ({ label: o.label, value: o.id }))
        })),
        ocrise: z.boolean().describe(JSON.stringify({
            required: false,
            className: "flex items-center -mt-4",
            component: "input_switch",
            disabled: !['export_pdf', 'export_cmis', 'export_openads'].includes(outputType),
            label: t("OUTPUTS.ocrise")
        }))
    });

    const {
        watch: watchDetails,
        control: detailsControl,
        setValue: detailsSetValue,
        handleSubmit: detailsHandleSubmit,
        formState: { errors: detailsErrors }
    } = useForm({
        resolver: zodResolver(detailSchema),
        defaultValues: {
            output_label: '',
            output_type_id: ''
        },
        mode: "onChange"
    });

    // Update output type when changed
    useEffect(() => {
        setOutputType(watchDetails('output_type_id'));
    }, [watchDetails('output_type_id')]);

    // Fetch output details
    useEffect(() => {
        if (!outputId) return;

        const fetchOutputDetails = async () => {
            try {
                const response = await get(`/outputs/${ module }/getById/${ outputId }`);
                if (response) {
                    Object.keys(response).forEach((key: any) => {
                        detailsSetValue(key, response[key]);
                    });
                }
            } catch (error) {
                console.error("Error fetching output details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOutputDetails().then();
    }, []);

    const handleNextStep: any = (data: FormData) => {
        // if (data && Object.keys(workflowErrors).length > 0) {
        //     return;
        // }
        stepperRef.current?.nextCallback();
    }

    const handlePreviousStep = () => stepperRef.current?.prevCallback();

    if (loading) return <Loader/>;

    return (
        <div className="h-full w-full overflow-y-auto flex">
            <div className='w-full'>
                <div className='px-8 pt-8'>
                    <h1 className="text-lg font-semibold mb-4">
                        { t('OUTPUTS.details') }
                    </h1>

                    <div className='w-full'>
                        <DynamicForm errors={ detailsErrors } control={ detailsControl } schema={ detailSchema }
                                     grid={ 2 }/>
                    </div>
                </div>

                <Stepper ref={ stepperRef } linear className='p-4' activeStep={ stepperIndex }
                         onChangeStep={ (e: any) => setStepperIndex(e.index) }>
                    <StepperPanel header={ t("SMTP.authentication") }>

                        <div className="flex justify-end mt-6">
                            <Button onClick={ handleNextStep } className="ml-auto px-12"
                                    disabled={ loading }>
                                { t("MAILCOLLECT.next") }
                            </Button>
                        </div>
                    </StepperPanel>

                    <StepperPanel header={ t("OUTPUTS.specific") }>

                        <div className='mt-4 flex justify-between'>
                            <Button onClick={ handlePreviousStep } variant="no_bg"
                                    className="px-0! text-(--color-primary) border-transparent hover:text-(--text-primary)">
                                <ArrowLeft/> { t("MAILCOLLECT.previous") }
                            </Button>

                            <Button onClick={ handleNextStep } className="px-12"
                                    disabled={ loading }>
                                { t("MAILCOLLECT.next") }
                            </Button>
                        </div>
                    </StepperPanel>

                    { outputType === 'export_mem' && (
                        <StepperPanel header={ t("OUTPUTS.links") }>
                        </StepperPanel>
                    ) }
                </Stepper>
            </div>

            { stepperIndex === 1 && (
                <div className="w-[25rem] h-full flex flex-col border-l-2 border-(--border-secondary)">
                    <TabView scrollable className="available_fields">
                        <TabPanel header={ t("VERIFIER.system_fields") }>
                            <div className="p-6 flex flex-col gap-2">
                                { getSystemFieldsOptions().map((option: any) => (
                                    <div key={ option.id } data-tooltip-id='tooltip'
                                         data-tooltip-content={ t("OUTPUTS.copy_to_clipboard") }
                                         onClick={ () => {
                                             navigator.clipboard.writeText(option.id);
                                         } }
                                         className='flex flex-col border-2 border-(--border-secondary) rounded-lg
                                                   bg-(--bg-primary) px-6 py-2 w-full cursor-pointer hover:bg-(--bg-secondary)'>
                                        <div className='text-(--text-primary) font-semibold'>
                                            { option.label }
                                        </div>
                                        <div className='text-(--text-secondary)'>
                                            { option.id }
                                        </div>
                                    </div>
                                )) }
                            </div>
                        </TabPanel>
                        { customFields.length > 0 && (
                            <TabPanel header={ t("VERIFIER.custom_fields") }>
                                <div className="p-6 flex flex-col gap-2">
                                    { customFields.map((field: any) => (
                                        <div key={ field.id } data-tooltip-id='tooltip'
                                                data-tooltip-content={ t("OUTPUTS.copy_to_clipboard") }
                                             onClick={ () => {
                                                 navigator.clipboard.writeText(field.label_short);
                                             } }
                                             className='flex flex-col border-2 border-(--border-secondary) rounded-lg
                                                       bg-(--bg-primary) px-6 py-2 w-full cursor-pointer hover:bg-(--bg-secondary)'>
                                            <div className='text-(--text-primary) font-semibold'>
                                                { field.label }
                                            </div>
                                            <div className='text-(--text-secondary)'>
                                                { field.label_short }
                                            </div>
                                        </div>
                                    )) }
                                </div>
                            </TabPanel>
                        ) }
                    </TabView>
                </div>
            ) }
        </div>
    )
}