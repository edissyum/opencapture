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

import { RadioButton } from "primereact/radiobutton";

export function RadioBox({ label, value, checked, onChange, border=true }: {
    label?: string;
    value: string;
    border?: boolean;
    checked: boolean;
    onChange: (value: string) => void
}) {

    const handleOnChange = (e: any) => {
        onChange(e.target.value);
    };

    return (
        <label key={ value } className={ `peer peer-checked:bg-(--color-primary) 
                                ${ border ? 'border-2 border-(--border-secondary) hover:border-(--color-primary) rounded-lg px-3 py-2': '' }
                                transition-colors text-(--text-primary) cursor-pointer flex items-center 
                                justify-center gap-1 bg-(--bg-primary) 
                                ${ checked && border ? 'bg-(--color-primary)/20 border-(--color-primary)' : '' }` }>
            <RadioButton inputId={ value } checked={ checked } className='mr-1 scale-80'
                         value={ value } onChange={ handleOnChange }>
            </RadioButton>
            { label }
        </label>
    );
}