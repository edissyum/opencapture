import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    userId : number | undefined;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        this.userId = this.route.snapshot.params['id']
    }

    }
