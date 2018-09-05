import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA,  } from '@angular/material';

@Component({
    selector: 'input-validate-dialog',
    templateUrl: './input-validate-dialog.component.html',
    styleUrls: ['./input-validate-dialog.component.css']
})
export class InputValidateDialogComponent {
    constructor( @Inject(MAT_DIALOG_DATA) public data) {}

    ngOnInit() {
        console.log(this.data);
    }
}