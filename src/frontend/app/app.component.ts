import {Component, Inject, Injectable, OnInit} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from "@angular/animations";
import { TranslateService } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { API_URL } from './env';
import { NotificationService } from "../services/notifications/notifications.service";

import { ConfigService } from "../services/config.service";
import {AuthService} from "../services/auth.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
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

export class AppComponent implements OnInit {
    title                       : string = 'Open-Capture For Invoices';
    image                       : string = '';
    user                        : any;
    profileDropdownCurrentState : string = 'hide'
    profileSettingsCurrentState : string = 'hide'
    mobileMenuState             : string = 'hide'

    constructor(
        private router: Router,
        private http: HttpClient,
        private titleService: Title,
        private notify:NotificationService,
        private translate: TranslateService,
        private activatedRoute: ActivatedRoute,
        private configService: ConfigService,
        private authService: AuthService
    ) {
    }

    ngOnInit() {
        const appTitle = this.titleService.getTitle();
        this.router
            .events.pipe(
            filter(event => event instanceof NavigationEnd),
            map(() => {
                let child = this.activatedRoute.firstChild;
                let child_image = ''
                if (child) {
                    while (child.firstChild) {
                        child = child.firstChild;
                    }

                    if (child.snapshot.data['image']) {
                        child_image = child.snapshot.data['image']
                    }

                    if (child.snapshot.data['title']) {
                        return [child.snapshot.data['title'], child_image];
                    }
                }

                return [appTitle, child_image]
            })
        ).subscribe((data: any) => {
            let ttl = data[0]
            this.image = data[1]
            this.translate.get(ttl).subscribe((data:any)=> {
                this.titleService.setTitle(data + ' - ' + this.title);
            });
        });

        this.configService.readConfig()
        this.user = this.authService.getUserFromLocal()
    }

    toggleProfileDropdown() {
        this.profileDropdownCurrentState = this.profileDropdownCurrentState === 'hide' ? 'show' : 'hide';
        this.profileSettingsCurrentState = this.profileDropdownCurrentState === 'show' && this.profileSettingsCurrentState == 'show' ? 'hide' : this.profileSettingsCurrentState
    }

    toggleSettingsDropdown() {
        this.profileSettingsCurrentState = this.profileSettingsCurrentState === 'hide' ? 'show' : 'hide';
        this.profileDropdownCurrentState = this.profileDropdownCurrentState === 'show' && this.profileSettingsCurrentState == 'show' ? 'hide' : this.profileDropdownCurrentState
    }

    closeSettingsDropDown(){
        this.profileSettingsCurrentState = 'hide';
    }

    closeprofileDropDown(){
        this.profileDropdownCurrentState = 'hide';
    }

    toggleMobileMenu() {
        this.mobileMenuState = this.mobileMenuState === 'hide' ? 'show' : 'hide';
    }

    changeLocale(data: any){
        this.translate.use(data.value)
        // TODO
        // Change locale in config file
    }
}
