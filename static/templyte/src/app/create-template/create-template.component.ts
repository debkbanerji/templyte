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
    templateName: String = 'A Template';
    fieldArray: Array<any> = [];
    tagArray: Array<String> = [];
    fileEndings: String = '';
    newAttribute: any = {};
    user: User = null;
    isEditItems = true;
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

    onEditCloseItems() {
        this.isEditItems = !this.isEditItems;
    }

    createTemplate() {
        // TODO: Implement
        console.log('TODO: Upload template');
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

    saveMetadata(templateName: String, fileEndings: String, ...restOfTags: String[]) {
        this.templateName = templateName;
        this.fileEndings = fileEndings;
        this.tagArray = restOfTags;
    }

    upload() {
        const file = this.selectedFiles.item(0);
        this.currentUpload = new Upload(file);
        this.upSvc.pushUpload(this.currentUpload);
    }

    onAddTag() {
        this.tagArray.push('');
    }
}
