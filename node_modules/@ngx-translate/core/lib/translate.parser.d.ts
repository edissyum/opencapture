import * as ɵngcc0 from '@angular/core';
export declare abstract class TranslateParser {
    /**
     * Interpolates a string to replace parameters
     * "This is a {{ key }}" ==> "This is a value", with params = { key: "value" }
     * @param expr
     * @param params
     */
    abstract interpolate(expr: string | Function, params?: any): string;
    /**
     * Gets a value from an object by composed key
     * parser.getValue({ key1: { keyA: 'valueI' }}, 'key1.keyA') ==> 'valueI'
     * @param target
     * @param key
     */
    abstract getValue(target: any, key: string): any;
}
export declare class TranslateDefaultParser extends TranslateParser {
    templateMatcher: RegExp;
    interpolate(expr: string | Function, params?: any): string;
    getValue(target: any, key: string): any;
    private interpolateFunction;
    private interpolateString;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<TranslateDefaultParser, never>;
    static ɵprov: ɵngcc0.ɵɵInjectableDef<TranslateDefaultParser>;
}

//# sourceMappingURL=translate.parser.d.ts.map