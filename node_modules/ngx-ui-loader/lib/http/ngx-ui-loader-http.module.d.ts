import { ModuleWithProviders } from '@angular/core';
import { NgxUiLoaderHttpConfig } from '../utils/interfaces';
export declare class NgxUiLoaderHttpModule {
    /**
     * Constructor
     */
    constructor(parentModule: NgxUiLoaderHttpModule);
    /**
     * forRoot
     *
     * @returns A module with its provider dependencies
     */
    static forRoot(httpConfig: NgxUiLoaderHttpConfig): ModuleWithProviders<NgxUiLoaderHttpModule>;
}
