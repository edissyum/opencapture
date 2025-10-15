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
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: any;
    no_margin_bottom?: boolean;
    iconPosition?: "left" | "right";
}

export const Input: React.FC<InputProps> = ({
    id,
    label,
    error,
    required,
    disabled,
    type = "text",
    className = "",
    no_margin_bottom = false,
    ...props
}) => {
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    const isPasswordField = type === "password";

    const inputType = isPasswordField && passwordVisible ? "text" : type;
    return (
        <div className={ `flex flex-col rounded-md ${ className }` }>
            <div className={ `relative ${ error || no_margin_bottom ? '' : 'mb-6' }` }>
                <input
                    id={ id }
                    className={ `z-10 peer w-full border-b px-3 py-2 border rounded-md focus:outline-none focus:border-green-400 
                                 border-(--border-secondary) disabled:bg-(--bg-secondary) disabled:cursor-not-allowed` }
                    placeholder=""
                    type={ inputType }
                    disabled={ disabled }
                    required={ required }
                    aria-required={ required }
                    { ...props }
                />
                { label && (
                    <label htmlFor={ id } className={ `absolute left-0 ml-2 top-2 -translate-y-5 px-1 text-sm select-none
                        duration-100 ease-linear peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-base
                        ${ disabled ? 'bg-transparent cursor-not-allowed' : 'bg-(--bg-primary) cursor-text' }
                        text-(--text-secondary) peer-focus:w-auto peer-focus:-translate-y-5 z-0 peer-focus:px-1 peer-focus:text-sm` }>
                        { label }
                        { required && <span className="text-red-500 ml-1">*</span> }
                    </label>
                ) }
                { isPasswordField && (
                    <button
                        type="button"
                        onClick={ () => setPasswordVisible((prev) => !prev) }
                        className="absolute right-2 top-3 text-(--text-secondary) hover:text-(--color-primary) transition-colors z-20 cursor-pointer"
                        tabIndex={ -1 }
                    >
                        { passwordVisible ? <EyeOff size={ 18 }/> : <Eye size={ 18 }/> }
                    </button>
                ) }
            </div>
            { error && <p className="text-red-500 text-sm mt-1" dangerouslySetInnerHTML={ { __html: error } }></p> }
        </div>
    );
};
