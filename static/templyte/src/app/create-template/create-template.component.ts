import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';
import {User} from 'firebase';

import {Component, OnInit} from '@angular/core';

import {UploadService, Upload} from '../upload/upload.service';
import {AngularFireDatabase} from 'angularfire2/database';
import {MatDialog} from '@angular/material/dialog';
import {InputValidateDialogComponent} from '../input-validate-dialog/input-validate-dialog.component';
import {UploadSuccessDialogComponent} from '../upload-success-dialog/upload-success-dialog.component';

@Component({
    selector: 'create-template',
    templateUrl: './create-template.component.html',
    styleUrls: ['./create-template.component.css']
})
export class CreateTemplateComponent implements OnInit {
    user: User = null;
    selectedFiles: FileList;
    currentUpload: Upload;
    templateName: String = null;
    variableArray: Array<any> = [];
    tagArray: Array<any> = [];
    fileEndingsArray: Array<any> = [];

    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private router: Router,
        private upSvc: UploadService,
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
            }
        });
    }

    addVariableValue() {
        this.variableArray.push({});
    }

    deleteVariableValue(index) {
        this.variableArray.splice(index, 1);
    }

    deleteTagValue(index) {
        this.tagArray.splice(index, 1);
    }

    addTagValue() {
        this.tagArray.push({});
    }

    deleteFileEndingsValue(index) {
        this.fileEndingsArray.splice(index, 1);
    }

    addFileEndingsValue() {
        this.fileEndingsArray.push({});
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

    uploadTemplate() {
        if (this.validateInput()) {
            const component = this;
            /*store data from the current typescript component in its own variable
                           because from within the upload function callbacks 'this' will refer to the current function being executed*/
            this.uploadFile(function (templateUrl) {
                console.log(templateUrl);
                const targetTemplateUrl = templateUrl;
                const renderInfoObject = component.db.list('template-render-info');
                renderInfoObject.push({
                    'template-url': targetTemplateUrl,
                    'variables' : component.variableArray,
                    'fileEndings' : component.fileEndingsArray
                }).then((renderInfoResult) => {
                    const targetKey = renderInfoResult.key;
                    const directoryObject = component.db.object('template-directory/' + targetKey);
                    directoryObject.set({
                        'templateName' : component.templateName,
                        'tags' : component.tagArray,
                        'authorName' : component.user.displayName,
                        'authorUID' : component.user.uid,
                        'authorPhotoUrl' : component.user.photoURL
                    })
                }).then(() => {
                    component.dialog.open(UploadSuccessDialogComponent, {
                    width: '250px'});
                });
            });
            component.router.navigate(['home']);
        }
    }

    validateInput() {
        let returnVal: Boolean = true;
        if (!this.templateName) { // will evaluate to true if templateName is an empty string, for more info google 'typescript truthiness'
            returnVal = false;
            this.dialog.open(InputValidateDialogComponent, {
                width: '250px',
                data: {message: 'Please enter a name for your template.'}
            });
        }
        if (this.variableArray.length === 0) {
            returnVal = false;
            this.dialog.open(InputValidateDialogComponent, {
                width: '250px',
                data: {message: 'Please enter at least one variable name for your template.'}
            });
        }
        if (this.fileEndingsArray.length === 0) {
            returnVal = false;
            this.dialog.open(InputValidateDialogComponent, {
                width: '250px',
                data: {message: 'Please enter at least one file ending that includes variables for your template.'}
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
