import { WStyle } from './style';
import { WList } from '../list/list';
import { WListLevel } from '../list/list-level';
/**
 * @private
 */
export declare class WListFormat {
    private uniqueListFormat;
    private static uniqueListFormats;
    private static uniqueFormatType;
    ownerBase: Object;
    baseStyle: WStyle;
    list: WList;
    listId: number;
    listLevelNumber: number;
    readonly listLevel: WListLevel;
    constructor(node?: Object);
    private getPropertyValue;
    private setPropertyValue;
    private initializeUniqueListFormat;
    private addUniqueListFormat;
    private static getPropertyDefaultValue;
    copyFormat(format: WListFormat): void;
    hasValue(property: string): boolean;
    clearFormat(): void;
    destroy(): void;
    static clear(): void;
    applyStyle(baseStyle: WStyle): void;
    getValue(property: string): Object;
    mergeFormat(format: WListFormat): void;
    cloneListFormat(): WListFormat;
}
