import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppMaterialModule } from './app-material.module';
import { ServicesModule } from '../services/services.module';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { DragDropModule } from "@angular/cdk/drag-drop";

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { HttpClient} from "@angular/common/http";
import { HttpClientModule } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from './app-routing.module';
import { SettingsRoutingModule } from './settings/settings-routing.module';
import { AppComponent } from './app.component';
import { VerifierViewerComponent } from './verifier/viewer/viewer.component';
import { VerifierListComponent } from './verifier/list/list.component';
import { SplitterViewerComponent } from './splitter/viewer/viewer.component';
import { SplitterListComponent } from './splitter/list/list.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from "./logout/logout.component";
import { HomeComponent } from './home/home.component';
import { MenuComponent } from './menu/menu.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UserProfileComponent } from './profile/profile.component';
import { UploadComponent } from './upload/upload.component';
import { NgxFileDragDropModule } from "ngx-file-drag-drop";
import { UsersListComponent} from './settings/general/users/list/users-list.component';
import { SettingsComponent } from './settings/settings.component';
import { MatPaginatorIntl } from "@angular/material/paginator";
import { CustomMatPaginatorIntl } from "./custom-mat-paginator";
import { LastUrlService } from "../services/last-url.service";
import { AboutUsComponent } from './settings/general/about-us/about-us.component';
import { VersionUpdateComponent } from './settings/general/version-update/version-update.component';
import { CreateUserComponent } from './settings/general/users/create/create-user.component';
import { UpdateUserComponent } from './settings/general/users/update/update-user.component';
import { RolesListComponent } from './settings/general/roles/list/roles-list.component';
import { UpdateRoleComponent } from './settings/general/roles/update/update-role.component';
import { CreateRoleComponent } from './settings/general/roles/create/create-role.component';
import { LoaderComponent } from './loader.component';
import { CustomFieldsComponent } from './settings/general/custom-fields/custom-fields.component';
import { FormBuilderComponent } from './settings/verifier/form-builder/form-builder.component';

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
    NotFoundComponent,
    UserProfileComponent,
    UploadComponent,
    UsersListComponent,
    SettingsComponent,
    AboutUsComponent,
    VersionUpdateComponent,
    RolesListComponent,
    CreateUserComponent,
    UpdateUserComponent,
    UpdateRoleComponent,
    CreateRoleComponent,
    LoaderComponent,
    CustomFieldsComponent,
    FormBuilderComponent
  ],
    imports: [
        BrowserModule,
        SettingsRoutingModule,
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
        DragDropModule,
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
