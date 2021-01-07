import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Title} from "@angular/platform-browser";
import {NotificationService} from "../../services/notifications/notifications.service";
import {TranslateService} from "@ngx-translate/core";
import {ConfigService} from "../../services/config.service";
import {AuthService} from "../../services/auth.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {UserService} from "../../services/user.service";
import {API_URL} from "../env";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";

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
    profileDropdownCurrentState : string = 'hide'
    profileSettingsCurrentState : string = 'hide'
    mobileMenuState             : string = 'hide'
    user                        : any
    currentLang                 : string = ''
    langs                       : [] = []

    constructor(
        private router: Router,
        public location: Location,
        private http: HttpClient,
        private titleService: Title,
        private notify: NotificationService,
        private translate: TranslateService,
        private activatedRoute: ActivatedRoute,
        private configService: ConfigService,
        private authService: AuthService,
        private userService: UserService,
    ) {
    }

    ngOnInit(): void {
        this.user = this.userService.getUserFromLocal()
        this.getLocales()
        this.getCurrentLocale()
    }

    toggleProfileDropdown() {
        this.profileDropdownCurrentState = this.profileDropdownCurrentState === 'hide' ? 'show' : 'hide';
        this.profileSettingsCurrentState = this.profileDropdownCurrentState === 'show' && this.profileSettingsCurrentState == 'show' ? 'hide' : this.profileSettingsCurrentState
    }

    toggleSettingsDropdown() {
        this.profileSettingsCurrentState = this.profileSettingsCurrentState === 'hide' ? 'show' : 'hide';
        this.profileDropdownCurrentState = this.profileDropdownCurrentState === 'show' && this.profileSettingsCurrentState == 'show' ? 'hide' : this.profileDropdownCurrentState
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

    changeLocale(data: any) {
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.authService.getToken())
        this.http.get(API_URL + '/ws/changeLanguage/' + data.value, {headers}).pipe(
            catchError((err: any) => {
                console.debug(err)
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
        this.currentLang = data.value
        this.translate.use(data.value)
    }

    getCurrentLocale(){
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.authService.getToken())
        this.http.get(API_URL + '/ws/getCurrentLang', {headers}).pipe(
            tap((data: any) => {
                this.currentLang = data.lang
                this.translate.use(this.currentLang)
            }),
            catchError((err: any) => {
                console.debug(err)
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

    getLocales(){
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.authService.getToken())
        this.http.get(API_URL + '/ws/getAllLang', {headers}).pipe(
            tap((data: any) => {
                this.langs = data.langs
            }),
            catchError((err: any) => {
                console.debug(err)
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

}
