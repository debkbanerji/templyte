import {AuthService} from '../providers/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from 'firebase';
import {Component, NgZone, OnInit} from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from 'angularfire2/database';
import {Observable} from 'rxjs';
import {ApiInterfaceService} from '../providers/api-interface.service';
import * as firebase from 'firebase';
import {Reference} from 'firebase/database';
import {MatDialog} from '@angular/material/dialog';
import {InputValidateDialogComponent} from '../input-validate-dialog/input-validate-dialog.component';


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
    templateRatingsInfoRef: AngularFireObject<any>;
    templateRatingsInfoDatabaseRef: Reference;
    templateDirectoryInfoDatabaseRef: Reference;
    templateRenderInfo: Observable<any> = null;
    templateDirectoryInfo: Observable<any> = null;
    templateRatingsInfo: Observable<any> = null;
    allRatingsList: Observable<any[]> = null;
    ratingText: String = '';
    ratingVal: number = null;

    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private ngZone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private api: ApiInterfaceService,
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
                        component.templateDirectoryInfoRef = component.db.object('template-directory/' + params.id);
                        component.templateRenderInfoRef = component.db.object('template-render-info/' + params.id);
                        component.templateRatingsInfoRef = component.db.object('template-ratings/' + params.id);
                        component.templateRatingsInfoDatabaseRef = firebase.database().ref('template-ratings/' + params.id + '/' + component.user.uid);
                        component.templateDirectoryInfoDatabaseRef = firebase.database().ref('template-directory/' + params.id);
                        component.templateRatingsInfo = component.templateRatingsInfoRef.valueChanges();
                        component.templateDirectoryInfo = component.templateDirectoryInfoRef.valueChanges();
                        component.templateRenderInfo = component.templateRenderInfoRef.valueChanges();
                        component.templateDirectoryInfoDatabaseRef = firebase.database().ref('template-directory/' + params.id);
                        component.templateRenderInfo.subscribe((response) => {
                            if (response == null) {
                                component.router.navigate(['home']);
                            }
                        });
                        component.allRatingsList = component.db.list('template-ratings/' + params.id).valueChanges();
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

    storeRating() {
        if (this.validateRating()) {
            const component = this;
            component.templateRatingsInfoDatabaseRef.once('value').then(snapshot => {
                const old_rating = snapshot.child('ratingValue').val(); // value of previous rating
                let varNumRatings = 0;
                let varRatingSum = 0;
                const currentRatingVal = component.ratingVal;
                component.templateRatingsInfoDatabaseRef.set({
                    'ratingValue': component.ratingVal,
                    'ratingText': component.ratingText,
                    'ratingUserDisplayName': component.user.displayName
                });
                component.templateDirectoryInfoDatabaseRef.child('/numberRatings').transaction(function (numberRatings) {
                    if (old_rating != null) {
                        varNumRatings = numberRatings;
                        return varNumRatings;
                    } else {
                        varNumRatings = numberRatings + 1;
                        return varNumRatings;
                    }
                }).then(function (ratingSumAgain) {
                    component.templateDirectoryInfoDatabaseRef.child('/ratingSum').transaction(function (ratingSum) {
                        if (old_rating != null) {
                            if (ratingSum !== 0) {
                                varRatingSum = ratingSum - old_rating + currentRatingVal;
                                return ratingSum - old_rating + currentRatingVal;
                            } else {
                                varRatingSum = currentRatingVal;
                                return currentRatingVal;
                            }
                        } else {
                            if (ratingSum !== 0) {
                                varRatingSum = ratingSum + currentRatingVal;
                                return ratingSum + currentRatingVal;
                            } else {
                                varRatingSum = currentRatingVal;
                                return currentRatingVal;
                            }
                        }
                    }).then(function (ratingSumForAverage) {
                        component.templateDirectoryInfoDatabaseRef.update({
                            'averageRating': (varRatingSum * 1.0) / varNumRatings,
                        });
                    });
                });
            });
        }
    }

    saveRatingVal(star_number) {
        this.ratingVal = star_number;
    }

    validateRating() {
        if (this.ratingVal) {
            return true;
        } else {
            this.dialog.open(InputValidateDialogComponent, {
                data: {message: 'Please enter a star rating for this template.'}
            });
            return false;
        }
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

            component.api.getZipFile(request, function (downloadedData) {
                const linkElement = document.createElement('a');
                const url = window.URL.createObjectURL(downloadedData);
                linkElement.setAttribute('href', url);
                linkElement.setAttribute('download', 'project');
                const clickEvent = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': false
                });
                linkElement.dispatchEvent(clickEvent);
                component.templateDirectoryInfoDatabaseRef.child('/templateNumDownload').transaction(function (snapshot) {
                    return snapshot + 1;
                });
                component.templateDirectoryInfoDatabaseRef.child('/templateLastDownloadDate').set(Date.now());
            });

        });
    }

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
