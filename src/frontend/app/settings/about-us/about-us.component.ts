import { Component, OnInit } from '@angular/core';
import {SettingsService} from "../../../services/settings.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {
  loading : boolean = true
  constructor(
      public router: Router,
      public serviceSettings: SettingsService,
  ) { }

  ngOnInit(): void {
  }

}
