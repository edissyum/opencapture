/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, OnChanges } from '@angular/core';
import { BaseDirective2, StyleBuilder, StyleDefinition, StyleUtils, MediaMarshaller } from '@angular/flex-layout/core';
import * as ɵngcc0 from '@angular/core';
export declare class FlexOrderStyleBuilder extends StyleBuilder {
    buildStyles(value: string): {
        order: string | number;
    };
    static ɵfac: ɵngcc0.ɵɵFactoryDef<FlexOrderStyleBuilder, never>;
}
/**
 * 'flex-order' flexbox styling directive
 * Configures the positional ordering of the element in a sorted layout container
 * @see https://css-tricks.com/almanac/properties/o/order/
 */
export declare class FlexOrderDirective extends BaseDirective2 implements OnChanges {
    protected DIRECTIVE_KEY: string;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: FlexOrderStyleBuilder, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<FlexOrderDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<FlexOrderDirective, never, never, {}, {}, never>;
}
export declare class DefaultFlexOrderDirective extends FlexOrderDirective {
    protected inputs: string[];
    static ɵfac: ɵngcc0.ɵɵFactoryDef<DefaultFlexOrderDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<DefaultFlexOrderDirective, "  [fxFlexOrder], [fxFlexOrder.xs], [fxFlexOrder.sm], [fxFlexOrder.md],  [fxFlexOrder.lg], [fxFlexOrder.xl], [fxFlexOrder.lt-sm], [fxFlexOrder.lt-md],  [fxFlexOrder.lt-lg], [fxFlexOrder.lt-xl], [fxFlexOrder.gt-xs], [fxFlexOrder.gt-sm],  [fxFlexOrder.gt-md], [fxFlexOrder.gt-lg]", never, { "fxFlexOrder": "fxFlexOrder"; "fxFlexOrder.xs": "fxFlexOrder.xs"; "fxFlexOrder.sm": "fxFlexOrder.sm"; "fxFlexOrder.md": "fxFlexOrder.md"; "fxFlexOrder.lg": "fxFlexOrder.lg"; "fxFlexOrder.xl": "fxFlexOrder.xl"; "fxFlexOrder.lt-sm": "fxFlexOrder.lt-sm"; "fxFlexOrder.lt-md": "fxFlexOrder.lt-md"; "fxFlexOrder.lt-lg": "fxFlexOrder.lt-lg"; "fxFlexOrder.lt-xl": "fxFlexOrder.lt-xl"; "fxFlexOrder.gt-xs": "fxFlexOrder.gt-xs"; "fxFlexOrder.gt-sm": "fxFlexOrder.gt-sm"; "fxFlexOrder.gt-md": "fxFlexOrder.gt-md"; "fxFlexOrder.gt-lg": "fxFlexOrder.gt-lg"; }, {}, never>;
}

//# sourceMappingURL=flex-order.d.ts.map