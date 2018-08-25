import {Component, OnInit} from '@angular/core';
import {ApiInterfaceService} from '../providers/api-interface.service';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs';
import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';
import {User} from 'firebase';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    // TODO: Remove once an actual API call is being made
    apiTestMessage = 'API connection not established';
    // TODO: Remove once an actual database call is being made
    firebaseTestObject: Observable<any>;

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


        // TODO: Remove once an actual API call is being made
        component.testApi();

        // TODO: Remove once an actual database call is being made
        const testObject = this.db.object('test');
        component.firebaseTestObject = testObject.valueChanges();

        component.authService.onAuthStateChanged(function (auth) {
            if (auth === null) { // If the user is logged out
                component.router.navigate(['login']);
            } else {
                component.user = component.authService.getAuth().currentUser;

                // TODO: Remove once an actual database call is being made
                testObject.set('Database connection works! - last successful write at ' + (new Date()).toLocaleString() + ' by ' + component.user.displayName);
            }
        });

    }

    // TODO: Remove once an actual API call is being made
    testApi(): void {
        const component: HomeComponent = this;
        component.apiInterfaceService.testApi(function (result) {
            component.apiTestMessage = result;
        });
    }

    createTemplate() {
        this.router.navigate(['create']);
    }

    logout(): void {
        this.authService.logout(null);
    }
}
