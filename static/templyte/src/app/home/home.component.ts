import {Component, OnInit} from '@angular/core';
import {ApiInterfaceService} from '../providers/api-interface.service';
import {AngularFireDatabase} from 'angularfire2/database';
import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';
import {User} from 'firebase';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    user: User = null;

    constructor(
        private apiInterfaceService: ApiInterfaceService,
        private authService: AuthService,
        private db: AngularFireDatabase,
        private router: Router
    ) {
    }

    ngOnInit(): void {
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
        this.router.navigate(['create']);
    }

    myTemplates() {
        this.router.navigate(['my-templates']);
    }

    // Ashwini -- Adding the routing redirect to Download Templates from this component when user clicks the menu option in the top nav bar
    downloadTemplate() {
        this.router.navigate(['download']);
    }

    logout(): void {
        this.authService.logout(null);
    }
}
