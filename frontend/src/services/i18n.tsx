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

import axios from "axios";
import { BACKEND_URL } from "./config.tsx";
import { getCustomFromUrl } from "./custom/getCustom.tsx";

const custom = getCustomFromUrl() || "";
const api = axios.create({
    baseURL: `${BACKEND_URL}/${custom}/ws/`,
    timeout: 5000,
});

export async function fetchCurrentLang(): Promise<string | null> {
    try {
        const res = await api.get("/i18n/getCurrentLang");
        return res.data?.lang || null;
    } catch (err) {
        console.error("Erreur lors de la récupération de la langue :", err);
        return null;
    }
}
