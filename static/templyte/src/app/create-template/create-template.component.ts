import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';
import {User} from 'firebase';

import {Component, OnInit} from '@angular/core';

import {UploadService, Upload} from '../upload/upload.service';
import {AngularFireDatabase} from 'angularfire2/database';

@Component({
    selector: 'create-template',
    templateUrl: './create-template.component.html',
    styleUrls: ['./create-template.component.css']
})
export class CreateTemplateComponent implements OnInit {
    user: User = null;
    selectedFiles: FileList;
    currentUpload: Upload;

    // TODO: Figure out if we need this
    newAttribute: any = {};


    templateName: String = null;
    fieldArray: Array<any> = [];
    tagArray: Array<any> = [];
    fileEndingsArray: Array<any> = [];

    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private router: Router,
        private upSvc: UploadService
    ) {
    }

    ngOnInit() {
        const component = this;
        component.authService.onAuthStateChanged(function (auth) {
            if (auth === null) { // If the user is logged out
                component.router.navigate(['login']);
            } else {
                component.user = component.authService.getAuth().currentUser;
            }
        });
    }

    addFieldValue() {
        this.fieldArray.push(this.newAttribute);
        this.newAttribute = {};
    }

    deleteFieldValue(index) {
        this.fieldArray.splice(index, 1);
    }

    goHome() {
        this.router.navigate(['']);
    }

    logout(): void {
        this.authService.logout(null);
    }


    detectFiles(event) {
        this.selectedFiles = event.target.files;
    }

    upload(callback) {
        const component = this;
        const file = component.selectedFiles.item(0);
        component.currentUpload = new Upload(file, component.user.uid);
        component.upSvc.pushUpload(component.currentUpload, callback);
    }

    onAddTag() {
        this.tagArray.push('');
    }


    createTemplate() {
        const component = this;
        this.upload(function(templateUrl) {
            console.log(templateUrl);
            const targetTemplateUrl = templateUrl;
            const renderInfoObject = component.db.list('template-render-info');
            renderInfoObject.push({
                'template-url': targetTemplateUrl
            }).then((renderInfoResult) => {
                const targetKey = renderInfoResult.key;
                const directoryObject = component.db.object('template-directory/'+targetKey);
                directoryObject.set({'junk':'junk'}).then(()=>{console.log('TODO: Handle potential errors')});
            });
        });
    }   
} 
