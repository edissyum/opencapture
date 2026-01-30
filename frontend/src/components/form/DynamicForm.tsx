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

import { type JSX } from "react";
import { Controller } from "react-hook-form";
import { InputSwitch } from "primereact/inputswitch";
import {
    Calendar,
    CaseSensitive,
    CircleQuestionMark,
    ListTodo,
    Regex,
    SquareCheckBig,
    TextInitial
} from "lucide-react";

import Input from "../Input";
import { RadioBox } from "../RadioBox";
import { Checkbox } from "../Checkbox";
import { Dropdown } from "../Dropdown";
import MultiSelectInput from "../MultiSelect";


export function DynamicForm({ schema, control, errors, labelFusion = false, gap = 4, grid = false }: any) {
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

    const logoMap: Record<string, JSX.Element> = {
        text: <CaseSensitive/>,
        date: <Calendar/>,
        select: <ListTodo/>,
        checkbox: <SquareCheckBig/>,
        textarea: <TextInitial/>,
        regex: <Regex/>
    };

    const fields = extractFieldsFromSchema(schema);

    const renderField = (field: any) => {
        switch (field.component) {
            case "input":
                return (
                    <div className={ field.className || "" } key={ field.name }>
                        <Controller
                            key={ field.name }
                            name={ field.name }
                            control={ control }
                            render={ ({ field: f }) => (
                                <Input
                                    label={ field.label }
                                    value={ f.value ?? "" }
                                    hint={ field.hint ?? "" }
                                    bgColor={ field.bgColor }
                                    textWeight={ field.textWeight }
                                    textColor={ field.textColor }
                                    required={ field.required }
                                    disabled={ field.disabled }
                                    labelFusion={ labelFusion }
                                    type={ field.type || "text" }
                                    placeholder={ field.placeholder }
                                    error={ errors[field.name]?.message }
                                    onChange={ e => {
                                        const value = e.target.value

                                        if (field.type === 'number') {
                                            // valueAsNumber doesn't work with Controller, so we convert manually
                                            f.onChange(value === '' ? undefined : Number(value));
                                        } else {
                                            f.onChange(value);
                                        }
                                    } }
                                    onBlur={ f.onBlur }
                                />
                            ) }
                        />
                    </div>
                );
            case "input_switch":
                return (
                    <div className={ field.className || "" } key={ field.name }>
                        <Controller
                            key={ field.name }
                            name={ field.name }
                            control={ control }
                            render={ ({ field: f }) => (
                                <div className='flex items-center mb-2 relative w-fit'>
                                    <InputSwitch
                                        inputId={ f.name }
                                        checked={ f.value }
                                        onChange={ e => f.onChange(e.value) }
                                    />
                                    <label htmlFor={ f.name } className='cursor-pointer'>
                                        { field.label }
                                    </label>
                                    { field.hint && (
                                        <span className={ `absolute cursor-pointer z-10 -right-5 top-1.5 
                                                           text-(--text-secondary)` }>
                                            <CircleQuestionMark data-tooltip-id="tooltip" size={ 16 }
                                                                data-tooltip-content={ field.hint }/>
                                        </span>
                                    ) }
                                </div>
                            ) }
                        />
                    </div>
                );
            case "multi_select":
                return (
                    <div className={ field.className || "" } key={ field.name }>
                        <Controller
                            key={ field.name }
                            name={ field.name }
                            control={ control }
                            render={ ({ field: f }) => (
                                <MultiSelectInput
                                    id={ f.name }
                                    className="mb-4"
                                    value={ f.value }
                                    optionValue="value"
                                    optionLabel="label"
                                    label={ field.label }
                                    options={ field.options }
                                    labelFusion={ labelFusion }
                                    onChange={ e => f.onChange(e.value) }
                                />
                            ) }
                        />
                    </div>
                );
            case "radio_box":
                return (
                    <Controller
                        key={ field.name }
                        name={ field.name }
                        control={ control }
                        render={ ({ field: f }) => (
                            <div className='flex gap-2'>
                                { field.options.map((option: any) => (
                                    <RadioBox
                                        key={ option.value }
                                        label={ option.label }
                                        value={ option.value }
                                        checked={ f.value === option.value }
                                        onChange={ () => f.onChange(option.value) }/>
                                ))
                                }
                            </div>
                        ) }
                    />
                )
            case "dropdown":
                return (
                    <div className={ field.className || "" } key={ field.name }>
                        <Controller
                            key={ field.name }
                            name={ field.name }
                            control={ control }
                            render={ ({ field: f }) => (
                                <Dropdown
                                    id={ f.name }
                                    value={ f.value }
                                    label={ field.label }
                                    options={ field.options }
                                    labelFusion={ labelFusion }
                                    required={ field.required }
                                    filter={ field.filter || false }
                                    error={ errors[field.name]?.message }
                                    onChange={ e => f.onChange(e.value) }
                                />
                            ) }
                        />
                    </div>
                );
            case "checkbox":
                return (
                    <Controller
                        key={ field.name }
                        name={ field.name }
                        control={ control }
                        render={ ({ field: f }) => (
                            <Checkbox
                                checked={ f.value }
                                label={ field.label }
                                onChange={ f.onChange }
                            />
                        ) }
                    />
                );
            case "box":
                return (
                    <Controller
                        key={ field.name }
                        name={ field.name }
                        control={ control }
                        render={ ({ field: f }) => (
                            <div className='flex gap-4'>
                                { field.options.map((action: any) => (
                                    <div
                                        key={ action.value }
                                        onClick={ () => f.onChange(action.value) }
                                        className={ `cursor-pointer border-2 w-1/3 py-5 rounded-md text-center duration-200
                                                     ${ f.value === action.value ? "text-(--color-primary) bg-(--color-primary)/20 border-(--color-primary)"
                                            : "border-(--border-secondary) hover:border-(--text-secondary) text-(--text-primary)" }
                                        ` }>
                                        <div className="flex justify-center mb-2">
                                            { logoMap[action.logo] }
                                        </div>
                                        <span
                                            className={ `${ action.hint ? 'font-semibold' : 'text-(--text-secondary)' }
                                                ${ f.value === action.value ? 'text-(--color-primary)!' : '' }` }>
                                            { action.label }
                                        </span>
                                        <p className="text-(--text-secondary) text-sm">
                                            { action.hint }
                                        </p>
                                    </div>
                                )) }
                            </div>
                        ) }
                    />
                );
        }
    };

    return (
        <div className={ `${ grid ? `grid grid-cols-${ grid }` : `flex flex-col` } gap-${ gap }` }>
            { fields.map(renderField) }
        </div>
    );
}
