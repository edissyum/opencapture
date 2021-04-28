import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppMaterialModule } from './app-material.module';
import { ServicesModule } from '../services/services.module';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { HttpClient} from "@angular/common/http";
import { HttpClientModule } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VerifierViewerComponent } from './verifier/viewer/viewer.component';
import { VerifierListComponent } from './verifier/list/list.component';
import { SplitterViewerComponent } from './splitter/viewer/viewer.component';
import { SplitterListComponent } from './splitter/list/list.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from "./logout/logout.component";
import { HomeComponent } from './home/home.component';
import { MenuComponent } from './menu/menu.component';
import { RegisterComponent } from './register/register.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UserProfileComponent } from './profile/profile.component';
import { UploadComponent } from './upload/upload.component';
import { NgxFileDragDropModule } from "ngx-file-drag-drop";
import { UserListComponent } from './settings/users/list/list.component';
import { PanelComponent } from './settings/panel/panel.component';
import { MatPaginatorIntl } from "@angular/material/paginator";
import { CustomMatPaginatorIntl } from "./custom-mat-paginator";
import { LastUrlService } from "../services/last-url.service";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/frontend/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    VerifierViewerComponent,
    VerifierListComponent,
    SplitterListComponent,
    SplitterViewerComponent,
    LoginComponent,
    LogoutComponent,
    HomeComponent,
    MenuComponent,
    RegisterComponent,
    NotFoundComponent,
    UserProfileComponent,
    UploadComponent,
    UserListComponent,
    PanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppMaterialModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ServicesModule,
    TranslateModule.forRoot({
      defaultLanguage: 'fra',
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    ReactiveFormsModule,
    FormsModule,
    NgxFileDragDropModule,
  ],
  providers: [
    Title,
    TranslateService,
    LastUrlService,
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    {
      provide: MatPaginatorIntl,
      useClass: CustomMatPaginatorIntl
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
      private routerExtService: LastUrlService,
  ){}
}
