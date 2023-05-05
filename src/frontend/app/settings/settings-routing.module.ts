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

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SettingsComponent } from "./settings.component";
import { AboutUsComponent } from './general/about-us/about-us.component';
import { HasPrivilegeService } from "../../services/has-privilege.service";
import { SeparatorComponent } from "./splitter/separator/separator.component";
import { LoginRequiredService } from "../../services/login-required.service";
import { FormListComponent } from "./verifier/form/list/form-list.component";
import { WorkflowListComponent } from "./verifier/workflow/list/workflow-list.component";
import { WorkflowListSplitterComponent } from "./splitter/workflow/list/workflow-list.component";
import { UsersListComponent } from "./general/users/list/users-list.component";
import { RolesListComponent } from "./general/roles/list/roles-list.component";
import { SplitterFormListComponent } from "./splitter/form/list/form-list.component";
import { CreateUserComponent } from "./general/users/create/create-user.component";
import { UpdateUserComponent } from "./general/users/update/update-user.component";
import { CreateRoleComponent } from "./general/roles/create/create-role.component";
import { UpdateRoleComponent } from "./general/roles/update/update-role.component";
import { FormBuilderComponent } from "./verifier/form/builder/form-builder.component";
import { WorkflowBuilderComponent } from "./verifier/workflow/builder/workflow-builder.component";
import { WorkflowBuilderSplitterComponent } from "./splitter/workflow/builder/workflow-builder.component";
import { OutputsListComponent } from "./verifier/outputs/list/outputs-list.component";
import { ListDocTypeComponent } from "./splitter/doc-types/list/list-doc-type.component";
import { CustomFieldsComponent } from "./general/custom-fields/custom-fields.component";
import { SplitterOutputListComponent } from "./splitter/output/list/output-list.component";
import { UpdateOutputComponent } from "./verifier/outputs/update/update-output.component";
import { ConfigurationsComponent } from "./general/configurations/configurations.component";
import { DocserversComponent } from "./general/docservers/docservers.component";
import { RegexComponent } from "./general/regex/regex.component";
import { MailCollectComponent } from "./general/mailcollect/mailcollect.component";
import { CreateOutputComponent } from "./verifier/outputs/create/create-output.component";
import { SplitterFormBuilderComponent } from "./splitter/form/builder/form-builder.component";
import { CreateDocTypeComponent } from "./splitter/doc-types/create/create-doc-type.component";
import { SplitterUpdateOutputComponent } from "./splitter/output/update/update-output.component";
import { SplitterCreateOutputComponent } from "./splitter/output/create/create-output.component";
import { ListAiModelComponent } from "./general/ai-model/list/list-ai-model.component";
import { CreateAiModelComponent } from "./general/ai-model/create/create-ai-model.component";
import { UpdateAiModelComponent } from "./general/ai-model/update/update-ai-model.component";
import { PositionsMaskListComponent } from "./verifier/positions-mask/list/positions-mask-list.component";
import { CreatePositionsMaskComponent } from "./verifier/positions-mask/create/create-positions-mask.component";
import { UpdatePositionsMaskComponent } from "./verifier/positions-mask/update/update-positions-mask.component";
import { CreateFolderDocTypeComponent } from "./splitter/doc-types/create-folder/create-folder-doc-type.component";
import { LoginMethodsComponent } from "./general/login-methods/login-methods.component";
import { VariousSettingsVerifierComponent } from "./verifier/various-settings/various-settings.component";
import { UserQuotaComponent } from "./general/user-quota/user-quota.component";
import { SplitterUpdateStatusComponent } from "./splitter/update-status/update-status.component";
import { VerifierStatusUpdateComponent } from "./verifier/update-status/update-status.component";

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
        data: {title: 'SETTINGS.custom_fields', privileges: ['settings', 'custom_fields']},
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
        path: 'settings/verifier/workflows', component: WorkflowListComponent,
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
        path: 'settings/verifier/forms', component: FormListComponent,
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
        path: 'settings/verifier/ai', component: ListAiModelComponent,
        data: {title: 'SETTINGS.artificial_intelligence', privileges: ['settings', 'list_ai_model']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/ai/create', component: CreateAiModelComponent,
        data: {title: 'ARTIFICIAL-INTELLIGENCE.add_model', privileges: ['settings', 'create_ai_model']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/verifier/ai/update/:id', component: UpdateAiModelComponent,
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
        path: 'settings/splitter/workflows', component: WorkflowListSplitterComponent,
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
        path: 'settings/splitter/forms', component: SplitterFormListComponent,
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
        component: ListDocTypeComponent,
        data: {title: 'SETTINGS.document_type', privileges: ['settings', 'document_type_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/document-type/new',
        component: CreateDocTypeComponent,
        data: {title: 'SETTINGS.document_type', privileges: ['settings', 'add_document_type']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/document-type/create-folder',
        component: CreateFolderDocTypeComponent,
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
        path: 'settings/splitter/ai', component: ListAiModelComponent,
        data: {title: 'SETTINGS.artificial_intelligence', privileges: ['settings', 'list_ai_model_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/ai/create', component: CreateAiModelComponent,
        data: {title: 'ARTIFICIAL-INTELLIGENCE.add_model', privileges: ['settings', 'create_ai_model']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/ai/update/:id', component: UpdateAiModelComponent,
        data: {title: 'ARTIFICIAL-INTELLIGENCE.update_model', privileges: ['settings', 'update_ai_model_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/splitter/status-update', component: SplitterUpdateStatusComponent,
        data: {title: 'SETTINGS.status_update', privileges: ['settings', 'update_status_splitter']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
// -- END Splitter
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {useHash: true})
    ],
    exports: [RouterModule]
})

export class SettingsRoutingModule {}
