import { LineStyle } from '../../base/types';
import { WBorders } from './borders';
/**
 * @private
 */
export declare class WBorder {
    private uniqueBorderFormat;
    private static uniqueBorderFormats;
    private static uniqueFormatType;
    ownerBase: WBorders;
    color: string;
    lineStyle: LineStyle;
    lineWidth: number;
    shadow: boolean;
    space: number;
    hasNoneStyle: boolean;
    readonly isBorderDefined: boolean;
    constructor(node?: WBorders);
    private getPropertyValue;
    private setPropertyValue;
    private initializeUniqueBorder;
    private addUniqueBorderFormat;
    private static getPropertyDefaultValue;
    getLineWidth(): number;
    private getBorderLineWidthArray;
    getBorderWeight(): number;
    private getBorderNumber;
    private getNumberOfLines;
    getPrecedence(): number;
    hasValue(property: string): boolean;
    cloneFormat(): WBorder;
    destroy(): void;
    copyFormat(border: WBorder): void;
    static clear(): void;
}
