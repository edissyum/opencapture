/** This file is part of Open-Capture for Invoices.

Open-Capture for Invoices is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Open-Capture is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Component, Input, OnInit } from '@angular/core';
import { Location } from "@angular/common";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { UserService } from "../../services/user.service";
import { LocaleService } from "../../services/locale.service";
import { LocalStorageService } from "../../services/local-storage.service";
import { PrivilegesService } from "../../services/privileges.service";
import { Router } from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
declare var $: any;

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    animations: [
        trigger('toggle', [
            state('hide', style({
                display: 'none',

            })),
            state('show', style({
                display: "block",
            })),
            transition('show => hide', animate('150ms ease-out')),
            transition('hide => show', animate('100ms ease-in'))
        ])
    ]
})

export class MenuComponent implements OnInit {
    @Input() image: any;
    profileDropdownCurrentState : string = 'hide';
    profileSettingsCurrentState : string = 'hide';
    mobileMenuState             : string = 'hide';

    constructor(
        public router: Router,
        public location: Location,
        public userService: UserService,
        public translate: TranslateService,
        public localeService: LocaleService,
        public privilegesService: PrivilegesService,
        public localeStorageService: LocalStorageService
    ) { }

    ngOnInit(): void {
        this.userService.user = this.userService.getUserFromLocal();
        if (this.userService.user) {
            this.localeService.getLocales();
            this.localeService.getCurrentLocale();
        }
        const k = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
        let n = 0;
        $(document).keydown((e: any) => {
            if (e.keyCode === k[n++]) {
                if (n === k.length) {
                    $('#konami').fadeIn("slow").delay(2000).fadeOut();
                    n = 0;
                }
            }
            else n = 0;
        });
    }

    getSplitterOrVerifier() {
        return this.localeStorageService.get('splitter_or_verifier');
    }

    toggleProfileDropdown() {
        this.profileDropdownCurrentState = this.profileDropdownCurrentState === 'hide' ? 'show' : 'hide';
        this.profileSettingsCurrentState = this.profileDropdownCurrentState === 'show' && this.profileSettingsCurrentState === 'show' ? 'hide' : this.profileSettingsCurrentState;
    }

    closeprofileDropDown() {
        this.profileDropdownCurrentState = 'hide';
    }

    toggleMobileMenu() {
        this.mobileMenuState = this.mobileMenuState === 'hide' ? 'show' : 'hide';
    }
}
