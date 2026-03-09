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

import MainLayout from "./layout/MainLayout";
import SettingsLayout from "./layout/SettingsLayout";

import { protectedLoader } from "./components/auth/auth";
import { FormsList } from "./components/settings/forms/list";
import { OutputsList } from "./components/settings/outputs/list";
import LoginRequiredError from "./components/errors/LoginRequired";
import { WorkflowsList } from "./components/settings/workflows/list";
import { FormEditor } from "./components/settings/forms/editor/Editor";
import { CustomFieldsList } from "./components/settings/custom-fields/list";
import { CustomFieldsEditor } from "./components/settings/custom-fields/editor";

import { getCustomFromUrl } from "./services/custom/getCustom";

import { Login } from "./pages/login";
import { HomePage } from "./pages/home";
import { AboutPage } from "./pages/about";
import { UploadPage } from "./pages/upload";
import { HistoryList } from "./pages/history";
import { Onboarding } from "./pages/onboarding";
import { SettingsIndex } from "./pages/settings";
import { SuppliersList } from "./pages/suppliers/list";
import { CustomersList } from "./pages/customers/list";
import { MonitoringList } from "./pages/monitoring/list";
import { StatisticsPage } from "./pages/statistics/list";
import { SupplierEditor } from "./pages/suppliers/editor";
import { CustomerEditor } from "./pages/customers/editor";
import { SplitterViewerPage } from "./pages/splitter/viewer";
import { VerifierViewerPage } from "./pages/verifier/viewer";
import { SettingsGeneralIndex } from "./pages/settings/general";
import { SettingsVerifierIndex } from "./pages/settings/verifier";
import { SettingsSplitterIndex } from "./pages/settings/splitter";
import { SettingsGeneralSMTP } from "./pages/settings/general/smtp";
import { SettingsGeneralRegex } from "./pages/settings/general/regex";
import { SettingsGeneralRoles } from "./pages/settings/general/roles/list";
import { SettingsGeneralUsers } from "./pages/settings/general/users/list";
import { SettingsGeneralSecurity } from "./pages/settings/general/security";
import { SettingsGeneralAdvanced } from "./pages/settings/general/advanced";
import { SettingsGeneralDocservers } from "./pages/settings/general/docservers";
import { SettingsGeneralMailcollect } from "./pages/settings/general/mailcollect";
import { SettingsGeneralRoleEditor } from "./pages/settings/general/roles/editor";
import { SettingsGeneralUserEditor } from "./pages/settings/general/users/editor";
import { SettingsVerifierAiLLMList } from "./pages/settings/verifier/ai-llm/list";
import { SettingsVerifierFormsCreate } from "./pages/settings/verifier/forms/create";
import { SettingsSplitterFormsCreate } from "./pages/settings/splitter/forms/create";
import { SettingsGeneralCustomization } from "./pages/settings/general/customization";
import { SettingsVerifierAiLLMEditor } from "./pages/settings/verifier/ai-llm/editor";
import { SettingsVerifierPositionsMasksList } from "./pages/settings/verifier/positions-masks/list";
import { AiDoctypesList } from "./components/settings/ai-doctypes/list.tsx";
import { AiDoctypesEditor } from "./components/settings/ai-doctypes/editor.tsx";

