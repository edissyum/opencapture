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
import ProfilePage from "./pages/profile";
import Onboarding from "./pages/onboarding";
import { UploadPage } from "./pages/upload";
import { HistoryList } from "./pages/history";
import { SettingsIndex } from "./pages/settings";
import { SuppliersList } from "./pages/suppliers/list";
import { CustomersList } from "./pages/customers/list";
import { ResetPassword } from "./pages/reset-password";
import { MonitoringList } from "./pages/monitoring/list";
import { StatisticsPage } from "./pages/statistics/list";
import { SupplierEditor } from "./pages/suppliers/editor";
import { CustomerEditor } from "./pages/customers/editor";
import { SplitterViewerPage } from "./pages/splitter/viewer";
import { VerifierViewerPage } from "./pages/verifier/viewer";
import { MonitoringDetails } from "./pages/monitoring/details";
import { SettingsGeneralIndex } from "./pages/settings/general";
import { SettingsVerifierIndex } from "./pages/settings/verifier";
import { SettingsSplitterIndex } from "./pages/settings/splitter";
import { OutputEditor } from "./components/settings/outputs/editor";
import { SettingsGeneralSMTP } from "./pages/settings/general/smtp";
import { SettingsGeneralRegex } from "./pages/settings/general/regex";
import { AiDoctypesList } from "./components/settings/ai-doctypes/list";
import { WorkflowEditor } from "./components/settings/workflows/editor";
import { UpdateStatus } from "./components/settings/update-status/update";
import { SettingsGeneralRoles } from "./pages/settings/general/roles/list";
import { SettingsGeneralUsers } from "./pages/settings/general/users/list";
import { SettingsGeneralSecurity } from "./pages/settings/general/security";
import { AiDoctypesEditor } from "./components/settings/ai-doctypes/editor";
import { SettingsGeneralAdvanced } from "./pages/settings/general/advanced";
import { SettingsGeneralDocservers } from "./pages/settings/general/docservers";
import { SettingsGeneralUserQuota } from "./pages/settings/general/users/quota";
import { SettingsGeneralMailcollect } from "./pages/settings/general/mailcollect";
import { SettingsGeneralRoleEditor } from "./pages/settings/general/roles/editor";
import { SettingsGeneralUserEditor } from "./pages/settings/general/users/editor";
import { SettingsVerifierAiLLMList } from "./pages/settings/verifier/ai-llm/list";
import { SettingsGeneralTokenAuth } from "./pages/settings/general/security/token";
import { SettingsVerifierFormsCreate } from "./pages/settings/verifier/forms/create";
import { SettingsSplitterFormsCreate } from "./pages/settings/splitter/forms/create";
import { SettingsGeneralCustomization } from "./pages/settings/general/customization";
import { SettingsVerifierAiLLMEditor } from "./pages/settings/verifier/ai-llm/editor";
import { SettingsSplitterSeparator } from "./pages/settings/splitter/separator/editor";
import { SettingsSplitterCertifiedCopy } from "./pages/settings/splitter/certified-copy/editor";
import { SettingsVerifierPositionsMasksList } from "./pages/settings/verifier/positions-masks/list";
import { SettingsVerifierPositionMaskEditor } from "./pages/settings/verifier/positions-masks/editor";

