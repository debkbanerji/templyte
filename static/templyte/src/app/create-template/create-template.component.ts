import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';
import {User} from 'firebase';

import {Component, OnInit} from '@angular/core';

import {UploadService, Upload} from '../upload/upload.service';

@Component({
    selector: 'create-template',
    templateUrl: './create-template.component.html',
    styleUrls: ['./create-template.component.css']
})
export class CreateTemplateComponent implements OnInit {
    templateName: String = null;
    fieldArray: Array<any> = [];
    tagArray: Array<String> = [];
    newAttribute: any = {};
    user: User = null;
    selectedFiles: FileList;
    currentUpload: Upload;

    constructor(
        private authService: AuthService,
        private upSvc: UploadService,
        private router: Router
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
        component.currentUpload = new Upload(file);
        component.upSvc.pushUpload(component.currentUpload, callback);
    }

    onAddTag() {
        this.tagArray.push('');
    }


    createTemplate() {
        // TODO: Implement
        const component = this;
        this.upload(function(uploadURL) {
            console.log(uploadURL);
        });
    }
}
