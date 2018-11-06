import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';
import {User} from 'firebase';
import {ApiInterfaceService} from '../providers/api-interface.service';
import {Component, OnInit} from '@angular/core';

import {UploadService, Upload} from '../upload/upload.service';
import {AngularFireDatabase} from 'angularfire2/database';
import {MatDialog} from '@angular/material/dialog';
import {InputValidateDialogComponent} from '../input-validate-dialog/input-validate-dialog.component';
import {UploadSuccessDialogComponent} from '../upload-success-dialog/upload-success-dialog.component';

@Component({
    selector: 'app-tutorial',
    templateUrl: './tutorial.component.html',
    styleUrls: ['./tutorial.component.css']
})

export class TutorialComponent implements OnInit {
    user: User = null;

    constructor(
        private apiInterfaceService: ApiInterfaceService,
        private authService: AuthService,
        private db: AngularFireDatabase,
        private router: Router
    ) {
    }

    ngOnInit(): void {

    }

    createTemplate() {
        this.router.navigate(['create']);
    }

    myTemplates() {
        this.router.navigate(['my-templates']);
    }
    
    goHome() {
        this.router.navigate(['']);
    }

    logout(): void {
        this.authService.logout(null);
    }
}