import {Component, NgZone, OnInit} from '@angular/core';
import {User} from 'firebase';
import {AuthService} from '../providers/auth.service';
import {AngularFireDatabase} from 'angularfire2/database';
import {Router} from '@angular/router';

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
        private router: Router,
        private ngZone: NgZone
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
}
