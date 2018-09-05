import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';
import {User} from 'firebase';

import {Component, OnInit} from '@angular/core';

import {UploadService, Upload} from '../upload/upload.service';
import {AngularFireDatabase} from 'angularfire2/database';
import {MatDialog} from '@angular/material/dialog';
import { InputValidateDialogComponent } from '../input-validate-dialog/input-validate-dialog.component';

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

    isInputValid: Boolean = true;
    invalidInputMessage: String;

    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private router: Router,
        private upSvc: UploadService,
        private dialog: MatDialog
    ) {}

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

    onAddTag() {
        this.tagArray.push('');
    }


    uploadTemplate() {
        if (this.validateInput()) {
            const component = this; /*store data from the current typescript component in its own variable
                because from within the upload function callbacks 'this' will refer to the current function being executed*/
            this.uploadFile(function(templateUrl) {
                console.log(templateUrl);
                const targetTemplateUrl = templateUrl;
                const renderInfoObject = component.db.list('template-render-info');
                renderInfoObject.push({
                    'template-url': targetTemplateUrl
                }).then((renderInfoResult) => {
                    const targetKey = renderInfoResult.key;
                    const directoryObject = component.db.object('template-directory/'+targetKey);
                    directoryObject.set({
                        'templateName' : component.templateName,
                        'variables' : component.fieldArray,
                        'tags' : component.tagArray,
                        'fileEndings' : component.fileEndingsArray,
                        'authorName' : component.user.displayName,
                        'authorUID' : component.user.uid,
                        'authorPhotoUrl' : component.user.photoURL
                    }).then(()=>{console.log('TODO: Handle potential errors')});
                });
            });
        }
    }

    validateInput() {
        //TODO: check to make sure name, file, and at least one variable has been filled out before upload
        //If not, make a popup with a specific message saying which thing is missing
        let returnVal: Boolean = true;
        if (!this.templateName) { //will evaluate to true if templateName is an empty string, for more info google 'typescript truthiness'
            returnVal = false;
            this.dialog.open(InputValidateDialogComponent, {
                width: '250px',
                data: {message: "Please enter a name for your template."}
              });
        }
        if (this.fieldArray.length == 0) {
            returnVal = false;
            this.dialog.open(InputValidateDialogComponent, {
                width: '250px',
                data: {message: "Please enter at least one variable name for your template."}
              });
        }
        if (this.fileEndingsArray.length == 0) {
            returnVal = false;
            this.dialog.open(InputValidateDialogComponent, {
                width: '250px',
                data: {message: "Please enter at least one file ending that includes variables for your template."}
              });
        }
        return returnVal;
    }

    uploadFile(callback) {
        const component = this;
        const file = component.selectedFiles.item(0);
        component.currentUpload = new Upload(file, component.user.uid);
        component.upSvc.pushUpload(component.currentUpload, callback);
    }
}
