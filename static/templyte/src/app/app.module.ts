import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {config} from './config/firebase-config';
import {AppComponent} from './app.component';
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {ApiInterfaceService} from "./providers/api-interface.service";
import {HttpClientModule} from "@angular/common/http";
import {AngularFireModule} from "angularfire2";
import {AngularFireDatabase} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

const routes: Routes = [
    {path: '', component: HomeComponent, pathMatch: 'full'},
    {path: 'login', component: LoginComponent, pathMatch: 'full'},
    {path: '**', redirectTo: '', pathMatch: 'full'} // Redirect everything else to the home page
];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent
    ],
    imports: [
        AngularFireModule.initializeApp(config),
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot(routes),
        BrowserAnimationsModule,
    ],
    providers: [
        AngularFireAuth,
        AngularFireDatabase,
        ApiInterfaceService
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
