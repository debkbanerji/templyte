import {Injectable} from '@angular/core';
import * as firebase from 'firebase';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFireModule} from 'angularfire2';

export class Upload {

    file: File;
    name: string;
    userUID: string;
    progress: number;

    constructor(file: File) {
        this.file = file;
    }
}

@Injectable()
export class UploadService {

    constructor(private af: AngularFireModule, private db: AngularFireDatabase) {
    }

    private basePath = '/uploads';

    pushUpload(upload: Upload, callback) {
        const storageRef = firebase.storage().ref();
        const uploadTask = storageRef.child(`${this.basePath}/users/${upload.userUID}/${upload.file.name}`).put(upload.file);

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
                // upload in progress
                const snapshotRef = snapshot as firebase.storage.UploadTaskSnapshot;
                const bytesTransferred = (snapshotRef).bytesTransferred;
                const totalBytes = (snapshotRef).totalBytes;
                upload.progress = (bytesTransferred / totalBytes) * 100;
            },
            (error) => {
                // upload failed
                console.log(error);
            },
            () => {
                // upload success
                upload.name = upload.file.name;
                uploadTask.snapshot.ref.getDownloadURL().then((url)=>{callback(url)});
            }
        );
    }
}
