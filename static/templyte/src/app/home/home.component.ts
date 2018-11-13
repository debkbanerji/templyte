import {Component, OnInit} from '@angular/core';
import {ApiInterfaceService} from '../providers/api-interface.service';
import {AngularFireDatabase} from 'angularfire2/database';
import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';
import {User} from 'firebase';
import {CreateTemplateComponent} from '../create-template/create-template.component';

export enum SortingOptions {
    CREATIONDATE = 'Creation Date',
    LASTDOWNLOADEDDATE = 'Last Downloaded Date',
    NUMBEROFDOWNLOADS = 'Number of downloads',
    RATING = 'Rating'
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    user: User = null;
    searchTerm: String = null;
    hasSearched = false;
    searchedTemplateList: any = null;
    options: String[];
    selected: any;
    displayList: any[];

    constructor(
        private apiInterfaceService: ApiInterfaceService,
        private authService: AuthService,
        private db: AngularFireDatabase,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        const component = this;
        component.authService.onAuthStateChanged(function (auth) {
            if (auth === null) { // If the user is logged out
                component.router.navigate(['login']);
            } else {
                component.user = component.authService.getAuth().currentUser;
            }
        });
        this.options = Object.values(SortingOptions);
    }

    doSearch() {
        const component = this;
        if (component.searchTerm) {
            component.hasSearched = true;
            component.searchedTemplateList = component.db.list('/template-directory',
                ref =>
                    ref.orderByChild(CreateTemplateComponent.encodeTag(component.searchTerm))
                        .equalTo(true)
            ).valueChanges().subscribe((data) => component.displayList = data);
        }
    }


    openTemplate(templateId) {
        const component = this;
        component.router.navigate(['download-template/' + templateId]);
    }

    createTemplate() {
        this.router.navigate(['create']);
    }

    tutorial() {
        this.router.navigate(['tutorial']);
    }

    myTemplates() {
        this.router.navigate(['my-templates']);
    }

    logout(): void {
        this.authService.logout(null);
    }

    sort(option) {
        const component = this;
        switch (option) {
            case SortingOptions.CREATIONDATE: {
                if (component.displayList != null) {
                    component.displayList.sort((b, a) => a.templateCreateDate - b.templateCreateDate);
                }
                break;
            }
            case SortingOptions.LASTDOWNLOADEDDATE: {
                if (component.displayList != null) {
                    component.displayList.sort((b, a) => a.templateLastDownloadDate - b.templateLastDownloadDate);
                }
                break;
            }
            case SortingOptions.NUMBEROFDOWNLOADS: {
                if (component.displayList != null) {
                    component.displayList.sort((b, a) => a.templateNumDownload - b.templateNumDownload);
                }
                break;
            }
            case SortingOptions.RATING: {
                if (component.displayList != null) {
                    component.displayList.sort((b, a) => a.averageRating - b.averageRating);
                }
                break;
            }
        }
    }
}
