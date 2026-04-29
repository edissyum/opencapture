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

import DOMPurify from "dompurify";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import React, { useEffect, useRef, useState } from "react";
import { CircleQuestionMark, Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: any;
    hint?: string;
    label?: string;
    height?: string;
    bgColor?: string;
    textColor?: string;
    textWeight?: string;
    labelFusion?: boolean;
    noMarginBottom?: boolean;
    iconPosition?: "left" | "right";
}

const Input: React.FC<InputProps> = ({
    id,
    hint,
    label,
    error,
    bgColor,
    required,
    disabled,
    textColor,
    textWeight,
    type = "text",
    height = "h-12",
    className = "",
    labelFusion = false,
    noMarginBottom = false,
    ...props
}) => {
    const [passwordVisible, setPasswordVisible] = React.useState(false);

    const isPasswordField = type === "password";

    const inputType = isPasswordField && passwordVisible ? "text" : type;

    const hasValue = props.value !== undefined && props.value !== null && props.value !== '';

    const value = props.value ?? "";

    const [textWidth, setTextWidth] = useState(0);
    const textRef = useRef<HTMLSpanElement>(null);
    const [inputWidth, setInputWidth] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const bgWidth = Math.min(textWidth + 10, inputWidth + 10);

    useEffect(() => {
        if (textRef.current) {
            setTextWidth(textRef.current.offsetWidth);
        }
    }, [value]);

    useEffect(() => {
        const update = () => {
            if (inputRef.current) {
                setInputWidth(inputRef.current.clientWidth);
            }
        };

        update();
        window.addEventListener("resize", update);

        return () => window.removeEventListener("resize", update);
    }, []);

    return (
        <div className={ `flex flex-col rounded-md ${ className }` }>
            <div className={ `group group-focus-within:border-(--border-primary) relative flex justify-items-stretch 
                            ${ error || noMarginBottom ? '' : 'mb-4' }
                            ${ disabled ? 'cursor-not-allowed' : '' }` }>
                <FloatLabel className='w-full'>
                    { bgColor && hasValue && (
                        <>
                            <div
                                className={ `h-6 left-3 ${ bgColor } absolute pointer-events-none w-fit rounded-sm` }
                                style={ {
                                    top: "1.55rem",
                                    transform: "translate(-4px, -50%)",
                                    width: `${ bgWidth }px`,
                                    transition: "width 0.1s",
                                } }
                            />
                            <span ref={ textRef } className="invisible absolute pointer-events-none whitespace-pre
                                                             font-semibold text-normal">
                                { value }
                            </span>
                        </>
                    ) }

                    { /*@ts-ignore*/ }
                    <InputText
                        id={ id }
                        ref={ inputRef }
                        className={ `w-full! px-3! py-2! border-[1.5px]! rounded-md! focus:outline-none! 
                            hover:border-(--border-primary)! transition-colors 
                            ${ props.placeholder || hasValue ? "p-inputwrapper-filled" : "" } 
                            ${ isPasswordField ? 'border-r-0! rounded-r-none!' : '' } 
                            ${ error ? 'border-(--text-error)!' : 'border-(--border-secondary)!' } 
                            ${ height } disabled:bg-(--bg-secondary) disabled:cursor-not-allowed!
                            ${ disabled ? '' : 'group-hover:border-(--border-primary)!' } focus:border-(--border-primary)!`
                        }
                        style={ {
                            fontWeight: `${ textWeight ? textWeight : '400' }`,
                            color: `${ textColor ? `var(--${ textColor })` : 'var(--text-primary)' }`
                        } }
                        type={ inputType }
                        disabled={ disabled }
                        required={ required }
                        aria-required={ required }
                        { ...props }
                    />
                    { label && (
                        <label htmlFor={ id }
                               className={ `select-none ${ labelFusion ? 'group-focus-within:border group-focus-within:border-b-0 ' +
                                   'border-(--border-secondary) group-focus-within:rounded-md ' +
                                   'group-focus-within:rounded-b-none group-focus-within:-top-[0.3rem]! ' +
                                   'group-focus-within:p-0.5 group-focus-within:border-(--border-primary) ' : '' }
                                   ${ labelFusion && disabled ? '' : 'group-hover:border-(--border-primary)' }
                                   ${ hasValue && labelFusion ? 'labelFusion border border-b-0 rounded-md rounded-b-none -top-[0.3rem]! p-0.5 border-(--border-primary)' : '' }` }>
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
                        className={ `password transition-colors px-2 rounded-lg! rounded-l-none! bg-(--bg-primary)
                                     group-focus-within:border-(--border-primary)! border-l-0! border! 
                                     text-(--text-secondary)! hover:text-(--color-primary) z-20 cursor-pointer
                                     ${ error ? 'border-(--text-error)!' : 'border-(--border-secondary)! ' +
                            'group-hover:border-(--border-primary)!'
                        }` }>
                        { passwordVisible ? <EyeOff size={ 18 }/> : <Eye size={ 18 }/> }
                    </button>
                ) }
            </div>
            { error && (
                <p className="text-(--text-error) text-xs ml-1"
                   dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(error) } }/>
            ) }
        </div>
    );
};
export default Input
