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
        private dialog: MatDialog,
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
                const renderInfoObject = component.db.list('template-render-info');
                renderInfoObject.push({
                    'templateArchiveUrl': templateUrl,
                    'variables': component.variableArray,
                    'fileEndings': component.fileEndingsArray
                }).then((renderInfoResult) => {
                    const targetKey = renderInfoResult.key;
                    const directoryObject = component.db.object('template-directory/' + targetKey);
                    directoryObject.set({
                        'templateName' : component.templateName,
                        'tags' : component.tagArray,
                        'authorName' : component.user.displayName,
                        'authorUID' : component.user.uid,
                        'authorPhotoUrl' : component.user.photoURL

                    });
                }).then(() => {
                    component.dialog.open(UploadSuccessDialogComponent, {
                        width: '250px'
                    });
                });
            });
            component.router.navigate(['home']);
        }
    }

    validateInput() {
        // TODO: Check to see that variable names don't have spaces or special characters
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
        } else {
            for (let i = 0; i < this.variableArray.length - 1; i++) {
                for (let j = i + 1; j < this.variableArray.length; j++) {
                    if (this.variableArray[i].name === this.variableArray[j].name) {
                        returnVal = false;
                        this.dialog.open(InputValidateDialogComponent, {
                            width: '250px',
                            data: {message: 'Please do not enter duplicate variables'}
                        });
                    }
                }
            }
        }
        for (let i = 0; i < this.tagArray.length - 1; i++) {
            for (let j = i + 1; j < this.tagArray.length; j++) {
                if (this.tagArray[i].name === this.tagArray[j].name) {
                    returnVal = false;
                    this.dialog.open(InputValidateDialogComponent, {
                        width: '250px',
                        data: {message: 'Please do not enter duplicate tags'}
                    });
                }
            }
        }
        if (this.fileEndingsArray.length === 0) {
            returnVal = false;
            this.dialog.open(InputValidateDialogComponent, {
                width: '250px',
                data: {message: 'Please enter at least one file ending that includes variables for your template.'}
            });
        } else {
            for (let i = 0; i < this.fileEndingsArray.length - 1; i++) {
                for (let j = i + 1; j < this.fileEndingsArray.length; j++) {
                    if (this.fileEndingsArray[i].name === this.fileEndingsArray[j].name) {
                        returnVal = false;
                        this.dialog.open(InputValidateDialogComponent, {
                            width: '250px',
                            data: {message: 'Please do not enter duplicate file endings'}
                        });
                    }
                }
            }
        }
        return returnVal;
    }

    uploadFile(callback) {
        const component = this;
        const file = component.selectedFiles.item(0);
        component.currentUpload = new Upload(file, component.user.uid);
        component.upSvc.pushUpload(component.currentUpload, callback);
    }

    downloadTemplate() {
        this.router.navigate(['download']);
    }

    myTemplates() {
        this.router.navigate(['my-templates']);
    }
}
