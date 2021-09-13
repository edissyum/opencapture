/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AfterViewInit, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { MatDatepickerBase, MatDatepickerControl } from './datepicker-base';
/** Button that will close the datepicker and assign the current selection to the data model. */
import * as ɵngcc0 from '@angular/core';
export declare class MatDatepickerApply {
    private _datepicker;
    constructor(_datepicker: MatDatepickerBase<MatDatepickerControl<unknown>, unknown>);
    _applySelection(): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<MatDatepickerApply, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<MatDatepickerApply, "[matDatepickerApply], [matDateRangePickerApply]", never, {}, {}, never>;
}
/** Button that will close the datepicker and discard the current selection. */
export declare class MatDatepickerCancel {
    _datepicker: MatDatepickerBase<MatDatepickerControl<unknown>, unknown>;
    constructor(_datepicker: MatDatepickerBase<MatDatepickerControl<unknown>, unknown>);
    static ɵfac: ɵngcc0.ɵɵFactoryDef<MatDatepickerCancel, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<MatDatepickerCancel, "[matDatepickerCancel], [matDateRangePickerCancel]", never, {}, {}, never>;
}
/**
 * Container that can be used to project a row of action buttons
 * to the bottom of a datepicker or date range picker.
 */
export declare class MatDatepickerActions implements AfterViewInit, OnDestroy {
    private _datepicker;
    private _viewContainerRef;
    _template: TemplateRef<unknown>;
    private _portal;
    constructor(_datepicker: MatDatepickerBase<MatDatepickerControl<unknown>, unknown>, _viewContainerRef: ViewContainerRef);
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<MatDatepickerActions, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDefWithMeta<MatDatepickerActions, "mat-datepicker-actions, mat-date-range-picker-actions", never, {}, {}, never, ["*"]>;
}

//# sourceMappingURL=datepicker-actions.d.ts.map