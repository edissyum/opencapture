import { Dictionary } from './dictionary';
/**
 * @private
 */
export declare class WUniqueFormat {
    propertiesHash: Dictionary<number, object>;
    referenceCount: number;
    uniqueFormatType: number;
    constructor(type: number);
    /**
     * @private
     */
    isEqual(source: Dictionary<number, object>, property: string, modifiedValue: object): boolean;
    private isNotEqual;
    /**
     * @private
     */
    static getPropertyType(uniqueFormatType: number, property: string): number;
    private static getRowFormatType;
    private static getListFormatType;
    private static getTableFormatType;
    private static getListLevelType;
    private static getShadingPropertyType;
    private static getCellFormatPropertyType;
    private static getBorderPropertyType;
    private static getCharacterFormatPropertyType;
    private static getParaFormatPropertyType;
    private static getSectionFormatType;
    /**
     * @private
     */
    isBorderEqual(source: Dictionary<number, object>, modifiedProperty: string, modifiedValue: Object): boolean;
    /**
     * @private
     */
    isCharacterFormatEqual(source: Dictionary<number, object>, modifiedProperty: string, modifiedValue: object): boolean;
    private isParagraphFormatEqual;
    /**
     * @private
     */
    isCellFormatEqual(source: Dictionary<number, object>, modifiedProperty: string, modifiedValue: Object): boolean;
    /**
     * @private
     */
    isShadingEqual(source: Dictionary<number, object>, modifiedProperty: string, modifiedValue: Object): boolean;
    /**
     * @private
     */
    isRowFormatEqual(source: Dictionary<number, object>, modifiedProperty: string, modifiedValue: Object): boolean;
    /**
     * @private
     */
    isListFormatEqual(source: Dictionary<number, object>, modifiedProperty: string, modifiedValue: Object): boolean;
    /**
     * @private
     */
    isTableFormatEqual(source: Dictionary<number, object>, modifiedProperty: string, modifiedValue: Object): boolean;
    /**
     * @private
     */
    isListLevelEqual(source: Dictionary<number, object>, modifiedProperty: string, modifiedValue: Object): boolean;
    /**
     * @private
     */
    isSectionFormatEqual(source: Dictionary<number, object>, modifiedProperty: string, modifiedValue: Object): boolean;
    /**
     * @private
     */
    cloneItems(format: WUniqueFormat, property: string, value: object, uniqueFormatType: number): void;
    /**
     * @private
     */
    mergeProperties(format: WUniqueFormat): Dictionary<number, object>;
    /**
     * @private
     */
    cloneProperties(): Dictionary<number, object>;
    /**
     * @private
     */
    destroy(): void;
}
