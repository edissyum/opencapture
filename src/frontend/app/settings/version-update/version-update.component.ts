import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../../services/user.service";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../services/notifications/notifications.service";
import {SettingsService} from "../../../services/settings.service";
import {PrivilegesService} from "../../../services/privileges.service";

@Component({
  selector: 'app-version-update',
  templateUrl: './version-update.component.html',
  styleUrls: ['./version-update.component.scss']
})
export class VersionUpdateComponent implements OnInit {
  loading: boolean = true
  constructor(
      public router: Router,
      private http: HttpClient,
      private route: ActivatedRoute,
      public userService: UserService,
      private formBuilder: FormBuilder,
      private authService: AuthService,
      private translate: TranslateService,
      private notify: NotificationService,
      public serviceSettings: SettingsService,
      public privilegesService: PrivilegesService
  ) { }

  ngOnInit(): void {
  }

}
