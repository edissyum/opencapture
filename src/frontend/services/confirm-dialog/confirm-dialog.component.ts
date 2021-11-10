import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

export interface ConfirmData {
    confirmTitle : string;
    confirmText : string;
    confirmButton : string;
    selectValues: any;
    selectLabel : string;
    confirmButtonColor : string;
    cancelButton : string;
}

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})

export class ConfirmDialogComponent implements OnInit {
    selectData: any;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: ConfirmData,
    ) { }

    ngOnInit(): void {}
}