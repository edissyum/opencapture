/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan Cheval <nathan.cheval@outlook.fr>
 @dev : Oussama BRICH <oussama.brich@edissyum.com> */

import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppMaterialModule } from './app-material.module';
import { ServicesModule } from '../services/services.module';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { EditorModule } from '@tinymce/tinymce-angular';

import { AppRoutingModule } from './app-routing.module';
import { SettingsRoutingModule } from './settings/settings-routing.module';
import { AppComponent } from './app.component';
import { VerifierViewerComponent } from './verifier/viewer/verifier-viewer.component';
import { VerifierListComponent } from './verifier/list/verifier-list.component';
import { SplitterViewerComponent } from './splitter/viewer/splitter-viewer.component';
import { SplitterListComponent } from './splitter/list/splitter-list.component';

import { FilterPipe } from '../services/pipes/filter.pipe';
import { NgxFileDragDropComponent } from 'ngx-file-drag-drop';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgsgModule } from 'ng-sortgrid';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { DocumentTypeFactoryComponent } from './splitter/document-type-factory/document-type-factory.component';
import { DocumentTypeComponent } from './splitter/document-type/document-type.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { HomeComponent } from './home/home.component';
import { MenuComponent } from './menu/menu.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { UserProfileComponent } from './profile/profile.component';
import { UploadComponent } from './upload/upload.component';
import { UsersListComponent } from './settings/general/users/list/users-list.component';
import { SettingsComponent } from './settings/settings.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorIntl } from './custom-mat-paginator';
import { LastUrlService } from '../services/last-url.service';
import { AboutUsComponent } from './settings/general/about-us/about-us.component';
import { CreateUserComponent } from './settings/general/users/create/create-user.component';
import { UpdateUserComponent } from './settings/general/users/update/update-user.component';
import { RolesListComponent } from './settings/general/roles/list/roles-list.component';
import { UpdateRoleComponent } from './settings/general/roles/update/update-role.component';
import { CreateRoleComponent } from './settings/general/roles/create/create-role.component';
import { LoginMethodsComponent } from './settings/general/login-methods/login-methods.component';
import { LoaderComponent } from './loader.component';
import { CustomFieldsComponent } from './settings/general/custom-fields/custom-fields.component';
import { FormsListComponent } from './settings/verifier/forms/list/forms-list.component';
import { FormBuilderComponent } from './settings/verifier/forms/builder/form-builder.component';
import { SuppliersListComponent } from './accounts/suppliers/list/suppliers-list.component';
import { UpdateSupplierComponent } from './accounts/suppliers/update/update-supplier.component';
import { UpdateSupplierModaleComponent } from "./accounts/suppliers/update/update-supplier-modale.component";
import { CreateSupplierComponent } from './accounts/suppliers/create/create-supplier.component';
import { CreateSupplierModaleComponent } from './accounts/suppliers/create/create-supplier-modale.component';
import { CustomersListComponent } from './accounts/customers/list/customers-list.component';
import { UpdateCustomerComponent } from './accounts/customers/update/update-customer.component';
import { CreateCustomerComponent } from './accounts/customers/create/create-customer.component';
import { CreateOutputComponent } from './settings/verifier/outputs/create/create-output.component';
import { OutputsListComponent } from './settings/verifier/outputs/list/outputs-list.component';
import { HighlightPipe, UpdateOutputComponent } from './settings/verifier/outputs/update/update-output.component';
import { UpdatePositionsMaskComponent } from './settings/verifier/positions-mask/update/update-positions-mask.component';
import { PositionsMaskListComponent } from './settings/verifier/positions-mask/list/positions-mask-list.component';
import { CreatePositionsMaskComponent } from './settings/verifier/positions-mask/create/create-positions-mask.component';
import { VerifierStatusUpdateComponent } from './settings/verifier/update-status/update-status.component';
import { HistoryComponent } from './history/history.component';
import { SeparatorComponent } from './settings/splitter/separator/separator.component';
import { SplitterUpdateOutputComponent } from './settings/splitter/outputs/update/update-output.component';
import { SplitterCreateOutputComponent } from './settings/splitter/outputs/create/create-output.component';
import { SplitterOutputListComponent } from './settings/splitter/outputs/list/outputs-list.component';
import { SplitterFormBuilderComponent } from './settings/splitter/forms/builder/form-builder.component';
import { SplitterUpdateStatusComponent } from './settings/splitter/update-status/update-status.component';
import { SplitterFormsListComponent } from './settings/splitter/forms/list/forms-list.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { CreateDoctypeComponent } from './settings/splitter/doctypes/create/create-doctype.component';
import { ListDoctypeComponent } from './settings/splitter/doctypes/list/list-doctype.component';
import { CreateFolderDoctypeComponent } from './settings/splitter/doctypes/create-folder/create-folder-doctype.component';
import { ListVerifierAiModelComponent } from "./settings/verifier/ai-models/list/list-ai-models.component";
import { CreateVerifierAiModelComponent } from "./settings/verifier/ai-models/create/create-ai-model.component";
import { UpdateVerifierAiModelComponent } from "./settings/verifier/ai-models/update/update-ai-model.component";
import { ListSplitterAiModelsComponent } from "./settings/splitter/ai-models/list/list-ai-models.component";
import { CreateSplitterAiModelComponent } from "./settings/splitter/ai-models/create/create-ai-model.component";
import { UpdateSplitterAiModelComponent } from "./settings/splitter/ai-models/update/update-ai-model.component";
import { ConfigurationsComponent } from './settings/general/configurations/configurations.component';
import { DocserversComponent } from './settings/general/docservers/docservers.component';
import { RegexComponent } from './settings/general/regex/regex.component';
import { HintServiceComponent } from "../services/hint/hint.service";
import { ErrorServiceComponent } from "../services/error/error.service";
import { Error500Component } from './errors/error-500/error-500.component';
import { MatSelectCountryModule } from "@angular-material-extensions/select-country";
import { MiddlewareComponent } from "./middleware.component";
import { VariousSettingsVerifierComponent } from './settings/verifier/various-settings/various-settings.component';
import { MailCollectComponent } from './settings/general/mailcollect/mailcollect.component';
import { UserQuotaComponent } from './settings/general/user-quota/user-quota.component';
import { SettingsMenuComponent } from './settings/settings-menu.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { MonitoringListComponent } from './monitoring/list/monitoring-list.component';
import { MonitoringDetailsComponent } from './monitoring/details/monitoring-details.component';
import { WorkflowsListComponent } from './settings/verifier/workflows/list/workflows-list.component';
import { WorkflowBuilderComponent } from './settings/verifier/workflows/builder/workflow-builder.component';
import { WorkflowsListSplitterComponent } from './settings/splitter/workflows/list/workflows-list.component';
import { WorkflowBuilderSplitterComponent } from './settings/splitter/workflows/builder/workflow-builder.component';
import { TimeoutInterceptor } from "../services/HttpTimeout.service";
import { CodeEditorModule } from '@ngstack/code-editor';
import { OverlayModule } from '@angular/cdk/overlay';
import { AttachmentListComponent } from "./attachment-list/attachment-list.component";
import { FileViewerComponent } from "./file-viewer/file-viewer.component";

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/frontend/', '.json');
}

