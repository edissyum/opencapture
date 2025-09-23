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
import { t } from "i18next";
import { StrictMode } from 'react'
import { Tooltip } from "react-tooltip";
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";

import './index.css'
import { router } from "./routes.tsx";

import { showToast, ToastProvider } from "./components/ToastProvider";

import { applyTheme } from "./services/theme.tsx";
import { BACKEND_URL } from "./services/config.tsx";
import { fetchCurrentLang, initI18n } from "./services/i18n";
import { getCustomFromUrl } from "./services/custom/getCustom";
import { CustomProvider } from "./services/custom/customContext";

async function bootstrap() {
    applyTheme();

    let custom = getCustomFromUrl();
    let currentLang = localStorage.getItem("selectedLang");
    const api = axios.create({baseURL: `${BACKEND_URL}/${custom}/ws/`});

    if (custom) {
        try {
            await api.get("/config/customExists");
        } catch {
            custom = null;
        }
    }

    if (custom && !currentLang) {
        currentLang = await fetchCurrentLang(api);
    }

    await initI18n(currentLang || "fra");

    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <CustomProvider custom={custom}>
                <ToastProvider />
                <Tooltip id="tooltip" />
                <RouterProvider router={router} />
            </CustomProvider>
        </StrictMode>
    );

    if (!custom) {
        setTimeout(() => {
            showToast(t("ERROR.custom_not_provided"), "error");
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
            sessionStorage.clear();
        }, 0);
    }
}

bootstrap().then();