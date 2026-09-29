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
import { MultiSelect } from "@mantine/core";
import React, { useMemo, useState } from "react";

import { FloatingLabel, useFloatingLabel } from "./FloatingLabel";

interface MultiSelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    value: any[];
    options: any[];
    label?: string;
    filter?: boolean;
    invalid?: boolean;
    filterBy?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    optionValue: string;
    optionLabel: string;
    placeholder?: string;
    onChange: (value: any) => void;
    itemTemplate?: (option: any) => React.ReactNode;
}

const MultiSelectInput: React.FC<MultiSelectProps> = ({
    id,
    value,
    label,
    invalid,
    options,
    filterBy,
    optionValue,
    optionLabel,
    placeholder,
    itemTemplate,
    filter = true,
    className = "",
    disabled = false,
    required = false,
    onChange
}) => {
    const [searchValue, setSearchValue] = useState("");

    const hasValue = !!value && value.length > 0;
    const { floating, onFocus, onBlur } = useFloatingLabel(hasValue);

    const searchFields = useMemo(
        () => (filterBy ? filterBy.split(",") : [optionLabel]),
        [filterBy, optionLabel]
    );

    const { data, itemsByValue } = useMemo(() => {
        const map = new Map<string, any>();
        const opts = options.map((option: any) => {
            const key = String(option[optionValue]);
            map.set(key, option);
            return { value: key, label: String(option[optionLabel] ?? "") };
        });
        return { data: opts, itemsByValue: map };
    }, [options, optionValue, optionLabel]);

    const highlightJSX: any = (node: any, query: string) => {
        if (!query || !node) return node;

        if (typeof node === "string") {
            const regex = new RegExp(`(${ query })`, "gi");
            const parts = node.split(regex);

            return parts.map((part, i) =>
                regex.test(part) ? <strong key={ i }>{ part }</strong> : part
            );
        }

        if (!React.isValidElement(node)) return node;

        return React.cloneElement(node, {
            ...node.props,
            children: React.Children.map(node.props.children, (child: any) =>
                highlightJSX(child, query)
            )
        });
    };

    return (
        <div className={ `${ className } group group-focus-within:border-(--border-primary) relative flex
                          justify-items-stretch ${ disabled ? 'cursor-not-allowed' : '' }` }>
            <MultiSelect
                clearable
                id={ id }
                data={ data }
                error={ invalid }
                disabled={ disabled }
                required={ required }
                searchable={ filter }
                className='w-full'
                searchValue={ searchValue }
                placeholder={ placeholder }
                value={ (value ?? []).map(String) }
                onSearchChange={ setSearchValue }
                nothingFoundMessage={ t('GLOBAL.no_result_found') }
                filter={ ({ options: parsedOptions, search }) => {
                    if (!search) return parsedOptions;
                    const query = search.toLowerCase();
                    return parsedOptions.filter((opt: any) => {
                        const original = itemsByValue.get(opt.value);
                        if (!original) return false;
                        return searchFields.some((field) =>
                            String(original[field] ?? "").toLowerCase().includes(query)
                        );
                    });
                } }
                renderOption={ ({ option }) => {
                    const original = itemsByValue.get(option.value);
                    const content = itemTemplate && original ? itemTemplate(original) : option.label;
                    return highlightJSX(content, searchValue);
                } }
                onBlur={ onBlur }
                onFocus={ onFocus }
                onChange={ (newValue) => {
                    const original = newValue.map((v) => itemsByValue.get(v)?.[optionValue] ?? v);
                    onChange({ value: original });
                } }
            />

            { label && !placeholder && (
                <FloatingLabel htmlFor={ id } floating={ floating } required={ required }>
                    { label }
                </FloatingLabel>
            ) }
        </div>
    );
};

export default MultiSelectInput;
