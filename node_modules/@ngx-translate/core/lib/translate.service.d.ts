import { EventEmitter, InjectionToken } from "@angular/core";
import { Observable } from "rxjs";
import { MissingTranslationHandler } from "./missing-translation-handler";
import { TranslateCompiler } from "./translate.compiler";
import { TranslateLoader } from "./translate.loader";
import { TranslateParser } from "./translate.parser";
import { TranslateStore } from "./translate.store";
import * as ɵngcc0 from '@angular/core';
export declare const USE_STORE: InjectionToken<string>;
export declare const USE_DEFAULT_LANG: InjectionToken<string>;
export declare const DEFAULT_LANGUAGE: InjectionToken<string>;
export declare const USE_EXTEND: InjectionToken<string>;
export interface TranslationChangeEvent {
    translations: any;
    lang: string;
}
export interface LangChangeEvent {
    lang: string;
    translations: any;
}
export interface DefaultLangChangeEvent {
    lang: string;
    translations: any;
}
export declare class TranslateService {
    store: TranslateStore;
    currentLoader: TranslateLoader;
    compiler: TranslateCompiler;
    parser: TranslateParser;
    missingTranslationHandler: MissingTranslationHandler;
    private useDefaultLang;
    private isolate;
    private extend;
    private loadingTranslations;
    private pending;
    private _onTranslationChange;
    private _onLangChange;
    private _onDefaultLangChange;
    private _defaultLang;
    private _currentLang;
    private _langs;
    private _translations;
    private _translationRequests;
    /**
     * An EventEmitter to listen to translation change events
     * onTranslationChange.subscribe((params: TranslationChangeEvent) => {
       *     // do something
       * });
     */
    get onTranslationChange(): EventEmitter<TranslationChangeEvent>;
    /**
     * An EventEmitter to listen to lang change events
     * onLangChange.subscribe((params: LangChangeEvent) => {
       *     // do something
       * });
     */
    get onLangChange(): EventEmitter<LangChangeEvent>;
    /**
     * An EventEmitter to listen to default lang change events
     * onDefaultLangChange.subscribe((params: DefaultLangChangeEvent) => {
       *     // do something
       * });
     */
    get onDefaultLangChange(): EventEmitter<DefaultLangChangeEvent>;
    /**
     * The default lang to fallback when translations are missing on the current lang
     */
    get defaultLang(): string;
    set defaultLang(defaultLang: string);
    /**
     * The lang currently used
     */
    get currentLang(): string;
    set currentLang(currentLang: string);
    /**
     * an array of langs
     */
    get langs(): string[];
    set langs(langs: string[]);
    /**
     * a list of translations per lang
     */
    get translations(): any;
    set translations(translations: any);
    /**
     *
     * @param store an instance of the store (that is supposed to be unique)
     * @param currentLoader An instance of the loader currently used
     * @param compiler An instance of the compiler currently used
     * @param parser An instance of the parser currently used
     * @param missingTranslationHandler A handler for missing translations.
     * @param useDefaultLang whether we should use default language translation when current language translation is missing.
     * @param isolate whether this service should use the store or not
     * @param extend To make a child module extend (and use) translations from parent modules.
     * @param defaultLanguage Set the default language using configuration
     */
    constructor(store: TranslateStore, currentLoader: TranslateLoader, compiler: TranslateCompiler, parser: TranslateParser, missingTranslationHandler: MissingTranslationHandler, useDefaultLang: boolean, isolate: boolean, extend: boolean, defaultLanguage: string);
    /**
     * Sets the default language to use as a fallback
     */
    setDefaultLang(lang: string): void;
    /**
     * Gets the default language used
     */
    getDefaultLang(): string;
    /**
     * Changes the lang currently used
     */
    use(lang: string): Observable<any>;
    /**
     * Retrieves the given translations
     */
    private retrieveTranslations;
    /**
     * Gets an object of translations for a given language with the current loader
     * and passes it through the compiler
     */
    getTranslation(lang: string): Observable<any>;
    /**
     * Manually sets an object of translations for a given language
     * after passing it through the compiler
     */
    setTranslation(lang: string, translations: Object, shouldMerge?: boolean): void;
    /**
     * Returns an array of currently available langs
     */
    getLangs(): Array<string>;
    /**
     * Add available langs
     */
    addLangs(langs: Array<string>): void;
    /**
     * Update the list of available langs
     */
    private updateLangs;
    /**
     * Returns the parsed result of the translations
     */
    getParsedResult(translations: any, key: any, interpolateParams?: Object): any;
    /**
     * Gets the translated value of a key (or an array of keys)
     * @returns the translated key, or an object of translated keys
     */
    get(key: string | Array<string>, interpolateParams?: Object): Observable<string | any>;
    /**
     * Returns a stream of translated values of a key (or an array of keys) which updates
     * whenever the translation changes.
     * @returns A stream of the translated key, or an object of translated keys
     */
    getStreamOnTranslationChange(key: string | Array<string>, interpolateParams?: Object): Observable<string | any>;
    /**
     * Returns a stream of translated values of a key (or an array of keys) which updates
     * whenever the language changes.
     * @returns A stream of the translated key, or an object of translated keys
     */
    stream(key: string | Array<string>, interpolateParams?: Object): Observable<string | any>;
    /**
     * Returns a translation instantly from the internal state of loaded translation.
     * All rules regarding the current language, the preferred language of even fallback languages will be used except any promise handling.
     */
    instant(key: string | Array<string>, interpolateParams?: Object): string | any;
    /**
     * Sets the translated value of a key, after compiling it
     */
    set(key: string, value: string, lang?: string): void;
    /**
     * Changes the current lang
     */
    private changeLang;
    /**
     * Changes the default lang
     */
    private changeDefaultLang;
    /**
     * Allows to reload the lang file from the file
     */
    reloadLang(lang: string): Observable<any>;
    /**
     * Deletes inner translation
     */
    resetLang(lang: string): void;
    /**
     * Returns the language code name from the browser, e.g. "de"
     */
    getBrowserLang(): string;
    /**
     * Returns the culture language code name from the browser, e.g. "de-DE"
     */
    getBrowserCultureLang(): string;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<TranslateService, never>;
    static ɵprov: ɵngcc0.ɵɵInjectableDef<TranslateService>;
}

//# sourceMappingURL=translate.service.d.ts.map