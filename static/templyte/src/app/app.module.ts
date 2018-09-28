import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {config} from './config/firebase-config';
import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {ApiInterfaceService} from './providers/api-interface.service';
import {HttpClientModule} from '@angular/common/http';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {CreateTemplateComponent} from './create-template/create-template.component';
import {AngularFireStorage} from 'angularfire2/storage';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatCardModule, MatDialogModule, MatInputModule} from '@angular/material';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FormsModule} from '@angular/forms';
import {UploadService} from './upload/upload.service';
import {InputValidateDialogComponent} from './input-validate-dialog/input-validate-dialog.component';
import {UploadSuccessDialogComponent} from './upload-success-dialog/upload-success-dialog.component';
import {MyTemplatesComponent} from './my-templates/my-templates.component';
import {MatChipsModule} from '@angular/material/chips';
import {MatSelectModule} from '@angular/material/select';
import {DownloadTemplateComponent} from './download-template/download-template.component';

const routes: Routes = [
    {path: '', component: HomeComponent, pathMatch: 'full'},
    {path: 'login', component: LoginComponent, pathMatch: 'full'},
    {path: 'create', component: CreateTemplateComponent, pathMatch: 'full'},
    {path: 'download-template/:id', component: DownloadTemplateComponent, pathMatch: 'full'},
    {path: 'my-templates', component: MyTemplatesComponent, pathMatch: 'full'},
    {path: '**', redirectTo: '', pathMatch: 'full'} // Redirect everything else to the home page
];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        CreateTemplateComponent,
        DownloadTemplateComponent,
        InputValidateDialogComponent,
        UploadSuccessDialogComponent,
        MyTemplatesComponent
    ],
    imports: [
        AngularFireModule.initializeApp(config),
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatToolbarModule,
        MatInputModule,
        MatSelectModule,
        RouterModule.forRoot(routes),
        FormsModule,
        MatChipsModule
    ],
    entryComponents: [
        InputValidateDialogComponent,
        UploadSuccessDialogComponent
    ],
    providers: [
        AngularFireAuth,
        AngularFireDatabase,
        AngularFireStorage,
        ApiInterfaceService,
        UploadService
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
