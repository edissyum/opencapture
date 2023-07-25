import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss']
})
export class ExportDialogComponent {
  extensions: any[] = [
    {
      id: 'csv',
      label: 'CSV'
    }
  ];
  delimiters: any[] = [
    {
      id: 'COMMA',
      label: ','
    },
    {
      id: 'SEMICOLON',
      label: ';'
    },
    {
      id: 'TAB',
      label: 'TAB'
    }
  ];

  config: any          = {
    extension: 'csv',
    delimiter: 'COMMA',
    selectedColumns: [],
    availableColumns: []
  };

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.config.availableColumns = data.availableColumns;
    this.config.selectedColumns  = data.selectedColumns;
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
      );
    }
  }
}
