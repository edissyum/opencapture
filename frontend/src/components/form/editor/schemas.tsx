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

import { type TFunction } from "i18next";

export const getColorOptions = (t: TFunction) => ([
    { name: t('COLORS.blue'), value: "#426CF5" },
    { name: t('COLORS.ligtblue'), value: "#1CC7BE" },
    { name: t('COLORS.lightgreen'), value: "#1FAA60" },
    { name: t('COLORS.green'), value: "#64C800" },
    { name: t('COLORS.yellow'), value: "#B3A613" },
    { name: t('COLORS.orange'), value: "#E66910" },
    { name: t('COLORS.red'), value: "#CD0D0D" },
    { name: t('COLORS.brown'), value: "#974600" },
    { name: t('COLORS.pink'), value: "#F469F6" },
    { name: t('COLORS.fuschia'), value: "#E600E6" },
    { name: t('COLORS.indigo'), value: "#4C00FF" },
    { name: t('COLORS.purple'), value: "#57076B" },
    { name: t('COLORS.darkblue'), value: "#123196" },
    { name: t('COLORS.teal'), value: "#178984" },
    { name: t('COLORS.green'), value: "#11603D" },
    { name: t('COLORS.black'), value: "#000000" },
    { name: t('COLORS.grey'), value: "#6E6E6E" }
]);

export const getTypeLabels = (t: TFunction) => ({
    date: t('FORMATS.date'),
    text: t('FORMATS.text'),
    email: t('FORMATS.email'),
    phone: t('FORMATS.phone'),
    select: t('FORMATS.select'),
    number: t('FORMATS.number')
});

export const getFormatLabels = (t: TFunction) => ([
    { value: 'date', label: t('FORMATS.date') },
    { value: 'number_float', label: t('FORMATS.number_float') },
    { value: 'number_int', label: t('FORMATS.number_int') },
    { value: 'char', label: t('FORMATS.char') },
    { value: 'select', label: t('FORMATS.select') },
    { value: 'alphanum', label: t('FORMATS.alphanum') },
    { value: 'alphanum_extended', label: t('FORMATS.alphanum_extended') },
    { value: 'alphanum_extended_with_accent', label: t('FORMATS.alphanum_extended_with_accent') },
    { value: 'email', label: t('FORMATS.email') }
]);