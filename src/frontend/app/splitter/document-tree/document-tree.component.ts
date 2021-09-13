import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-document-tree',
  templateUrl: './document-tree.component.html',
  styleUrls: ['./document-tree.component.scss']
})
export class DocumentTreeComponent implements OnInit {
  selectedItem:any;

  constructor(
  ) { }

  ngOnInit(): void {
  }

  getOutPut($event: any) {
    this.selectedItem = $event;
  }
}
