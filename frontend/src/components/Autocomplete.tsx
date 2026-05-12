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
import DOMPurify from "dompurify";

interface AutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    label?: string;
    error?: any;
    value: any[] | any;
    dropdown?: boolean;
    multiple?: boolean;
    required?: boolean;
    disabled?: boolean;
    optionLabel?: string;
    suggestions: string[];
    itemTemplate?: (item: any) => React.ReactNode;
    search: (event: { query: string }) => void;
    onChange: (value: any[] | any) => void;
}

const AutocompleteInput: React.FC<AutocompleteProps> = ({
    id,
    value,
    label,
    error,
    suggestions,
    itemTemplate,
    dropdown = false,
    multiple = false,
    required = false,
    disabled = false,
    optionLabel = "name",
    search,
    onChange
}) => {
    const autoRef = useRef<any>(null);

    return (
        <div>
            <FloatLabel className={ `w-full ${ disabled ? 'cursor-not-allowed' : '' }` }>
                <AutoComplete
                    key={ id }
                    name={ id }
                    ref={ autoRef }
                    value={ value }
                    multiple={ multiple }
                    dropdown={ dropdown }
                    disabled={ disabled }
                    required={ required }
                    className={ `
                        w-full ${ disabled ? 'pointer-events-none' : '' }
                        ${ error ? 'autocompleteError' : '' }
                    ` }
                    completeMethod={ search }
                    suggestions={ suggestions }
                    itemTemplate={ itemTemplate }
                    field={ itemTemplate ? undefined : optionLabel }
                    onChange={ (e: any) => onChange(e.value) }
                />

                { label && (
                    <label htmlFor={ id }>
                        { label }
                        { required && <span className="text-(--text-error) ml-1">*</span> }
                    </label>
                ) }
            </FloatLabel>
            { error && (
                <p className="text-(--text-error) text-xs ml-1 mt-1"
                   dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(error) } }/>
            ) }
        </div>
    );
};

export default AutocompleteInput;
