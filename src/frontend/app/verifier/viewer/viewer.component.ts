import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-viewer',
    templateUrl: './viewer.component.html',
    styleUrls: ['./viewer.component.scss']
})

export class VerifierViewerComponent implements OnInit {
    loading: boolean = true

    constructor(
        private route: ActivatedRoute,
    ) {
    }

    ngOnInit(): void {
        let invoiceId = this.route.snapshot.params['id'];
        console.log(invoiceId)
    }

}
