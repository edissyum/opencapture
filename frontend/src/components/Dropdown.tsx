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
import { CircleQuestionMark } from "lucide-react";

interface DropdownProps {
    id: any;
    value: any;
    hint?: any;
    error?: any;
    label?: string;
    filter?: boolean;
    itemsSize?: number;
    editable?: boolean;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    useExtraInLabel?: boolean;
    onChange: (e: any) => void;
    options: { value: any; label: string }[];
}

export const Dropdown: React.FC<DropdownProps> = ({
    id,
    hint,
    value,
    label,
    error,
    options,
    onChange,
    required,
    itemsSize,
    filter = false,
    className = "",
    editable = false,
    placeholder = "",
    disabled = false,
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

    const dropdownEl: any = (
        <PrimeDropdown
            id={ id }
            value={ value }
            filter={ filter }
            options={ options }
            onChange={ onChange }
            disabled={ disabled }
            editable={ editable }
            placeholder={ placeholder }
            itemTemplate={ dropdownItemTemplate }
            valueTemplate={ dropdownValueTemplate }
            virtualScrollerOptions={ itemsSize ? { itemSize: itemsSize } : undefined }
            className={ `w-full min-h-12 flex items-center hover:border-(--border-primary)! ${ error ? 'border-(--text-error)!' : 'border-(--border-secondary)!' }` }
        />
    );

    return (
        <div className='w-full relative'>
            <div className={ `${ className } group group-focus-within:border-(--border-primary) relative flex justify-items-stretch 
                              ${ disabled ? 'cursor-not-allowed opacity-70' : '' }` }
            >
                { placeholder ? (
                    <span className='w-full'>
                        { dropdownEl }
                    </span>
                ) : (
                    <FloatLabel className='w-full'>
                        { dropdownEl }
                        { label && (
                            <label htmlFor={ id } className='select-none'>
                                { label }
                                { required && <span className="text-(--text-error) ml-1">*</span> }
                            </label>
                        ) }
                    </FloatLabel>
                ) }
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