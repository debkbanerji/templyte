import {AuthService} from '../providers/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from 'firebase';
import {Component, NgZone, OnInit} from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from 'angularfire2/database';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiInterfaceService} from '../providers/api-interface.service';


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


    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private ngZone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private api: ApiInterfaceService,
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
                        component.templateDirectoryInfoRef = component.db.object('template-directory/' + params.id);
                        component.templateRenderInfoRef = component.db.object('template-render-info/' + params.id);
                        component.templateDirectoryInfo = component.templateDirectoryInfoRef.valueChanges();
                        component.templateRenderInfo = component.templateRenderInfoRef.valueChanges();

                        component.templateRenderInfo.subscribe((response) => {
                            if (response == null) {
                                component.router.navigate(['home']);
                            }
                        });
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
            const payload_val = data.payload.val();
            const fileEndings = payload_val.fileEndings;
            for (let i = 0; i < payload_val.fileEndings.length; i++) {
                fileEndings[i] = fileEndings[i].name;
            }
            const request = encodeURIComponent(JSON.stringify({
                'variables': component.valueMap,
                'fileEndings': fileEndings,
                'url': encodeURI(payload_val.templateArchiveUrl)
            }));
            console.log('Sending request: ', request);
            const options = {responseType: 'blob' as 'blob'};
            const linkElement = document.createElement('a');
            component.http.get('http://localhost:3000/api/download-template?request=' + request, options)
                .subscribe(downloadedData => {
                    const url = window.URL.createObjectURL(downloadedData);
                    linkElement.setAttribute('href', url);
                    linkElement.setAttribute('download', 'rawTemplate');
                    const clickEvent = new MouseEvent('click', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': false
                    });
                    linkElement.dispatchEvent(clickEvent);

            component.api.getZipFile(request, function(downloadedData) {
                var linkElement = document.createElement('a');
                const url= window.URL.createObjectURL(downloadedData);
                linkElement.setAttribute('href', url);
                linkElement.setAttribute("download", 'rawTemplate');
                var clickEvent = new MouseEvent("click", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": false
                });
                linkElement.dispatchEvent(clickEvent);
            });

        });

    })}

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
