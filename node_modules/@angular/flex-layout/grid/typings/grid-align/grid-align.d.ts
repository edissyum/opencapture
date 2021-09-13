/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
import { MediaMarshaller, BaseDirective2, StyleBuilder, StyleDefinition, StyleUtils } from '@angular/flex-layout/core';
import * as ɵngcc0 from '@angular/core';
export declare class GridAlignStyleBuilder extends StyleBuilder {
    buildStyles(input: string): {
        [key: string]: string;
    };
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GridAlignStyleBuilder, never>;
}
export declare class GridAlignDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    constructor(elementRef: ElementRef, styleBuilder: GridAlignStyleBuilder, styler: StyleUtils, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GridAlignDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<GridAlignDirective, never, never, {}, {}, never>;
}
/**
 * 'align' CSS Grid styling directive for grid children
 *  Defines positioning of child elements along row and column axis in a grid container
 *  Optional values: {row-axis} values or {row-axis column-axis} value pairs
 *
 *  @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-justify-self
 *  @see https://css-tricks.com/snippets/css/complete-guide-grid/#prop-align-self
 */
export declare class DefaultGridAlignDirective extends GridAlignDirective {
    protected inputs: string[];
    static ɵfac: ɵngcc0.ɵɵFactoryDef<DefaultGridAlignDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<DefaultGridAlignDirective, "  [gdGridAlign],  [gdGridAlign.xs], [gdGridAlign.sm], [gdGridAlign.md], [gdGridAlign.lg],[gdGridAlign.xl],  [gdGridAlign.lt-sm], [gdGridAlign.lt-md], [gdGridAlign.lt-lg], [gdGridAlign.lt-xl],  [gdGridAlign.gt-xs], [gdGridAlign.gt-sm], [gdGridAlign.gt-md], [gdGridAlign.gt-lg]", never, { "gdGridAlign": "gdGridAlign"; "gdGridAlign.xs": "gdGridAlign.xs"; "gdGridAlign.sm": "gdGridAlign.sm"; "gdGridAlign.md": "gdGridAlign.md"; "gdGridAlign.lg": "gdGridAlign.lg"; "gdGridAlign.xl": "gdGridAlign.xl"; "gdGridAlign.lt-sm": "gdGridAlign.lt-sm"; "gdGridAlign.lt-md": "gdGridAlign.lt-md"; "gdGridAlign.lt-lg": "gdGridAlign.lt-lg"; "gdGridAlign.lt-xl": "gdGridAlign.lt-xl"; "gdGridAlign.gt-xs": "gdGridAlign.gt-xs"; "gdGridAlign.gt-sm": "gdGridAlign.gt-sm"; "gdGridAlign.gt-md": "gdGridAlign.gt-md"; "gdGridAlign.gt-lg": "gdGridAlign.gt-lg"; }, {}, never>;
}

//# sourceMappingURL=grid-align.d.ts.map