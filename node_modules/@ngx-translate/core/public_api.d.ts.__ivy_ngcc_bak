import { ModuleWithProviders, Provider } from "@angular/core";
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
}
