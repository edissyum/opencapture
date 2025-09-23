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

import { createBrowserRouter } from "react-router-dom";

import { protectedLoader } from "./components/auth/auth";
import LoginRequiredError from "./components/errors/LoginRequired";

import MainLayout from "./layout/MainLayout";
import SettingsLayout from "./layout/SettingsLayout";

import { Login } from "./pages/login";
import { HomePage } from "./pages/home";
import { UploadPage } from "./pages/upload";
import { Onboarding } from "./pages/onboarding";
import { SettingsIndex } from "./pages/settings";

import { getCustomFromUrl } from "./services/custom/getCustom";
import { SettingsGeneralIndex } from "./pages/settings/general";
import { SettingsVerifierIndex } from "./pages/settings/verifier";
import { SettingsSplitterIndex } from "./pages/settings/splitter";

export const router = createBrowserRouter(
    [
        {
            path: "/login",
            element: <Login/>
        },
        {
            path: "onboarding",
            element: <Onboarding />,
            loader: protectedLoader,
            errorElement: <LoginRequiredError/>
        },
        {
            path: "/",
            element: <MainLayout />,
            children: [
                {
                    path: "home",
                    element: <HomePage />,
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>
                },
                {
                    path: "upload",
                    element: <UploadPage />,
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>
                }
            ]
        },
        {
            path: "/settings",
            element: <SettingsLayout />,
            handle: { breadcrumb: 'SETTINGS.title' },
            children: [
                {
                    index: true,
                    loader: protectedLoader,
                    element: <SettingsIndex />,
                    errorElement: <LoginRequiredError/>,
                },
                {
                    path: "general",
                    loader: protectedLoader,
                    element: <SettingsGeneralIndex/>,
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'SETTINGS.general' }
                },
                {
                    path: "verifier",
                    loader: protectedLoader,
                    element: <SettingsVerifierIndex/>,
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'SETTINGS.verifier' }
                },
                {
                    path: "splitter",
                    loader: protectedLoader,
                    element: <SettingsSplitterIndex/>,
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'SETTINGS.splitter' }
                }
            ]
        }
    ],
    {
        basename: getCustomFromUrl() || undefined
    }
);