import {Component, NgZone, OnInit} from '@angular/core';
import {User} from 'firebase';
import {AuthService} from '../providers/auth.service';
import {AngularFireDatabase} from 'angularfire2/database';
import {Router} from '@angular/router';
import {AngularFireStorage} from 'angularfire2/storage';
import * as firebase from 'firebase';
import {MatDialog} from '@angular/material';

import {DeleteConfirmDialogComponent} from '../delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
    selector: 'app-my-templates',
    templateUrl: './my-templates.component.html',
    styleUrls: ['./my-templates.component.css']
})
export class MyTemplatesComponent implements OnInit {

    user: User = null;
    templateList: any = null;

    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private ngZone: NgZone,
        private router: Router,
        private storage: AngularFireStorage,
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

    createTemplate() {
        this.router.navigate(['create']);
    }

    deleteTemplate(templateUID) {
        var dialogRef = this.dialog.open(DeleteConfirmDialogComponent);
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
        component.router.navigate(['download-template/' + templateId]);
    }

    logout(): void {
        this.authService.logout(null);
    }

    goHome(): void {
        this.router.navigate(['']);
    }
}
