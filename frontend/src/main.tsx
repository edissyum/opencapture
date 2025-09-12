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

import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Login } from "./pages/login.tsx";
import { Dashboard } from "./pages/dashboard.tsx";

import { protectedLoader } from "./components/auth/auth.tsx";
import { fetchCurrentLang, initI18n } from "./services/i18n.tsx";
import { getCustomFromUrl } from "./services/custom/getCustom.tsx";
import { CustomProvider } from "./services/custom/customContext.tsx";
import { ToastProvider } from "./components/ToastProvider.tsx";

const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login/>,
    },
    {
        path: "/dashboard",
        element: <Dashboard/>,
        loader: protectedLoader,
    }],
    { basename: getCustomFromUrl() || undefined }
);

async function bootstrap() {
    const custom = getCustomFromUrl();
    const currentLang = await fetchCurrentLang();

    if (currentLang) {
        await initI18n(currentLang);
    }

    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <CustomProvider custom={custom}>
                <ToastProvider />
                <RouterProvider router={router}/>
            </CustomProvider>
        </StrictMode>
    );
}

bootstrap().then();
