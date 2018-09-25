import {AuthService} from '../providers/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from 'firebase';
import {Component, NgZone, OnInit} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {MatDialog} from '@angular/material/dialog';
import {InputValidateDialogComponent} from '../input-validate-dialog/input-validate-dialog.component';

@Component({
    selector: 'download-template',
    templateUrl: './download-template.component.html',
    styleUrls: ['./download-template.component.css']
})
export class DownloadTemplateComponent implements OnInit {
    user: User = null;
    valueMap: Map<any, any> = new Map();
    templateRenderInfo: Object = null;
    templateDirectoryInfo: Object = null;
    templateVariableNameList: Object = null;

    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private ngZone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
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
                        console.log('template-directory/' + params.id);
                        component.templateDirectoryInfo = component.db.object('template-directory/' + params.id).valueChanges();
                        component.templateRenderInfo = component.db.object('template-render-info/' + params.id).valueChanges();
                        component.templateVariableNameList = component.db.object('template-render-info/' + params.id + '/variables')
                            .valueChanges().subscribe((response) => {
                                component.templateVariableNameList = response;
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

    downloadTemplate() {
        console.log(this.valueMap);
        this.validateEnteredVariables();
        console.log(this.valueMap);
    }

    createTemplate() {
        this.router.navigate(['create']);
    }

    myTemplates() {
        this.router.navigate(['my-templates']);
    }

    //Checks to make sure none of the entered values are null, and if they are change the value in the valueMap to an empty string
    validateEnteredVariables() {
        let keys = Object.keys(this.valueMap);
        console.log(keys);
        let myValueMap = this.valueMap as Map<any, any>;
        console.log(typeof myValueMap);
        for (var variable in this.templateVariableNameList) {
            if (!keys.includes(this.templateVariableNameList[variable].name)) {
                myValueMap.set(this.templateVariableNameList[variable].name, "");
            }
        }
        this.valueMap = myValueMap; 
    }
}
