import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {LocalStorageService} from "../../services/local-storage.service";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private localeStorageService: LocalStorageService
    ) {
    }

    ngOnInit() {
    }

    setValue(value: string){
        this.localeStorageService.save('splitter_or_verifier', value);
    }
}
