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

import { getCustomFromUrl } from "./services/custom/getCustom";

import MainLayout from "./layout/MainLayout";
import SettingsLayout from "./layout/SettingsLayout";

import { Login } from "./pages/login";
import { HomePage } from "./pages/home";
import { UploadPage } from "./pages/upload";
import { Onboarding } from "./pages/onboarding";
import { SettingsIndex } from "./pages/settings";
import { SettingsGeneralIndex } from "./pages/settings/general";
import { SettingsVerifierIndex } from "./pages/settings/verifier";
import { SettingsSplitterIndex } from "./pages/settings/splitter";
import { SettingsGeneralSMTP } from "./pages/settings/general/smtp";
import { SettingsGeneralRoles } from "./pages/settings/general/roles";
import { SettingsGeneralUsers } from "./pages/settings/general/users";
import { SettingsGeneralAdvanced } from "./pages/settings/general/advanced";
import { SettingsGeneralMailcollect } from "./pages/settings/general/mailcollect";
import { SettingsGeneralCustomization } from "./pages/settings/general/customization";
import { SettingsVerifierFormsList } from "./pages/settings/verifier/forms/list";
import { SettingsVerifierFormsEditor } from "./pages/settings/verifier/forms/editor";

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
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'SETTINGS.general' },
                    children: [
                        {
                            index: true,
                            loader: protectedLoader,
                            element: <SettingsGeneralIndex />,
                            errorElement: <LoginRequiredError/>,
                        },
                        {
                            path: "customization",
                            loader: protectedLoader,
                            element: <SettingsGeneralCustomization/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.customization' }
                        },
                        {
                            path: "smtp",
                            loader: protectedLoader,
                            element: <SettingsGeneralSMTP/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.smtp' }
                        },
                        {
                            path: "mailcollect",
                            loader: protectedLoader,
                            element: <SettingsGeneralMailcollect/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.mailcollect' }
                        },
                        {
                            path: "advanced",
                            loader: protectedLoader,
                            element: <SettingsGeneralAdvanced/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.advanced' }
                        },
                        {
                            path: "users",
                            loader: protectedLoader,
                            element: <SettingsGeneralUsers/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.users' }
                        },
                        {
                            path: "roles",
                            loader: protectedLoader,
                            element: <SettingsGeneralRoles/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.roles' }
                        }
                    ]
                },
                {
                    path: "verifier",
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'SETTINGS.verifier' },
                    children: [
                        {
                            index: true,
                            loader: protectedLoader,
                            element: <SettingsVerifierIndex/>,
                            errorElement: <LoginRequiredError/>
                        },
                        {
                            path: "forms",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'SETTINGS.forms' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <SettingsVerifierFormsList/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path:'edit/:formId',
                                    loader: protectedLoader,
                                    element: <SettingsVerifierFormsEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_form' }
                                }
                            ]
                        }
                    ]
                },
                {
                    path: "splitter",
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'SETTINGS.splitter' },
                    children: [
                        {
                            index: true,
                            loader: protectedLoader,
                            element: <SettingsSplitterIndex/>,
                            errorElement: <LoginRequiredError/>
                        },
                    ]
                }
            ]
        }
    ],
    {
        basename: getCustomFromUrl() || undefined
    }
);