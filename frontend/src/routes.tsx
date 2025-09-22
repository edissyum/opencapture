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

import { protectedLoader } from "./components/auth/auth.tsx";
import LoginRequiredError from "./components/errors/LoginRequired.tsx";

import MainLayout from "./layout/MainLayout.tsx";

import { Login } from "./pages/login.tsx";
import { HomePage } from "./pages/home.tsx";
import { UploadPage } from "./pages/upload.tsx";
import { Onboarding } from "./pages/onboarding/main.tsx";

import { getCustomFromUrl } from "./services/custom/getCustom.tsx";

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