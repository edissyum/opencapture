import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import { ViewerComponent } from './verifier/viewer/viewer.component';
import { ListComponent } from './verifier/list/list.component';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {path: '', component: HomeComponent,},
  {path: 'auth', component: AuthComponent},
  {path: 'verifier/viewer', component: ViewerComponent},
  {path: 'verifier/list', component: ListComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
