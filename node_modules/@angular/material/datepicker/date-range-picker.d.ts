/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { MatDatepickerBase, MatDatepickerContent, MatDatepickerControl } from './datepicker-base';
import { DateRange } from './date-selection-model';
/**
 * Input that can be associated with a date range picker.
 * @docs-private
 */
import * as ɵngcc0 from '@angular/core';
export interface MatDateRangePickerInput<D> extends MatDatepickerControl<D> {
    comparisonStart: D | null;
    comparisonEnd: D | null;
}
/** Component responsible for managing the date range picker popup/dialog. */
export declare class MatDateRangePicker<D> extends MatDatepickerBase<MatDateRangePickerInput<D>, DateRange<D>, D> {
    protected _forwardContentValues(instance: MatDatepickerContent<DateRange<D>, D>): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<MatDateRangePicker<any>, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDefWithMeta<MatDateRangePicker<any>, "mat-date-range-picker", ["matDateRangePicker"], {}, {}, never, never>;
}

//# sourceMappingURL=date-range-picker.d.ts.map