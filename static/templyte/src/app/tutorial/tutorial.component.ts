import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';
import {User} from 'firebase';
import {ApiInterfaceService} from '../providers/api-interface.service';
import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-tutorial',
    templateUrl: './tutorial.component.html',
    styleUrls: ['./tutorial.component.css']
})

export class TutorialComponent implements OnInit {
    user: User = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
    }

    ngOnInit(): void {

    }

    createTemplate() {
        this.router.navigate(['create']);
    }

    myTemplates() {
        this.router.navigate(['my-templates']);
    }

    goHome() {
        this.router.navigate(['']);
    }

    logout(): void {
        const component = this;
        component.authService.onAuthStateChanged(function (auth) {
            if (auth === null) { // If the user is logged out
                component.router.navigate(['login']);
            } else {
                component.user = component.authService.getAuth().currentUser;
                this.authService.logout(null);
            }
        });
    }
}
