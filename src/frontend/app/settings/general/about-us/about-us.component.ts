import { Component, OnInit } from '@angular/core';
import {SettingsService} from "../../../../services/settings.service";
import {Router} from "@angular/router";
import {PrivilegesService} from "../../../../services/privileges.service";
declare var $: any;

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
        public privilegesService: PrivilegesService
    ) { }

    ngOnInit(): void {
        this.loading = false
        let k = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
        let n = 0;
        $(document).keydown(function (e: any) {
            if (e.keyCode === k[n++]) {
                if (n === k.length) {
                    alert('Konami !!!'); // à remplacer par votre code
                    n = 0;
                }
            }
            else n = 0;
        });
    }

}
