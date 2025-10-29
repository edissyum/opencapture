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

import React, { useEffect, useState } from "react";
import { CircleQuestionMark, Eye, EyeOff } from "lucide-react";
import { FloatLabel } from "primereact/floatlabel";
import { Calendar } from "primereact/calendar";
import { addLocale } from "primereact/api";
import moment from "moment";

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
    height = "h-12",
    type = "text",
    className = "",
    onChange,
    onBlur,
    no_margin_bottom = false,
    ...props
}) => {
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    const [localeLang, setLocaleLang] = useState("fr");

    const isPasswordField = type === "password";

    const inputType = isPasswordField && passwordVisible ? "text" : type;

    useEffect(() => {
        addLocale("fr", {
            firstDayOfWeek: 1,
            dayNames: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
            dayNamesShort: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
            monthNames: [
                "janvier", "février", "mars", "avril", "mai", "juin",
                "juillet", "août", "septembre", "octobre", "novembre", "décembre"
            ],
            monthNamesShort: ["jan", "fév", "mar", "avr", "mai", "jun", "jul", "aoû", "sep", "oct", "nov", "déc"],
            today: "Aujourd'hui",
            clear: "Effacer"
        });

        addLocale("es", {
            firstDayOfWeek: 1,
            dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
            dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
            monthNames: [
                "enero", "febrero", "marzo", "abril", "mayo", "junio",
                "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
            ],
            monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
            today: "Hoy",
            clear: "Borrar"
        });
    }, []);

    useEffect(() => {
        const lang = localStorage.getItem("selectedLang") || "en";
        setLocaleLang(lang.startsWith("fr") ? "fr" : lang.startsWith("es") ? "es" : "en");
        moment.locale(lang);
    }, []);

    return (
        <div className={ `flex flex-col rounded-md ${ className }` }>
            <div className={ `relative flex justify-items-stretch ${ error || no_margin_bottom ? '' : 'mb-6' }` }>
                <FloatLabel className='w-full'>
                    { type === 'date' ? (
                        /* @ts-ignore */
                        <Calendar
                            /* @ts-ignore */
                            onChange={ onChange }
                            onBlur={ onBlur }
                            locale={ localeLang }
                            className={ `w-full rounded-md focus:outline-none focus:border-(--color-primary)
                                text-(--text-primary) disabled:bg-(--bg-secondary) disabled:cursor-not-allowed ${ height }` }
                            id={ id }
                            dateFormat={
                                localeLang === "fr"
                                    ? "dd/mm/yy"
                                    : localeLang === "es"
                                        ? "dd/mm/yy"
                                        : "mm/dd/yy"
                            }
                            placeholder={
                                localeLang === "fr" || localeLang === "es"
                                    ? "JJ/MM/AAAA"
                                    : "MM/DD/YYYY"
                            }
                            showIcon
                            { ...props }
                        />
                    ) : (
                        <input
                            id={ id }
                            className={ `w-full px-3 py-2 border-[1.5px] rounded-md focus:outline-none focus:border-(--color-primary)
                                ${ isPasswordField ? 'border-r-0 rounded-tr-none rounded-br-none' : '' } text-(--text-primary)
                                border-(--border-secondary) disabled:bg-(--bg-secondary) disabled:cursor-not-allowed ${ height }
                                ${ props.value ? "p-filled" : "" }` }
                            placeholder=""
                            type={ inputType }
                            disabled={ disabled }
                            required={ required }
                            onChange={ onChange }
                            aria-required={ required }
                            { ...props }
                        />
                    ) }
                    { label && (
                        <label htmlFor={ id }>
                            { label }
                            { required && <span className="text-red-500 ml-1">*</span> }
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
                        className="peer-focus:border-(--color-primary) px-2 rounded-lg rounded-tl-none
                                   rounded-bl-none border-l-0 border border-(--border-secondary) text-(--text-secondary)
                                   hover:text-(--color-primary) z-20 cursor-pointer"
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
export default Input
