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
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import { SettingsService } from "../../../../../services/settings.service";
import {FormControl} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-workflow-builder',
    templateUrl: './workflow-builder.component.html',
    styleUrls: ['./workflow-builder.component.scss'],
    providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: {displayDefaultIndicatorType: false},
        },
    ],
})
export class WorkflowBuilderComponent implements OnInit {
    loading         : boolean       = true;
    creationMode    : boolean       = true;
    workflowId      : any;
    idControl       : FormControl   = new FormControl();
    nameControl     : FormControl   = new FormControl();

    constructor(
        private route: ActivatedRoute,
        public serviceSettings: SettingsService,
    ) {}

    ngOnInit() {
        this.serviceSettings.init();
        this.workflowId = this.route.snapshot.params['id'];
        if (this.workflowId) {
            this.creationMode = false;
        }
        this.loading = false;
    }
}
