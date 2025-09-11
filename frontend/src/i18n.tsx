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

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationFR from "./assets/i18n/fra.json";
import translationEN from "./assets/i18n/eng.json";
import translationSPA from "./assets/i18n/spa.json";

export function initI18n(initialLang: string) {
    return i18n.use(initReactI18next).init({
        resources: {
            fra: {translation: translationFR},
            eng: {translation: translationEN},
            spa: {translation: translationSPA}
        },
        lng: initialLang,
        fallbackLng: "fra",
    });
}
