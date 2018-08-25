import {Component, OnInit} from '@angular/core';
import {User} from 'firebase';
import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-create-template',
    templateUrl: './create-template.component.html',
    styleUrls: ['./create-template.component.css']
})
export class CreateTemplateComponent implements OnInit {

    user: User = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
    }

    ngOnInit() {
        const component = this;
        component.authService.onAuthStateChanged(function (auth) {
            if (auth === null) { // If the user is logged out
                component.router.navigate(['login']);
            } else {
                component.user = component.authService.getAuth().currentUser;
            }
        });
    }

    createTemplate() {
        // TODO: Implement
        console.log('TODO: Upload template');
    }

    goHome() {
        this.router.navigate(['']);
    }

    logout(): void {
        this.authService.logout(null);
    }
}
