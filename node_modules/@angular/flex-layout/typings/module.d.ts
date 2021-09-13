/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ModuleWithProviders } from '@angular/core';
import { LayoutConfigOptions, BreakPoint } from '@angular/flex-layout/core';
/**
 * FlexLayoutModule -- the main import for all utilities in the Angular Layout library
 * * Will automatically provide Flex, Grid, and Extended modules for use in the application
 * * Can be configured using the static withConfig method, options viewable on the Wiki's
 *   Configuration page
 */
import * as ɵngcc0 from '@angular/core';
import * as ɵngcc1 from '@angular/flex-layout/flex';
import * as ɵngcc2 from '@angular/flex-layout/extended';
import * as ɵngcc3 from '@angular/flex-layout/grid';
export declare class FlexLayoutModule {
    /**
     * Initialize the FlexLayoutModule with a set of config options,
     * which sets the corresponding tokens accordingly
     */
    static withConfig(configOptions: LayoutConfigOptions, breakpoints?: BreakPoint | BreakPoint[]): ModuleWithProviders<FlexLayoutModule>;
    constructor(serverModuleLoaded: boolean, platformId: Object);
    static ɵfac: ɵngcc0.ɵɵFactoryDef<FlexLayoutModule, never>;
    static ɵmod: ɵngcc0.ɵɵNgModuleDefWithMeta<FlexLayoutModule, never, [typeof ɵngcc1.FlexModule, typeof ɵngcc2.ExtendedModule, typeof ɵngcc3.GridModule], [typeof ɵngcc1.FlexModule, typeof ɵngcc2.ExtendedModule, typeof ɵngcc3.GridModule]>;
    static ɵinj: ɵngcc0.ɵɵInjectorDef<FlexLayoutModule>;
}

//# sourceMappingURL=module.d.ts.map