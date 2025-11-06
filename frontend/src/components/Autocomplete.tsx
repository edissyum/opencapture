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

import React, { useRef } from "react";

import { FloatLabel } from "primereact/floatlabel";
import { AutoComplete } from "primereact/autocomplete";

interface AutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    value: string;
    label?: string;
    required?: boolean;
    optionLabel?: string;
    suggestions: string[];
    itemTemplate?: (item: any) => React.ReactNode;
    search: (event: { query: string }) => void;
    onChange: (value: any) => void;
}

const AutocompleteInput: React.FC<AutocompleteProps> = ({
    id,
    value,
    label,
    suggestions,
    itemTemplate,
    required = false,
    optionLabel = "name",
    search,
    onChange
}) => {
    const autoRef = useRef<any>(null);

    return (
        <div>
            <FloatLabel className="w-full">
                <AutoComplete
                    key={ id }
                    name={ id }
                    ref={ autoRef }
                    value={ value }
                    field={ itemTemplate ? undefined : optionLabel }
                    itemTemplate={ itemTemplate }
                    required={ required }
                    completeMethod={ search }
                    suggestions={ suggestions }
                    onChange={ (e: any) => onChange(e.value) }
                />

                { label && (
                    <label htmlFor={ id }>
                        { label }
                        { required && <span className="text-(--text-error) ml-1">*</span> }
                    </label>
                ) }
            </FloatLabel>
        </div>
    );
};

export default AutocompleteInput;
