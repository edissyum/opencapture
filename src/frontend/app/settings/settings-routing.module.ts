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

 @dev : Nathan Cheval <nathan.cheval@outlook.fr>
 @dev : Oussama Brich <oussama.brich@edissyum.com> */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SettingsComponent } from "./settings.component";
import { AboutUsComponent } from './general/about-us/about-us.component';
import { HasPrivilegeService } from "../../services/has-privilege.service";
import { SeparatorComponent } from "./splitter/separator/separator.component";
import { LoginRequiredService } from "../../services/login-required.service";
import { FormsListComponent } from "./verifier/forms/list/forms-list.component";
import { WorkflowsListComponent } from "./verifier/workflows/list/workflows-list.component";
import { WorkflowsListSplitterComponent } from './splitter/workflows/list/workflows-list.component';
import { UsersListComponent } from "./general/users/list/users-list.component";
import { RolesListComponent } from "./general/roles/list/roles-list.component";
import { SplitterFormsListComponent } from "./splitter/forms/list/forms-list.component";
import { CreateUserComponent } from "./general/users/create/create-user.component";
import { UpdateUserComponent } from "./general/users/update/update-user.component";
import { CreateRoleComponent } from "./general/roles/create/create-role.component";
import { UpdateRoleComponent } from "./general/roles/update/update-role.component";
import { FormBuilderComponent } from "./verifier/forms/builder/form-builder.component";
import { WorkflowBuilderComponent } from "./verifier/workflows/builder/workflow-builder.component";
import { WorkflowBuilderSplitterComponent } from "./splitter/workflows/builder/workflow-builder.component";
import { OutputsListComponent } from "./verifier/outputs/list/outputs-list.component";
import { ListDoctypeComponent } from "./splitter/doctypes/list/list-doctype.component";
import { CustomFieldsComponent } from "./general/custom-fields/custom-fields.component";
import { SplitterOutputListComponent } from "./splitter/outputs/list/outputs-list.component";
import { UpdateOutputComponent } from "./verifier/outputs/update/update-output.component";
import { ConfigurationsComponent } from "./general/configurations/configurations.component";
import { DocserversComponent } from "./general/docservers/docservers.component";
import { RegexComponent } from "./general/regex/regex.component";
import { MailCollectComponent } from "./general/mailcollect/mailcollect.component";
import { CreateOutputComponent } from "./verifier/outputs/create/create-output.component";
import { SplitterFormBuilderComponent } from "./splitter/forms/builder/form-builder.component";
import { CreateDoctypeComponent } from "./splitter/doctypes/create/create-doctype.component";
import { SplitterUpdateOutputComponent } from "./splitter/outputs/update/update-output.component";
import { SplitterCreateOutputComponent } from "./splitter/outputs/create/create-output.component";
import { ListVerifierAiModelComponent } from "./verifier/ai-models/list/list-ai-models.component";
import { CreateVerifierAiModelComponent } from "./verifier/ai-models/create/create-ai-model.component";
import { UpdateVerifierAiModelComponent } from "./verifier/ai-models/update/update-ai-model.component";
import { ListSplitterAiModelsComponent } from "./splitter/ai-models/list/list-ai-models.component";
import { CreateSplitterAiModelComponent } from "./splitter/ai-models/create/create-ai-model.component";
import { UpdateSplitterAiModelComponent } from "./splitter/ai-models/update/update-ai-model.component";
import { PositionsMaskListComponent } from "./verifier/positions-mask/list/positions-mask-list.component";
import { CreatePositionsMaskComponent } from "./verifier/positions-mask/create/create-positions-mask.component";
import { UpdatePositionsMaskComponent } from "./verifier/positions-mask/update/update-positions-mask.component";
import { CreateFolderDoctypeComponent } from "./splitter/doctypes/create-folder/create-folder-doctype.component";
import { LoginMethodsComponent } from "./general/login-methods/login-methods.component";
import { VariousSettingsVerifierComponent } from "./verifier/various-settings/various-settings.component";
import { UserQuotaComponent } from "./general/user-quota/user-quota.component";
import { SplitterUpdateStatusComponent } from "./splitter/update-status/update-status.component";
import { VerifierStatusUpdateComponent } from "./verifier/update-status/update-status.component";
import { CreateAiLLMComponent } from "./verifier/ai-llm/create/create-ai-llm.component";
import { UpdateAiLLMComponent } from "./verifier/ai-llm/update/update-ai-llm.component";
import { AiLLMListComponent } from "./verifier/ai-llm/list/list-ai-llm.component";

