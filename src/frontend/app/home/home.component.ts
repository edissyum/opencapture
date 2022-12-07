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

import { Component, OnInit } from '@angular/core';
import { UserService } from "../../services/user.service";
import { LocalStorageService } from "../../services/local-storage.service";
import { PrivilegesService } from "../../services/privileges.service";
import {Router} from "@angular/router";
import {LastUrlService} from "../../services/last-url.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    constructor(
        private router: Router,
        private userService: UserService,
        private routerExtService: LastUrlService,
        public privilegesService: PrivilegesService,
        private localStorageService: LocalStorageService
    ) {}

    ngOnInit() {
        this.setValue('');
        this.localStorageService.save('task_watcher_minimize_display', 'true');
        const splitter = this.privilegesService.hasPrivilege('access_splitter');
        const verifier = this.privilegesService.hasPrivilege('access_verifier');
        const lastUrl = this.routerExtService.getPreviousUrl();
        if (lastUrl === '/login') {
            if (verifier && !splitter) {
                this.router.navigate(['/verifier/list']).then();
            } else if (splitter && !verifier) {
                this.router.navigate(['/splitter/list']).then();
            }
        }
    }

    setValue(value: string) {
        this.localStorageService.save('splitter_or_verifier', value);
    }
}
