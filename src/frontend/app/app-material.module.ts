import {MAT_DATE_FORMATS} from "@angular/material/core";

export const APP_DATE_FORMATS =
{
    parse: {
        dateInput: { month: 'short', year: 'numeric', day: 'numeric' }
    },
    display: {
        dateInput: 'input',
        monthYearLabel: { month: 'short', year: 'numeric', day: 'numeric' },
        dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
        monthYearA11yLabel: { year: 'numeric', month: 'long' },
    }
};


import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

import { MatTreeModule } from '@angular/material/tree';

@NgModule({
    imports: [
        MatCheckboxModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatInputModule,
        MatTooltipModule,
        MatTabsModule,
        MatSidenavModule,
        MatButtonModule,
        MatCardModule,
        MatButtonToggleModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatToolbarModule,
        MatMenuModule,
        MatGridListModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatExpansionModule,
        MatAutocompleteModule,
        MatSnackBarModule,
        MatIconModule,
        MatDialogModule,
        MatListModule,
        MatChipsModule,
        MatStepperModule,
        MatRadioModule,
        MatSliderModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatTreeModule,
        MatRippleModule,
    ],
    exports: [
        MatCheckboxModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatInputModule,
        MatTooltipModule,
        MatTabsModule,
        MatSidenavModule,
        MatButtonModule,
        MatCardModule,
        MatButtonToggleModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatToolbarModule,
        MatMenuModule,
        MatGridListModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatExpansionModule,
        MatAutocompleteModule,
        MatSnackBarModule,
        MatIconModule,
        MatDialogModule,
        MatListModule,
        MatChipsModule,
        MatStepperModule,
        MatRadioModule,
        MatSliderModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatRippleModule,
        MatTreeModule,
    ],
    providers: [
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    ]
})
export class AppMaterialModule { }
