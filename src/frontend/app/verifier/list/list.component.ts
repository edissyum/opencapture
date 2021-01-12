import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class VerifierListComponent implements OnInit {
  loading = true
  constructor() { }

  ngOnInit(): void {
  }

}
