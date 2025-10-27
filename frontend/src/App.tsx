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
import { Tooltip } from "react-tooltip";
import { RouterProvider } from "react-router-dom";
import { StrictMode, useEffect, useState } from "react";

import { en } from "zod/locales"
import { fr } from "zod/locales";
import { es } from "zod/locales";

import { ConfirmDialog } from "primereact/confirmdialog";

import { router } from "./routes";

import { applyTheme } from "./services/theme";
import { BACKEND_URL } from "./services/config";
import { showToast } from "./components/ToastProvider";
import { fetchCurrentLang, initI18n } from "./services/i18n";
import { getCustomFromUrl } from "./services/custom/getCustom";
import { CustomProvider } from "./services/custom/customContext";
import { z } from "zod";

export function App() {
    const [appKey, setAppKey] = useState(0);
    const [ready, setReady] = useState(false);
    const [custom, setCustom] = useState<string | null>(null);

    useEffect(() => {
        const listener = () => {
            setAppKey((k) => k + 1)
        };
        window.addEventListener("forceAppReload", listener);
        return () => window.removeEventListener("forceAppReload", listener);
    }, []);

    useEffect(() => {
        async function bootstrap() {
            applyTheme();

            let _custom = getCustomFromUrl();
            let currentLang = localStorage.getItem("selectedLang");
            const api = axios.create({ baseURL: `${ BACKEND_URL }/${ _custom }/ws/` });

            if (_custom) {
                try {
                    await api.get("/config/customExists");
                } catch (err) {
                    if (axios.isAxiosError(err) && (err.code === "ECONNABORTED" || err.code === "ERR_NETWORK")) {
                        console.error("Backend not reachable : ", err);
                    } else {
                        _custom = null;
                    }
                }
            }

            if (_custom && !currentLang) {
                currentLang = await fetchCurrentLang(api);
            }

            await initI18n(currentLang || "fra");
            if (currentLang === "fra") {
                z.config(fr());
            } else if (currentLang === "eng") {
                z.config(en());
            } else if (currentLang === "esp") {
                z.config(es());
            }

            setCustom(_custom);
            setReady(true);

            if (!_custom) {
                showToast(t("ERROR.custom_not_provided"), "error");
                if (!window.location.pathname.includes("/login")) {
                    window.location.href = "/login";
                }
                sessionStorage.clear();
            }
        }

        bootstrap().then();
    }, []);

    if (!ready) return null;

    return (
        <StrictMode>
            <CustomProvider custom={ custom }>
                <ConfirmDialog />
                <Tooltip id="tooltip" className="z-50"/>
                <RouterProvider key={ appKey } router={ router }/>
            </CustomProvider>
        </StrictMode>
    );
}