const routes: Routes = [
    {
        path: 'settings', component: SettingsComponent,
        data: {title: 'GLOBAL.settings', privileges: ['settings']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },

// --- General
    // Configurations
    {
        path: 'settings/general/configurations', component: ConfigurationsComponent,
        data: {title: 'SETTINGS.configurations', privileges: ['settings', 'configurations']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/docservers', component: DocserversComponent,
        data: {title: 'SETTINGS.docservers', privileges: ['settings', 'docservers']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/regex', component: RegexComponent,
        data: {title: 'SETTINGS.regex', privileges: ['settings', 'regex']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/mailcollect', component: MailCollectComponent,
        data: {title: 'SETTINGS.mailcollect', privileges: ['settings', 'mailcollect']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/user-quota', component: UserQuotaComponent,
        data: {title: 'SETTINGS.user_quota', privileges: ['settings', 'user_quota']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/users', component: UsersListComponent,
        data: {title: 'SETTINGS.users_list', privileges: ['settings', 'users_list']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/users/new', component: CreateUserComponent,
        data: {title: 'USER.create_user', privileges: ['settings', 'add_user']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/users/update/:id', component: UpdateUserComponent,
        data: {title: 'USER.update', privileges: ['settings', 'update_user']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/roles', component: RolesListComponent,
        data: {title: 'SETTINGS.roles_list', privileges: ['settings', 'roles_list']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/roles/new', component: CreateRoleComponent,
        data: {title: 'ROLE.create_role', privileges: ['settings', 'add_role']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/roles/update/:id', component: UpdateRoleComponent,
        data: {title: 'ROLE.update', privileges: ['settings', 'update_role']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/login-methods', component: LoginMethodsComponent,
        data: {title: 'SETTINGS.login_methods', privileges: ['settings', 'login_methods']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/about-us', component: AboutUsComponent,
        data: {title: 'SETTINGS.abouts_us', privileges: ['settings']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/custom-fields', component: CustomFieldsComponent,
        data: {title: 'SETTINGS.custom_fields', privileges: ['settings', 'custom_fields_advanced']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
// --- END General
// --- Verifier
    {
        path: 'settings/verifier', component: VariousSettingsVerifierComponent,
        data: {title: 'SETTINGS.verifier_settings', privileges: ['settings', 'verifier_settings']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/workflows', component: WorkflowsListComponent,
        data: {title: 'SETTINGS.list_workflows', privileges: ['settings', 'workflows_list']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/workflows/builder/new', component: WorkflowBuilderComponent,
        data: {title: 'SETTINGS.workflow_builder', privileges: ['settings', 'add_workflow']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/workflows/builder/edit/:id', component: WorkflowBuilderComponent,
        data: {title: 'SETTINGS.workflow_update', privileges: ['settings', 'update_workflow']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/forms', component: FormsListComponent,
        data: {title: 'SETTINGS.list_forms', privileges: ['settings', 'forms_list']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/forms/builder/new', component: FormBuilderComponent,
        data: {title: 'SETTINGS.form_builder', privileges: ['settings', 'add_form']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/forms/builder/edit/:id', component: FormBuilderComponent,
        data: {title: 'SETTINGS.form_update', privileges: ['settings', 'update_form']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/outputs', component: OutputsListComponent,
        data: {title: 'FORMS.output_settings', privileges: ['settings', 'outputs_list']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/outputs/new', component: CreateOutputComponent,
        data: {title: 'SETTINGS.add_output', privileges: ['settings', 'add_output']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/outputs/update/:id', component: UpdateOutputComponent,
        data: {title: 'SETTINGS.update_output', privileges: ['settings', 'update_output']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/ai-llm', component: AiLLMListComponent,
        data: {title: 'SETTINGS.ai_llm_settings', privileges: ['settings', 'list_llm_models']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/ai-llm/new', component: CreateAiLLMComponent,
        data: {title: 'SETTINGS.add_llm_models', privileges: ['settings', 'add_llm_models']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/ai-llm/update/:id', component: UpdateAiLLMComponent,
        data: {title: 'SETTINGS.update_llm_models', privileges: ['settings', 'update_llm_models']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/positions-mask', component: PositionsMaskListComponent,
        data: {title: 'SETTINGS.list_positions_mask', privileges: ['settings', 'positions_mask_list']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/positions-mask/create', component: CreatePositionsMaskComponent,
        data: {title: 'SETTINGS.positions_mask_builder', privileges: ['settings', 'add_positions_mask']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/positions-mask/update/:id', component: UpdatePositionsMaskComponent,
        data: {title: 'SETTINGS.positions_mask_update', privileges: ['settings', 'update_positions_mask']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/ai', component: ListVerifierAiModelComponent,
        data: {title: 'SETTINGS.artificial_intelligence', privileges: ['settings', 'list_ai_model']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/ai/create', component: CreateVerifierAiModelComponent,
        data: {title: 'ARTIFICIAL-INTELLIGENCE.add_model', privileges: ['settings', 'create_ai_model']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/ai/update/:id', component: UpdateVerifierAiModelComponent,
        data: {title: 'ARTIFICIAL-INTELLIGENCE.update_model', privileges: ['settings', 'update_ai_model']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/status-update', component: VerifierStatusUpdateComponent,
        data: {title: 'SETTINGS.status_update', privileges: ['settings', 'update_status']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
// -- END Verifier
// -- Splitter
    {
        path: 'settings/splitter/workflows', component: WorkflowsListSplitterComponent,
        data: {title: 'SETTINGS.list_workflows', privileges: ['settings', 'workflows_list_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/workflows/builder/new', component: WorkflowBuilderSplitterComponent,
        data: {title: 'SETTINGS.workflow_builder', privileges: ['settings', 'add_workflow_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/workflows/builder/edit/:id', component: WorkflowBuilderSplitterComponent,
        data: {title: 'SETTINGS.workflow_update', privileges: ['settings', 'update_workflow']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/forms', component: SplitterFormsListComponent,
        data: {title: 'SETTINGS.list_forms', privileges: ['settings', 'forms_list_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/forms/builder/new', component: SplitterFormBuilderComponent,
        data: {title: 'SETTINGS.form_builder', privileges: ['settings', 'add_form_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/forms/builder/edit/:id', component: SplitterFormBuilderComponent,
        data: {title: 'SETTINGS.form_update', privileges: ['settings', 'update_form_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/separator',
        component: SeparatorComponent,
        data: {title: 'SETTINGS.document_separator', privileges: ['settings', 'separator_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/document-type',
        component: ListDoctypeComponent,
        data: {title: 'SETTINGS.document_type', privileges: ['settings', 'document_type_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/document-type/new',
        component: CreateDoctypeComponent,
        data: {title: 'SETTINGS.document_type', privileges: ['settings', 'add_document_type']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/document-type/create-folder',
        component: CreateFolderDoctypeComponent,
        data: {title: 'SETTINGS.document_type', privileges: ['settings', 'add_document_type']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/outputs', component: SplitterOutputListComponent,
        data: {title: 'FORMS.output_settings', privileges: ['settings', 'outputs_list_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/outputs/new', component: SplitterCreateOutputComponent,
        data: {title: 'SETTINGS.add_output', privileges: ['settings', 'add_output_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/outputs/update/:id', component: SplitterUpdateOutputComponent,
        data: {title: 'SETTINGS.update_output', privileges: ['settings', 'update_output_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/ai', component: ListSplitterAiModelsComponent,
        data: {title: 'SETTINGS.artificial_intelligence', privileges: ['settings', 'list_ai_model_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/ai/create', component: CreateSplitterAiModelComponent,
        data: {title: 'ARTIFICIAL-INTELLIGENCE.add_model', privileges: ['settings', 'create_ai_model']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/ai/update/:id', component: UpdateSplitterAiModelComponent,
        data: {title: 'ARTIFICIAL-INTELLIGENCE.update_model', privileges: ['settings', 'update_ai_model_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/status-update', component: SplitterUpdateStatusComponent,
        data: {title: 'SETTINGS.status_update', privileges: ['settings', 'update_status_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    }
// -- END Splitter
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {useHash: true})
    ],
    exports: [RouterModule]
})

export class SettingsRoutingModule {}
