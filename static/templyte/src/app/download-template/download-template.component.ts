import {AuthService} from '../providers/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from 'firebase';
import {Component, NgZone, OnInit} from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from 'angularfire2/database';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AngularFireStorage, AngularFireStorageReference} from 'angularfire2/storage';

@Component({
    selector: 'download-template',
    templateUrl: './download-template.component.html',
    styleUrls: ['./download-template.component.css']
})
export class DownloadTemplateComponent implements OnInit {
    user: User = null;
    valueMap: Object = {};
    templateDirectoryInfoRef: AngularFireObject<any>;
    templateRenderInfoRef: AngularFireObject<any>;
    templateRenderInfo: Observable<any> = null;
    templateDirectoryInfo: Observable<any> = null;
    templateVariableNameList: Object = null;
    templateRenderInfoStorageRef: AngularFireStorageReference;


    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private str: AngularFireStorage,
        private ngZone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
    ) {
    }

    ngOnInit() {
        const component = this;
        component.authService.onAuthStateChanged(function (auth) {
            if (auth === null) { // If the user is logged out
                component.router.navigate(['login']);
            } else {
                component.user = component.authService.getAuth().currentUser;
                component.route.params.subscribe(params => {
                    component.ngZone.run(() => { // Need to do this using NgZone since we're calling a third party API
                        console.log('template-directory/' + params.id);
                        // let metadataIsValid = true;
                        component.templateDirectoryInfoRef = component.db.object('template-directory/' + params.id);
                        component.templateRenderInfoRef = component.db.object('template-render-info/' + params.id);
                        component.templateDirectoryInfo = component.templateDirectoryInfoRef.valueChanges();
                        component.templateRenderInfo = component.templateRenderInfoRef.valueChanges();
                        component.templateDirectoryInfoRef.valueChanges().subscribe((response) => {
                            // component.templateDirectoryInfo = response;
                            // metadataIsValid = false;
                        });
                        component.templateRenderInfoRef.valueChanges().subscribe((response) => {
                            // component.templateRenderInfo = response;
                            // metadataIsValid = false;
                        });
                        component.templateVariableNameList = component.db.object('template-render-info/' + params.id + '/variables')
                            .valueChanges();
                        component.templateRenderInfoStorageRef = component.str.ref('uploads/users/')
                        // .subscribe((response) => {
                        //     component.templateVariableNameList = response;
                        //     if (!component.templateVariableNameList || !metadataIsValid) {
                        //         component.router.navigate(['home']);
                        //     }
                        // });
                    });
                });
            }
        });
    }

    goHome() {
        this.router.navigate(['']);
    }

    logout(): void {
        this.authService.logout(null);
    }

    downloadTemplate() {
        const component = this;
        component.validateEnteredVariables();
        component.templateRenderInfoRef.snapshotChanges().subscribe(data => {
            // console.log(data.payload.val().templateArchiveUrl);
            const fileEndings = data.payload.val().fileEndings;
            let targetUrl = null;
            component.templateRenderInfoStorageRef.getDownloadURL().subscribe(url => targetUrl = url);
            for (let i = 0; i < data.payload.val().fileEndings.length; i++) {
                fileEndings[i] = fileEndings[i].name;
            }
            // console.log(component.templateRenderInfoStorageRef.getDownloadURL());
            const request = encodeURIComponent(JSON.stringify({
                'variables': component.valueMap,
                'fileEndings': fileEndings,
                'url': targetUrl
            }));
            console.log('Sending request: ', request);
            const options = {responseType: 'blob' as 'blob'};
            component.http.get('http://localhost:3000/api/download-template?request=' + request, options)
                .subscribe(downloadedData => {
                    const url = window.URL.createObjectURL(downloadedData);
                    window.open(url);
                }, (error => {
                    console.log('Error connecting to API: ' + JSON.stringify(data) + ' ' + error.message);
                }));
        });

    }

    createTemplate() {
        this.router.navigate(['create']);
    }

    myTemplates() {
        this.router.navigate(['my-templates']);
    }

    validateEnteredVariables() {
        const component = this;
        Object.keys(component.valueMap).forEach(function (variable) {
            if (!component.valueMap[variable]) {
                component.valueMap[variable] = '';
            }
        });
    }
}
