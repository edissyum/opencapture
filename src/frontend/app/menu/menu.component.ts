/** This file is part of Open-Capture.

Open-Capture is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Open-Capture is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { Component, Input, OnInit } from '@angular/core';
import { UserService } from "../../services/user.service";
import { AuthService } from "../../services/auth.service";
import { LocaleService } from "../../services/locale.service";
import { PrivilegesService } from "../../services/privileges.service";
import { LocalStorageService } from "../../services/local-storage.service";
import { NotificationService } from "../../services/notifications/notifications.service";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})

export class MenuComponent implements OnInit {
    @Input() image              : any;
    @Input() imageMobile        : any;
    profileDropdownCurrentState : boolean = false;
    mobileMenuState             : boolean = false;

    constructor(
        public router: Router,
        private http: HttpClient,
        public location: Location,
        public authService: AuthService,
        public userService: UserService,
        public translate: TranslateService,
        private notify: NotificationService,
        public localeService: LocaleService,
        public privilegesService: PrivilegesService,
        public localStorageService: LocalStorageService
    ) { }

    ngOnInit(): void {
        setTimeout(() => {
            this.userService.user = this.userService.getUserFromLocal();
        }, 100);

        if (this.userService.user) {
            this.localeService.getLocales();
            this.localeService.getCurrentLocale();
        }

        const k = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let n = 0;
        document.addEventListener('keydown', (e) => {
            if (e.key === k[n++]) {
                if (n === k.length) {
                    const audio = new Audio("assets/imgs/konami.mp3");
                    const konami = document.getElementById('konami');
                    konami!.style.display = "block";
                    konami!.style.transition = "opacity .5s";
                    konami!.style.opacity = "1";
                    audio.volume = 0.3;
                    audio.play().then(r => setTimeout(() => {
                        konami!.style.transition = "opacity 1s";
                        konami!.style.opacity = "0";
                        setTimeout(() => {
                            konami!.style.display = "none";
                        }, 1000);
                    }, 3000));
                    n = 0;
                }
            }
            else n = 0;
        });
    }

    getSplitterOrVerifier() {
        return this.localStorageService.get('splitter_or_verifier');
    }

    toggleProfileDropdown() {
        this.profileDropdownCurrentState = !this.profileDropdownCurrentState;
    }

    closeprofileDropDown() {
        this.profileDropdownCurrentState = false;
    }

    toggleMobileMenu() {
        this.mobileMenuState = !this.mobileMenuState;
    }
}
