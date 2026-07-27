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

import React from "react";
import { t } from "i18next";
import DOMPurify from "dompurify";
import { CircleQuestionMark } from "lucide-react";
import { Select as SelectMantine } from "@mantine/core";

import { FloatingLabel, useFloatingLabel } from "./FloatingLabel";

interface SelectProps {
    id: any;
    value: any;
    hint?: any;
    error?: any;
    label?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    onChange: (value: string) => void;
    options: { value: any; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
    id,
    hint,
    value,
    label,
    error,
    options,
    onChange,
    required,
    className = "",
    placeholder = "",
    disabled = false,
}) => {
    const hasValue = value !== undefined && value !== null && value !== '';
    const { floating, onFocus, onBlur } = useFloatingLabel(hasValue);

    const uniqueOptions = [...new Map(options.map(item => [item.value, item])).values()];

    const mantineRenderOption = ({ option }: { option: any }) => (
        <span>
            { option.label }
            { option.extras?.length > 0 && (
                <span className='text-(--text-secondary) text-sm ml-2'>
                        — { option.extras.join(" - ") }
                    </span>
            ) }
        </span>
    );

    return (
        <div className='w-full relative'>
            <div className={ `${ className } group group-focus-within:border-(--border-primary) relative flex justify-items-stretch
                              ${ disabled ? 'cursor-not-allowed opacity-70' : '' }` }
            >
                <span className='w-full'>
                    <SelectMantine
                        searchable
                        value={ value }
                        onBlur={ onBlur }
                        onFocus={ onFocus }
                        disabled={ disabled }
                        data={ uniqueOptions }
                        placeholder={ placeholder }
                        renderOption={ mantineRenderOption }
                        onChange={ (value) => {
                            onChange(value)
                        } }
                        nothingFoundMessage={ t('GLOBAL.no_result_found') }
                    />
                    { label && (
                        <FloatingLabel htmlFor={ id } floating={ floating } required={ required }>
                            { label }
                        </FloatingLabel>
                    ) }
                </span>
            </div>
            { hint && (
                <span className={ `absolute cursor-pointer z-10 -right-5 top-0 text-(--text-secondary)` }>
                    <CircleQuestionMark data-tooltip-id="tooltip" data-tooltip-content={ hint } size={ 16 }/>
                </span>
            ) }
            { error && (
                <p className="text-(--text-error) text-xs ml-1"
                   dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(error) } }/>
            ) }
        </div>
    );
};