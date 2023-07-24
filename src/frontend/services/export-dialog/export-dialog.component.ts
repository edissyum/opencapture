import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

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
      id: 'comma',
      label: ','
    },
    {
      id: 'semicolon',
      label: ';'
    },
    {
      id: 'TAB',
      label: 'TAB'
    }
  ];
  config: any          = {
    extension: 'csv'
  };

  constructor(
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }
}
