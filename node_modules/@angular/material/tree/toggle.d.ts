/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CdkTreeNodeToggle } from '@angular/cdk/tree';
/**
 * Wrapper for the CdkTree's toggle with Material design styles.
 */
import * as ɵngcc0 from '@angular/core';
export declare class MatTreeNodeToggle<T, K = T> extends CdkTreeNodeToggle<T, K> {
    get recursive(): boolean;
    set recursive(value: boolean);
    static ɵfac: ɵngcc0.ɵɵFactoryDef<MatTreeNodeToggle<any, any>, never>;
    static ɵdir: ɵngcc0.ɵɵDirectiveDefWithMeta<MatTreeNodeToggle<any, any>, "[matTreeNodeToggle]", never, { "recursive": "matTreeNodeToggleRecursive"; }, {}, never>;
}

//# sourceMappingURL=toggle.d.ts.map