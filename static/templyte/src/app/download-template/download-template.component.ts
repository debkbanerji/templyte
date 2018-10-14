import {AuthService} from '../providers/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from 'firebase';
import {Component, NgZone, OnInit} from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from 'angularfire2/database';
import {Observable} from 'rxjs';
import {ApiInterfaceService} from '../providers/api-interface.service';
import * as firebase from 'firebase';
import { FirebaseDatabase } from 'angularfire2';
import { Reference } from 'firebase/database';


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


    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private ngZone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private api: ApiInterfaceService,
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
                        component.templateRatingsInfoDatabaseRef = firebase.database().ref('template-ratings/' + params.id);
                        component.templateDirectoryInfoDatabaseRef = firebase.database().ref('template-directory/' + params.id);
                        component.templateRatingsInfo = component.templateRatingsInfoRef.valueChanges();
                        component.templateDirectoryInfo = component.templateDirectoryInfoRef.valueChanges();
                        component.templateRenderInfo = component.templateRenderInfoRef.valueChanges();
                        component.templateRenderInfo.subscribe((response) => {
                            if (response == null) {
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

    storeRating(new_rating) {
        const component = this;
        let authorUID:string  =  component.user.uid;
        component.templateRatingsInfoDatabaseRef.once('value').then(snapshot2 => {
            const old_rating = snapshot2.child(authorUID).val(); //value of previous rating
            let hasRated:boolean = old_rating != null;
            if (hasRated == true) {
                // author has reviewed before
                console.log("Author has reviewed before");
                // update values in template directory
                component.templateDirectoryInfoDatabaseRef.child('/ratingSum').once('value', function(snapshot) {
                    console.log("Rating sum snapshot val");
                    console.log(snapshot.val());
                    component.templateDirectoryInfoRef.update({
                        'ratingSum': snapshot.val() - old_rating
                    })
                });
                component.templateDirectoryInfoDatabaseRef.child('/numberRatings').once('value', function(snapshot) {
                    console.log("Number of ratings snapshot val");
                    console.log(snapshot.val());
                    component.templateDirectoryInfoRef.update({
                        'numberRatings': snapshot.val() - 1
                    })
                });
                // hasRated = false;
            }
            console.log("Updated current rating to " + new_rating);
            component.templateRatingsInfoRef.set({
                [authorUID]: new_rating
            });

            //update all with new_rating
            let ratingSum, ratingCount
            component.templateDirectoryInfoDatabaseRef.child('/ratingSum').once('value', sumSnapshot => {
                ratingSum = sumSnapshot.val() + new_rating;
                component.templateDirectoryInfoRef.update({
                    'ratingSum': ratingSum
                })
            });
            console.log('Updated Sum');
            component.templateDirectoryInfoDatabaseRef.child('/numberRatings').once('value', countSnapshot => {
                ratingCount = countSnapshot.val() + 1;
                component.templateDirectoryInfoRef.update({
                    'numberRatings': ratingCount
                })
            });
            console.log('Updated Count');
            component.templateDirectoryInfoRef.update({
                'averageRating': (ratingSum * 1.0) / ratingCount
            });
            console.log('Updated Average');
        });
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
