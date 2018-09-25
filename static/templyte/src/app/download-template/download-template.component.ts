import {AuthService} from '../providers/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from 'firebase';
import {Component, NgZone, OnInit} from '@angular/core';
import {AngularFireDatabase, AngularFireObject} from 'angularfire2/database';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';

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
    templateRenderInfo: Observable<any> = null;
    templateDirectoryInfo: Observable<any> = null;
    renderInfo : Object = null;



    constructor(
        private authService: AuthService,
        private db: AngularFireDatabase,
        private ngZone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient
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
                        // console.log('params: ', params);
                        // defer(async() => {
                        //     component.templateDirectoryInfo = await component.db.object('template-directory/' + params.id).valueChanges();
                        //     component.templateRenderInfo = await component.db.object('template-render-info/' + params.id).valueChanges(); });
                        component.templateDirectoryInfoRef = component.db.object('template-directory/' + params.id);
                        component.templateRenderInfoRef = component.db.object('template-render-info/' + params.id);
                        component.templateDirectoryInfo = component.templateDirectoryInfoRef.valueChanges();
                        component.templateRenderInfo = component.templateRenderInfoRef.valueChanges();
                        // defer(async() => {
                        //     await component.templateDirectoryInfo;
                        //     await component.templateRenderInfo});
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
        const component = this;
        this.templateRenderInfoRef.snapshotChanges().subscribe(data => {
            console.log(data.payload.val());
            let request = {
                'variables' : this.valueMap,
                'fileEndings' : data.payload.val().fileEndings,
                'url' : data.payload.val().templateArchiveUrl
            }
            console.log(request);
            component.http.post<any>('http://localhost:3000/api/download-template', request).subscribe(data => console.log('data: ', data));
        });

    }

    createTemplate() {
        this.router.navigate(['create']);
    }

    myTemplates() {
        this.router.navigate(['my-templates']);
    }
}
