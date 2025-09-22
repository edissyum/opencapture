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
import { Tooltip } from "react-tooltip";
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { Login } from "./pages/login";
import { HomePage } from "./pages/home";
import { UploadPage } from "./pages/upload";
import { Onboarding } from "./pages/onboarding/main.tsx";

import MainLayout from "./layout/MainLayout.tsx";

import { protectedLoader } from "./components/auth/auth";
import { ToastProvider } from "./components/ToastProvider";
import LoginRequiredError from "./components/errors/LoginRequired.tsx";

import { fetchCurrentLang, initI18n } from "./services/i18n";
import { getCustomFromUrl } from "./services/custom/getCustom";
import { CustomProvider } from "./services/custom/customContext";

const router = createBrowserRouter(
    [
        {
            path: "/login",
            element: <Login/>
        },
        {
            path: "onboarding",
            element: <Onboarding />,
            loader: protectedLoader,
            errorElement: <LoginRequiredError />
        },
        {
            path: "/",
            element: <MainLayout />,
            children: [
                {
                    path: "home",
                    element: <HomePage />,
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError />
                },
                {
                    path: "upload",
                    element: <UploadPage />,
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError />
                }
            ]
        }
    ],
    {
        basename: getCustomFromUrl() || undefined
    }
);

async function bootstrap() {
    const custom = getCustomFromUrl();

    let currentLang = localStorage.getItem('selectedLang');
    if (!currentLang) {
        currentLang = await fetchCurrentLang();
    }

    if (currentLang) {
        await initI18n(currentLang);
    }

    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <CustomProvider custom={custom}>
                <ToastProvider/>
                <Tooltip id="tooltip" />
                <RouterProvider router={router}/>
            </CustomProvider>
        </StrictMode>
    );
}

bootstrap().then();
