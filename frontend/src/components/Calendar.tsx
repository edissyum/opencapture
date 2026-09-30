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

import "dayjs/locale/fr";
import "dayjs/locale/es";
import dayjs from "dayjs";
import DOMPurify from "dompurify";
import { DateInput } from '@mantine/dates';
import React, { useEffect, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { FloatingLabel, useFloatingLabel } from "./FloatingLabel";

interface ISOCalendarProps {
    id: string;
    error?: any;
    label: string;
    value: string;
    required: boolean;
    disabled?: boolean;
    onClick?: () => void;
    onChange?: (isoDate: string | null) => void;
}

const ISOCalendar: React.FC<ISOCalendarProps> = ({
    id,
    label,
    value,
    error,
    onClick,
    required,
    onChange,
    disabled = false
}) => {
    const [localeLang, setLocaleLang] = useState<string | null>(null);

    // ISO ↔ Date conversions
    const isoToDate = (iso?: string): Date | null => {
        if (!iso) return null;
        const [year, month, day] = iso.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const handleChange = (date: string | null) => {
        onChange?.(date);
    };

    const hasValue = !!value;

    const { floating, onFocus, onBlur } = useFloatingLabel(hasValue);

    useEffect(() => {
        const lang = localStorage.getItem("backendLang") || "fr";
        const finalLang =
            lang.startsWith("fr") ? "fr" :
                lang.startsWith("es") ? "es" : "en";

        dayjs.locale(finalLang);
        setLocaleLang(finalLang);
    }, []);

    const valueFormat = localeLang === "en" ? "MM/DD/YYYY" : "DD/MM/YYYY";

    if (!localeLang) return null;

    return (
        <div className="flex flex-col">
            <div title={ label } className={ `relative w-full ${ disabled ? 'cursor-not-allowed' : '' }` }>
                <DateInput
                    id={ id }
                    className='w-full'
                    required={ required }
                    disabled={ disabled }
                    onClick={ onClick }
                    onChange={ handleChange }
                    onFocus={ onFocus }
                    onBlur={ onBlur }
                    value={ isoToDate(value) }
                    locale={ localeLang }
                    valueFormat={ valueFormat }
                    placeholder={ label && !floating ? undefined : label }
                    rightSection={ <CalendarIcon size={ 18 }/> }
                />

                { label && (
                    <FloatingLabel htmlFor={ id } floating={ floating } required={ required }>
                        { label }
                    </FloatingLabel>
                ) }
            </div>
            { error && <p className="text-(--text-error) text-sm "
                          dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(error) } }></p> }
        </div>
    );
};

export default ISOCalendar;
