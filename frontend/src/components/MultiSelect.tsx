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
import { X } from "lucide-react";
import React, { useState } from "react";

import { FloatLabel } from "primereact/floatlabel";
import { MultiSelect } from "primereact/multiselect";

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

    const [filterValue, setFilterValue] = useState("");

    const highlightJSX: any = (node: any, filter: any) => {
        if (!filter || !node) return node;

        if (typeof node === "string") {
            const regex = new RegExp(`(${filter})`, "gi");
            const parts = node.split(regex);

            return parts.map((part, i) =>
                regex.test(part) ? <strong key={ i }>{ part }</strong> : part
            );
        }

        if (!React.isValidElement(node)) return node;

        return React.cloneElement(node, {
            // @ts-ignore
            ...node.props,
            // @ts-ignore
            children: React.Children.map(node.props.children, child =>
                highlightJSX(child, filter)
            ),
        });
    };

    const wrappedItemTemplate = (option: any) => {
        const originalJSX = itemTemplate
            ? itemTemplate(option)
            : option[optionLabel];
        return highlightJSX(originalJSX, filterValue);
    };

    const multiSelectEl: any = (
        <MultiSelect
            id={ id }
            display="chip"
            value={ value }
            filter={ filter }
            className='w-full'
            invalid={ invalid }
            options={ options }
            disabled={ disabled }
            required={ required }
            focusOnHover={ false }
            selectOnFocus={ false }
            autoOptionFocus={ false }
            optionValue={ optionValue }
            optionLabel={ optionLabel }
            placeholder={ placeholder }
            removeIcon={ (options: any) => (
                <i { ...options.iconProps }
                   className={ `${ options.iconProps?.className ?? "" }` }>
                    <X size={ 16 }/>
                </i>
            ) }

            itemTemplate={ wrappedItemTemplate }
            filterBy={ filterBy ? filterBy : optionLabel }
            emptyMessage={ t('GLOBAL.no_result_found') }
            emptyFilterMessage={ t('GLOBAL.no_result_found') }
            virtualScrollerOptions={ { itemSize: 45, orientation: 'vertical', showSpacer: false } }
            onChange={ onChange }
            onFilter={ (e) => setFilterValue(e.filter) }
        />
    );

    return (
        <div className={ `${ className } group group-focus-within:border-(--border-primary) relative flex
                          justify-items-stretch ${ disabled ? 'cursor-not-allowed' : '' }` }>
            { placeholder ? (
                <span className='w-full'>
                    { multiSelectEl }
                </span>
            ) : (
                <FloatLabel className='w-full'>
                    { multiSelectEl }
                    { label && (
                        <label htmlFor={ id } className='select-none'>
                            { label }
                            { required && <span className="text-(--text-error) ml-1">*</span> }
                        </label>
                    ) }
                </FloatLabel>
            ) }
        </div>
    );
};

export default MultiSelectInput;
