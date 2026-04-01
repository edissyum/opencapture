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
import DOMPurify from "dompurify";
import { FloatLabel } from "primereact/floatlabel";
import { Dropdown as PrimeDropdown } from "primereact/dropdown";

interface DropdownProps {
    id: any;
    value: any;
    error?: string;
    label?: string;
    filter?: boolean;
    editable?: boolean;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    labelFusion?: boolean;
    noMarginBottom?: boolean;
    useExtraInLabel?: boolean;
    onChange: (e: any) => void;
    options: { value: any; label: string }[];
}

export const Dropdown: React.FC<DropdownProps> = ({
    id,
    value,
    label,
    error,
    options,
    onChange,
    required,
    editable = false,
    filter = false,
    className = "",
    placeholder = "",
    disabled = false,
    labelFusion = false,
    noMarginBottom = false,
    useExtraInLabel = false
}) => {
    let dropdownItemTemplate = undefined;
    let dropdownValueTemplate = undefined;
    if (useExtraInLabel) {
        dropdownItemTemplate = (option: any) => {
            if (!option) return null;
            return (
                <span>
                    { option.label }
                    { option.extras?.length > 0 && (
                        <span className='text-(--text-secondary) text-sm ml-2'>
                            — { option.extras.join(" - ") }
                        </span>
                    ) }
                </span>
            );
        };

        dropdownValueTemplate = (option: any) => {
            if (!option) return null;
            return option.label;
        };
    }

    return (
        <div className='w-full'>
            <div className={ `${ className } group group-focus-within:border-(--border-primary) relative flex justify-items-stretch 
                              ${ error || noMarginBottom ? '' : 'mb-4' } ${ disabled ? 'cursor-not-allowed' : '' }` }
            >
                <FloatLabel className='w-full'>
                    <PrimeDropdown
                        id={ id }
                        value={ value }
                        filter={ filter }
                        options={ options }
                        onChange={ onChange }
                        disabled={ disabled }
                        editable={ editable }
                        itemTemplate={ dropdownItemTemplate }
                        valueTemplate={ dropdownValueTemplate }
                        className={ `w-full min-h-12 flex items-center hover:border-(--border-primary)! ${ error ? 'border-(--text-error)!' : 'border-(--border-secondary)!' }` }
                        placeholder={ placeholder }
                    />
                    { label && (
                        <label htmlFor={ id }
                               className={ `select-none ${ labelFusion ? 'group-focus-within:border group-focus-within:border-b-0 ' +
                                   'border-(--border-secondary) group-focus-within:rounded-md ' +
                                   'group-focus-within:rounded-b-none group-focus-within:border-(--border-primary) ' +
                                   'group-hover:border-(--border-primary)' : '' }
                               ${ value && labelFusion ? 'border border-b-0 rounded-md rounded-b-none -top-[0.3rem]! p-0.5 border-(--border-primary)' : '' }` }>
                            { label }
                            { required && <span className="text-(--text-error) ml-1">*</span> }
                        </label>
                    ) }
                </FloatLabel>
            </div>
            { error && (
                <p className="text-(--text-error) text-xs ml-1"
                   dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(error) } }/>
            ) }
        </div>
    );
};