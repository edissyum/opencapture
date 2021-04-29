import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {PanelComponent} from "./panel/panel.component";
import {marker} from "@biesbjerg/ngx-translate-extract-marker";
import {LoginRequiredService} from "../../services/login-required.service";
import {HasPrivilegeService} from "../../services/has-privilege.service";
import {UsersListComponent} from "./users/list/users-list.component";
import {RolesListComponent} from "./roles/list/roles-list.component";

const routes: Routes = [
    {
        path: 'settings/panel',
        component: PanelComponent,
        data: {title: marker('GLOBAL.settings'), privileges: ['settings']},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'settings/users',
        component: UsersListComponent,
        data: {title: marker('SETTINGS.users_list'), privileges: ['settings', 'users_list']},
        canActivate: [
            LoginRequiredService,
            HasPrivilegeService
        ]
    },
    {
        path: 'settings/roles',
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