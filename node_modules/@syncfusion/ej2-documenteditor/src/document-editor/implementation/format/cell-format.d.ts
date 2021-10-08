import { CellVerticalAlignment, WidthType } from '../../base/types';
import { WBorders } from './borders';
import { WShading } from './shading';
/**
 * @private
 */
export declare class WCellFormat {
    private uniqueCellFormat;
    private static uniqueCellFormats;
    private static uniqueFormatType;
    borders: WBorders;
    shading: WShading;
    ownerBase: Object;
    leftMargin: number;
    rightMargin: number;
    topMargin: number;
    bottomMargin: number;
    cellWidth: number;
    columnSpan: number;
    rowSpan: number;
    preferredWidth: number;
    verticalAlignment: CellVerticalAlignment;
    preferredWidthType: WidthType;
    constructor(node?: Object);
    getPropertyValue(property: string): Object;
    private setPropertyValue;
    private initializeUniqueCellFormat;
    private addUniqueCellFormat;
    private static getPropertyDefaultValue;
    containsMargins(): boolean;
    destroy(): void;
    cloneFormat(): WCellFormat;
    hasValue(property: string): boolean;
    copyFormat(format: WCellFormat): void;
    static clear(): void;
}
