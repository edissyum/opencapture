import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from "@angular/animations";
import { TranslateService } from "@ngx-translate/core";

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
    title = 'Open-Capture For Invoices';
    image = '';
    profileDropdownCurrentState = 'hide'
    profileSettingsCurrentState = 'hide'
    mobileMenuState = 'hide'

    constructor(
        private titleService: Title,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private translate: TranslateService
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
    }

    toggleProfileDropdown() {
        this.profileDropdownCurrentState = this.profileDropdownCurrentState === 'hide' ? 'show' : 'hide';
        this.profileSettingsCurrentState = this.profileDropdownCurrentState === 'show' && this.profileSettingsCurrentState == 'show' ? 'hide' : this.profileSettingsCurrentState
    }

    toggleSettingsDropdown() {
        this.profileSettingsCurrentState = this.profileSettingsCurrentState === 'hide' ? 'show' : 'hide';
        this.profileDropdownCurrentState = this.profileDropdownCurrentState === 'show' && this.profileSettingsCurrentState == 'show' ? 'hide' : this.profileDropdownCurrentState
    }

    toggleMobileMenu() {
        this.mobileMenuState = this.mobileMenuState === 'hide' ? 'show' : 'hide';
    }

    changeLocale(data: any){
        console.log(data.value)
        console.log(this.translate.use(data.value))
    }
}
