import { HeightType, WidthType } from '../../base/types';
import { WBorders } from './borders';
import { TableRowWidget } from '../viewer/page';
import { Revision } from '../track-changes/track-changes';
/**
 * @private
 */
export declare class WRowFormat {
    private uniqueRowFormat;
    private static uniqueRowFormats;
    private static uniqueFormatType;
    /**
     * @private
     */
    borders: WBorders;
    /**
     * @private
     */
    ownerBase: TableRowWidget;
    /**
     * @private
     */
    beforeWidth: number;
    /**
     * @private
     */
    afterWidth: number;
    /**
     * @private
     */
    revisions: Revision[];
    /**
     * @private
     */
    removedIds: string[];
    gridBefore: number;
    gridBeforeWidth: number;
    gridBeforeWidthType: WidthType;
    gridAfter: number;
    gridAfterWidth: number;
    gridAfterWidthType: WidthType;
    allowBreakAcrossPages: boolean;
    isHeader: boolean;
    rightMargin: number;
    height: number;
    heightType: HeightType;
    bottomMargin: number;
    leftIndent: number;
    topMargin: number;
    leftMargin: number;
    constructor(node?: TableRowWidget);
    getPropertyValue(property: string): Object;
    private setPropertyValue;
    private initializeUniqueRowFormat;
    private addUniqueRowFormat;
    private static getPropertyDefaultValue;
    containsMargins(): boolean;
    cloneFormat(): WRowFormat;
    hasValue(property: string): boolean;
    copyFormat(format: WRowFormat): void;
    destroy(): void;
    static clear(): void;
}
