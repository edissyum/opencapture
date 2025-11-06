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
import { CircleQuestionMark, Eye, EyeOff } from "lucide-react";

import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: any;
    hint?: string;
    label?: string;
    height?: string;
    no_margin_bottom?: boolean;
    iconPosition?: "left" | "right";
}

const Input: React.FC<InputProps> = ({
    id,
    hint,
    label,
    error,
    required,
    disabled,
    type = "text",
    height = "h-12",
    className = "",
    no_margin_bottom = false,
    ...props
}) => {
    const [passwordVisible, setPasswordVisible] = React.useState(false);

    const isPasswordField = type === "password";

    const inputType = isPasswordField && passwordVisible ? "text" : type;

    return (
        <div className={ `flex flex-col rounded-md ${ className }` }>
            <div className={ `group group-focus-within:border-(--border-primary) relative flex justify-items-stretch 
                            ${ error || no_margin_bottom ? '' : 'mb-5' }` }>
                <FloatLabel className='w-full'>
                    {/*@ts-ignore*/ }
                    <InputText
                        id={ id }
                        className={ `peer! w-full! px-3! py-2! border-[1.5px]! rounded-md! focus:outline-none! focus:border-(--color-primary)!
                            hover:border-(--color-primary)! transition-colors duration-200 text-(--text-primary)!
                            ${ isPasswordField ? 'border-r-0! rounded-r-none!' : '' }
                            ${ error ? 'border-(--text-error)!' : 'border-(--border-secondary)!' } disabled:bg-(--bg-secondary) disabled:cursor-not-allowed! ${ height }`
                        }
                        type={ inputType }
                        disabled={ disabled }
                        required={ required }
                        aria-required={ required }
                        { ...props }
                    />
                    { label && (
                        <label htmlFor={ id }>
                            { label }
                            { required && <span className="text-(--text-error) ml-1">*</span> }
                        </label>
                    ) }
                </FloatLabel>

                { hint && (
                    <span className={ `absolute cursor-pointer z-10 right-1.5 top-1.5 text-(--text-secondary)` }>
                        <CircleQuestionMark data-tooltip-id="tooltip" data-tooltip-content={ hint } size={ 16 }/>
                    </span>
                ) }
                { isPasswordField && (
                    <button
                        type="button"
                        onClick={ () => setPasswordVisible((prev) => !prev) }
                        className={ `px-2 rounded-lg! rounded-l-none! group-focus-within:border-(--color-primary)!
                            border-l-0! border! text-(--text-secondary)! hover:text-(--color-primary) z-20 cursor-pointer
                            ${ error ? 'border-(--text-error)!' : 'border-(--border-secondary)! group-hover:border-(--color-primary)!' }` }
                        tabIndex={ -1 }>
                        { passwordVisible ? <EyeOff size={ 18 }/> : <Eye size={ 18 }/> }
                    </button>
                ) }
            </div>
            { error &&
                <p className="text-(--text-error) text-xs ml-1" dangerouslySetInnerHTML={ { __html: error } }></p> }
        </div>
    );
};
export default Input
