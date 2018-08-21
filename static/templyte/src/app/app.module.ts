import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {ApiInterfaceService} from "./providers/api-interface.service";
import {HttpClientModule} from "@angular/common/http";

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
        BrowserModule,
        HttpClientModule,
        RouterModule.forRoot(routes)
    ],
    providers: [
        ApiInterfaceService
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
