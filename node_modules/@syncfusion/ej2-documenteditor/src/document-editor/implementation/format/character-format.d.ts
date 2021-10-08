import { Underline, HighlightColor, BaselineAlignment, Strikethrough, BiDirectionalOverride } from '../../base/types';
import { WUniqueFormat } from '../../base/unique-format';
import { WStyle } from './style';
import { Revision } from '../track-changes/track-changes';
/**
 * @private
 */
export declare class WCharacterFormat {
    uniqueCharacterFormat: WUniqueFormat;
    private static uniqueCharacterFormats;
    private static uniqueFormatType;
    ownerBase: Object;
    baseCharStyle: WStyle;
    /**
     * @private
     */
    removedIds: string[];
    /**
     * @private
     */
    revisions: Revision[];
    bold: boolean;
    italic: boolean;
    fontSize: number;
    fontFamily: string;
    underline: Underline;
    strikethrough: Strikethrough;
    baselineAlignment: BaselineAlignment;
    highlightColor: HighlightColor;
    fontColor: string;
    bidi: boolean;
    bdo: BiDirectionalOverride;
    boldBidi: boolean;
    italicBidi: boolean;
    fontSizeBidi: number;
    fontFamilyBidi: string;
    allCaps: boolean;
    constructor(node?: Object);
    getPropertyValue(property: string): Object;
    private getDefaultValue;
    private documentCharacterFormat;
    private checkBaseStyle;
    private checkCharacterStyle;
    private setPropertyValue;
    private initializeUniqueCharacterFormat;
    private addUniqueCharacterFormat;
    private static getPropertyDefaultValue;
    isEqualFormat(format: WCharacterFormat): boolean;
    isSameFormat(format: WCharacterFormat): boolean;
    cloneFormat(): WCharacterFormat;
    hasValue(property: string): boolean;
    clearFormat(): void;
    destroy(): void;
    copyFormat(format: WCharacterFormat): void;
    updateUniqueCharacterFormat(format: WCharacterFormat): void;
    static clear(): void;
    applyStyle(baseCharStyle: WStyle): void;
    getValue(property: string): Object;
    mergeFormat(format: WCharacterFormat): void;
}
