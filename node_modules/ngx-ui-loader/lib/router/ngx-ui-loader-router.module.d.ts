import { ModuleWithProviders } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from '../core/ngx-ui-loader.service';
import { NgxUiLoaderRouterConfig } from '../utils/interfaces';
import * as ɵngcc0 from '@angular/core';
export declare class NgxUiLoaderRouterModule {
    private exclude;
    /**
     * Constructor
     */
    constructor(parentModule: NgxUiLoaderRouterModule, customConfig: NgxUiLoaderRouterConfig, router: Router, loader: NgxUiLoaderService);
    /**
     * forRoot
     *
     * @returns A module with its provider dependencies
     */
    static forRoot(routerConfig: NgxUiLoaderRouterConfig): ModuleWithProviders<NgxUiLoaderRouterModule>;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<NgxUiLoaderRouterModule, [{ optional: true; skipSelf: true; }, { optional: true; }, null, null]>;
    static ɵmod: ɵngcc0.ɵɵNgModuleDefWithMeta<NgxUiLoaderRouterModule, never, never, never>;
    static ɵinj: ɵngcc0.ɵɵInjectorDef<NgxUiLoaderRouterModule>;
}

//# sourceMappingURL=ngx-ui-loader-router.module.d.ts.map