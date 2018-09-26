import {AuthService} from '../providers/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from 'firebase';
import {Component, NgZone, OnInit} from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from 'angularfire2/database';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import { FileSaver } from 'file-saver';

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
    renderInfo : Object = null;
    templateVariableNameList: Object = null;



    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private ngZone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private dialog: MatDialog
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
                        let metadataIsValid = true;
                        component.templateDirectoryInfoRef = component.db.object('template-directory/' + params.id);
                        component.templateRenderInfoRef = component.db.object('template-render-info/' + params.id);
                        component.templateDirectoryInfoRef.valueChanges().subscribe((response) => {
                            component.templateDirectoryInfo = response;
                            metadataIsValid = false;
                        });
                        component.templateRenderInfoRef.valueChanges().subscribe((response) => {
                            component.templateRenderInfo = response;
                            metadataIsValid = false;
                        });
                        component.templateVariableNameList = component.db.object('template-render-info/' + params.id + '/variables')
                            .valueChanges().subscribe((response) => {
                                component.templateVariableNameList = response;
                                if (!component.templateVariableNameList || !metadataIsValid) {
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
        this.validateEnteredVariables();
        const component = this;
        this.templateRenderInfoRef.snapshotChanges().subscribe(data => {
            console.log(data.payload.val());
            let fileEndings =  data.payload.val().fileEndings;
            for (let i = 0; i < data.payload.val().fileEndings.length; i++) {
                fileEndings[i] = fileEndings[i].name;
            }
            console.log(fileEndings);
            let request = encodeURIComponent(JSON.stringify({
                'variables' : this.valueMap,
                'fileEndings' : fileEndings,
                'url' : data.payload.val().templateArchiveUrl
            }))
            console.log(request);
            component.http.get<any>('http://localhost:3000/api/download-template?request=' + request)
                .subscribe(data => console.log('downloading'), (error => {
                    console.log('Error connecting to API: ' + JSON.stringify(data) + " " + error.message);
                }));
        });

    }

    createTemplate() {
        this.router.navigate(['create']);
    }

    myTemplates() {
        this.router.navigate(['my-templates']);
    }

    //Checks to make sure none of the entered values are null, and if they are change the value in the valueMap to an empty string
    validateEnteredVariables() {
        let keys = Object.keys(this.valueMap);
        let myValueMap = this.valueMap as Map<any, any>;
        for (var variable in this.templateVariableNameList) {
            if (!keys.includes(this.templateVariableNameList[variable].name)) {
                myValueMap.set(this.templateVariableNameList[variable].name, "");
            }
            this.valueMap = myValueMap; 
        }
    }
}
