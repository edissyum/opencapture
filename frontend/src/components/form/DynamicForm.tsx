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

import { Controller } from "react-hook-form";
import Input from "../Input.tsx";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "../Checkbox";


export function DynamicForm({ schema, control, errors, formData, labelFusion = false }) {
    const extractFieldsFromSchema = (schema: any) => {
        const shape = schema._def.shape;
        return Object.entries(shape).map(([name, zodType]: any) => {
            let metadata = zodType.description || {};
            if (metadata) {
                metadata = JSON.parse(metadata);
            }
            return { name, ...metadata, zodType };
        });
    };

    const fields = extractFieldsFromSchema(schema);

    const renderField = (field: any) => {
        switch (field.component) {
            case "input":
                return (
                    <Controller
                        key={ field.name }
                        name={ field.name }
                        control={ control }
                        render={ ({ field: f }) => (
                            <Input
                                required={ field.required }
                                disabled={ field.disabled }
                                label={ field.label }
                                type={ field.type || "text" }
                                labelFusion={ labelFusion }
                                placeholder={ field.placeholder }
                                error={ errors[field.name]?.message }
                                value={ f.value ?? "" }
                                onChange={ e => f.onChange(e.target.value) }
                                onBlur={ f.onBlur }
                            />
                        ) }
                    />
                );
            case "dropdown":
                return (
                    <Controller
                        key={ field.name }
                        name={ field.name }
                        control={ control }
                        render={ ({ field: f }) => (
                            <Dropdown
                                className='w-full mb-7'
                                placeholder={ field.label }
                                options={ field.options }
                                value={ f.value }
                                onChange={ f.onChange }
                            />
                        ) }
                    />
                );
            case "checkbox":
                return (
                    <Controller
                        key={ field.name }
                        name={ field.name }
                        control={ control }
                        render={ ({ field: f }) => (
                            <Checkbox
                                label={ field.label }
                                checked={ f.value }
                                onChange={ f.onChange }
                            />
                        ) }
                    />
                );
        }
    };

    return <div className="space-y-4">{ fields.map(renderField) }</div>;
}

