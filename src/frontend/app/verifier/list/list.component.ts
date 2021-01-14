import {Component, OnInit} from '@angular/core';
import {LocalStorageService} from "../../../services/local-storage.service";

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class VerifierListComponent implements OnInit {
    loading = true

    constructor(
        private localeStorageService: LocalStorageService

    ) {}

    ngOnInit(): void {
        this.localeStorageService.save('splitter_or_verifier', 'verifier')
    }


}
