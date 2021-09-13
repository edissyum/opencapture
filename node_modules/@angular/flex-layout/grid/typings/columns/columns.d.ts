/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { MediaMarshaller, BaseDirective2, StyleBuilder, StyleUtils } from '@angular/flex-layout/core';
import * as ɵngcc0 from '@angular/core';
export interface GridColumnsParent {
    inline: boolean;
}
export declare class GridColumnsStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridColumnsParent): {
        display: string;
        'grid-auto-columns': string;
        'grid-template-columns': string;
    };
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GridColumnsStyleBuilder, never>;
}
export declare class GridColumnsDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    get inline(): boolean;
    set inline(val: boolean);
    protected _inline: boolean;
    constructor(elementRef: ElementRef, styleBuilder: GridColumnsStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GridColumnsDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<GridColumnsDirective, never, never, { "inline": "gdInline"; }, {}, never>;
}
/**
 * 'grid-template-columns' CSS Grid styling directive
 * Configures the sizing for the columns in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
export declare class DefaultGridColumnsDirective extends GridColumnsDirective {
    protected inputs: string[];
    static ɵfac: ɵngcc0.ɵɵFactoryDef<DefaultGridColumnsDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<DefaultGridColumnsDirective, "  [gdColumns],  [gdColumns.xs], [gdColumns.sm], [gdColumns.md], [gdColumns.lg], [gdColumns.xl],  [gdColumns.lt-sm], [gdColumns.lt-md], [gdColumns.lt-lg], [gdColumns.lt-xl],  [gdColumns.gt-xs], [gdColumns.gt-sm], [gdColumns.gt-md], [gdColumns.gt-lg]", never, { "gdColumns": "gdColumns"; "gdColumns.xs": "gdColumns.xs"; "gdColumns.sm": "gdColumns.sm"; "gdColumns.md": "gdColumns.md"; "gdColumns.lg": "gdColumns.lg"; "gdColumns.xl": "gdColumns.xl"; "gdColumns.lt-sm": "gdColumns.lt-sm"; "gdColumns.lt-md": "gdColumns.lt-md"; "gdColumns.lt-lg": "gdColumns.lt-lg"; "gdColumns.lt-xl": "gdColumns.lt-xl"; "gdColumns.gt-xs": "gdColumns.gt-xs"; "gdColumns.gt-sm": "gdColumns.gt-sm"; "gdColumns.gt-md": "gdColumns.gt-md"; "gdColumns.gt-lg": "gdColumns.gt-lg"; }, {}, never>;
}

//# sourceMappingURL=columns.d.ts.map