import {Component, OnInit} from '@angular/core';
import {ApiInterfaceService} from "../providers/api-interface.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    apiTestMessage: string = null;

    constructor(
        private apiInterfaceService: ApiInterfaceService
    ) {
    }

    ngOnInit(): void {
        this.testApi();
    }

    // TODO: Remove once an actual API call is being made
    testApi(): void {
        const component: HomeComponent = this;
        component.apiInterfaceService.testApi(function (result) {
            component.apiTestMessage = result;
        });
    }
}
