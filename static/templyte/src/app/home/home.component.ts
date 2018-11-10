import {Component, OnInit} from '@angular/core';
import {ApiInterfaceService} from '../providers/api-interface.service';
import {AngularFireDatabase} from 'angularfire2/database';
import {AuthService} from '../providers/auth.service';
import {Router} from '@angular/router';
import {User} from 'firebase';
import {CreateTemplateComponent} from '../create-template/create-template.component';

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

    }

    doSearch() {
        const component = this;
        component.hasSearched = true;
        component.searchedTemplateList = component.db.list('/template-directory',
            ref =>
                ref.orderByChild(CreateTemplateComponent.encodeTag(component.searchTerm))
                    .equalTo(true)
        ).valueChanges();
    }


    openTemplate(templateId) {
        const component = this;
        component.router.navigate(['download-template/' + templateId]);
    }

    createTemplate() {
        this.router.navigate(['create']);
    }

    myTemplates() {
        this.router.navigate(['my-templates']);
    }

    logout(): void {
        this.authService.logout(null);
    }
}
