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

import React, { useState } from "react";
import { t } from "i18next";

import { MultiSelect } from "primereact/multiselect";

interface MultiSelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    options: any[];
    filter?: boolean;
    invalid?: boolean;
    filterBy?: string;
    required?: boolean;
    disabled?: boolean;
    optionValue: string;
    optionLabel: string;
    placeholder?: string;
    onChange: (value: any) => void;
    itemTemplate?: (option: any) => React.ReactNode;
}

const MultiSelectInput: React.FC<MultiSelectProps> = ({
    id,
    value,
    invalid,
    options,
    filterBy,
    optionValue,
    optionLabel,
    placeholder,
    itemTemplate,
    filter = true,
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
                regex.test(part) ? <strong key={i}>{part}</strong> : part
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

    return (
        <div>
            <MultiSelect
                id={ id }
                display="chip"
                value={ value }
                filter={ filter }
                invalid={ invalid }
                options={ options }
                required={ required }
                className={ 'w-full' }
                focusOnHover={ false }
                selectOnFocus={ false }
                autoOptionFocus={ false }
                optionValue={ optionValue }
                optionLabel={ optionLabel }
                placeholder={ placeholder }
                itemTemplate={ wrappedItemTemplate }
                filterBy={ filterBy ? filterBy : optionLabel }
                emptyMessage={ t('GLOBAL.no_result_found') }
                emptyFilterMessage={ t('GLOBAL.no_result_found') }
                virtualScrollerOptions={ { itemSize: 45, orientation: 'vertical', showSpacer: false } }
                onChange={ (e) => onChange(e) }
                onFilter={ (e) => setFilterValue(e.filter) }
            />
        </div>
    );
};

export default MultiSelectInput;
