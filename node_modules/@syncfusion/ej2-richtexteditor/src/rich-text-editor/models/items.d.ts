/**
 * Export items model
 */
import { IToolsItems, IDropDownItemModel, IRichTextEditor, IListDropDownModel } from '../base/interface';
export declare let templateItems: string[];
export declare let tools: {
    [key: string]: IToolsItems;
};
export declare let alignmentItems: IDropDownItemModel[];
export declare let imageAlignItems: IDropDownItemModel[];
export declare let imageDisplayItems: IDropDownItemModel[];
export declare let tableCellItems: IDropDownItemModel[];
export declare let tableRowsItems: IDropDownItemModel[];
export declare let tableColumnsItems: IDropDownItemModel[];
export declare let TableCellVerticalAlignItems: IDropDownItemModel[];
export declare let TableStyleItems: IDropDownItemModel[];
export declare const predefinedItems: string[];
export declare const fontFamily: IDropDownItemModel[];
export declare const fontSize: IDropDownItemModel[];
export declare const formatItems: IDropDownItemModel[];
export declare const fontColor: {
    [key: string]: string[];
};
export declare const backgroundColor: {
    [key: string]: string[];
};
export declare const numberFormatList: IListDropDownModel[];
export declare const bulletFormatList: IListDropDownModel[];
export declare function updateDropDownLocale(self: IRichTextEditor): void;
