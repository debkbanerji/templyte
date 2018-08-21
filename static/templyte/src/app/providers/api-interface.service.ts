import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class ApiInterfaceService {

    private API_ADDRESS = '/api';

    constructor(
        private http: HttpClient
    ) {
    }

    // TODO: Remove once an actual API call is being made
    testApi(callback): void {
        const targetAddress = this.API_ADDRESS + '/test-api';
        this.http.get(targetAddress).subscribe((response: any) => {
            callback(response.message);
        }, (error => {
            callback('Error connecting to API: ' + error.message);
        }));
    }
}
