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
import { SuppliersList } from "./pages/suppliers/list";
import { CustomersList } from "./pages/customers/list";
import { SupplierEditor } from "./pages/suppliers/editor";
import { CustomerEditor } from "./pages/customers/editor";
import { FormsList } from "./components/settings/forms/list";
import { VerifierViewerPage } from "./pages/verifier/viewer";
import { SettingsGeneralIndex } from "./pages/settings/general";
import { SettingsVerifierIndex } from "./pages/settings/verifier";
import { SettingsSplitterIndex } from "./pages/settings/splitter";
import { SettingsGeneralSMTP } from "./pages/settings/general/smtp";
import { WorkflowsList } from "./components/settings/workflows/list";
import { SettingsGeneralRegex } from "./pages/settings/general/regex";
import { FormEditor } from "./components/settings/forms/editor/Editor";
import { SettingsGeneralRoles } from "./pages/settings/general/roles/list";
import { SettingsGeneralUsers } from "./pages/settings/general/users/list";
import { SettingsGeneralSecurity } from "./pages/settings/general/security";
import { SettingsGeneralAdvanced } from "./pages/settings/general/advanced";
import { CustomFieldsList } from "./components/settings/custom-fields/list";
import { SettingsGeneralDocservers } from "./pages/settings/general/docservers";
import { CustomFieldsEditor } from "./components/settings/custom-fields/editor";
import { SettingsGeneralMailcollect } from "./pages/settings/general/mailcollect";
import { SettingsGeneralRoleEditor } from "./pages/settings/general/roles/editor";
import { SettingsGeneralUserEditor } from "./pages/settings/general/users/editor";
import { SettingsVerifierFormsCreate } from "./pages/settings/verifier/forms/create";
import { SettingsSplitterFormsCreate } from "./pages/settings/splitter/forms/create";
import { SettingsGeneralCustomization } from "./pages/settings/general/customization";
import { MonitoringList } from "./pages/monitoring/list";
import { HistoryList } from "./pages/history";

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
                    element: <HomePage/>,
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>
                },
                {
                    path: "monitoring",
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>,
                    children: [
                        {
                            index: true,
                            loader: protectedLoader,
                            element: <MonitoringList/>,
                            errorElement: <LoginRequiredError/>
                        }
                    ]
                },
                {
                    path: "history",
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>,
                    children: [
                        {
                            index: true,
                            loader: protectedLoader,
                            element: <HistoryList/>,
                            errorElement: <LoginRequiredError/>
                        }
                    ]
                },
                {
                    path: "suppliers",
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'ACCOUNTS.suppliers_list' },
                    children: [
                        {
                            index: true,
                            loader: protectedLoader,
                            element: <SuppliersList/>,
                            errorElement: <LoginRequiredError/>
                        },
                        {
                            path:'edit/:supplierId',
                            loader: protectedLoader,
                            element: <SupplierEditor/>,
                            errorElement: <LoginRequiredError/>,
                        },
                        {
                            path:'create',
                            loader: protectedLoader,
                            element: <SupplierEditor/>,
                            errorElement: <LoginRequiredError/>,
                        }
                    ]
                },
                {
                    path: "customers",
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'ACCOUNTS.customers_list' },
                    children: [
                        {
                            index: true,
                            loader: protectedLoader,
                            element: <CustomersList/>,
                            errorElement: <LoginRequiredError/>
                        },
                        {
                            path:'edit/:customerId',
                            loader: protectedLoader,
                            element: <CustomerEditor/>,
                            errorElement: <LoginRequiredError/>,
                        },
                        {
                            path:'create',
                            loader: protectedLoader,
                            element: <CustomerEditor/>,
                            errorElement: <LoginRequiredError/>,
                        }
                    ]
                },
                {
                    path: "verifier/viewer/:documentId",
                    element: <VerifierViewerPage/>,
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
                            path: "regex",
                            loader: protectedLoader,
                            element: <SettingsGeneralRegex/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.regex' }
                        },
                        {
                            path: "docservers",
                            loader: protectedLoader,
                            element: <SettingsGeneralDocservers/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.docservers' }
                        },
                        {
                            path: "security",
                            loader: protectedLoader,
                            element: <SettingsGeneralSecurity/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.security' }
                        },
                        {
                            path: "users",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'SETTINGS.users' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <SettingsGeneralUsers/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path:'edit/:userId',
                                    loader: protectedLoader,
                                    element: <SettingsGeneralUserEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_user' }
                                },
                                {
                                    path:'create',
                                    loader: protectedLoader,
                                    element: <SettingsGeneralUserEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'FORMS.add_user' }
                                }
                            ]
                        },
                        {
                            path: "roles",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'SETTINGS.roles' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <SettingsGeneralRoles/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path:'edit/:roleId',
                                    loader: protectedLoader,
                                    element: <SettingsGeneralRoleEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_role' }
                                },
                                {
                                    path:'create',
                                    loader: protectedLoader,
                                    element: <SettingsGeneralRoleEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'FORMS.add_role' }
                                }
                            ]
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
                                    element: <FormsList module="verifier"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path:'edit/:formId',
                                    loader: protectedLoader,
                                    element: <FormEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_form' }
                                },
                                {
                                    path:'create',
                                    loader: protectedLoader,
                                    element: <SettingsVerifierFormsCreate/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'FORMS.add_form' }
                                }
                            ]
                        },
                        {
                            path: "custom-fields",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'VERIFIER.custom_fields' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <CustomFieldsList module="verifier"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path:'edit/:customFieldId',
                                    loader: protectedLoader,
                                    element: <CustomFieldsEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_custom_fields' }
                                },
                                {
                                    path:'create',
                                    loader: protectedLoader,
                                    element: <CustomFieldsEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_custom_field' }
                                }
                            ]
                        },
                        {
                            path: "workflows",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'SETTINGS.workflows' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <WorkflowsList module="verifier"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path:'edit/:workflowId',
                                    loader: protectedLoader,
                                    element: <CustomFieldsEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_workflow' }
                                },
                                {
                                    path:'create',
                                    loader: protectedLoader,
                                    element: <CustomFieldsEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_workflow' }
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
                        {
                            path: "forms",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'SETTINGS.forms' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <FormsList module="splitter"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path:'edit/:formId',
                                    loader: protectedLoader,
                                    element: <FormEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_form' }
                                },
                                {
                                    path:'create',
                                    loader: protectedLoader,
                                    element: <SettingsSplitterFormsCreate/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'FORMS.add_form' }
                                }
                            ]
                        },
                        {
                            path: "custom-fields",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'VERIFIER.custom_fields' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <CustomFieldsList module="splitter"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path:'edit/:customFieldId',
                                    loader: protectedLoader,
                                    element: <CustomFieldsEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_custom_fields' }
                                },
                                {
                                    path:'create',
                                    loader: protectedLoader,
                                    element: <CustomFieldsEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_custom_field' }
                                }
                            ]
                        },
                        {
                            path: "workflows",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'SETTINGS.workflows' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <WorkflowsList module="splitter"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path:'edit/:workflowId',
                                    loader: protectedLoader,
                                    element: <CustomFieldsEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_workflow' }
                                },
                                {
                                    path:'create',
                                    loader: protectedLoader,
                                    element: <CustomFieldsEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_workflow' }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    {
        basename: getCustomFromUrl() || undefined
    }
);