import {Component, OnInit} from '@angular/core';
import {ApiInterfaceService} from "../providers/api-interface.service";
import {AngularFireDatabase} from "angularfire2/database";
import {Observable} from "rxjs";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    // TODO: Remove once an actual API call is being made
    apiTestMessage: string = null;
    // TODO: Remove once an actual database call is being made
    firebaseTestObject: Observable<any>;

    constructor(
        private apiInterfaceService: ApiInterfaceService,
        private db: AngularFireDatabase,
    ) {
    }

    ngOnInit(): void {
        // TODO: Remove once an actual API call is being made
        this.testApi();

        // TODO: Remove once an actual database call is being made
        let testObject = this.db.object('test');
        this.firebaseTestObject = testObject.valueChanges();
        testObject.set('Database connection works! - last successful write at ' + (new Date()).toLocaleString());
    }

    // TODO: Remove once an actual API call is being made
    testApi(): void {
        const component: HomeComponent = this;
        component.apiInterfaceService.testApi(function (result) {
            component.apiTestMessage = result;
        });
    }
}
