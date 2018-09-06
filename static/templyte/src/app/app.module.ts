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
import {MatButtonModule, MatCardModule, MatDialogModule} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {UploadService} from './upload/upload.service';
import {InputValidateDialogComponent} from './input-validate-dialog/input-validate-dialog.component';
import {UploadSuccessDialogComponent} from './upload-success-dialog/upload-success-dialog.component';

const routes: Routes = [
    {path: '', component: HomeComponent, pathMatch: 'full'},
    {path: 'login', component: LoginComponent, pathMatch: 'full'},
    {path: 'create', component: CreateTemplateComponent, pathMatch: 'full'},
    {path: '**', redirectTo: '', pathMatch: 'full'} // Redirect everything else to the home page
];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        CreateTemplateComponent,
        InputValidateDialogComponent,
        UploadSuccessDialogComponent
    ],
    imports: [
        AngularFireModule.initializeApp(config),
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        RouterModule.forRoot(routes),
        FormsModule
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
