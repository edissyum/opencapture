import { TableAlignment, WidthType, HorizontalAlignment } from '../../base/types';
import { WBorders } from './borders';
import { WShading } from './shading';
import { TableWidget } from '../viewer/page';
/**
 * @private
 */
export declare class WTableFormat {
    private uniqueTableFormat;
    private static uniqueTableFormats;
    private static uniqueFormatType;
    borders: WBorders;
    shading: WShading;
    ownerBase: TableWidget;
    allowAutoFit: boolean;
    cellSpacing: number;
    leftMargin: number;
    topMargin: number;
    rightMargin: number;
    bottomMargin: number;
    tableAlignment: TableAlignment;
    leftIndent: number;
    preferredWidth: number;
    preferredWidthType: WidthType;
    bidi: boolean;
    horizontalPositionAbs: HorizontalAlignment;
    horizontalPosition: number;
    constructor(owner?: TableWidget);
    getPropertyValue(property: string): Object;
    private setPropertyValue;
    private initializeUniqueTableFormat;
    private addUniqueTableFormat;
    private static getPropertyDefaultValue;
    private assignTableMarginValue;
    initializeTableBorders(): void;
    destroy(): void;
    cloneFormat(): WTableFormat;
    hasValue(property: string): boolean;
    copyFormat(format: WTableFormat): void;
    static clear(): void;
}
