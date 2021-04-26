import { Component, OnInit } from '@angular/core';
import { Location } from "@angular/common";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { UserService } from "../../services/user.service";
import { LocaleService } from "../../services/locale.service";
import { LocalStorageService } from "../../services/local-storage.service";
import {HttpHeaders} from "@angular/common/http";
import {AuthService} from "../../services/auth.service";
import {PrivilegesService} from "../../services/privileges.service";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    animations: [
        trigger('toggle', [
            state('hide', style({
                opacity: 0,
                scale: 0,
            })),
            state('show', style({
                opacity: 100,
                scale: 1,
            })),
            transition('show => hide', animate('350ms ease-out')),
            transition('hide => show', animate('250ms ease-in'))
        ])
    ]
})

export class MenuComponent implements OnInit {
    profileDropdownCurrentState : string = 'hide';
    profileSettingsCurrentState : string = 'hide';
    mobileMenuState             : string = 'hide';

    constructor(
        public location: Location,
        public userService: UserService,
        private authService: AuthService,
        public localeService: LocaleService,
        public privilegesService: PrivilegesService,
        public localeStorageService: LocalStorageService
    ) {
    }

    ngOnInit(): void {
        this.authService.headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.authService.getToken());
        this.userService.user = this.userService.getUserFromLocal();
        this.localeService.getLocales();
        this.localeService.getCurrentLocale();
    }

    getSplitterOrVerifier(){
        return this.localeStorageService.get('splitter_or_verifier')
    }

    toggleProfileDropdown() {
        this.profileDropdownCurrentState = this.profileDropdownCurrentState === 'hide' ? 'show' : 'hide';
        this.profileSettingsCurrentState = this.profileDropdownCurrentState === 'show' && this.profileSettingsCurrentState == 'show' ? 'hide' : this.profileSettingsCurrentState;
    }

    toggleSettingsDropdown() {
        this.profileSettingsCurrentState = this.profileSettingsCurrentState === 'hide' ? 'show' : 'hide';
        this.profileDropdownCurrentState = this.profileDropdownCurrentState === 'show' && this.profileSettingsCurrentState == 'show' ? 'hide' : this.profileDropdownCurrentState;
    }

    closeSettingsDropDown() {
        this.profileSettingsCurrentState = 'hide';
    }

    closeprofileDropDown() {
        this.profileDropdownCurrentState = 'hide';
    }

    toggleMobileMenu() {
        this.mobileMenuState = this.mobileMenuState === 'hide' ? 'show' : 'hide';
    }
}
