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

import DOMPurify from "dompurify";
import { Autocomplete } from '@mantine/core';
import React, { useMemo, useState } from "react";

import { FloatingLabel, useFloatingLabel } from "./FloatingLabel";

interface AutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    error?: any;
    label?: string;
    value: any[] | any;
    required?: boolean;
    disabled?: boolean;
    optionLabel?: string;
    suggestions: string[];
    search: (event: string) => void;
    onChange: (value: any[] | any) => void;
}

const AutocompleteInput: React.FC<AutocompleteProps> = ({
    id,
    value,
    label,
    error,
    suggestions,
    required = false,
    disabled = false,
    optionLabel = "name",
    search,
    onChange
}) => {

    const [inputValue, setInputValue] = useState<string>(
        value ? (typeof value === 'string' ? value : value[optionLabel] ?? '') : ''
    );

    const { floating, onFocus, onBlur } = useFloatingLabel(!!inputValue);

    const { data, itemsByValue } = useMemo(() => {
        const map = new Map<string, any>();
        const opts = suggestions.map((item: any) => {
            const label = typeof item === 'string' ? item : (item[optionLabel] ?? '');
            const key = typeof item === 'string' ? item : String(item.id ?? label);
            map.set(key, item);
            return { value: key, label, extras: typeof item === 'string' ? undefined : item.extras };
        }).filter(opt => opt.label !== '');
        return { data: opts, itemsByValue: map };
    }, [suggestions, optionLabel]);

    const renderOption = ({ option }: { option: any }) => (
        <span className={ `flex items-center justify-between w-full` }>
            <span>
                { option.label }
                { option.extras?.length > 0 && (
                    <span className='text-(--text-secondary) text-sm ml-2'>
                        — { option.extras.join(" - ") }
                    </span>
                ) }
            </span>
        </span>
    );

    return (
        <div>
            <div className={ `relative w-full ${ disabled ? 'cursor-not-allowed' : '' }` }>
                <Autocomplete
                    id={ id }
                    data={ data }
                    className='w-full'
                    value={ inputValue }
                    required={ required }
                    disabled={ disabled }
                    onFocus={ onFocus }
                    onBlur={ onBlur }
                    renderOption={ renderOption }
                    onChange={ (val: string) => {
                        setInputValue(val);
                        search(val);
                    } }
                    onOptionSubmit={ (key: string) => {
                        const item = itemsByValue.get(key);
                        if (item) {
                            setInputValue(typeof item === 'string' ? item : item[optionLabel] ?? '');
                            onChange(item);
                        }
                    } }
                />

                { label && (
                    <FloatingLabel htmlFor={ id } floating={ floating } required={ required }>
                        { label }
                    </FloatingLabel>
                ) }
            </div>
            { error && (
                <p className="text-(--text-error) text-xs ml-1 mt-1"
                   dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(error) } }/>
            ) }
        </div>
    );
};

export default AutocompleteInput;
