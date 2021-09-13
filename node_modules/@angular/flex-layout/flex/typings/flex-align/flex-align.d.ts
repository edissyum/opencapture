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
export declare class FlexAlignStyleBuilder extends StyleBuilder {
    buildStyles(input: string): StyleDefinition;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<FlexAlignStyleBuilder, never>;
}
/**
 * 'flex-align' flexbox styling directive
 * Allows element-specific overrides for cross-axis alignments in a layout container
 * @see https://css-tricks.com/almanac/properties/a/align-self/
 */
export declare class FlexAlignDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: FlexAlignStyleBuilder, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<FlexAlignDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<FlexAlignDirective, never, never, {}, {}, never>;
}
export declare class DefaultFlexAlignDirective extends FlexAlignDirective {
    protected inputs: string[];
    static ɵfac: ɵngcc0.ɵɵFactoryDef<DefaultFlexAlignDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<DefaultFlexAlignDirective, "  [fxFlexAlign], [fxFlexAlign.xs], [fxFlexAlign.sm], [fxFlexAlign.md],  [fxFlexAlign.lg], [fxFlexAlign.xl], [fxFlexAlign.lt-sm], [fxFlexAlign.lt-md],  [fxFlexAlign.lt-lg], [fxFlexAlign.lt-xl], [fxFlexAlign.gt-xs], [fxFlexAlign.gt-sm],  [fxFlexAlign.gt-md], [fxFlexAlign.gt-lg]", never, { "fxFlexAlign": "fxFlexAlign"; "fxFlexAlign.xs": "fxFlexAlign.xs"; "fxFlexAlign.sm": "fxFlexAlign.sm"; "fxFlexAlign.md": "fxFlexAlign.md"; "fxFlexAlign.lg": "fxFlexAlign.lg"; "fxFlexAlign.xl": "fxFlexAlign.xl"; "fxFlexAlign.lt-sm": "fxFlexAlign.lt-sm"; "fxFlexAlign.lt-md": "fxFlexAlign.lt-md"; "fxFlexAlign.lt-lg": "fxFlexAlign.lt-lg"; "fxFlexAlign.lt-xl": "fxFlexAlign.lt-xl"; "fxFlexAlign.gt-xs": "fxFlexAlign.gt-xs"; "fxFlexAlign.gt-sm": "fxFlexAlign.gt-sm"; "fxFlexAlign.gt-md": "fxFlexAlign.gt-md"; "fxFlexAlign.gt-lg": "fxFlexAlign.gt-lg"; }, {}, never>;
}

//# sourceMappingURL=flex-align.d.ts.map