import {Component, NgZone, OnInit} from '@angular/core';
import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    constructor(
        private authService: AuthService,
        private ngZone: NgZone,
        private router: Router) {
    }

    ngOnInit() {
        const component = this;
        component.authService.onAuthStateChanged(function (auth) {
            if (auth !== null) {
                component.goHome();
            }
        });
    }

    login(): void {
        const component = this;
        component.authService.login(function () {
            component.goHome();
        });
    }

    tutorial() {
        this.router.navigate(['tutorial']);
    }

    goHome() {
        const component = this;
        component.ngZone.run(() => { // Need to do this using NgZone since we're calling a third party API
            component.router.navigate(['']);
        });
    }
}
