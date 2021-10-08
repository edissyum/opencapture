/**
 * `Metrics` of the font.
 * @private
 */
export declare class Bidi {
    private indexes;
    private indexLevels;
    private mirroringShapeCharacters;
    constructor();
    private doMirrorShaping;
    getLogicalToVisualString(inputText: string, isRtl: boolean): string;
    private setDefaultIndexLevel;
    private doOrder;
    private reArrange;
    private update;
}
export declare class RtlCharacters {
    private types;
    private textOrder;
    private length;
    private result;
    private levels;
    rtlCharacterTypes: number[];
    private readonly L;
    private readonly LRE;
    private readonly LRO;
    private readonly R;
    private readonly AL;
    private readonly RLE;
    private readonly RLO;
    private readonly PDF;
    private readonly EN;
    private readonly ES;
    private readonly ET;
    private readonly AN;
    private readonly CS;
    private readonly NSM;
    private readonly BN;
    private readonly B;
    private readonly S;
    private readonly WS;
    private readonly ON;
    private readonly charTypes;
    constructor();
    getVisualOrder(inputText: string, isRtl: boolean): number[];
    private getCharacterCode;
    private setDefaultLevels;
    private setLevels;
    private updateLevels;
    private doVisualOrder;
    private getEmbeddedCharactersLength;
    private checkEmbeddedCharacters;
    private checkNSM;
    private checkEuropeanDigits;
    private checkArabicCharacters;
    private checkEuropeanNumberSeparator;
    private checkEuropeanNumberTerminator;
    private checkOtherNeutrals;
    private checkOtherCharacters;
    private getLength;
    private checkCommanCharacters;
}
