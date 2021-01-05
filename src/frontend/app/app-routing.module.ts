import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import { ViewerComponent } from './verifier/viewer/viewer.component';
import { ListComponent } from './verifier/list/list.component';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent , data: { title: 'GLOBAL.home', image: 'assets/imgs/open-capture.png' }},
  { path: 'auth', component: AuthComponent , data: { title: 'GLOBAL.auth', image: 'assets/imgs/open-capture.png' }},
  { path: 'verifier/viewer', component: ViewerComponent , data: { title: 'VERIFIER.viewer', image: 'assets/imgs/open-capture_verifier.png' }},
  { path: 'verifier/list', component: ListComponent , data: { title: 'VERIFIER.list', image: 'assets/imgs/open-capture_verifier.png' }},
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'verifier', redirectTo: 'verifier/list', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}
