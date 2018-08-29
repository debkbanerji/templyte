import { Component } from '@angular/core';

@Component({
  selector: 'todo-list',
  templateUrl: './todolist.component.html',
  styleUrls: ['./todolist.component.css']
})
export class TodoListComponent {
  fieldArray: Array<any> = [];
  newAttribute: any = {};

  firstField = true;
  firstFieldName = 'First Item name';
  isEditItems: boolean;

  addFieldValue(index) {
    if (this.fieldArray.length <= 2) {
      this.fieldArray.push(this.newAttribute);
      this.newAttribute = {};
    } else {
      
    }
  }

  deleteFieldValue(index) {
    this.fieldArray.splice(index, 1);
  }

  onEditCloseItems() {
    this.isEditItems = !this.isEditItems;
  }
}
