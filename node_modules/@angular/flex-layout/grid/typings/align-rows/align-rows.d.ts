/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, StyleUtils, StyleBuilder, StyleDefinition, MediaMarshaller } from '@angular/flex-layout/core';
import * as ɵngcc0 from '@angular/core';
export interface GridAlignRowsParent {
    inline: boolean;
}
export declare class GridAlignRowsStyleBuilder extends StyleBuilder {
    buildStyles(input: string, parent: GridAlignRowsParent): StyleDefinition;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GridAlignRowsStyleBuilder, never>;
}
export declare class GridAlignRowsDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    get inline(): boolean;
    set inline(val: boolean);
    protected _inline: boolean;
    constructor(elementRef: ElementRef, styleBuilder: GridAlignRowsStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected updateWithValue(value: string): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GridAlignRowsDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<GridAlignRowsDirective, never, never, { "inline": "gdInline"; }, {}, never>;
}
/**
 * 'row alignment' CSS Grid styling directive
 * Configures the alignment in the row direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-18
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-20
 */
export declare class DefaultGridAlignRowsDirective extends GridAlignRowsDirective {
    protected inputs: string[];
    static ɵfac: ɵngcc0.ɵɵFactoryDef<DefaultGridAlignRowsDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<DefaultGridAlignRowsDirective, "  [gdAlignRows],  [gdAlignRows.xs], [gdAlignRows.sm], [gdAlignRows.md],  [gdAlignRows.lg], [gdAlignRows.xl], [gdAlignRows.lt-sm],  [gdAlignRows.lt-md], [gdAlignRows.lt-lg], [gdAlignRows.lt-xl],  [gdAlignRows.gt-xs], [gdAlignRows.gt-sm], [gdAlignRows.gt-md],  [gdAlignRows.gt-lg]", never, { "gdAlignRows": "gdAlignRows"; "gdAlignRows.xs": "gdAlignRows.xs"; "gdAlignRows.sm": "gdAlignRows.sm"; "gdAlignRows.md": "gdAlignRows.md"; "gdAlignRows.lg": "gdAlignRows.lg"; "gdAlignRows.xl": "gdAlignRows.xl"; "gdAlignRows.lt-sm": "gdAlignRows.lt-sm"; "gdAlignRows.lt-md": "gdAlignRows.lt-md"; "gdAlignRows.lt-lg": "gdAlignRows.lt-lg"; "gdAlignRows.lt-xl": "gdAlignRows.lt-xl"; "gdAlignRows.gt-xs": "gdAlignRows.gt-xs"; "gdAlignRows.gt-sm": "gdAlignRows.gt-sm"; "gdAlignRows.gt-md": "gdAlignRows.gt-md"; "gdAlignRows.gt-lg": "gdAlignRows.gt-lg"; }, {}, never>;
}

//# sourceMappingURL=align-rows.d.ts.map