import {Injectable} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {auth} from 'firebase';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(public afAuth: AngularFireAuth) {
    }

    login(callback): void {
        this.afAuth.auth.signInWithPopup(new auth.GithubAuthProvider()).then(function (res) {
            if (callback) {
                callback(res);
            }
        });
    }

    logout(callback): void {
        this.afAuth.auth.signOut().then(function (res) {
            if (callback) {
                callback(res);
            }
        });
    }

    onAuthStateChanged(callback) {
        this.afAuth.auth.onAuthStateChanged(function (auth) {
            callback(auth);
        });
    }

    getAuth() {
        return this.afAuth.auth;
    }
}
