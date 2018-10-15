import {Component, Input, NgZone, OnInit} from '@angular/core';
import {User} from 'firebase';
import {AuthService} from '../providers/auth.service';
import {AngularFireDatabase, AngularFireObject} from 'angularfire2/database';
import {ActivatedRoute, Router} from '@angular/router';
import {AngularFireStorage} from 'angularfire2/storage';
import * as firebase from 'firebase';
import {MatDialog} from '@angular/material';
import {DeleteConfirmDialogComponent} from '../delete-confirm-dialog/delete-confirm-dialog.component';
import {Observable} from "rxjs";
import {ApiInterfaceService} from '../providers/api-interface.service';


@Component({
    selector: 'app-my-templates',
    templateUrl: './my-templates.component.html',
    styleUrls: ['./my-templates.component.css']
})

export class MyTemplatesComponent implements OnInit {

    user: User = null;
    templateList: any = null;
    templateRenderList: any = null;
    valueMap: Object = {};
    templateDirectoryInfoRef: AngularFireObject<any>;
    templateRenderInfoRef: AngularFireObject<any>;
    templateRenderInfo: Observable<any> = null;
    templateDirectoryInfo: Observable<any> = null;

    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private ngZone: NgZone,
        private router: Router,
        private route: ActivatedRoute,
        private storage: AngularFireStorage,
        private api: ApiInterfaceService,
        private dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        const component = this;

        component.authService.onAuthStateChanged(function (auth) {
            if (auth === null) { // If the user is logged out
                component.router.navigate(['login']);
            } else {
                component.user = component.authService.getAuth().currentUser;

                component.ngZone.run(() => {
                    component.createTemplateList();
                });
            }
        });
    }

    private createTemplateList() {
        const component = this;
        component.templateList = component.db.list('/template-directory',
            ref =>
                ref.orderByChild('authorUID')
                    .equalTo(component.user.uid)
        ).valueChanges();
    }

    private createTemplateRenderList(templateId) {
        const component = this;
        component.templateRenderInfoRef = component.db.object('template-render-info/' + templateId)
        component.templateRenderList = component.templateRenderInfoRef.valueChanges();
    }

    createTemplate() {
        this.router.navigate(['create']);
    }

    deleteTemplate(templateUID) {
        const dialogRef = this.dialog.open(DeleteConfirmDialogComponent);
        dialogRef.afterClosed().subscribe( (result) => {
            if (result) {
                const component = this;
                component.db.object('template-directory/' + templateUID).remove().then(() => {
                    const renderInfoRef = component.db.object('template-render-info/' + templateUID);
                    renderInfoRef.valueChanges().subscribe((renderInfoValueRes: any) => {
                        if (renderInfoValueRes) {
                            const archiveURL = renderInfoValueRes.templateArchiveUrl;
                            renderInfoRef.remove().then(() => {
                                firebase.storage().refFromURL(archiveURL).delete();
                            });
                        }
                    });
                });
            }
        });
    }
    openTemplate(templateId) {
        const component = this;
        component.createTemplateRenderList(templateId);
        // component.router.navigate(['download-template/' + templateId]);
    }

    logout(): void {
        this.authService.logout(null);
    }

    goHome(): void {
        this.router.navigate(['']);
    }
    validateEnteredVariables() {
        const component = this;
        Object.keys(component.valueMap).forEach(function (variable) {
            if (!component.valueMap[variable]) {
                component.valueMap[variable] = '';
            }
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
}
