import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tasks-watcher',
  templateUrl: './tasks-watcher.component.html',
  styleUrls: ['./tasks-watcher.component.scss']
})
export class TasksWatcherComponent implements OnInit {
  minimizeDisplay : boolean = false;
  tasks           : any[]   = [
    {
      'id'      : 1,
      'time'    : "il y'a 1min",
      'fileName': "test.pdf",
      'status'  : "progress"
    },
  ];
  constructor() { }

  ngOnInit(): void {
  }

}
