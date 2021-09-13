/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, StyleUtils, MediaMarshaller, StyleBuilder } from '@angular/flex-layout/core';
import * as ɵngcc0 from '@angular/core';
export interface GridGapParent {
    inline: boolean;
}
export declare class GridGapStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridGapParent): {
        display: string;
        'grid-gap': string;
    };
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GridGapStyleBuilder, never>;
}
export declare class GridGapDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    get inline(): boolean;
    set inline(val: boolean);
    protected _inline: boolean;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: GridGapStyleBuilder, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GridGapDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<GridGapDirective, never, never, { "inline": "gdInline"; }, {}, never>;
}
/**
 * 'grid-gap' CSS Grid styling directive
 * Configures the gap between items in the grid
 * Syntax: <row gap> [<column-gap>]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-17
 */
export declare class DefaultGridGapDirective extends GridGapDirective {
    protected inputs: string[];
    static ɵfac: ɵngcc0.ɵɵFactoryDef<DefaultGridGapDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<DefaultGridGapDirective, "  [gdGap],  [gdGap.xs], [gdGap.sm], [gdGap.md], [gdGap.lg], [gdGap.xl],  [gdGap.lt-sm], [gdGap.lt-md], [gdGap.lt-lg], [gdGap.lt-xl],  [gdGap.gt-xs], [gdGap.gt-sm], [gdGap.gt-md], [gdGap.gt-lg]", never, { "gdGap": "gdGap"; "gdGap.xs": "gdGap.xs"; "gdGap.sm": "gdGap.sm"; "gdGap.md": "gdGap.md"; "gdGap.lg": "gdGap.lg"; "gdGap.xl": "gdGap.xl"; "gdGap.lt-sm": "gdGap.lt-sm"; "gdGap.lt-md": "gdGap.lt-md"; "gdGap.lt-lg": "gdGap.lt-lg"; "gdGap.lt-xl": "gdGap.lt-xl"; "gdGap.gt-xs": "gdGap.gt-xs"; "gdGap.gt-sm": "gdGap.gt-sm"; "gdGap.gt-md": "gdGap.gt-md"; "gdGap.gt-lg": "gdGap.gt-lg"; }, {}, never>;
}

//# sourceMappingURL=gap.d.ts.map