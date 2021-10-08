import { Calculate } from './index';
export declare class Parser {
    private parent;
    constructor(parent?: Calculate);
    private emptyStr;
    private storedStringText;
    private sheetToken;
    /** @hidden */
    tokenAdd: string;
    /** @hidden */
    tokenSubtract: string;
    /** @hidden */
    tokenMultiply: string;
    /** @hidden */
    tokenDivide: string;
    /** @hidden */
    tokenLess: string;
    private charEm;
    private charEp;
    /** @hidden */
    tokenGreater: string;
    /** @hidden */
    tokenEqual: string;
    /** @hidden */
    tokenLessEq: string;
    /** @hidden */
    tokenGreaterEq: string;
    /** @hidden */
    tokenNotEqual: string;
    /** @hidden */
    tokenAnd: string;
    private tokenEm;
    private tokenEp;
    /** @hidden */
    tokenOr: string;
    private charAnd;
    private charLess;
    private charGreater;
    private charEqual;
    private charLessEq;
    private charGreaterEq;
    private charNoEqual;
    private stringGreaterEq;
    private stringLessEq;
    private stringNoEqual;
    private stringAnd;
    private stringOr;
    private charOr;
    private charAdd;
    private charSubtract;
    private charMultiply;
    private charDivide;
    private fixedReference;
    private spaceString;
    private ignoreBracet;
    /** @hidden */
    isError: boolean;
    /** @hidden */
    isFormulaParsed: boolean;
    private findNamedRange;
    private stringsColl;
    private tokens;
    private charNOTop;
    private specialSym;
    private isFailureTriggered;
    /**
     * @hidden
     * @param {string} text - specify the text
     * @param {string} fkey - specify the formula key
     * @returns {string} - returns parse.
     */
    parse(text: string, fkey?: string): string;
    private exceptionArgs;
    private formulaAutoCorrection;
    private checkScopedRange;
    private storeStrings;
    private setStrings;
    /**
     * @hidden
     * @param {string} formulaText - specify the formula text
     * @returns {string} - parse simple.
     */
    parseSimple(formulaText: string): string;
    /**
     * @hidden
     * @param {string} formulaText - specify the formula text
     * @param {string[]} markers -  specify the markers
     * @param {string[]} operators - specify the operators
     * @returns {string} - parse Simple Operators
     */
    parseSimpleOperators(formulaText: string, markers: string[], operators: string[]): string;
    /**
     * @hidden
     * @param {string} text - specify the text
     * @param {string[]} operators - specify the operators
     * @returns {number} - returns index.
     */
    indexOfAny(text: string, operators: string[]): number;
    /**
     * @hidden
     * @param {string} text - specify the text
     * @returns {number} - find Left Marker.
     */
    findLeftMarker(text: string): number;
    /**
     * @hidden
     * @param {string} text - specify the text.
     * @returns {number} - find Right Marker.
     */
    findRightMarker(text: string): number;
    /**
     * @hidden
     * @param {string} formula - specify the formula
     * @param {string} fKey - specify the formula key.
     * @returns {string} - parse formula.
     */
    parseFormula(formula: string, fKey?: string): string;
    /**
     * @hidden
     * @param {string} formula - specify the formula
     * @returns {string} - mark library formulas.
     */
    markLibraryFormulas(formula: string): string;
    /**
     * @hidden
     * @param {string} fSubstr - specify the string
     * @returns {string} - swap inner parens.
     */
    swapInnerParens(fSubstr: string): string;
    /**
     * @hidden
     * @param {string} fSubstr - specify the string
     * @returns {string} - add parens to args.
     */
    addParensToArgs(fSubstr: string): string;
    /**
     * @hidden
     * @param {string} text - specify the text
     * @param {string[]} operators - specify the operators
     * @returns {number} - returns last Index Of Any.
     */
    private lastIndexOfAny;
    /**
     * @hidden
     * @param {string} formula - specify the formula
     * @returns {string} - mark Named Ranges.
     */
    markNamedRanges(formula: string): string;
    /**
     * @hidden
     * @param {string} text - specify the text.
     * @returns {string} - check For Named Range And Key Value
     */
    checkForNamedRangeAndKeyValue(text: string): string;
    private getTableRange;
    private findNextEndIndex;
}
