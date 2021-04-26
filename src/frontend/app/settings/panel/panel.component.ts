import {AfterViewInit, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {UserService} from "../../../services/user.service";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../services/notifications/notifications.service";

@Component({
  selector: 'app-setting',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})

export class PanelComponent implements OnInit {
  isMenuOpen:boolean            = true;
  selectedSetting:string        = "custom-fields";
  searchSetting: string         = "";
  settingListOpenState: boolean = true;
  settings : any[]              = [
    {
      "id"    : "users",
      "label" : "SETTINGS.users_list",
      "icon"  : "fas fa-users fa-lg",
    },
    {
      "id"    : "custom-fields",
      "label" : "SETTINGS.custom_fields",
      "icon"  : "fas fa-align-center fa-lg",
    },
    {
      "id"    : "separator",
      "label" : "SETTINGS.document_separator",
      "icon"  : "fas fa-qrcode fa-lg",
    },
    {
      "id"    : "document-type",
      "label" : "SETTINGS.document_type",
      "icon"  : "fas fa-file fa-lg",
    },
    {
      "id"    : "connector",
      "label" : "SETTINGS.connector_EDM",
      "icon"  : "fas fa-link fa-lg",
    },
    {
      "id"    : "update",
      "label" : "SETTINGS.version_and_update",
      "icon"  : "fas fa-sync fa-lg",
    },
  ]

  constructor(
      private http: HttpClient,
      private router: Router,
      private route: ActivatedRoute,
      private formBuilder: FormBuilder,
      private authService: AuthService,
      public userService: UserService,
      private translate: TranslateService,
      private notify: NotificationService,
      private resolver: ComponentFactoryResolver
  ) { }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  changeSetting(settingId: string) {
    this.selectedSetting = settingId;
  }

  ngOnInit(): void {
  }
}