export const router = createBrowserRouter(
    [
        {
            path: "/login",
            element: <Login/>
        },
        {
            path: "onboarding",
            element: <Onboarding/>,
            loader: protectedLoader,
            errorElement: <LoginRequiredError/>
        },
        {
            path: "/",
            element: <MainLayout/>,
            children: [
                {
                    path: "home",
                    element: <HomePage/>,
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>
                },
                {
                    path: "about",
                    element: <AboutPage/>,
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>
                },
                {
                    path: "statistics",
                    element: <StatisticsPage/>,
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
                            path: 'edit/:supplierId',
                            loader: protectedLoader,
                            element: <SupplierEditor/>,
                            errorElement: <LoginRequiredError/>,
                        },
                        {
                            path: 'create',
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
                            path: 'edit/:customerId',
                            loader: protectedLoader,
                            element: <CustomerEditor/>,
                            errorElement: <LoginRequiredError/>,
                        },
                        {
                            path: 'create',
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
                    path: "splitter/viewer/:batchId",
                    element: <SplitterViewerPage/>,
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>
                },
                {
                    path: "upload",
                    element: <UploadPage/>,
                    loader: protectedLoader,
                    errorElement: <LoginRequiredError/>
                }
            ]
        },
        {
            path: "/settings",
            element: <SettingsLayout/>,
            handle: { breadcrumb: 'SETTINGS.title' },
            children: [
                {
                    index: true,
                    loader: protectedLoader,
                    element: <SettingsIndex/>,
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
                            element: <SettingsGeneralIndex/>,
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
                                    path: 'edit/:userId',
                                    loader: protectedLoader,
                                    element: <SettingsGeneralUserEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_user' }
                                },
                                {
                                    path: 'create',
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
                                    path: 'edit/:roleId',
                                    loader: protectedLoader,
                                    element: <SettingsGeneralRoleEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_role' }
                                },
                                {
                                    path: 'create',
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
                                    path: 'edit/:formId',
                                    loader: protectedLoader,
                                    element: <FormEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_form' }
                                },
                                {
                                    path: 'create',
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
                                    path: 'edit/:customFieldId',
                                    loader: protectedLoader,
                                    element: <CustomFieldsEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_custom_fields' }
                                },
                                {
                                    path: 'create',
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
                                    element: <WorkflowsList module="verifier"/>,
                                    errorElement: <LoginRequiredError/>
                                }
                            ]
                        },
                        {
                            path: "outputs",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'SETTINGS.outputs' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <OutputsList module="verifier"/>,
                                    errorElement: <LoginRequiredError/>
                                }
                            ]
                        },
                        {
                            path: "ai-llm",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'SETTINGS.ai_llm' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <SettingsVerifierAiLLMList/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:aiLLMId',
                                    loader: protectedLoader,
                                    element: <SettingsVerifierAiLLMEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_ai_llm' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader,
                                    element: <SettingsVerifierAiLLMEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_ai_llm' }
                                }
                            ]
                        },
                        {
                            path: "positions-masks",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'SETTINGS.positions-masks' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <SettingsVerifierPositionsMasksList/>,
                                    errorElement: <LoginRequiredError/>
                                },
                            ]
                        },
                        {
                            path: "ai-doctypes",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'SETTINGS.ai_doctypes' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <AiDoctypesList module="verifier"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:aiDoctypeId',
                                    loader: protectedLoader,
                                    element: <AiDoctypesEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_ai_doctype' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader,
                                    element: <AiDoctypesEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_ai_doctype' }
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
                                    path: 'edit/:formId',
                                    loader: protectedLoader,
                                    element: <FormEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_form' }
                                },
                                {
                                    path: 'create',
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
                                    path: 'edit/:customFieldId',
                                    loader: protectedLoader,
                                    element: <CustomFieldsEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_custom_fields' }
                                },
                                {
                                    path: 'create',
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
                                    element: <WorkflowsList module="splitter"/>,
                                    errorElement: <LoginRequiredError/>
                                }
                            ]
                        },
                        {
                            path: "outputs",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'SETTINGS.outputs' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <OutputsList module="splitter"/>,
                                    errorElement: <LoginRequiredError/>
                                }
                            ]
                        },
                        {
                            path: "ai-doctypes",
                            loader: protectedLoader,
                            handle: { breadcrumb: 'SETTINGS.ai_doctypes' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader,
                                    element: <AiDoctypesList module="splitter"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:aiDoctypeId',
                                    loader: protectedLoader,
                                    element: <AiDoctypesEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_ai_doctype' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader,
                                    element: <AiDoctypesEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_ai_doctype' }
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