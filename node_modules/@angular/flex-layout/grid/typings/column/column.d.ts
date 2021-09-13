/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { BaseDirective2, StyleUtils, MediaMarshaller, StyleBuilder, StyleDefinition } from '@angular/flex-layout/core';
import * as ɵngcc0 from '@angular/core';
export declare class GridColumnStyleBuilder extends StyleBuilder {
    buildStyles(input: string): {
        'grid-column': string;
    };
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GridColumnStyleBuilder, never>;
}
export declare class GridColumnDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    constructor(elementRef: ElementRef, styleBuilder: GridColumnStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GridColumnDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<GridColumnDirective, never, never, {}, {}, never>;
}
/**
 * 'grid-column' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-26
 */
export declare class DefaultGridColumnDirective extends GridColumnDirective {
    protected inputs: string[];
    static ɵfac: ɵngcc0.ɵɵFactoryDef<DefaultGridColumnDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<DefaultGridColumnDirective, "  [gdColumn],  [gdColumn.xs], [gdColumn.sm], [gdColumn.md], [gdColumn.lg], [gdColumn.xl],  [gdColumn.lt-sm], [gdColumn.lt-md], [gdColumn.lt-lg], [gdColumn.lt-xl],  [gdColumn.gt-xs], [gdColumn.gt-sm], [gdColumn.gt-md], [gdColumn.gt-lg]", never, { "gdColumn": "gdColumn"; "gdColumn.xs": "gdColumn.xs"; "gdColumn.sm": "gdColumn.sm"; "gdColumn.md": "gdColumn.md"; "gdColumn.lg": "gdColumn.lg"; "gdColumn.xl": "gdColumn.xl"; "gdColumn.lt-sm": "gdColumn.lt-sm"; "gdColumn.lt-md": "gdColumn.lt-md"; "gdColumn.lt-lg": "gdColumn.lt-lg"; "gdColumn.lt-xl": "gdColumn.lt-xl"; "gdColumn.gt-xs": "gdColumn.gt-xs"; "gdColumn.gt-sm": "gdColumn.gt-sm"; "gdColumn.gt-md": "gdColumn.gt-md"; "gdColumn.gt-lg": "gdColumn.gt-lg"; }, {}, never>;
}

//# sourceMappingURL=column.d.ts.map