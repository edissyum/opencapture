import { DocumentEditor } from '../../index';
import { WParagraphFormat } from '../index';
import { WListLevel } from '../list/list-level';
import { TableWidget, WTableHolder, EditRangeStartElementBox } from '../viewer/page';
import { Point } from '../editor/editor-helper';
import { WRowFormat } from '../format/row-format';
import { HeightType, WidthType } from '../../base';
import { IWidget, BookmarkElementBox } from '../viewer/page';
/**
 * @private
 */
export interface BookmarkInfo extends IWidget {
    bookmark: BookmarkElementBox;
    startIndex: number;
    endIndex: number;
}
/**
 * @private
 */
export interface EditRangeInfo extends IWidget {
    editStart: EditRangeStartElementBox;
    startIndex: number;
    endIndex: number;
}
/**
 * @private
 */
export declare class ModifiedLevel {
    private ownerListLevelIn;
    private modifiedListLevelIn;
    ownerListLevel: WListLevel;
    modifiedListLevel: WListLevel;
    constructor(owner: WListLevel, modified: WListLevel);
    destroy(): void;
}
/**
 * @private
 */
export declare class ModifiedParagraphFormat {
    private ownerFormatIn;
    private modifiedFormatIn;
    ownerFormat: WParagraphFormat;
    modifiedFormat: WParagraphFormat;
    constructor(ownerFormat: WParagraphFormat, modifiedFormat: WParagraphFormat);
    destroy(): void;
}
/**
 * @private
 */
export declare class RowHistoryFormat {
    startingPoint: Point;
    rowFormat: WRowFormat;
    rowHeightType: HeightType;
    displacement: number;
    constructor(startingPoint: Point, rowFormat: WRowFormat);
    revertChanges(isRedo: boolean, owner: DocumentEditor): void;
}
/**
 * @private
 */
export declare class TableHistoryInfo {
    tableHolder: WTableHolder;
    tableFormat: TableFormatHistoryInfo;
    rows: RowFormatHistoryInfo[];
    tableHierarchicalIndex: string;
    startingPoint: Point;
    owner: DocumentEditor;
    constructor(table: TableWidget, owner: DocumentEditor);
    copyProperties(table: TableWidget): void;
    destroy(): void;
}
/**
 * @private
 */
export declare class TableFormatHistoryInfo {
    leftIndent: number;
    preferredWidth: number;
    preferredWidthType: WidthType;
    allowAutoFit: boolean;
}
/**
 * @private
 */
export declare class RowFormatHistoryInfo {
    gridBefore: number;
    gridAfter: number;
    gridBeforeWidth: number;
    gridBeforeWidthType: WidthType;
    gridAfterWidth: number;
    gridAfterWidthType: WidthType;
    cells: CellFormatHistoryInfo[];
    constructor();
}
/**
 * @private
 */
export declare class CellFormatHistoryInfo {
    columnSpan: number;
    columnIndex: number;
    preferredWidth: number;
    preferredWidthType: WidthType;
}
/**
 * @private
 */
export declare class CellHistoryFormat {
    /**
     * @private
     */
    startingPoint: Point;
    /**
     * @private
     */
    startIndex: number;
    /**
     * @private
     */
    endIndex: number;
    /**
     * @private
     */
    tableHierarchicalIndex: string;
    /**
     * @private
     */
    startX: number;
    /**
     * @private
     */
    startY: number;
    /**
     * @private
     */
    displacement: number;
    constructor(point: Point);
}
