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

import { environment } from "../env";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { _, TranslateService } from "@ngx-translate/core";
import { UserService } from "../../services/user.service";
import { AuthService } from "../../services/auth.service";
import { LocaleService } from "../../services/locale.service";
import { PrivilegesService } from "../../services/privileges.service";
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { SessionStorageService } from "../../services/session-storage.service";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    standalone: false
})

export class MenuComponent implements OnInit {
    @Input() image       : any;
    @Input() imageMobile : any;
    hideProfileDropdown  : boolean = true;
    mobileMenuState      : boolean = false;
    defaultModule        : string = '';

    constructor(
        public router: Router,
        private http: HttpClient,
        public location: Location,
        public authService: AuthService,
        public userService: UserService,
        public translate: TranslateService,
        public localeService: LocaleService,
        public privilegesService: PrivilegesService,
        public sessionStorageService: SessionStorageService
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
                    audio.play().then(() => setTimeout(() => {
                        konami!.style.transition = "opacity 1s";
                        konami!.style.opacity = "0";
                        setTimeout(() => {
                            konami!.style.display = "none";
                        }, 1000);
                    }, 3000));
                    n = 0;
                }
            }
            else {
                n = 0;
            }
        });

        if (!this.defaultModule) {
            this.http.get(environment['url'] + '/ws/config/getConfigurationNoAuth/defaultModule', {headers: this.authService.headers}).pipe(
                tap((data: any) => {
                    if (data.configuration.length === 1) {
                        this.defaultModule = data.configuration[0].data.value;
                    }
                })
            ).subscribe();
        }
    }

    @HostListener('document:click', ['$event'])
    onScreenClick(event: MouseEvent) {
        const clickedElement = event.target as HTMLElement;
        const userMenu = document.getElementById('user-menu');
        if (userMenu && !userMenu.contains(clickedElement)) {
            this.hideProfileDropdown = true;
        }
    }

    goToUpload() {
        if (this.defaultModule && !this.getSplitterOrVerifier()) {
            this.sessionStorageService.save('splitter_or_verifier', this.defaultModule);
        }
    }

    getSplitterOrVerifier() {
        return this.sessionStorageService.get('splitter_or_verifier');
    }

    toggleProfileDropdown() {
        this.hideProfileDropdown = !this.hideProfileDropdown;
    }

    closeProfileDropDown() {
        this.hideProfileDropdown = false;
    }

    toggleMobileMenu() {
        this.mobileMenuState = !this.mobileMenuState;
    }
}
