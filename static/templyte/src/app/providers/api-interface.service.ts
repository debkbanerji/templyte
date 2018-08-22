import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiInterfaceService {

    private readonly API_ADDRESS: string;

    constructor(
        private http: HttpClient
    ) {
        this.API_ADDRESS = environment.production
            ? '/api' :
            'http://localhost:3000/api'; // Expect a development server to be running if running in prod mode
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
