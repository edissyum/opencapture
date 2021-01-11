import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import { LoginRedirectService } from '../services/login-redirect.service';
import { LoginRequiredService } from '../services/login-required.service';

import { ViewerComponent } from './verifier/viewer/viewer.component';
import { ListComponent } from './verifier/list/list.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from "./not-found/not-found.component";
import { RegisterComponent } from "./register/register.component";
import { ProfileComponent } from "./profile/profile.component";


const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent , data: { title: 'GLOBAL.home', image: 'assets/imgs/open-capture.png' }, canActivate: [LoginRequiredService]},
  {path: 'login', component: LoginComponent , data: { title: 'GLOBAL.login', image: 'assets/imgs/open-capture.png' }, canActivate: [LoginRedirectService]},
  {path: 'register', component: RegisterComponent , data: { title: 'GLOBAL.register', image: 'assets/imgs/open-capture.png' }, canActivate: [LoginRedirectService]},
  {path: 'logout', component: LogoutComponent , canActivate: [LoginRequiredService]},
  {path: 'profile/:id', component: ProfileComponent, canActivate: [LoginRequiredService]},

  {path: 'verifier/viewer', component: ViewerComponent , data: { title: 'VERIFIER.viewer', image: 'assets/imgs/open-capture_verifier.png' }, canActivate: [LoginRequiredService]},
  {path: 'verifier/list', component: ListComponent , data: { title: 'VERIFIER.list', image: 'assets/imgs/open-capture_verifier.png' }, canActivate: [LoginRequiredService]},
  {path: 'verifier', redirectTo: 'verifier/list', pathMatch: 'full'},

  {path: '404', component: NotFoundComponent}, // This two routes (** and 404) need to be the last of const routes: Routes variable
  {path: '**', redirectTo: '404'}, // if routes doesn't exists, redirect to 404, display a popup and then redirect to login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {}
