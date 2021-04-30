import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {SettingsComponent} from "./settings.component";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
import {LoginRequiredService} from "../../services/login-required.service";
import {HasPrivilegeService} from "../../services/has-privilege.service";
import {UsersListComponent} from "./users/list/users-list.component";
import {RolesListComponent} from "./roles/list/roles-list.component";
import {CreateUserComponent} from "./users/create/create-user.component";

const routes: Routes = [
    {
        path: 'settings',
        component: SettingsComponent,
        data: {title: marker('GLOBAL.settings'), privileges: ['settings']},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'settings/general/users',
        component: UsersListComponent,
        data: {title: marker('SETTINGS.users_list'), privileges: ['settings', 'users_list']},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'settings/general/users/new',
        component: CreateUserComponent,
        data: {title: marker('SETTINGS.create_user'), privileges: ['settings', 'add_user']},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'settings/general/users/edit/:id',
        component: UsersListComponent,
        data: {title: marker('SETTINGS.create_user'), privileges: ['settings', 'modify_user']},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'settings/general/roles',
        component: RolesListComponent,
        data: {title: marker('SETTINGS.roles_list'), privileges: ['settings', 'roles_list']},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },

];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {useHash: true})
    ],
    exports: [RouterModule]
})

export class SettingsRoutingModule {}