@NgModule({
    declarations: [
        HighlightPipe,
        AppComponent,
        VerifierViewerComponent,
        VerifierListComponent,
        SplitterListComponent,
        SplitterViewerComponent,
        DocumentTypeFactoryComponent,
        DocumentTypeComponent,
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
        RolesListComponent,
        CreateUserComponent,
        UpdateUserComponent,
        UpdateRoleComponent,
        CreateRoleComponent,
        LoaderComponent,
        CustomFieldsComponent,
        SeparatorComponent,
        FormBuilderComponent,
        FormsListComponent,
        SuppliersListComponent,
        UpdateSupplierComponent,
        UpdateSupplierModaleComponent,
        CreateSupplierComponent,
        CreateSupplierModaleComponent,
        CustomersListComponent,
        CreateCustomerComponent,
        UpdateCustomerComponent,
        CreateOutputComponent,
        OutputsListComponent,
        UpdateOutputComponent,
        UpdatePositionsMaskComponent,
        PositionsMaskListComponent,
        CreatePositionsMaskComponent,
        FilterPipe,
        SplitterFormsListComponent,
        SplitterFormBuilderComponent,
        SplitterUpdateOutputComponent,
        SplitterCreateOutputComponent,
        SplitterOutputListComponent,
        ListVerifierAiModelComponent,
        CreateVerifierAiModelComponent,
        UpdateVerifierAiModelComponent,
        ListSplitterAiModelsComponent,
        CreateSplitterAiModelComponent,
        UpdateSplitterAiModelComponent,
        HistoryComponent,
        StatisticsComponent,
        CreateDoctypeComponent,
        ListDoctypeComponent,
        CreateFolderDoctypeComponent,
        ConfigurationsComponent,
        DocserversComponent,
        RegexComponent,
        HintServiceComponent,
        ErrorServiceComponent,
        Error500Component,
        LoginMethodsComponent,
        VariousSettingsVerifierComponent,
        MailCollectComponent,
        UserQuotaComponent,
        SettingsMenuComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        MonitoringListComponent,
        MonitoringDetailsComponent,
        SplitterUpdateStatusComponent,
        VerifierStatusUpdateComponent,
        WorkflowsListComponent,
        WorkflowBuilderComponent,
        WorkflowsListSplitterComponent,
        WorkflowBuilderSplitterComponent,
        AttachmentListComponent,
        FileViewerComponent
    ],
    imports: [
        BrowserModule,
        SettingsRoutingModule,
        AppRoutingModule,
        AppMaterialModule,
        BrowserAnimationsModule,
        HttpClientModule,
        EditorModule,
        ServicesModule,
        NgsgModule,
        NgxChartsModule,
        PdfViewerModule,
        CodeEditorModule.forRoot({
            baseUrl: 'monaco/'
        }),
        ToastrModule.forRoot({
            maxOpened: 1,
            enableHtml: true,
            preventDuplicates: true
        }),
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
        NgxFileDragDropComponent,
        DragDropModule,
        NgxMatSelectSearchModule,
        MatSelectCountryModule.forRoot('fr'),
        TranslateModule,
        OverlayModule
    ],
    providers: [
        Title,
        LastUrlService,
        TranslateService,
        HintServiceComponent,
        ErrorServiceComponent,
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'outline'
            }
        },
        {
            provide: MatPaginatorIntl,
            useClass: CustomMatPaginatorIntl
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: MiddlewareComponent,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TimeoutInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
