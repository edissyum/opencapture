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
export declare class GridAreaStyleBuilder extends StyleBuilder {
    buildStyles(input: string): {
        'grid-area': string;
    };
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GridAreaStyleBuilder, never>;
}
export declare class GridAreaDirective extends BaseDirective2 {
    protected DIRECTIVE_KEY: string;
    constructor(elRef: ElementRef, styleUtils: StyleUtils, styleBuilder: GridAreaStyleBuilder, marshal: MediaMarshaller);
    protected styleCache: Map<string, StyleDefinition>;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GridAreaDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<GridAreaDirective, never, never, {}, {}, never>;
}
/**
 * 'grid-area' CSS Grid styling directive
 * Configures the name or position of an element within the grid
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-27
 */
export declare class DefaultGridAreaDirective extends GridAreaDirective {
    protected inputs: string[];
    static ɵfac: ɵngcc0.ɵɵFactoryDef<DefaultGridAreaDirective, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<DefaultGridAreaDirective, "  [gdArea],  [gdArea.xs], [gdArea.sm], [gdArea.md], [gdArea.lg], [gdArea.xl],  [gdArea.lt-sm], [gdArea.lt-md], [gdArea.lt-lg], [gdArea.lt-xl],  [gdArea.gt-xs], [gdArea.gt-sm], [gdArea.gt-md], [gdArea.gt-lg]", never, { "gdArea": "gdArea"; "gdArea.xs": "gdArea.xs"; "gdArea.sm": "gdArea.sm"; "gdArea.md": "gdArea.md"; "gdArea.lg": "gdArea.lg"; "gdArea.xl": "gdArea.xl"; "gdArea.lt-sm": "gdArea.lt-sm"; "gdArea.lt-md": "gdArea.lt-md"; "gdArea.lt-lg": "gdArea.lt-lg"; "gdArea.lt-xl": "gdArea.lt-xl"; "gdArea.gt-xs": "gdArea.gt-xs"; "gdArea.gt-sm": "gdArea.gt-sm"; "gdArea.gt-md": "gdArea.gt-md"; "gdArea.gt-lg": "gdArea.gt-lg"; }, {}, never>;
}

//# sourceMappingURL=area.d.ts.map