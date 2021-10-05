import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {SettingsService} from "../../../../services/settings.service";

import {DOC_SEPARATOR} from "./urls/docUrl";
import {BUNDLE_SEPARATOR} from "./urls/bundleUrl";
import {Router} from "@angular/router";
import {UserService} from "../../../../services/user.service";
import {PrivilegesService} from "../../../../services/privileges.service";

@Component({
  selector: 'app-separator',
  templateUrl: './separator.component.html',
  styleUrls: ['./separator.component.scss']
})
export class SeparatorComponent implements AfterViewInit {
  @ViewChild('pdfViewerAutoLoad') pdfViewerAutoLoad : any;
  constructor(
        public router: Router,
        public userService: UserService,
        public translate: TranslateService,
        public serviceSettings: SettingsService,
        public privilegesService: PrivilegesService
  ) { }

  loading           : boolean = false;
  pdfFile           : any;
  selectedSeparator : string  = "bundleSeparator";
  base64            : string  = BUNDLE_SEPARATOR;
  separators        : any[]   = [
    {
      id  : 'bundleSeparator',
      name: "SPLITTER.bundle_separator",
    },
    {
      id  : 'documentSeparator',
      name: "SPLITTER.document_separator",
    },
  ];

  convertDataURIToBinary(dataURI: string) {
    let base64Index = dataURI.indexOf(';base64,') + ';base64,'.length;
    let base64      = dataURI.substring(base64Index);
    let raw         = window.atob(base64);
    let rawLength   = raw.length;
    let array       = new Uint8Array(new ArrayBuffer(rawLength));

    for(let i = 0; i < rawLength; i++) {
      array[i]      = raw.charCodeAt(i);
    }
    return array;
  }

  ngAfterViewInit(): void {
    this.refreshPdfView();
  }

  refreshPdfView(): void {
    this.pdfFile = this.convertDataURIToBinary(this.base64);
    this.pdfViewerAutoLoad.pdfSrc = this.pdfFile;
    this.pdfViewerAutoLoad.refresh();
  }

  onChangeType() {
    if(this.selectedSeparator == "bundleSeparator") {
      this.base64 = BUNDLE_SEPARATOR
    }
    else if(this.selectedSeparator == "documentSeparator") {
      this.base64 = DOC_SEPARATOR
    }
    this.refreshPdfView();
  }
}
