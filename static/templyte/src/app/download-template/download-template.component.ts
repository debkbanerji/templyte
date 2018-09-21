import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';
import {User} from 'firebase';

import {Component, OnInit} from '@angular/core';

import {AngularFireDatabase} from 'angularfire2/database';

@Component({
    selector: 'download-template',
    templateUrl: './download-template.component.html',
    styleUrls: ['./download-template.component.css']
})
export class DownloadTemplateComponent implements OnInit {
    user: User = null;
    templateName: String = null;
    tagArray: Array<any> = [];
    templateList: any = null;
    selectedValue: any;

    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private router: Router,
    ) {
    }

    ngOnInit() {
        const component = this;
        component.authService.onAuthStateChanged(function (auth) {
            if (auth === null) { // If the user is logged out
                component.router.navigate(['login']);
            } else {
                component.user = component.authService.getAuth().currentUser;
                component.createTemplateList();
            }
        });
    }
    // This is the same function as in the myTemplates component. It is used to populate
    // the dropdown list. This needs to be changed to get all templates, not just the ones on my templates. This is temporary, for testing only.
    private createTemplateList() {
        const component = this;
        component.templateList = component.db.list('/template-directory',
            ref =>
                ref.orderByChild('authorUID')
                    .equalTo(component.user.uid)
        ).valueChanges();
    }

    deleteTagValue(index) {
        this.tagArray.splice(index, 1);
    }

    addTagValue() {
        this.tagArray.push({});
    }

    goHome() {
        this.router.navigate(['']);
    }

    logout(): void {
        this.authService.logout(null);
    }

    downloadTemplate() {
        let variables_array = this.selectedValue.tags;
        console.log("Tags:",variables_array);
    }

    createTemplate() {
        this.router.navigate(['create']);
    }

    myTemplates() {
        this.router.navigate(['my-templates']);
    }
}
