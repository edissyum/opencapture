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

import { MultiSelect } from "primereact/multiselect";

interface MultiSelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    options: any[];
    filter?: boolean;
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
    optionValue: string;
    optionLabel: string;
    placeholder?: string;
    onChange: (value: any) => void;
}

const MultiSelectInput: React.FC<MultiSelectProps> = ({
    id,
    value,
    invalid,
    options,
    optionValue,
    optionLabel,
    placeholder,
    filter = true,
    required = false,
    onChange
}) => {

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
                emptyMessage={ t('GLOBAL.no_result_found') }
                virtualScrollerOptions={ { itemSize: 45, orientation: 'vertical', showSpacer: false } }
                onChange={ (e) => onChange(e) }
            />
        </div>
    );
};

export default MultiSelectInput;
