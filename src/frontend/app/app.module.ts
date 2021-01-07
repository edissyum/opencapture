import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppMaterialModule } from './app-material.module';
import { ServicesModule } from '../services/services.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ViewerComponent } from './verifier/viewer/viewer.component';
import { ListComponent } from './verifier/list/list.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from "./logout/logout.component";
import { HomeComponent } from './home/home.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { HttpClient} from "@angular/common/http";
import { HttpClientModule } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { MenuComponent } from './menu/menu.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    ViewerComponent,
    ListComponent,
    LoginComponent,
    LogoutComponent,
    HomeComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppMaterialModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ServicesModule,
    TranslateModule.forRoot({
      defaultLanguage: 'fr_FR',
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    Title,
    TranslateService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
