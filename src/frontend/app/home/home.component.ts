import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {LocalStorageService} from "../../services/local-storage.service";
import {PrivilegesService} from "../../services/privileges.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        public privilegesService: PrivilegesService,
        private localeStorageService: LocalStorageService
    ) {
    }

    ngOnInit() {
        this.setValue('')
    }

    setValue(value: string) {
        this.localeStorageService.save('splitter_or_verifier', value);
    }
}
