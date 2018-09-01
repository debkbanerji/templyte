import {Injectable} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase';
import {NgForm} from '@angular/forms';
import {AngularFireDatabase} from 'angularfire2/database';
import { AngularFireModule } from 'angularfire2';
import {FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database-deprecated';

export class Upload {

    $key: string;
    file:File;
    name:string;
    userUID: string;
    progress:number;
    createdAt: Date = new Date();

    constructor(file:File) {
        this.file = file;
    }
}

@Injectable()
export class UploadService {

    constructor(private af: AngularFireModule, private db: AngularFireDatabase) { }

    private basePath:string = '/uploads';
    uploads: FirebaseListObservable<Upload[]>;

    pushUpload(upload: Upload) {
        let storageRef = firebase.storage().ref();
        let uploadTask = storageRef.child(`${this.basePath}/users/${upload.userUID}/${upload.file.name}`).put(upload.file);

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) =>  {
            // upload in progress
            var snapshotRef = snapshot as firebase.storage.UploadTaskSnapshot;
            var bytesTransferred = (snapshotRef).bytesTransferred;
            var totalBytes = (snapshotRef).totalBytes;
            upload.progress = (bytesTransferred / totalBytes) * 100
        },
        (error) => {
            // upload failed
            console.log(error)
        },
        () => {
            // upload success
            upload.name = upload.file.name
            this.saveFileData(upload)
        }
        );
    }
  
  
  
    // Writes the file details to the realtime db
    private saveFileData(upload: Upload) {
        this.db.list(`${this.basePath}/`).push(upload);
    }
}