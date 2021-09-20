import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-document-tree',
  templateUrl: './document-tree.component.html',
  styleUrls: ['./document-tree.component.scss']
})
export class DocumentTreeComponent implements OnInit {
  selectedItem:any;

  constructor(
      public router: Router
  ) {
  }

  ngOnInit(): void {
  }

  getOutPut($event: any) {
    this.selectedItem = $event;
  }
}
