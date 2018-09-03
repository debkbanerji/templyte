import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';
import {User} from 'firebase';

import {Component, OnInit, OnDestroy, ViewChild, ApplicationRef} from '@angular/core';
import {NgForm} from '@angular/forms';

import {AngularFireDatabase} from 'angularfire2/database';
import * as firebase from 'firebase';

import { UploadService, Upload } from '../upload/upload.service';
import * as _ from "lodash";
@Component({
    // TODO:  maybe I should rename this selector as app-createTemplate without hyphen in create Template
    // TODO: maybe  i need to create a model for the template later on, if the template object becomes more than a simple string.
    selector: 'create-template',
    templateUrl: './create-template.component.html',
    styleUrls: ['./create-template.component.css']
})
// TODO:  maybe I should rename this directory as createTemplate without hyphen
export class CreateTemplateComponent  implements OnInit {
    templateName: String = "A Template";
    fieldArray: Array<any> = [];
    tagArray: Array<String> = [];
    fileEndings: String = "";
    newAttribute: any = {};
    user: User = null;
    firstField = false;
    firstFieldName = '';
    isEditItems: boolean = true;

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
        for (var field of this.fieldArray) {
            console.log("field array = ", field);
        }
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

    selectedFiles: FileList;
    currentUpload: Upload;

    detectFiles(event) {
        console.log(event.target.files);
        
        this.selectedFiles = event.target.files;
    }

    saveMetadata(templateName: String, fileEndings: String, ...restOfTags: String[]) {
        this.templateName = templateName;
        this.fileEndings = fileEndings;
        this.tagArray = restOfTags;
    }
  
    upload() {
      let file = this.selectedFiles.item(0)
      console.log('uploading')
      this.currentUpload = new Upload(file);
      this.upSvc.pushUpload(this.currentUpload)
    }

    onAddTag() {
        this.tagArray.push("");
    }
}