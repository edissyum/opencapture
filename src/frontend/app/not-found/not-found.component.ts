import { Component, OnInit } from '@angular/core';
import {NotificationService} from "../../services/notifications/notifications.service";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(
      private notify: NotificationService,
      private router: Router,
      private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.translate.get('ERROR.404').subscribe((translated: string) => {
      this.notify.error(translated)
      this.router.navigate(['/login'])
    });
  }

}
