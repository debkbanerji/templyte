import { AuthService } from '../providers/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'firebase';
import { Component, NgZone, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { Observable } from 'rxjs';
import { ApiInterfaceService } from '../providers/api-interface.service';
import * as firebase from 'firebase';
import { Reference } from 'firebase/database';


@Component({
	selector: 'edit-template',
	templateUrl: './edit-template.component.html',
	styleUrls: ['./edit-template.component.css']
})
export class EditTemplateComponent implements OnInit {
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
						component.templateDirectoryInfoDatabaseRef = firebase.database().ref('template-directory/' + params.id);
						component.templateDirectoryInfo = component.templateDirectoryInfoRef.valueChanges();
						component.templateRenderInfo = component.templateRenderInfoRef.valueChanges();
						component.templateDirectoryInfoDatabaseRef = firebase.database().ref('template-directory/' + params.id);
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
