import { Component, OnInit } from '@angular/core';
import {LocalStorageService} from "../local-storage.service";
import {environment} from "../../app/env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../auth.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-tasks-watcher',
  templateUrl: './tasks-watcher.component.html',
  styleUrls: ['./tasks-watcher.component.scss']
})
export class TasksWatcherComponent implements OnInit {
  minimizeDisplay   : boolean = false;

  constructor(
      private http: HttpClient,
      private authService: AuthService,
      public translate: TranslateService,
      private localStorageService: LocalStorageService,
  ) { }

  lastTasks       : any[]     = [];

  ngOnInit(): void {
    const minimizeDisplayValue = this.localStorageService.get('task_watcher_minimize_display');
    this.minimizeDisplay = (minimizeDisplayValue === 'true');
    this.getLastTasks();
  }

  changeDisplayMode(minimizeDisplay: boolean) {
    this.minimizeDisplay = minimizeDisplay;
    this.localStorageService.save('task_watcher_minimize_display', minimizeDisplay ? 'true': 'false');
  }

  getLastTasks(){
    this.http.get(environment['url'] + '/ws/tasks/new', {headers: this.authService.headers}).pipe(
        tap((data: any) => {
          let cpt = 1;
          for(const task of data.tasks){
              this.lastTasks.push({
                'id'      : cpt,
                'type'    : task.type,
                'fileName': task.title,
                'module'  : task.module,
                'status'  : task.status ? task.title: 'in_progress',
                'age'     : task.age !== 0 ?
                    this.translate.instant("GLOBAL.n_minutes_ago", {'minutes': task.age}):
                    this.translate.instant("GLOBAL.few_seconds_ago")
              });
            cpt++;
          }
        }),
        catchError((err: any) => {
          console.debug(err);
          return of(false);
        })
    ).subscribe();
  }
}
