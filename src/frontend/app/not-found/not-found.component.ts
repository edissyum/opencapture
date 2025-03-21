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

import { Component, OnInit  } from '@angular/core';
import { NotificationService } from "../../services/notifications/notifications.service";
import { Router } from "@angular/router";
import { _, TranslateService } from "@ngx-translate/core";

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    standalone: false
})
export class NotFoundComponent implements OnInit {
    constructor(
        private router: Router,
        private notify: NotificationService,
        private translate: TranslateService
    ) { }

    ngOnInit(): void {
        this.translate.get('ERROR.404').subscribe((translated: string) => {
            this.notify.error(translated);
            this.router.navigate(['/login']).then();
        });
    }

}
