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

import moment from "moment";
import DOMPurify from "dompurify";
import { addLocale } from "primereact/api";
import { Calendar } from "primereact/calendar";
import { FloatLabel } from "primereact/floatlabel";
import React, { useEffect, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

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

    const dateToIso = (date?: Date | null): string | null => {
        if (!date) return null;
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${ y }-${ m }-${ d }`;
    };

    const handleChange: any = (e: { value: Date | Date[] | null }) => {
        const date = e.value as Date | null;
        onChange?.(dateToIso(date));
    };

    useEffect(() => {
        addLocale("fr", {
            firstDayOfWeek: 1,
            dayNames: [
                "dimanche", "lundi", "mardi", "mercredi",
                "jeudi", "vendredi", "samedi"
            ],
            dayNamesShort: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
            dayNamesMin: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
            monthNames: [
                "janvier", "février", "mars", "avril", "mai", "juin",
                "juillet", "août", "septembre", "octobre", "novembre", "décembre"
            ],
            monthNamesShort: [
                "janv", "févr", "mars", "avr", "mai", "juin",
                "juil", "août", "sept", "oct", "nov", "déc"
            ],
            today: "Aujourd'hui",
            clear: "Effacer",
            chooseDate: "Choisir une date",
            chooseMonth: "Choisir un mois",
            chooseYear: "Choisir une année",
            prevMonth: "Mois précédent",
            nextMonth: "Mois suivant",
            prevYear: "Année précédente",
            nextYear: "Année suivante",
            prevDecade: "Décennie précédente",
            nextDecade: "Décennie suivante"
        });

        addLocale("es", {
            firstDayOfWeek: 1,
            dayNames: [
                "domingo", "lunes", "martes", "miércoles",
                "jueves", "viernes", "sábado"
            ],
            dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
            dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
            monthNames: [
                "enero", "febrero", "marzo", "abril", "mayo", "junio",
                "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
            ],
            monthNamesShort: [
                "ene", "feb", "mar", "abr", "may", "jun",
                "jul", "ago", "sep", "oct", "nov", "dic"
            ],
            today: "Hoy",
            clear: "Borrar",
            chooseDate: "Elegir fecha",
            chooseMonth: "Elegir mes",
            chooseYear: "Elegir año",
            prevMonth: "Mes anterior",
            nextMonth: "Mes siguiente",
            prevYear: "Año anterior",
            nextYear: "Año siguiente",
            prevDecade: "Década anterior",
            nextDecade: "Década siguiente"
        });

        addLocale("en", {
            firstDayOfWeek: 1,
            dayNames: [
                "Sunday", "Monday", "Tuesday", "Wednesday",
                "Thursday", "Friday", "Saturday"
            ],
            dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            monthNames: [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ],
            monthNamesShort: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ],
            today: "Today",
            clear: "Clear",
            chooseDate: "Choose date",
            chooseMonth: "Choose month",
            chooseYear: "Choose year",
            prevMonth: "Previous month",
            nextMonth: "Next month",
            prevYear: "Previous year",
            nextYear: "Next year",
            prevDecade: "Previous decade",
            nextDecade: "Next decade"
        });

        const lang = localStorage.getItem("backendLang") || "fr";
        const finalLang =
            lang.startsWith("fr") ? "fr" :
                lang.startsWith("es") ? "es" : "en";

        moment.locale(finalLang);
        setLocaleLang(finalLang);
    }, []);

    if (!localeLang) return null;

    return (
        <div className="flex flex-col">
            <div className={ `${ error ? '' : 'mb-5' } ${ disabled ? 'cursor-not-allowed' : '' }` }>
                <FloatLabel className="w-full calendar">
                    <Calendar
                        showIcon
                        id={ id }
                        className={ `w-full ${disabled ? 'pointer-events-none' : '' }` }
                        locale={ localeLang }
                        disabled={ disabled }
                        // @ts-ignore
                        onClick={ onClick }
                        onChange={ handleChange }
                        value={ isoToDate(value) }
                        icon={ <CalendarIcon size={ 18 }/> }
                        dateFormat={
                            localeLang === "fr"
                                ? "dd/mm/yy"
                                : localeLang === "es"
                                    ? "dd/mm/yy"
                                    : "mm/dd/yy"
                        }
                    />
                    { label && (
                        <label htmlFor={ id }>
                            { label }
                            { required && <span className="text-(--text-error) ml-1">*</span> }
                        </label>
                    ) }
                </FloatLabel>
            </div>
            { error && <p className="text-(--text-error) text-sm "
                          dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize(error) } }></p> }
        </div>
    );
};

export default ISOCalendar;
