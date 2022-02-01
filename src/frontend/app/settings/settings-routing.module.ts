/** This file is part of Open-Capture for Invoices.

 Open-Capture for Invoices is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SettingsComponent } from "./settings.component";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import { LoginRequiredService } from "../../services/login-required.service";
import { HasPrivilegeService } from "../../services/has-privilege.service";
import { UsersListComponent } from "./general/users/list/users-list.component";
import { RolesListComponent } from "./general/roles/list/roles-list.component";
import { CreateUserComponent } from "./general/users/create/create-user.component";
import { AboutUsComponent } from './general/about-us/about-us.component';
import { UpdateUserComponent } from "./general/users/update/update-user.component";
import { CreateRoleComponent } from "./general/roles/create/create-role.component";
import { UpdateRoleComponent } from "./general/roles/update/update-role.component";
import { CustomFieldsComponent } from "./general/custom-fields/custom-fields.component";
import { FormBuilderComponent } from "./verifier/form/builder/form-builder.component";
import { FormListComponent } from "./verifier/form/list/form-list.component";
import { OutputsListComponent } from "./verifier/outputs/list/outputs-list.component";
import { UpdateOutputComponent } from "./verifier/outputs/update/update-output.component";
import { CreateOutputComponent } from "./verifier/outputs/create/create-output.component";
import { InputsListComponent } from "./verifier/inputs/list/inputs-list.component";
import { UpdateInputComponent } from "./verifier/inputs/update/update-input.component";
import { CreateInputComponent } from "./verifier/inputs/create/create-input.component";
import { CreatePositionsMaskComponent } from "./verifier/positions-mask/create/create-positions-mask.component";
import { UpdatePositionsMaskComponent } from "./verifier/positions-mask/update/update-positions-mask.component";
import { PositionsMaskListComponent } from "./verifier/positions-mask/list/positions-mask-list.component";
import {SeparatorComponent} from "./splitter/separator/separator.component";
import {SplitterCreateInputComponent} from "./splitter/inputs/create/create-input.component";
import {SplitterInputListComponent} from "./splitter/inputs/list/input-list.component";
import {SplitterUpdateInputComponent} from "./splitter/inputs/update/update-input.component";
import {SplitterUpdateOutputComponent} from "./splitter/output/update/update-output.component";
import {SplitterCreateOutputComponent} from "./splitter/output/create/create-output.component";
import {SplitterFormListComponent} from "./splitter/form/list/form-list.component";
import {SplitterFormBuilderComponent} from "./splitter/form/builder/form-builder.component";
import {SplitterListOutputComponent} from "./splitter/output/list/list-output.component";
import {ListDocTypeComponent} from "./splitter/doc-types/list/list-doc-type.component";
import {CreateDocTypeComponent} from "./splitter/doc-types/create/create-doc-type.component";
import {UpdateDocTypeComponent} from "./splitter/doc-types/update/update-doc-type.component";
import {CreateFolderDocTypeComponent} from "./splitter/doc-types/create-folder/create-folder-doc-type.component";

const routes: Routes = [
    {
        path: 'settings', component: SettingsComponent,
        data: {title: marker('GLOBAL.settings'), privileges: ['settings']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },

// --- General
    // Users
    {
        path: 'settings/general/users', component: UsersListComponent,
        data: {title: marker('SETTINGS.users_list'), privileges: ['settings', 'users_list']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/users/new', component: CreateUserComponent,
        data: {title: marker('SETTINGS.create_user'), privileges: ['settings', 'add_user']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/users/update/:id', component: UpdateUserComponent,
        data: {title: marker('USER.update'), privileges: ['settings', 'update_user']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    // END Users

    // Roles
    {
        path: 'settings/general/roles', component: RolesListComponent,
        data: {title: marker('SETTINGS.roles_list'), privileges: ['settings', 'roles_list']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/roles/new', component: CreateRoleComponent,
        data: {title: marker('SETTINGS.create_role'), privileges: ['settings', 'add_role']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    {
        path: 'settings/general/roles/update/:id', component: UpdateRoleComponent,
        data: {title: marker('ROLE.update'), privileges: ['settings', 'update_role']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    // END Roles
    {
        path: 'settings/general/about-us', component: AboutUsComponent,
        data: {title: marker('SETTINGS.abouts_us')},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/general/custom-fields', component: CustomFieldsComponent,
        data: {title: marker('SETTINGS.custom_fields'), privileges: ['settings', 'custom_fields']},
        canActivate: [LoginRequiredService]
    },
// --- END General
// --- Verifier
    {
        path: 'settings/verifier/forms', component: FormListComponent,
        data: {title: marker('SETTINGS.list_forms'), privileges: ['settings', 'forms_list']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/verifier/forms/builder/new', component: FormBuilderComponent,
        data: {title: marker('SETTINGS.form_builder'), privileges: ['settings', 'add_form']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/verifier/forms/builder/edit/:id', component: FormBuilderComponent,
        data: {title: marker('SETTINGS.form_update'), privileges: ['settings', 'update_form']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/verifier/outputs', component: OutputsListComponent,
        data: {title: marker('FORMS.output_settings'), privileges: ['settings', 'outputs_list']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/verifier/outputs/new', component: CreateOutputComponent,
        data: {title: marker('SETTINGS.add_output'), privileges: ['settings', 'add_output']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/verifier/outputs/update/:id', component: UpdateOutputComponent,
        data: {title: marker('SETTINGS.update_output'), privileges: ['settings', 'update_output']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/verifier/inputs', component: InputsListComponent,
        data: {title: marker('FORMS.input_settings'), privileges: ['settings', 'inputs_list']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/verifier/inputs/new', component: CreateInputComponent,
        data: {title: marker('SETTINGS.add_input'), privileges: ['settings', 'add_input']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/verifier/inputs/update/:id', component: UpdateInputComponent,
        data: {title: marker('SETTINGS.update_input'), privileges: ['settings', 'update_input']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/verifier/positions-mask', component: PositionsMaskListComponent,
        data: {title: marker('SETTINGS.list_positions_mask'), privileges: ['settings', 'positions_mask_list']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/verifier/positions-mask/create', component: CreatePositionsMaskComponent,
        data: {title: marker('SETTINGS.positions_mask_builder'), privileges: ['settings', 'add_positions_mask']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/verifier/positions-mask/update/:id', component: UpdatePositionsMaskComponent,
        data: {title: marker('SETTINGS.positions_mask_update'), privileges: ['settings', 'update_positions_mask']},
        canActivate: [LoginRequiredService]
    },
// -- END Verifier
// -- Splitter
    {
        path: 'settings/splitter/forms', component: SplitterFormListComponent,
        data: {title: marker('SETTINGS.list_forms'), privileges: ['settings', 'forms_list_splitter']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/splitter/forms/builder/new', component: SplitterFormBuilderComponent,
        data: {title: marker('SETTINGS.form_builder'), privileges: ['settings', 'add_form_splitter']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/splitter/forms/builder/edit/:id', component: SplitterFormBuilderComponent,
        data: {title: marker('SETTINGS.form_update'), privileges: ['settings', 'update_form_splitter']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/splitter/separator',
        component: SeparatorComponent,
        data: {title: marker('SETTINGS.custom_fields'), privileges: ['settings', 'separator_splitter']},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'settings/splitter/documentType',
        component: ListDocTypeComponent,
        data: {title: marker('SETTINGS.document_type'), privileges: ['settings', 'document_type_splitter']},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'settings/splitter/documentType/new',
        component: CreateDocTypeComponent,
        data: {title: marker('SETTINGS.document_type'), privileges: ['settings', 'document_type_splitter']},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'settings/splitter/documentType/createFolder',
        component: CreateFolderDocTypeComponent,
        data: {title: marker('SETTINGS.document_type'), privileges: ['settings', 'document_type_splitter']},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'settings/splitter/documentType/update',
        component: UpdateDocTypeComponent,
        data: {title: marker('SETTINGS.document_type'), privileges: ['settings', 'document_type_splitter']},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'settings/splitter/outputs', component: SplitterListOutputComponent,
        data: {title: marker('FORMS.output_settings'), privileges: ['settings', 'outputs_list_splitter']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/splitter/outputs/new', component: SplitterCreateOutputComponent,
        data: {title: marker('SETTINGS.add_output'), privileges: ['settings', 'add_output_splitter']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/splitter/outputs/update/:id', component: SplitterUpdateOutputComponent,
        data: {title: marker('SETTINGS.update_output'), privileges: ['settings', 'update_output_splitter']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/splitter/inputs', component: SplitterInputListComponent,
        data: {title: marker('FORMS.input_settings'), privileges: ['settings', 'inputs_list_splitter']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/splitter/inputs/new', component: SplitterCreateInputComponent,
        data: {title: marker('SETTINGS.add_input'), privileges: ['settings', 'add_input_splitter']},
        canActivate: [LoginRequiredService]
    },
    {
        path: 'settings/splitter/inputs/update/:id', component: SplitterUpdateInputComponent,
        data: {title: marker('SETTINGS.update_input'), privileges: ['settings', 'update_input_splitter']},
        canActivate: [LoginRequiredService]
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