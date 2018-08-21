import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {RouterModule, Routes} from "@angular/router";
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
    {path: '', component: HomeComponent, pathMatch: 'full'},
    {path: 'login', component: LoginComponent, pathMatch: 'full'},
    {path: '**', redirectTo: '', pathMatch: 'full'} // Redirect everything else to the home page
];

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        RouterModule.forRoot(routes)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
