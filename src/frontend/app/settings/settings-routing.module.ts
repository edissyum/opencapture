import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SettingsComponent } from "./settings.component";
import { marker } from "@biesbjerg/ngx-translate-extract-marker";
import { LoginRequiredService } from "../../services/login-required.service";
import { HasPrivilegeService } from "../../services/has-privilege.service";
import { UsersListComponent } from "./users/list/users-list.component";
import { RolesListComponent } from "./roles/list/roles-list.component";
import { CreateUserComponent } from "./users/create/create-user.component";
import { AboutUsComponent } from './about-us/about-us.component';
import { UpdateUserComponent } from "./users/update/update-user.component";
import {CreateRoleComponent} from "./roles/create/create-role.component";
import {UpdateRoleComponent} from "./roles/update/update-role.component";

const routes: Routes = [
    {
        path: 'settings', component: SettingsComponent,
        data: {title: marker('GLOBAL.settings'), privileges: ['settings']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },

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
        data: {title: marker('USER.update'), privileges: ['settings', 'modify_user']},
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
        data: {title: marker('ROLE.update'), privileges: ['settings', 'modify_role']},
        canActivate: [LoginRequiredService, HasPrivilegeService]
    },
    // END Roles
    {
        path: 'settings/general/about-us', component: AboutUsComponent,
        data: {title: marker('SETTINGS.abouts_us')},
        canActivate: [LoginRequiredService]
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {useHash: true})
    ],
    exports: [RouterModule]
})

export class SettingsRoutingModule {}