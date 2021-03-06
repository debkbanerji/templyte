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
    templateDescription: String = null;
    variableArray: Array<any> = [];
    tagArray: Array<any> = [];
    fileEndingsArray: Array<any> = [];
    isUploading: boolean;

    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private router: Router,
        private upSvc: UploadService,
        private dialog: MatDialog,
    ) {
    }


    static encodeTag(tag) {
        return '__TAG__' + tag.replace(/\s*/g, '').replace(/[^\w\s\d]/gi, '').toLowerCase();
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
        const component = this;
        if (component.validateInput() && !component.isUploading) {
            component.isUploading = true;
            const renderInfoObject = component.db.list('template-render-info');
            renderInfoObject.push({
                'variables': component.variableArray,
                'fileEndings': component.fileEndingsArray,
                'authorUID': component.user.uid
            }).then((renderInfoResult) => {
                const targetKey = renderInfoResult.key;
                const directoryObject = component.db.object('template-directory/' + targetKey);
                const templateDirectoryData = {
                    'uid': targetKey,
                    'templateName': component.templateName,
                    'templateDescription': component.templateDescription,
                    'tags': component.tagArray,
                    'authorName': component.user.displayName,
                    'authorUID': component.user.uid,
                    'authorPhotoUrl': component.user.photoURL,
                    'averageRating': 0,
                    'ratingSum': 0,
                    'numberRatings': 0,
                    'templateNumDownload': 0,
                    'templateLastDownloadDate': null,
                    'templateCreateDate': Date.now()
                };
                for (let i = 0; i < component.tagArray.length; i++) {
                    templateDirectoryData[CreateTemplateComponent.encodeTag(component.tagArray[i].name)] = true;
                }
                templateDirectoryData[CreateTemplateComponent.encodeTag(component.templateName)] = true;
                const nameSplit = component.templateName.split(/\s+/);
                for (let i = 0; i < nameSplit.length; i++) {
                    templateDirectoryData[CreateTemplateComponent.encodeTag(nameSplit[i])] = true;
                }
                directoryObject.set(templateDirectoryData);
                component.uploadFile(targetKey + '.zip', function (templateUrl) {
                    component.db.object('template-render-info/' + targetKey + '/templateArchiveUrl')
                        .set(templateUrl).then(() => {
                        const dialogRef = component.dialog.open(UploadSuccessDialogComponent);
                        dialogRef.afterClosed().subscribe(() => {
                            component.router.navigate(['my-templates']);
                        });
                    });
                });
            });
        }
    }

    validateInput() {
        let returnVal: Boolean = true;
        if (!this.templateName) { // will evaluate to true if templateName is an empty string, for more info google 'typescript truthiness'
            returnVal = false;
            this.dialog.open(InputValidateDialogComponent, {
                data: {message: 'Please enter a name for your template.'}
            });
        }
        for (let i = 0; i < this.variableArray.length - 1; i++) {
            for (let j = i + 1; j < this.variableArray.length; j++) {
                if (this.variableArray[i].name === this.variableArray[j].name) {
                    returnVal = false;
                    this.dialog.open(InputValidateDialogComponent, {
                        data: {message: 'Please do not enter duplicate variables'}
                    });
                }
            }
        }
        const invalidCharactersArray: Array<String> = [' ', '!', '#', '$', '%', '&', '\\',
            '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[',
            `/`, ']', '^', '_', '`', '{', '|', '}', '~'];
        for (let i = 0; i < this.variableArray.length; i++) {
            for (const char in invalidCharactersArray) {
                if (this.variableArray[i].name.includes(invalidCharactersArray[char])) {
                    returnVal = false;
                    this.dialog.open(InputValidateDialogComponent, {
                        data: {
                            message: `The variable name "` + this.variableArray[i].name +
                                `" contains an invalid character: ` + invalidCharactersArray[char] +
                                '\n Please do not include spaces or special characters in your variable names.'
                        }
                    });
                    break; // once you find one invalid character in a variable name, the user doesn't need to be told if there are more
                }
            }
        }
        for (let i = 0; i < this.tagArray.length - 1; i++) {
            for (let j = i + 1; j < this.tagArray.length; j++) {
                if (this.tagArray[i].name === this.tagArray[j].name) {
                    returnVal = false;
                    this.dialog.open(InputValidateDialogComponent, {
                        data: {message: 'Please do not enter duplicate tags'}
                    });
                }
            }
        }

        for (let i = 0; i < this.fileEndingsArray.length - 1; i++) {
            for (let j = i + 1; j < this.fileEndingsArray.length; j++) {
                if (this.fileEndingsArray[i].name === this.fileEndingsArray[j].name) {
                    returnVal = false;
                    this.dialog.open(InputValidateDialogComponent, {
                        data: {message: 'Please do not enter duplicate file endings'}
                    });
                }
            }
        }

        if (!/zip/i.test(this.selectedFiles[0].type)) {
            returnVal = false;
            this.dialog.open(InputValidateDialogComponent, {
                data: {message: 'Please make sure that the file you are uploading is a .zip file'}
            });
        }
        return returnVal;
    }

    uploadFile(targetName: string, callback) {
        const component = this;
        const file = component.selectedFiles.item(0);
        component.currentUpload = new Upload(file, targetName, component.user.uid);
        component.upSvc.pushUpload(component.currentUpload, callback);
    }

    tutorial() {
        this.router.navigate(['tutorial']);
    }

    myTemplates() {
        this.router.navigate(['my-templates']);
    }
}