export const router = createBrowserRouter(
    [
        {
            path: "/login",
            element: <Login/>,
        },
        {
            path: "/reset-password",
            element: <ResetPassword/>,
        },
        {
            path: "onboarding",
            element: <Onboarding/>,
            loader: protectedLoader(),
            errorElement: <LoginRequiredError/>
        },
        { // Route with settings Topbar
            path: "/",
            element: <SettingsLayout/>,
            children: [
                {
                    path: "profile",
                    element: <ProfilePage/>,
                    loader: protectedLoader(),
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'GLOBAL.my_profile' }
                },
                {
                    path: "about",
                    element: <AboutPage/>,
                    loader: protectedLoader(),
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'SETTINGS.abouts_us' }
                },
                {
                    path: "history",
                    errorElement: <LoginRequiredError/>,
                    children: [
                        {
                            index: true,
                            loader: protectedLoader(['history']),
                            element: <HistoryList/>,
                            handle: { breadcrumb: 'GLOBAL.history' },
                            errorElement: <LoginRequiredError/>
                        }
                    ]
                },
                {
                    path: "suppliers",
                    loader: protectedLoader(['suppliers_list']),
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'ACCOUNTS.suppliers_list' },
                    children: [
                        {
                            index: true,
                            loader: protectedLoader(['suppliers_list']),
                            element: <SuppliersList/>,
                            errorElement: <LoginRequiredError/>
                        },
                        {
                            path: 'edit/:supplierId',
                            loader: protectedLoader(['update_supplier']),
                            element: <SupplierEditor/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'ACCOUNTS.edit_supplier' }
                        },
                        {
                            path: 'create',
                            loader: protectedLoader(['create_supplier']),
                            element: <SupplierEditor/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'ACCOUNTS.add_supplier' }
                        }
                    ]
                },
                {
                    path: "customers",
                    loader: protectedLoader(['customers_list']),
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'ACCOUNTS.customers_list' },
                    children: [
                        {
                            index: true,
                            loader: protectedLoader(['customers_list']),
                            element: <CustomersList/>,
                            errorElement: <LoginRequiredError/>
                        },
                        {
                            path: 'edit/:customerId',
                            loader: protectedLoader(['update_customer']),
                            element: <CustomerEditor/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'ACCOUNTS.edit_customer' }
                        },
                        {
                            path: 'create',
                            loader: protectedLoader(['create_customer']),
                            element: <CustomerEditor/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'ACCOUNTS.add_customer' }
                        }
                    ]
                },
                {
                    path: "statistics",
                    element: <StatisticsPage/>,
                    loader: protectedLoader(['statistics']),
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'GLOBAL.statistics' }
                },
                {
                    path: "monitoring",
                    loader: protectedLoader(['monitoring']),
                    handle: { breadcrumb: 'MONITORING.list' },
                    errorElement: <LoginRequiredError/>,
                    children: [
                        {
                            index: true,
                            loader: protectedLoader(['monitoring']),
                            element: <MonitoringList/>,
                            errorElement: <LoginRequiredError/>,
                        },
                        {
                            path: ':processId',
                            loader: protectedLoader(['monitoring']),
                            element: <MonitoringDetails/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'MONITORING.details' },
                        },
                    ]
                }
            ]
        },
        {
            path: "/",
            element: <MainLayout/>,
            children: [
                {
                    path: "home",
                    element: <HomePage/>,
                    loader: protectedLoader(),
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'GLOBAL.home' }
                },
                {
                    path: "verifier/viewer/:documentId",
                    element: <VerifierViewerPage/>,
                    loader: protectedLoader(['access_verifier']),
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'SETTINGS.verifier' }
                },
                {
                    path: "splitter/viewer/:batchId",
                    element: <SplitterViewerPage/>,
                    loader: protectedLoader(['access_splitter']),
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'SETTINGS.splitter' }
                },
                {
                    path: "upload",
                    element: <UploadPage/>,
                    loader: protectedLoader(['upload']),
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'GLOBAL.upload' }
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
                    loader: protectedLoader(['settings']),
                    element: <SettingsIndex/>,
                    errorElement: <LoginRequiredError/>,
                },
                {
                    path: "general",
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'SETTINGS.general' },
                    children: [
                        {
                            index: true,
                            loader: protectedLoader(),
                            element: <SettingsGeneralIndex/>,
                            errorElement: <LoginRequiredError/>,
                        },
                        {
                            path: "customization",
                            loader: protectedLoader(),
                            element: <SettingsGeneralCustomization/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.customization' }
                        },
                        {
                            path: "smtp",
                            loader: protectedLoader(['settings', 'smtp']),
                            element: <SettingsGeneralSMTP/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.smtp' }
                        },
                        {
                            path: "mailcollect",
                            loader: protectedLoader(['settings', 'mailcollect']),
                            element: <SettingsGeneralMailcollect/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.mailcollect' }
                        },
                        {
                            path: "advanced",
                            loader: protectedLoader(['settings', 'advanced']),
                            element: <SettingsGeneralAdvanced/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.advanced' }
                        },
                        {
                            path: "regex",
                            loader: protectedLoader(['settings', 'regex']),
                            element: <SettingsGeneralRegex/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.regex' }
                        },
                        {
                            path: "docservers",
                            loader: protectedLoader(['settings', 'docservers']),
                            element: <SettingsGeneralDocservers/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.docservers' }
                        },
                        {
                            path: "security",
                            loader: protectedLoader(['settings', 'security']),
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.security' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(),
                                    element: <SettingsGeneralSecurity/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'token',
                                    loader: protectedLoader(),
                                    element: <SettingsGeneralTokenAuth/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.token_auth' }
                                }
                            ]
                        },
                        {
                            path: "users",
                            handle: { breadcrumb: 'SETTINGS.users' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'users_list']),
                                    element: <SettingsGeneralUsers/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'quota',
                                    loader: protectedLoader(['settings', 'user_quota']),
                                    element: <SettingsGeneralUserQuota/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.user_quota' }
                                },
                                {
                                    path: 'edit/:userId',
                                    loader: protectedLoader(['settings', 'update_user']),
                                    element: <SettingsGeneralUserEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_user' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'add_user']),
                                    element: <SettingsGeneralUserEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'FORMS.add_user' }
                                }
                            ]
                        },
                        {
                            path: "roles",
                            handle: { breadcrumb: 'SETTINGS.roles' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'roles_list']),
                                    element: <SettingsGeneralRoles/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:roleId',
                                    loader: protectedLoader(['settings', 'update_role']),
                                    element: <SettingsGeneralRoleEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_role' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'add_role']),
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
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'SETTINGS.verifier' },
                    children: [
                        {
                            index: true,
                            loader: protectedLoader(['settings', 'verifier_settings']),
                            element: <SettingsVerifierIndex/>,
                            errorElement: <LoginRequiredError/>
                        },
                        {
                            path: 'update-status',
                            loader: protectedLoader(['settings', 'update_status']),
                            element: <UpdateStatus module='verifier'/>,
                            handle: { breadcrumb: 'SETTINGS.update-status' },
                            errorElement: <LoginRequiredError/>
                        },
                        {
                            path: "forms",
                            handle: { breadcrumb: 'SETTINGS.forms' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'forms_list']),
                                    element: <FormsList module="verifier"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:formId',
                                    loader: protectedLoader(['settings', 'update_form']),
                                    element: <FormEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_form' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'add_form']),
                                    element: <SettingsVerifierFormsCreate/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'FORMS.add_form' }
                                }
                            ]
                        },
                        {
                            path: "custom-fields",
                            handle: { breadcrumb: 'VERIFIER.custom_fields' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'custom_fields_advanced']),
                                    element: <CustomFieldsList module="verifier"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:customFieldId',
                                    loader: protectedLoader(['settings', 'custom_fields_advanced']),
                                    element: <CustomFieldsEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_custom_fields' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'custom_fields_advanced']),
                                    element: <CustomFieldsEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_custom_field' }
                                }
                            ]
                        },
                        {
                            path: "workflows",
                            handle: { breadcrumb: 'SETTINGS.workflows' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'workflows_list']),
                                    element: <WorkflowsList module="verifier"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:workflowId',
                                    loader: protectedLoader(['settings', 'update_workflow']),
                                    element: <WorkflowEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_workflow' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'add_workflow']),
                                    element: <WorkflowEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_workflow' }
                                }
                            ]
                        },
                        {
                            path: "outputs",
                            handle: { breadcrumb: 'SETTINGS.outputs' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'outputs_list']),
                                    element: <OutputsList module="verifier"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:outputId',
                                    loader: protectedLoader(['settings', 'update_output']),
                                    element: <OutputEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_output' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'add_output']),
                                    element: <OutputEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_output' }
                                }
                            ]
                        },
                        {
                            path: "ai-llm",
                            handle: { breadcrumb: 'SETTINGS.ai_llm' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'list_llm_models']),
                                    element: <SettingsVerifierAiLLMList/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:aiLLMId',
                                    loader: protectedLoader(['settings', 'update_llm_models']),
                                    element: <SettingsVerifierAiLLMEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_ai_llm' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'add_llm_models']),
                                    element: <SettingsVerifierAiLLMEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_ai_llm' }
                                }
                            ]
                        },
                        {
                            path: "positions-masks",
                            handle: { breadcrumb: 'SETTINGS.positions-masks' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'positions_mask_list']),
                                    element: <SettingsVerifierPositionsMasksList/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:positionMaskId',
                                    loader: protectedLoader(['settings', 'update_positions_mask']),
                                    element: <SettingsVerifierPositionMaskEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_ai_doctype' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'add_positions_mask']),
                                    element: <SettingsVerifierPositionMaskEditor/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_ai_doctype' }
                                }
                            ]
                        },
                        {
                            path: "ai-doctypes",
                            handle: { breadcrumb: 'SETTINGS.ai_doctypes' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'list_ai_model']),
                                    element: <AiDoctypesList module="verifier"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:aiDoctypeId',
                                    loader: protectedLoader(['settings', 'update_ai_model']),
                                    element: <AiDoctypesEditor module="verifier"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_ai_doctype' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'create_ai_model']),
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
                    errorElement: <LoginRequiredError/>,
                    handle: { breadcrumb: 'SETTINGS.splitter' },
                    children: [
                        {
                            index: true,
                            loader: protectedLoader(['settings', 'splitter_settings']),
                            element: <SettingsSplitterIndex/>,
                            errorElement: <LoginRequiredError/>
                        },
                        {
                            path: 'update-status',
                            loader: protectedLoader(['settings', 'update_status_splitter']),
                            element: <UpdateStatus module='splitter'/>,
                            handle: { breadcrumb: 'SETTINGS.update-status' },
                            errorElement: <LoginRequiredError/>
                        },
                        {
                            path: "forms",
                            handle: { breadcrumb: 'SETTINGS.forms' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'forms_list_splitter']),
                                    element: <FormsList module="splitter"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:formId',
                                    loader: protectedLoader(['settings', 'update_form_splitter']),
                                    element: <FormEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_form' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'add_form_splitter']),
                                    element: <SettingsSplitterFormsCreate/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'FORMS.add_form' }
                                }
                            ]
                        },
                        {
                            path: "custom-fields",
                            handle: { breadcrumb: 'VERIFIER.custom_fields' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'custom_fields_advanced']),
                                    element: <CustomFieldsList module="splitter"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:customFieldId',
                                    loader: protectedLoader(['settings', 'custom_fields_advanced']),
                                    element: <CustomFieldsEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_custom_fields' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'custom_fields_advanced']),
                                    element: <CustomFieldsEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_custom_field' }
                                }
                            ]
                        },
                        {
                            path: "workflows",
                            handle: { breadcrumb: 'SETTINGS.workflows' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'workflows_list_splitter']),
                                    element: <WorkflowsList module="splitter"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:workflowId',
                                    loader: protectedLoader(['settings', 'update_workflow_splitter']),
                                    element: <WorkflowEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_workflow' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'add_workflow_splitter']),
                                    element: <WorkflowEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_workflow' }
                                }
                            ]
                        },
                        {
                            path: "outputs",
                            handle: { breadcrumb: 'SETTINGS.outputs' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'outputs_list_splitter']),
                                    element: <OutputsList module="splitter"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:outputId',
                                    loader: protectedLoader(['settings', 'update_output_splitter']),
                                    element: <OutputEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_output' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'add_output_splitter']),
                                    element: <OutputEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_output' }
                                }
                            ]
                        },
                        {
                            path: "ai-doctypes",
                            handle: { breadcrumb: 'SETTINGS.ai_doctypes' },
                            children: [
                                {
                                    index: true,
                                    loader: protectedLoader(['settings', 'list_ai_model_splitter']),
                                    element: <AiDoctypesList module="splitter"/>,
                                    errorElement: <LoginRequiredError/>
                                },
                                {
                                    path: 'edit/:aiDoctypeId',
                                    loader: protectedLoader(['settings', 'update_ai_model_splitter']),
                                    element: <AiDoctypesEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.edit_ai_doctype' }
                                },
                                {
                                    path: 'create',
                                    loader: protectedLoader(['settings', 'create_ai_model']),
                                    element: <AiDoctypesEditor module="splitter"/>,
                                    errorElement: <LoginRequiredError/>,
                                    handle: { breadcrumb: 'SETTINGS.add_ai_doctype' }
                                }
                            ]
                        },
                        {
                            path: 'certified-copy',
                            loader: protectedLoader(['settings', 'certified_copy']),
                            element: <SettingsSplitterCertifiedCopy/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'SETTINGS.certified_copy' }
                        },
                        {
                            path: 'separator',
                            loader: protectedLoader(['settings', 'certified_copy']),
                            element: <SettingsSplitterSeparator/>,
                            errorElement: <LoginRequiredError/>,
                            handle: { breadcrumb: 'FORMS.qr_code' }
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