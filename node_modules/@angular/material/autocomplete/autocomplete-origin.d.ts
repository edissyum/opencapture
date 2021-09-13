/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef } from '@angular/core';
/** Base class containing all of the functionality for `MatAutocompleteOrigin`. */
import * as ɵngcc0 from '@angular/core';
export declare abstract class _MatAutocompleteOriginBase {
    /** Reference to the element on which the directive is applied. */
    elementRef: ElementRef<HTMLElement>;
    constructor(
    /** Reference to the element on which the directive is applied. */
    elementRef: ElementRef<HTMLElement>);
    static ɵfac: ɵngcc0.ɵɵFactoryDef<_MatAutocompleteOriginBase, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<_MatAutocompleteOriginBase, never, never, {}, {}, never>;
}
/**
 * Directive applied to an element to make it usable
 * as a connection point for an autocomplete panel.
 */
export declare class MatAutocompleteOrigin extends _MatAutocompleteOriginBase {
    static ɵfac: ɵngcc0.ɵɵFactoryDef<MatAutocompleteOrigin, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<MatAutocompleteOrigin, "[matAutocompleteOrigin]", ["matAutocompleteOrigin"], {}, {}, never>;
}

//# sourceMappingURL=autocomplete-origin.d.ts.map