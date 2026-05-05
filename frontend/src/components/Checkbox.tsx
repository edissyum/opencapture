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

import { Check, Minus } from "lucide-react";
import React, { useEffect, useState } from "react";

type CheckboxProps = {
    id?: string;
    size?: number;
    label?: string;
    checked?: boolean;
    disabled?: boolean;
    className?: string;
    indeterminate?: boolean;
    onChange?: (checked: boolean, id: string | undefined) => void;
};

export function Checkbox({
    id,
    checked = false,
    onChange,
    label,
    className,
    indeterminate,
    size = 5,
    disabled = false
}: CheckboxProps) {
    const [isChecked, setIsChecked] = useState(checked);
    const [isIndeterminate, setIsIndeterminate] = useState(indeterminate);
    console.log(label, indeterminate, isIndeterminate)
    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    useEffect(() => {
        setIsIndeterminate(indeterminate);
    }, [indeterminate]);

    const toggle = (event: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;

        event.preventDefault();
        event.stopPropagation();

        let newValue: boolean;

        if (isIndeterminate) {
            newValue = true;
            setIsIndeterminate(false);
        } else {
            newValue = !isChecked;
        }

        setIsChecked(newValue);
        if (onChange) onChange(newValue, id);
    };

    return (
        <label className={ `${ className } inline-flex items-center cursor-pointer select-none` }>
            <div
                id={ id }
                onClick={ toggle }
                style={ { width: `calc(0.25rem*${ size })`, height: `calc(0.25rem*${ size })` } }
                className={ `border border-(--border-secondary) rounded flex items-center justify-center
                    ${ isChecked ? "bg-(--color-primary) hover:bg-(--color-primary)/80 border-(--border-primary)!" : "bg-(--bg-primary) hover:border-(--border-primary)" }
                    ${ disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-(--bg-selected)" }
                    transition-all shrink-0` }
            >
                { isChecked && !isIndeterminate && (
                    <Check className={ `size-${ size } text-(--bg-primary)` }/>
                ) }

                { isIndeterminate && (
                    <Minus className={ `size-${ size } text-(--bg-primary)` }/>
                ) }
            </div>
            { label &&
                <span onClick={ toggle } title={ label }
                      className="ml-2 text-(--text-secondary) truncate">
                    { label }
                </span>
            }
        </label>
    );
}
