import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import { ViewerComponent } from './verifier/viewer/viewer.component';
import { ListComponent } from './verifier/list/list.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { HomeComponent } from './home/home.component';

import { LoginRedirectService } from '../services/login-redirect.service';
import { LoginRequiredService } from '../services/login-required.service';

const routes: Routes = [
  { path: 'home', component: HomeComponent , data: { title: 'GLOBAL.home', image: 'assets/imgs/open-capture.png' }, canActivate: [LoginRequiredService]},
  { path: 'login', component: LoginComponent , data: { title: 'GLOBAL.login', image: 'assets/imgs/open-capture.png' }, canActivate: [LoginRedirectService]},
  { path: 'logout', component: LogoutComponent , canActivate: [LoginRequiredService]},
  { path: 'verifier/viewer', component: ViewerComponent , data: { title: 'VERIFIER.viewer', image: 'assets/imgs/open-capture_verifier.png' }, canActivate: [LoginRequiredService]},
  { path: 'verifier/list', component: ListComponent , data: { title: 'VERIFIER.list', image: 'assets/imgs/open-capture_verifier.png' }, canActivate: [LoginRequiredService]},
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'verifier', redirectTo: 'verifier/list', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}
