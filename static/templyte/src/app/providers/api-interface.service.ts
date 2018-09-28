import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
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

    getZipFile(request: string, callback): void {
        const targetAddress = this.API_ADDRESS + '/download-template';

        const options = {responseType: 'blob' as 'blob'};
        this.http.get(targetAddress + '?request=' + request, options)
            .subscribe(downloadedData => {
                callback(downloadedData);

            }, (error => {
                callback('Error connecting to API: ' + error.message);
            }));
    }
}
