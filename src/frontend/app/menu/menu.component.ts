import { Component, Input, OnInit } from '@angular/core';
import { Location } from "@angular/common";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { UserService } from "../../services/user.service";
import { LocaleService } from "../../services/locale.service";
import { LocalStorageService } from "../../services/local-storage.service";
import { PrivilegesService } from "../../services/privileges.service";
import { Router } from "@angular/router";

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
        public localeService: LocaleService,
        public privilegesService: PrivilegesService,
        public localeStorageService: LocalStorageService
    ) { }

    ngOnInit(): void {
        this.userService.user = this.userService.getUserFromLocal();
        if (this.userService.user){
            this.localeService.getLocales();
            this.localeService.getCurrentLocale();
        }
    }

    getSplitterOrVerifier() {
        return this.localeStorageService.get('splitter_or_verifier')
    }

    toggleProfileDropdown() {
        this.profileDropdownCurrentState = this.profileDropdownCurrentState === 'hide' ? 'show' : 'hide';
        this.profileSettingsCurrentState = this.profileDropdownCurrentState === 'show' && this.profileSettingsCurrentState == 'show' ? 'hide' : this.profileSettingsCurrentState;
    }

    closeprofileDropDown() {
        this.profileDropdownCurrentState = 'hide';
    }

    toggleMobileMenu() {
        this.mobileMenuState = this.mobileMenuState === 'hide' ? 'show' : 'hide';
    }
}
