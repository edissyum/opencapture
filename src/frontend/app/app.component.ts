import {Component, OnInit} from '@angular/core';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from "@angular/animations";
import { TranslateService } from "@ngx-translate/core";
import { HttpClient } from "@angular/common/http";
import { NotificationService } from "../services/notifications/notifications.service";

import { ConfigService } from "../services/config.service";
import { AuthService } from "../services/auth.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {
    title   : string = 'Open-Capture For Invoices';
    image   : string = '';
    loading : boolean = true;

    constructor(
        private router: Router,
        public location: Location,
        private http: HttpClient,
        private titleService: Title,
        private notify:NotificationService,
        private translate: TranslateService,
        private activatedRoute: ActivatedRoute
    ) {
    }

    ngOnInit() {
        const appTitle = this.titleService.getTitle();
        this.router.events.pipe(
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
}
