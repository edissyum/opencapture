import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { LoginRedirectService } from '../services/login-redirect.service';
import { LoginRequiredService } from '../services/login-required.service';

import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from "./not-found/not-found.component";
import { RegisterComponent } from "./register/register.component";
import { ProfileComponent } from "./profile/profile.component";
import { SplitterViewerComponent } from "./splitter/viewer/viewer.component";
import { SplitterListComponent } from "./splitter/list/list.component";
import { VerifierViewerComponent } from './verifier/viewer/viewer.component';
import { VerifierListComponent } from './verifier/list/list.component';
import { UploadComponent } from "./upload/upload.component";

const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent , data: { title: marker('GLOBAL.home'), image: 'assets/imgs/open-capture.png' }, canActivate: [LoginRequiredService]},
  {path: 'login', component: LoginComponent , data: { title: marker('GLOBAL.login'), image: 'assets/imgs/open-capture.png' }, canActivate: [LoginRedirectService]},
  {path: 'register', component: RegisterComponent , data: { title: marker('GLOBAL.register'), image: 'assets/imgs/open-capture.png' }, canActivate: [LoginRedirectService]},
  {path: 'logout', component: LogoutComponent , canActivate: [LoginRequiredService]},
  {path: 'profile/:id', component: ProfileComponent, canActivate: [LoginRequiredService]},

  {path: 'splitter/viewer', component: SplitterViewerComponent , data: { title: marker('SPLITTER.viewer'), image: 'assets/imgs/Open-Capture_Splitter.png' }, canActivate: [LoginRequiredService]},
  {path: 'splitter/list', component: SplitterListComponent , data: { title: marker('SPLITTER.list'), image: 'assets/imgs/Open-Capture_Splitter.png' }, canActivate: [LoginRequiredService]},
  {path: 'splitter', redirectTo: 'splitter/list', pathMatch: 'full'},

  {path: 'verifier/viewer', component: VerifierViewerComponent , data: { title: marker('VERIFIER.viewer'), image: 'assets/imgs/open-capture_verifier.png' }, canActivate: [LoginRequiredService]},
  {path: 'verifier/list', component: VerifierListComponent , data: { title: marker('VERIFIER.list'), image: 'assets/imgs/open-capture_verifier.png' }, canActivate: [LoginRequiredService]},
  {path: 'verifier', redirectTo: 'verifier/list', pathMatch: 'full'},

  {path: 'upload', component: UploadComponent, data: { title: marker('GLOBAL.upload'), image: 'assets/imgs/open-capture_verifier.png' }, canActivate: [LoginRequiredService]},

  {path: '404', component: NotFoundComponent}, // This two routes (** and 404) need to be the last of const routes: Routes variable
  {path: '**', redirectTo: '404'}, // if routes doesn't exists, redirect to 404, display a popup and then redirect to login
];

@NgModule({
  imports: [
      RouterModule.forRoot(routes, {useHash: true})
  ],
  exports: [RouterModule]
})

export class AppRoutingModule {}
