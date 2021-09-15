import {Component, OnInit} from '@angular/core';
import {SettingsService} from "../../../../services/settings.service";
import {PrivilegesService} from "../../../../services/privileges.service";
import {Router} from "@angular/router";
import {UserService} from "../../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-document-type',
  templateUrl: './document-type.component.html',
  styleUrls: ['./document-type.component.scss'],
})
export class DocumentTypeComponent implements OnInit {
  loading: boolean = false;

  constructor(
        public router: Router,
        public userService: UserService,
        public translate: TranslateService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
  ) {
  }

  ngOnInit(): void {
  }
}
