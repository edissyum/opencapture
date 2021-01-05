import { ModuleWithProviders, Provider } from "@angular/core";
import * as ɵngcc0 from '@angular/core';
import * as ɵngcc1 from './lib/translate.pipe';
import * as ɵngcc2 from './lib/translate.directive';
export * from "./lib/translate.loader";
export * from "./lib/translate.service";
export * from "./lib/missing-translation-handler";
export * from "./lib/translate.parser";
export * from "./lib/translate.compiler";
export * from "./lib/translate.directive";
export * from "./lib/translate.pipe";
export * from "./lib/translate.store";
export interface TranslateModuleConfig {
    loader?: Provider;
    compiler?: Provider;
    parser?: Provider;
    missingTranslationHandler?: Provider;
    isolate?: boolean;
    extend?: boolean;
    useDefaultLang?: boolean;
    defaultLanguage?: string;
}
export declare class TranslateModule {
    /**
     * Use this method in your root module to provide the TranslateService
     */
    static forRoot(config?: TranslateModuleConfig): ModuleWithProviders<TranslateModule>;
    /**
     * Use this method in your other (non root) modules to import the directive/pipe
     */
    static forChild(config?: TranslateModuleConfig): ModuleWithProviders<TranslateModule>;
    static ɵmod: ɵngcc0.ɵɵNgModuleDefWithMeta<TranslateModule, [typeof ɵngcc1.TranslatePipe, typeof ɵngcc2.TranslateDirective], never, [typeof ɵngcc1.TranslatePipe, typeof ɵngcc2.TranslateDirective]>;
    static ɵinj: ɵngcc0.ɵɵInjectorDef<TranslateModule>;
}

//# sourceMappingURL=public_api.d.ts.map