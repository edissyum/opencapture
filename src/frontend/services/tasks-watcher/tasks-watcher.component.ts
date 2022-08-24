import { Component, OnInit } from '@angular/core';
import {LocalStorageService} from "../local-storage.service";

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
      'time'    : "il y'a 1 min",
      'fileName': "test.pdf",
      'status'  : "in_progress"
    },
    {
      'id'      : 2,
      'time'    : "il y'a 8 min",
      'fileName': "Facture_SFR_08-07.pdf",
      'status'  : "done"
    },
  ];
  constructor(
      private localStorageService: LocalStorageService,
  ) { }

  ngOnInit(): void {
    const minimizeDisplayValue = this.localStorageService.get('task_watcher_minimize_display');
    this.minimizeDisplay = (minimizeDisplayValue === 'true');
  }

  changeDisplayMode(minimizeDisplay: boolean) {
    this.minimizeDisplay = minimizeDisplay;
    this.localStorageService.save('task_watcher_minimize_display', minimizeDisplay ? 'true': 'false');
  }
}
