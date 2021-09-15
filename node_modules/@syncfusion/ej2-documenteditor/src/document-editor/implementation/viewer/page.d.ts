import { WTableFormat, WRowFormat, WCellFormat } from '../format/index';
import { WidthType, AutoFitType, TextFormFieldType, CheckBoxSizeType, VerticalOrigin, VerticalAlignment, HorizontalOrigin, HorizontalAlignment, LineFormatType, LineDashing, AutoShapeType, ContentControlType, ContentControlWidgetType, TextWrappingStyle, TextWrappingType } from '../../base/types';
import { WListLevel } from '../list/list-level';
import { WParagraphFormat, WCharacterFormat, WSectionFormat, WBorder, WBorders } from '../format/index';
import { L10n } from '@syncfusion/ej2-base';
import { Dictionary } from '../../base/dictionary';
import { ElementInfo, Point, WidthInfo, TextFormFieldInfo, CheckBoxFormFieldInfo, DropDownFormFieldInfo, BorderInfo } from '../editor/editor-helper';
import { HeaderFooterType, TabLeader, FootnoteType } from '../../base/types';
import { TextPosition } from '..';
import { ChartComponent } from '@syncfusion/ej2-office-chart';
import { LayoutViewer, DocumentHelper } from './viewer';
import { Revision } from '../track-changes/track-changes';
/**
 * @private
 */
export declare class Rect {
    /**
     * @private
     */
    width: number;
    /**
     * @private
     */
    height: number;
    /**
     * @private
     */
    x: number;
    /**
     * @private
     */
    y: number;
    readonly right: number;
    readonly bottom: number;
    constructor(x: number, y: number, width: number, height: number);
    /**
     * @param currentBound
     * @private
     */
    isIntersecting(currentBound: Rect): boolean;
    /**
     * @private
     */
    clone(): Rect;
}
/**
 * @private
 */
export declare class Padding {
    right: number;
    left: number;
    top: number;
    bottom: number;
    constructor(right: number, left: number, top: number, bottom: number);
}
/**
 * @private
 */
export declare class Margin {
    /**
     * @private
     */
    left: number;
    /**
     * @private
     */
    top: number;
    /**
     * @private
     */
    right: number;
    /**
     * @private
     */
    bottom: number;
    constructor(leftMargin: number, topMargin: number, rightMargin: number, bottomMargin: number);
    clone(): Margin;
    destroy(): void;
}
/**
 * @private
 */
export interface IWidget {
}
/**
 * @private
 */
export declare abstract class Widget implements IWidget {
    /**
     * @private
     */
    childWidgets: IWidget[];
    /**
     * @private
     */
    x: number;
    /**
     * @private
     */
    y: number;
    /**
     * @private
     */
    width: number;
    /**
     * @private
     */
    height: number;
    /**
     * @private
     */
    margin: Margin;
    /**
     * @private
     */
    containerWidget: Widget;
    /**
     * @private
     */
    index: number;
    readonly indexInOwner: number;
    readonly firstChild: IWidget;
    readonly lastChild: IWidget;
    readonly previousWidget: Widget;
    readonly nextWidget: Widget;
    readonly previousRenderedWidget: Widget;
    readonly nextRenderedWidget: Widget;
    readonly previousSplitWidget: Widget;
    readonly nextSplitWidget: Widget;
    abstract equals(widget: Widget): boolean;
    abstract getTableCellWidget(point: Point): TableCellWidget;
    getPreviousSplitWidgets(): Widget[];
    getSplitWidgets(): Widget[];
    combineWidget(viewer: LayoutViewer): Widget;
    private combine;
    addWidgets(childWidgets: IWidget[]): void;
    removeChild(index: number): void;
    abstract destroyInternal(viewer: LayoutViewer): void;
    destroy(): void;
}
/**
 * @private
 */
export declare abstract class BlockContainer extends Widget {
    /**
     * @private
     */
    page: Page;
    /**
     * @private
     */
    floatingElements: (ShapeBase | TableWidget)[];
    /**
     * @private
     */
    sectionFormatIn: WSectionFormat;
    sectionFormat: WSectionFormat;
    readonly sectionIndex: number;
    getHierarchicalIndex(hierarchicalIndex: string): string;
}
/**
 * @private
 */
export declare class BodyWidget extends BlockContainer {
    /**
     * Initialize the constructor of BodyWidget
     */
    constructor();
    equals(widget: Widget): boolean;
    getHierarchicalIndex(hierarchicalIndex: string): string;
    getTableCellWidget(touchPoint: Point): TableCellWidget;
    destroyInternal(viewer: LayoutViewer): void;
    destroy(): void;
}
/**
 * @private
 */
export interface HeaderFooters {
    [key: number]: HeaderFooterWidget;
}
/**
 * @private
 */
export declare class HeaderFooterWidget extends BlockContainer {
    /**
     * @private
     */
    headerFooterType: HeaderFooterType;
    /**
     * @private
     */
    isEmpty: boolean;
    constructor(type: HeaderFooterType);
    getTableCellWidget(point: Point): TableCellWidget;
    equals(widget: Widget): boolean;
    clone(): HeaderFooterWidget;
    destroyInternal(viewer: LayoutViewer): void;
}
/**
 * @private
 */
export declare abstract class BlockWidget extends Widget {
    /**
     * @private
     */
    isLayouted: boolean;
    /**
     * @private
     */
    leftBorderWidth: number;
    /**
     * @private
     */
    rightBorderWidth: number;
    /**
     * @private
     */
    topBorderWidth: number;
    /**
     * @private
     */
    bottomBorderWidth: number;
    /**
     * @private
     */
    locked: boolean;
    /**
     * @private
     */
    lockedBy: string;
    /**
     * @private
     */
    contentControlProperties: ContentControlProperties;
    footNoteReference: FootnoteElementBox;
    readonly bodyWidget: BlockContainer;
    readonly leftIndent: number;
    readonly rightIndent: number;
    readonly isInsideTable: boolean;
    readonly isInHeaderFooter: boolean;
    readonly associatedCell: TableCellWidget;
    /**
     * Check whether the paragraph contains only page break.
     *
     * @private
     * @returns {boolean}: Returns true if paragraph contains page break alone.
     */
    isPageBreak(): boolean;
    getHierarchicalIndex(hierarchicalIndex: string): string;
    abstract getMinimumAndMaximumWordWidth(minimumWordWidth: number, maximumWordWidth: number): WidthInfo;
    abstract clone(): BlockWidget;
    getIndex(): number;
    getContainerWidth(): number;
    readonly bidi: boolean;
}
/**
 * @private
 */
export declare class FootNoteWidget extends BlockContainer {
    getMinimumAndMaximumWordWidth(minimumWordWidth: number, maximumWordWidth: number): WidthInfo;
    /**
     * @private
     */
    footNoteType: FootnoteType;
    /**
     * @private
     */
    containerWidget: BodyWidget;
    /**
     * @private
     */
    block: BlockWidget;
    getTableCellWidget(point: Point): TableCellWidget;
    equals(widget: Widget): boolean;
    clone(): FootNoteWidget;
    destroyInternal(viewer: LayoutViewer): void;
}
/**
 * @private
 */
export declare class ParagraphWidget extends BlockWidget {
    /**
     * @private
     */
    paragraphFormat: WParagraphFormat;
    /**
     * @private
     */
    characterFormat: WCharacterFormat;
    /**
     * @private
     */
    isChangeDetected: boolean;
    /**
     * @private
     */
    floatingElements: ShapeBase[];
    readonly isEndsWithPageBreak: boolean;
    /**
     * Initialize the constructor of ParagraphWidget
     */
    constructor();
    equals(widget: Widget): boolean;
    isContainsShapeAlone(): boolean;
    isEmpty(): boolean;
    getInline(offset: number, indexInInline: number): ElementInfo;
    getLength(): number;
    getTableCellWidget(point: Point): TableCellWidget;
    getMinimumAndMaximumWordWidth(minimumWordWidth: number, maximumWordWidth: number): WidthInfo;
    private measureParagraph;
    clone(): ParagraphWidget;
    destroyInternal(viewer: LayoutViewer): void;
    destroy(): void;
}
/**
 * @private
 */
export declare class TablePosition {
    /**
     * @private
     */
    allowOverlap: boolean;
    /**
     * @private
     */
    distanceTop: number;
    /**
     * @private
     */
    distanceRight: number;
    /**
     * @private
     */
    distanceLeft: number;
    /**
     * @private
     */
    distanceBottom: number;
    /**
    * @private
    */
    verticalOrigin: string;
    /**
     * @private
     */
    verticalAlignment: VerticalAlignment;
    /**
     * @private
     */
    verticalPosition: number;
    /**
     * @private
     */
    horizontalOrigin: string;
    /**
     * @private
     */
    horizontalAlignment: HorizontalAlignment;
    /**
     * @private
     */
    horizontalPosition: number;
    /**
     * @private
     */
    clone(): TablePosition;
}
/**
 * @private
 */
export declare class TableWidget extends BlockWidget {
    private flags;
    /**
     * @private
     */
    leftMargin: number;
    /**
     * @private
     */
    topMargin: number;
    /**
     * @private
     */
    rightMargin: number;
    /**
     * @private
     */
    bottomMargin: number;
    /**
     * @private
     */
    tableFormat: WTableFormat;
    /**
     * @private
     */
    spannedRowCollection: Dictionary<number, number>;
    /**
     * @private
     */
    tableHolder: WTableHolder;
    /**
     * @private
     */
    headerHeight: number;
    /**
     * @private
     */
    description: string;
    /**
     * @private
     */
    title: string;
    /**
     * @private
     */
    tableCellInfo: Dictionary<number, Dictionary<number, number>>;
    /**
     * @private
     */
    isDefaultFormatUpdated: boolean;
    /**
     * @private
     */
    wrapTextAround: boolean;
    /**
     * @private
     */
    positioning: TablePosition;
    /**
     * @private
     */
    /**
    * @private
    */
    isGridUpdated: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    continueHeader: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    header: boolean;
    isBidiTable: boolean;
    constructor();
    /**
     * @private
     */
    equals(widget: Widget): boolean;
    /**
     * @private
     */
    combineRows(viewer: LayoutViewer): void;
    /**
     * @private
     */
    contains(tableCell: TableCellWidget): boolean;
    /**
     * @private
     */
    getOwnerWidth(isBasedOnViewer: boolean): number;
    /**
     * @private
     */
    getTableWidth(): number;
    /**
     * @private
     */
    getTableCellWidth(): number;
    /**
     * @private
     */
    getTableClientWidth(clientWidth: number): number;
    /**
     * @private
     */
    getCellWidth(preferredWidth: number, preferredWidthType: WidthType, containerWidth: number, cell: TableCellWidget): number;
    /**
     * @private
     */
    fitCellsToClientArea(clientWidth: number): void;
    /**
     * @private
     */
    getTableCellWidget(point: Point): TableCellWidget;
    /**
     * @private
     */
    calculateGrid(): void;
    private updateColumnSpans;
    /**
     * @private
     */
    getMinimumAndMaximumWordWidth(minimumWordWidth: number, maximumWordWidth: number): WidthInfo;
    /**
     * @private
     */
    checkTableColumns(): void;
    /**
     * @private
     */
    isAutoFit(): boolean;
    /**
     * @private
     */
    buildTableColumns(): void;
    /**
     * @private
     */
    setWidthToCells(tableWidth: number, isAutoWidth: boolean): void;
    /**
     * @private
     */
    updateProperties(updateAllowAutoFit: boolean, currentSelectedTable: TableWidget, autoFitBehavior: AutoFitType): void;
    /**
     * @private
     */
    getMaxRowWidth(clientWidth: number): number;
    /**
     * @private
     */
    updateWidth(dragValue: number): void;
    /**
     * @private
     */
    convertPointToPercent(tablePreferredWidth: number, ownerWidth: number): number;
    updateChildWidgetLeft(left: number): void;
    /**
     * Shift the widgets for right to left aligned table.
     * @private
     */
    shiftWidgetsForRtlTable(clientArea: Rect, tableWidget: TableWidget): void;
    /**
     * @private
     */
    clone(): TableWidget;
    /**
     * @private
     */
    static getTableOf(node: WBorders): TableWidget;
    /**
     * @private
     */
    fitChildToClientArea(): void;
    /**
     * @private
     */
    getColumnCellsForSelection(startCell: TableCellWidget, endCell: TableCellWidget): TableCellWidget[];
    /**
     * Splits width equally for all the cells.
     * @param tableClientWidth
     * @private
     */
    splitWidthToTableCells(tableClientWidth: number, isZeroWidth?: boolean): void;
    /**
     * @private
     */
    insertTableRowsInternal(tableRows: TableRowWidget[], startIndex: number, isInsertRow?: boolean): void;
    /**
     * @private
     */
    updateRowIndex(startIndex: number): void;
    /**
     * @private
     */
    getCellStartOffset(cell: TableCellWidget): number;
    /**
     * @private
     */
    destroyInternal(viewer: LayoutViewer): void;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class TableRowWidget extends BlockWidget {
    /**
     * @private
     */
    topBorderWidth: number;
    /**
     * @private
     */
    bottomBorderWidth: number;
    /**
     * @private
     */
    rowFormat: WRowFormat;
    /**
     * @private
     */
    contentControlProperties: ContentControlProperties;
    /**
     * @private
     */
    readonly rowIndex: number;
    /**
     * @private
     */
    readonly ownerTable: TableWidget;
    /**
     * @private
     */
    readonly nextRow: TableRowWidget;
    constructor();
    /**
     * @private
     */
    equals(widget: Widget): boolean;
    /**
     * @private
     */
    combineCells(viewer: LayoutViewer): void;
    /**
     * @private
     */
    static getRowOf(node: WBorders): TableRowWidget;
    /**
     * @private
     */
    getCell(rowIndex: number, cellIndex: number): TableCellWidget;
    /**
     * @private
     */
    splitWidthToRowCells(tableClientWidth: number, isZeroWidth?: boolean): void;
    /**
     * @private
     */
    getGridCount(tableGrid: number[], cell: TableCellWidget, index: number, containerWidth: number): number;
    private getOffsetIndex;
    private getCellOffset;
    /**
     * @private
     */
    updateRowBySpannedCells(): void;
    /**
     * @private
     */
    getPreviousRowSpannedCells(include?: boolean): TableCellWidget[];
    /**
     * @private
     */
    getTableCellWidget(point: Point): TableCellWidget;
    /**
     * @private
     */
    getMinimumAndMaximumWordWidth(minimumWordWidth: number, maximumWordWidth: number): WidthInfo;
    /**
     * @private
     */
    destroyInternal(viewer: LayoutViewer): void;
    /**
     * @private
     */
    clone(): TableRowWidget;
    /**
     * Updates the child widgets left.
     * @param left
     * @private
     */
    updateChildWidgetLeft(left: number): void;
    /**
     * Shift the widgets for RTL table.
     * @param clientArea
     * @param tableWidget
     * @param rowWidget
     * @private
     */
    shiftWidgetForRtlTable(clientArea: Rect, tableWidget: TableWidget, rowWidget: TableRowWidget): void;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class TableCellWidget extends BlockWidget {
    /**
     * @private
     */
    rowIndex: number;
    /**
     * @private
     */
    cellFormat: WCellFormat;
    /**
     * @private
     */
    columnIndex: number;
    private sizeInfoInternal;
    /**
     * @private
     */
    contentControlProperties: ContentControlProperties;
    /**
     * @private
     */
    updatedTopBorders: BorderInfo[];
    /**
     * @private
     */
    readonly ownerColumn: WColumn;
    /**
     * @private
     */
    readonly leftMargin: number;
    /**
     * @private
     */
    readonly topMargin: number;
    /**
     * @private
     */
    readonly rightMargin: number;
    /**
     * @private
     */
    readonly bottomMargin: number;
    /**
     * @private
     */
    readonly cellIndex: number;
    /**
     * @private
     */
    readonly ownerTable: TableWidget;
    /**
     * @private
     */
    readonly ownerRow: TableRowWidget;
    /**
     * @private
     */
    readonly sizeInfo: ColumnSizeInfo;
    constructor();
    /**
     * @private
     */
    equals(widget: Widget): boolean;
    /**
     * @private
     */
    getContainerTable(): TableWidget;
    /**
     * @private
     */
    getPreviousSplitWidget(): TableCellWidget;
    /**
     * @private
     */
    getNextSplitWidget(): TableCellWidget;
    /**
     * @private
     */
    getTableCellWidget(point: Point): TableCellWidget;
    /**
     * @private
     */
    updateWidth(preferredWidth: number): void;
    /**
     * @private
     */
    getCellWidth(block: BlockWidget): number;
    /**
     * @private
     */
    convertPointToPercent(cellPreferredWidth: number): number;
    /**
     * @private
     */
    static getCellLeftBorder(tableCell: TableCellWidget): WBorder;
    /**
     * @private
     */
    getLeftBorderWidth(): number;
    /**
     * @private
     */
    getRightBorderWidth(): number;
    /**
     * @private
     */
    getCellSpacing(): number;
    /**
     * @private
     */
    getCellSizeInfo(isAutoFit: boolean): ColumnSizeInfo;
    /**
     * @private
     */
    getMinimumPreferredWidth(): number;
    /**
     * @private
     */
    getPreviousCellLeftBorder(leftBorder: WBorder, previousCell: TableCellWidget): WBorder;
    /**
     * @private
     */
    getBorderBasedOnPriority(border: WBorder, adjacentBorder: WBorder): WBorder;
    /**
     * @private
     */
    getLeftBorderToRenderByHierarchy(leftBorder: WBorder, rowBorders: WBorders, tableBorders: WBorders): WBorder;
    /**
     * @private
     */
    static getCellRightBorder(tableCell: TableCellWidget): WBorder;
    /**
     * @private
     */
    getAdjacentCellRightBorder(rightBorder: WBorder, nextCell: TableCellWidget): WBorder;
    /**
     * @private
     */
    getRightBorderToRenderByHierarchy(rightBorder: WBorder, rowBorders: WBorders, tableBorders: WBorders): WBorder;
    /**
     * @private
     */
    static getCellTopBorder(tableCell: TableCellWidget): WBorder;
    /**
     * @private
     */
    getPreviousCellTopBorder(topBorder: WBorder, previousTopCell: TableCellWidget): WBorder;
    /**
     * @private
     */
    getTopBorderToRenderByHierarchy(topBorder: WBorder, rowBorders: WBorders, tableBorders: WBorders): WBorder;
    /**
     * @private
     */
    static getCellBottomBorder(tableCell: TableCellWidget): WBorder;
    /**
     * @private
     */
    getAdjacentCellBottomBorder(bottomBorder: WBorder, nextBottomCell: TableCellWidget): WBorder;
    /**
     * @private
     */
    getBottomBorderToRenderByHierarchy(bottomBorder: WBorder, rowBorders: WBorders, tableBorders: WBorders): WBorder;
    private convertHexToRGB;
    /**
     * @private
     */
    static getCellOf(node: WBorders): TableCellWidget;
    /**
     * Updates the Widget left.
     * @private
     */
    updateWidgetLeft(x: number): void;
    /**
     * @private
     */
    updateChildWidgetLeft(left: number): void;
    /**
     * @private
     */
    getMinimumAndMaximumWordWidth(minimumWordWidth: number, maximumWordWidth: number): WidthInfo;
    /**
     * @private
     */
    destroyInternal(viewer: LayoutViewer): void;
    /**
     * @private
     */
    clone(): TableCellWidget;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class LineWidget implements IWidget {
    /**
     * @private
     */
    children: ElementBox[];
    /**
     * @private
     */
    paragraph: ParagraphWidget;
    /**
     * @private
     */
    x: number;
    /**
     * @private
     */
    y: number;
    /**
     * @private
     */
    width: number;
    /**
     * @private
     */
    height: number;
    /**
     * @private
     */
    marginTop: number;
    /**
     * @private
     */
    readonly indexInOwner: number;
    /**
     * @private
     */
    readonly nextLine: LineWidget;
    /**
     * @private
     */
    readonly previousLine: LineWidget;
    /**
     * @private
     */
    readonly isEndsWithPageBreak: boolean;
    /**
     * Initialize the constructor of LineWidget
     */
    constructor(paragraphWidget: ParagraphWidget);
    /**
     * @private
     */
    isFirstLine(): boolean;
    /**
     * @private
     */
    isLastLine(): boolean;
    /**
     * @private
     */
    getOffset(inline: ElementBox, index: number): number;
    /**
     * @private
     */
    getEndOffset(): number;
    /**
     * @private
     * @param offset
     * @param isOffset
     * @param inline
     * @param isEndOffset
     */
    getInlineForOffset(offset: number, isOffset?: boolean, inline?: ElementBox, isEndOffset?: boolean, isPrevOffset?: boolean, isNxtOffset?: boolean): ElementInfo;
    getInlineForRtlLine(offset: number, isOffset?: boolean, inline?: ElementBox): ElementInfo;
    /**
     * @private
     */
    getInline(offset: number, indexInInline: number, bidi?: boolean, isInsert?: boolean): ElementInfo;
    /**
     * Method to retrieve next element
     * @param line
     * @param index
     */
    private getNextTextElement;
    /**
     * @private
     */
    getHierarchicalIndex(hierarchicalIndex: string): string;
    /**
     * @private
     */
    clone(): LineWidget;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare abstract class ElementBox {
    /**
     * @private
     */
    x: number;
    /**
     * @private
     */
    y: number;
    /**
     * @private
     */
    width: number;
    /**
     * @private
     */
    height: number;
    /**
     * @private
     */
    margin: Margin;
    /**
     * @private
     */
    padding: Margin;
    /**
     * @private
     */
    line: LineWidget;
    /**
     * @private
     */
    characterFormat: WCharacterFormat;
    /**
     * @private
     */
    static objectCharacter: string;
    /**
     * @private
     */
    isRightToLeft: boolean;
    /**
     * @private
     */
    canTrigger: boolean;
    /**
     * @private
     */
    ischangeDetected: boolean;
    /**
     * @private
     */
    isVisible: boolean;
    /**
     * @private
     */
    isSpellChecked?: boolean;
    /**
     * @private
     */
    revisions: Revision[];
    /**
     * @private
     */
    canTrack: boolean;
    /**
     * @private
     */
    removedIds: string[];
    /**
     * @private
     */
    isMarkedForRevision: boolean;
    /**
     * @private
     */
    contentControlProperties: ContentControlProperties;
    /**
     * @private
     */
    readonly isPageBreak: boolean;
    /**
     * @private
     * Method to indicate whether current element is trackable.
     */
    readonly isValidNodeForTracking: boolean;
    /**
     * @private
     */
    linkFieldCharacter(documentHelper: DocumentHelper): void;
    /**
     * @private
     */
    linkFieldTraversingBackward(line: LineWidget, fieldEnd: FieldElementBox, previousNode: ElementBox): boolean;
    /**
     * @private
     */
    linkFieldTraversingForward(line: LineWidget, fieldBegin: FieldElementBox, previousNode: ElementBox): boolean;
    /**
     * @private
     */
    linkFieldTraversingBackwardSeparator(line: LineWidget, fieldSeparator: FieldElementBox, previousNode: ElementBox): boolean;
    /**
     * @private
     */
    readonly length: number;
    /**
     * @private
     */
    readonly indexInOwner: number;
    /**
     * @private
     */
    readonly previousElement: ElementBox;
    /**
     * @private
     */
    readonly nextElement: ElementBox;
    /**
     * @private
     */
    readonly nextNode: ElementBox;
    /**
     * @private
     */
    readonly nextValidNodeForTracking: ElementBox;
    /**
     * @private
     */
    readonly previousValidNodeForTracking: ElementBox;
    /**
     * @private
     */
    readonly previousNode: ElementBox;
    /**
     * @private
     */
    readonly paragraph: ParagraphWidget;
    /**
     * Initialize the constructor of ElementBox
     */
    constructor();
    /**
     * @private
     */
    abstract getLength(): number;
    /**
     * @private
     */
    abstract clone(): ElementBox;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class FieldElementBox extends ElementBox {
    /**
     * @private
     */
    fieldType: number;
    /**
     * @private
     */
    fieldCodeType: string;
    /**
     * @private
     */
    hasFieldEnd: boolean;
    /**
     * @private
     */
    formFieldData: FormField;
    private fieldBeginInternal;
    private fieldSeparatorInternal;
    private fieldEndInternal;
    fieldBegin: FieldElementBox;
    fieldSeparator: FieldElementBox;
    fieldEnd: FieldElementBox;
    /**
     * @private
     */
    readonly resultText: string;
    constructor(type: number);
    /**
     * @private
     */
    getLength(): number;
    /**
     * @private
     */
    clone(): FieldElementBox;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare abstract class FormField {
    name: string;
    /**
     * @private
     */
    enabled: boolean;
    /**
     * @private
     */
    helpText: string;
    /**
     * @private
     */
    statusText: string;
    /**
     * @private
     */
    abstract clone(): FormField;
    /**
     * @private
     */
    abstract getFormFieldInfo(): TextFormFieldInfo | CheckBoxFormFieldInfo | DropDownFormFieldInfo;
    /**
     * @private
     */
    abstract copyFieldInfo(info: TextFormFieldInfo | CheckBoxFormFieldInfo | DropDownFormFieldInfo): void;
}
/**
 * @private
 */
export declare class TextFormField extends FormField {
    /**
     * @private
     */
    type: TextFormFieldType;
    /**
     * @private
     */
    maxLength: number;
    /**
     * @private
     */
    defaultValue: string;
    /**
     * @private
     */
    format: string;
    /**
     * @private
     */
    clone(): TextFormField;
    /**
     * @private
     */
    getFormFieldInfo(): TextFormFieldInfo;
    /**
     * @private
     */
    copyFieldInfo(info: TextFormFieldInfo): void;
}
/**
 * @private
 */
export declare class CheckBoxFormField extends FormField {
    /**
     * @private
     */
    sizeType: CheckBoxSizeType;
    /**
     * @private
     */
    size: number;
    /**
     * @private
     */
    defaultValue: boolean;
    /**
     * @private
     */
    checked: boolean;
    /**
     * @private
     */
    clone(): CheckBoxFormField;
    /**
     * @private
     */
    getFormFieldInfo(): CheckBoxFormFieldInfo;
    /**
     * @private
     */
    copyFieldInfo(info: CheckBoxFormFieldInfo): void;
}
/**
 * @private
 */
export declare class DropDownFormField extends FormField {
    /**
     * @private
     */
    dropdownItems: string[];
    /**
     * @private
     */
    selectedIndex: number;
    /**
     * @private
     */
    clone(): DropDownFormField;
    /**
     * @private
     */
    getFormFieldInfo(): DropDownFormFieldInfo;
    /**
     * @private
     */
    copyFieldInfo(info: DropDownFormFieldInfo): void;
}
/**
 * @private
 */
export declare class TextElementBox extends ElementBox {
    /**
     * @private
     */
    baselineOffset: number;
    /**
     * @private
     */
    text: string;
    /**
     * @private
     */
    trimEndWidth: number;
    /**
     * @private
     */
    errorCollection?: ErrorTextElementBox[];
    /**
     * @private
     */
    ignoreOnceItems?: string[];
    /**
     * @private
     */
    istextCombined?: boolean;
    constructor();
    /**
     * @private
     */
    getLength(): number;
    /**
     * @private
     */
    clone(): TextElementBox;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class Footnote {
    /**
     * @private
     */
    separator: BlockWidget[];
    /**
     * @private
     */
    continuationSeparator: BlockWidget[];
    /**
     * @private
     */
    continuationNotice: BlockWidget[];
    constructor();
    /**
     * @private
     */
    clear(): void;
    destroy(): void;
}
/**
 * @private
 */
export declare class FootnoteElementBox extends TextElementBox {
    /**
     * @private
     */
    footnoteType: FootnoteType;
    /**
     * @private
     */
    characterFormat: WCharacterFormat;
    /**
     * @private
     */
    blocks: BlockWidget[];
    /**
     * @private
     */
    symbolCode: string;
    /**
     * @private
     */
    height: number;
    /**
     * @private
     */
    index: boolean;
    isLayout: boolean;
    /**
     * @private
     */
    symbolFontName: string;
    /**
     * @private
     */
    customMarker: string;
    constructor();
    clone(): FootnoteElementBox;
    getLength(): number;
    destroy(): void;
}
/**
 * @private
 */
export declare class ErrorTextElementBox extends TextElementBox {
    private startIn;
    private endIn;
    start: TextPosition;
    end: TextPosition;
    constructor();
    destroy(): void;
}
/**
 * @private
 */
export declare class FieldTextElementBox extends TextElementBox {
    /**
     * @private
     */
    fieldBegin: FieldElementBox;
    private fieldText;
    text: string;
    constructor();
    /**
     * @private
     */
    clone(): FieldTextElementBox;
}
/**
 * @private
 */
export declare class TabElementBox extends TextElementBox {
    /**
     * @private
     */
    tabText: string;
    /**
     * @private
     */
    tabLeader: TabLeader;
    /**
     * @private
     */
    destroy(): void;
    constructor();
    /**
     * @private
     */
    clone(): TabElementBox;
}
/**
 * @private
 */
export declare class BookmarkElementBox extends ElementBox {
    private bookmarkTypeIn;
    private refereneceIn;
    private nameIn;
    /**
     * @private
     */
    readonly bookmarkType: number;
    /**
     * @private
     */
    /**
    * @private
    */
    name: string;
    /**
     * @private
     */
    /**
    * @private
    */
    reference: BookmarkElementBox;
    constructor(type: number);
    /**
     * @private
     */
    getLength(): number;
    /**
     * @private
     */
    destroy(): void;
    /**
     * Clones the bookmark element box.
     * @param element - book mark element
     */
    /**
     * @private
     */
    clone(): BookmarkElementBox;
}
/**
 * @private
 */
export declare class ContentControl extends ElementBox {
    /**
     * @private
     */
    contentControlProperties: ContentControlProperties;
    /**
     * @private
     */
    type: number;
    /**
     * @private
     */
    reference: ContentControl;
    /**
     * @private
     */
    contentControlWidgetType: ContentControlWidgetType;
    constructor(widgetType: ContentControlWidgetType);
    /**
     * @private
     */
    getLength(): number;
    /**
     * @private
     */
    clone(): ElementBox;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
/**
 * @private
 */
export declare class ContentControlProperties {
    /**
     * @private
     */
    contentControlWidgetType: ContentControlWidgetType;
    /**
     * @private
     */
    lockContentControl: boolean;
    /**
     * @private
     */
    lockContents: boolean;
    /**
     * @private
     */
    tag: string;
    /**
     * @private
     */
    color: string;
    /**
     * @private
     */
    title: string;
    /**
     * @private
     */
    appearance: string;
    /**
     * @private
     */
    type: ContentControlType;
    /**
     * @private
     */
    hasPlaceHolderText: boolean;
    /**
     * @private
     */
    multiline: boolean;
    /**
     * @private
     */
    isTemporary: boolean;
    /**
     * @private
     */
    isChecked: boolean;
    /**
     * @private
     */
    dateCalendarType: string;
    /**
     * @private
     */
    dateStorageFormat: string;
    /**
     * @private
     */
    dateDisplayLocale: string;
    /**
     * @private
     */
    dateDisplayFormat: string;
    /**
     * @private
     */
    uncheckedState: CheckBoxState;
    /**
     * @private
     */
    checkedState: CheckBoxState;
    /**
     * @private
     */
    contentControlListItems: ContentControlListItems[];
    /**
     * @private
     */
    xmlMapping: XmlMapping;
    /**
     * @private
     */
    characterFormat: WCharacterFormat;
    constructor(widgetType: ContentControlWidgetType);
    /**
     * @private
     */
    destroy(): void;
    /**
     * @private
     */
    clone(): ContentControlProperties;
}
/**
 * @private
 */
export declare class ContentControlListItems {
    /**
     * @private
     */
    displayText: string;
    /**
     * @private
     */
    value: string;
    /**
     * @private
     */
    destroy(): void;
    /**
     * @private
     */
    clone(): ContentControlListItems;
}
/**
 * @private
 */
export declare class CheckBoxState {
    /**
     * @private
     */
    font: string;
    /**
     * @private
     */
    value: string;
    /**
     * @private
     */
    destroy(): void;
    /**
     * @private
     */
    clone(): CheckBoxState;
}
/**
 * @private
 */
export declare class XmlMapping {
    /**
     * @private
     */
    isMapped: boolean;
    /**
     * @private
     */
    isWordMl: boolean;
    /**
     * @private
     */
    prefixMapping: string;
    /**
     * @private
     */
    xPath: string;
    /**
     * @private
     */
    storeItemId: string;
    /**
     * @private
     */
    customXmlPart: CustomXmlPart;
    /**
     * @private
     */
    destroy(): void;
    /**
     * @private
     */
    clone(): XmlMapping;
}
/**
 * @private
 */
export declare class CustomXmlPart {
    /**
     * @private
     */
    id: string;
    /**
     * @private
     */
    xml: string;
    /**
     * @private
     */
    destroy(): void;
    /**
     * @private
     */
    clone(): CustomXmlPart;
}
/**
 * @private
 */
export declare class ShapeCommon extends ElementBox {
    /**
     * @private
     */
    shapeId: number;
    /**
     * @private
     */
    name: string;
    /**
     * @private
     */
    alternativeText: string;
    /**
     * @private
     */
    title: string;
    /**
     * @private
     */
    visible: boolean;
    /**
     * @private
     */
    width: number;
    /**
     * @private
     */
    height: number;
    /**
     * @private
     */
    widthScale: number;
    /**
     * @private
     */
    heightScale: number;
    /**
     * @private
     */
    lineFormat: LineFormat;
    /**
     * @private
     */
    fillFormat: FillFormat;
    /**
     *
     * @private
     */
    getLength(): number;
    /**
     * @private
     */
    clone(): ShapeCommon;
}
/**
 * @private
 */
export declare class ShapeBase extends ShapeCommon {
    /**
     * @private
     */
    verticalPosition: number;
    /**
     * @private
     */
    verticalOrigin: VerticalOrigin;
    /**
     * @private
     */
    verticalAlignment: VerticalAlignment;
    /**
     * @private
     */
    verticalRelativePercent: number;
    /**
     * @private
     */
    horizontalPosition: number;
    /**
     * @private
     */
    horizontalOrigin: HorizontalOrigin;
    /**
     * @private
     */
    horizontalAlignment: HorizontalAlignment;
    /**
     * @private
     */
    horizontalRelativePercent: number;
    /**
     * @private
     */
    zOrderPosition: number;
    /**
     * @private
     */
    allowOverlap: boolean;
    /**
     * @private
     */
    textWrappingStyle: TextWrappingStyle;
    /**
     * @private
     */
    textWrappingType: TextWrappingType;
    /**
     * @private
     */
    distanceBottom: number;
    /**
     * @private
     */
    distanceLeft: number;
    /**
     * @private
     */
    distanceRight: number;
    /**
     * @private
     */
    distanceTop: number;
    /**
     * @private
     */
    layoutInCell: boolean;
    /**
     * @private
     */
    lockAnchor: boolean;
}
/**
 * @private
 */
export declare class ShapeElementBox extends ShapeBase {
    /**
     * @private
     */
    textFrame: TextFrame;
    /**
     * @private
     */
    autoShapeType: AutoShapeType;
    /**
     * @private
     */
    clone(): ShapeElementBox;
}
/**
 * @private
 */
export declare class TextFrame extends Widget {
    /**
     * @private
     */
    containerShape: ElementBox;
    /**
     * @private
     */
    textVerticalAlignment: VerticalAlignment;
    /**
     * @private
     */
    marginLeft: number;
    /**
     * @private
     */
    marginRight: number;
    /**
     * @private
     */
    marginTop: number;
    /**
     * @private
     */
    marginBottom: number;
    equals(): boolean;
    destroyInternal(): void;
    getHierarchicalIndex(index: string): string;
    getTableCellWidget(): TableCellWidget;
    /**
     * @private
     */
    clone(): TextFrame;
}
/**
 * @private
 */
export declare class LineFormat {
    /**
     * @private
     */
    line: boolean;
    /**
     * @private
     */
    lineFormatType: LineFormatType;
    /**
     * @private
     */
    color: string;
    /**
     * @private
     */
    weight: number;
    /**
     * @private
     */
    dashStyle: LineDashing;
    /**
     * @private
     */
    clone(): LineFormat;
}
/**
 * @private
 */
export declare class FillFormat {
    /**
     * @private
     */
    color: string;
    /**
     * @private
     */
    fill: boolean;
    /**
     * @private
     */
    clone(): FillFormat;
}
/**
 * @private
 */
export declare class ImageElementBox extends ShapeBase {
    private imageStr;
    private imgElement;
    private isInlineImageIn;
    /**
     * @private
     */
    isCrop: boolean;
    /**
     * @private
     */
    cropWidth: number;
    /**
     * @private
     */
    cropHeight: number;
    /**
     * @private
     */
    cropWidthScale: number;
    /**
     * @private
     */
    cropHeightScale: number;
    /**
     * @private
     */
    left: number;
    /**
     * @private
     */
    top: number;
    /**
     * @private
     */
    right: number;
    /**
     * @private
     */
    bottom: number;
    /**
     * @private
     */
    isMetaFile: boolean;
    /**
     * @private
     */
    isCompressed: boolean;
    /**
     * @private
     */
    metaFileImageString: string;
    /**
     * @private
     */
    readonly isInlineImage: boolean;
    /**
     * @private
     */
    readonly element: HTMLImageElement;
    /**
     * @private
     */
    readonly length: number;
    /**
     * @private
     */
    /**
    * @private
    */
    imageString: string;
    constructor(isInlineImage?: boolean);
    /**
     * @private
     */
    getLength(): number;
    /**
     * @private
     */
    clone(): ImageElementBox;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ListTextElementBox extends ElementBox {
    /**
     * @private
     */
    baselineOffset: number;
    /**
     * @private
     */
    text: string;
    /**
     * @private
     */
    trimEndWidth: number;
    /**
     * @private
     */
    listLevel: WListLevel;
    /**
     * @private
     */
    isFollowCharacter: boolean;
    constructor(listLevel: WListLevel, isListFollowCharacter: boolean);
    /**
     * @private
     */
    getLength(): number;
    /**
     * @private
     */
    clone(): ListTextElementBox;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class EditRangeEndElementBox extends ElementBox {
    /**
     * @private
     */
    editRangeStart: EditRangeStartElementBox;
    editRangeId: number;
    constructor();
    /**
     * @private
     */
    getLength(): number;
    /**
     * @private
     */
    destroy(): void;
    /**
     * @private
     */
    clone(): EditRangeEndElementBox;
}
/**
 * @private
 */
export declare class EditRangeStartElementBox extends ElementBox {
    /**
     * @private
     */
    columnFirst: number;
    /**
     * @private
     */
    columnLast: number;
    /**
     * @private
     */
    user: string;
    /**
     * @private
     */
    group: string;
    /**
     * @private
     */
    editRangeEnd: EditRangeEndElementBox;
    editRangeId: number;
    /**
     * Edit range mark
     * @private
     */
    editRangeMark: HTMLElement;
    constructor();
    /**
     * @private
     */
    getLength(): number;
    /**
     * @private
     */
    renderLockMark(currentUser: string, locale: L10n): void;
    /**
     * @private
     */
    removeEditRangeMark(): void;
    /**
     * @private
     */
    destroy(): void;
    /**
     * @private
     */
    clone(): EditRangeStartElementBox;
}
/**
 * @private
 */
export declare class ChartElementBox extends ImageElementBox {
    /**
     * @private
     */
    private div;
    /**
     * @private
     */
    private officeChartInternal;
    /**
     * @private
     */
    private chartTitle;
    /**
     * @private
     */
    private chartType;
    /**
     * @private
     */
    private gapWidth;
    /**
     * @private
     */
    private overlap;
    /**
     * @private
     */
    private chartElement;
    /**
     * @private
     */
    chartArea: ChartArea;
    /**
     * @private
     */
    chartPlotArea: ChartArea;
    /**
     * @private
     */
    chartCategory: ChartCategory[];
    /**
     * @private
     */
    chartSeries: ChartSeries[];
    /**
     * @private
     */
    chartTitleArea: ChartTitleArea;
    /**
     * @private
     */
    chartLegend: ChartLegend;
    /**
     * @private
     */
    chartPrimaryCategoryAxis: ChartCategoryAxis;
    /**
     * @private
     */
    chartPrimaryValueAxis: ChartCategoryAxis;
    /**
     * @private
     */
    chartDataTable: ChartDataTable;
    /**
     * @private
     */
    getLength(): number;
    /**
     * @private
     */
    /**
    * @private
    */
    title: string;
    /**
     * @private
     */
    /**
    * @private
    */
    type: string;
    /**
     * @private
     */
    /**
    * @private
    */
    chartGapWidth: number;
    /**
     * @private
     */
    /**
    * @private
    */
    chartOverlap: number;
    /**
     * @private
     */
    readonly targetElement: HTMLDivElement;
    /**
     * @private
     */
    /**
    * @private
    */
    officeChart: ChartComponent;
    /**
     * @private
     */
    constructor();
    private onChartLoaded;
    /**
     * @private
     */
    clone(): ChartElementBox;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartArea {
    /**
     * @private
     */
    private foreColor;
    /**
     * @private
     */
    /**
    * @private
    */
    chartForeColor: string;
    /**
     * @private
     */
    clone(): ChartArea;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartCategory {
    /**
     * @private
     */
    private categoryXName;
    /**
     * @private
     */
    chartData: ChartData[];
    /**
     * @private
     */
    /**
    * @private
    */
    xName: string;
    /**
     * @private
     */
    clone(): ChartCategory;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartData {
    private yValue;
    private xValue;
    private size;
    /**
     * @private
     */
    /**
    * @private
    */
    yAxisValue: number;
    /**
     * @private
     */
    /**
    * @private
    */
    xAxisValue: number;
    /**
     * @private
     */
    /**
    * @private
    */
    bubbleSize: number;
    /**
     * @private
     */
    clone(): ChartData;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartLegend {
    /**
     * @private
     */
    private legendPostion;
    /**
     * @private
     */
    chartTitleArea: ChartTitleArea;
    /**
     * @private
     */
    /**
    * @private
    */
    chartLegendPostion: string;
    /**
     * @private
     */
    constructor();
    /**
     * @private
     */
    clone(): ChartLegend;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartSeries {
    /**
     * @private
     */
    chartDataFormat: ChartDataFormat[];
    /**
     * @private
     */
    errorBar: ChartErrorBar;
    /**
     * @private
     */
    seriesFormat: ChartSeriesFormat;
    /**
     * @private
     */
    trendLines: ChartTrendLines[];
    /**
     * @private
     */
    private name;
    /**
     * @private
     */
    private sliceAngle;
    /**
     * @private
     */
    private holeSize;
    /**
     * @private
     */
    dataLabels: ChartDataLabels;
    /**
     * @private
     */
    /**
    * @private
    */
    seriesName: string;
    /**
     * @private
     */
    /**
    * @private
    */
    firstSliceAngle: number;
    /**
     * @private
     */
    /**
    * @private
    */
    doughnutHoleSize: number;
    constructor();
    /**
     * @private
     */
    clone(): ChartSeries;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartErrorBar {
    /**
     * @private
     */
    private type;
    /**
     * @private
     */
    private direction;
    /**
     * @private
     */
    private errorValue;
    /**
     * @private
     */
    private endStyle;
    /**
     * @private
     */
    /**
    * @private
    */
    errorType: string;
    /**
     * @private
     */
    /**
    * @private
    */
    errorDirection: string;
    /**
     * @private
     */
    /**
    * @private
    */
    errorEndStyle: string;
    /**
    * @private
    */
    numberValue: number;
    /**
     * @private
     */
    clone(): ChartErrorBar;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartSeriesFormat {
    /**
     * @private
     */
    private style;
    /**
     * @private
     */
    private color;
    /**
     * @private
     */
    private size;
    /**
     * @private
     */
    /**
    * @private
    */
    markerStyle: string;
    /**
     * @private
     */
    /**
    * @private
    */
    markerColor: string;
    /**
     * @private
     */
    /**
    * @private
    */
    numberValue: number;
    /**
     * @private
     */
    clone(): ChartSeriesFormat;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartDataLabels {
    /**
     * @private
     */
    private position;
    /**
     * @private
     */
    private name;
    /**
     * @private
     */
    private color;
    /**
     * @private
     */
    private size;
    /**
     * @private
     */
    private isLegend;
    /**
     * @private
     */
    private isBubble;
    /**
     * @private
     */
    private isCategory;
    /**
     * @private
     */
    private isSeries;
    /**
     * @private
     */
    private isValueEnabled;
    /**
     * @private
     */
    private isPercentageEnabled;
    /**
     * @private
     */
    private showLeaderLines;
    /**
     * @private
     */
    /**
    * @private
    */
    labelPosition: string;
    /**
     * @private
     */
    /**
    * @private
    */
    fontName: string;
    /**
     * @private
     */
    /**
    * @private
    */
    fontColor: string;
    /**
     * @private
     */
    /**
    * @private
    */
    fontSize: number;
    /**
     * @private
     */
    /**
    * @private
    */
    isLegendKey: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    isBubbleSize: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    isCategoryName: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    isSeriesName: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    isValue: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    isPercentage: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    isLeaderLines: boolean;
    /**
     * @private
     */
    clone(): ChartDataLabels;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartTrendLines {
    /**
     * @private
     */
    private type;
    /**
     * @private
     */
    private name;
    /**
     * @private
     */
    private backward;
    /**
     * @private
     */
    private forward;
    /**
     * @private
     */
    private intercept;
    /**
     * @private
     */
    private displayRSquared;
    /**
     * @private
     */
    private displayEquation;
    /**
     * @private
     */
    /**
    * @private
    */
    trendLineType: string;
    /**
     * @private
     */
    /**
    * @private
    */
    trendLineName: string;
    /**
     * @private
     */
    /**
    * @private
    */
    interceptValue: number;
    /**
     * @private
     */
    /**
    * @private
    */
    forwardValue: number;
    /**
     * @private
     */
    /**
    * @private
    */
    backwardValue: number;
    /**
     * @private
     */
    /**
    * @private
    */
    isDisplayRSquared: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    isDisplayEquation: boolean;
    /**
     * @private
     */
    clone(): ChartTrendLines;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartTitleArea {
    /**
     * @private
     */
    private fontName;
    /**
     * @private
     */
    private fontSize;
    /**
     * @private
     */
    dataFormat: ChartDataFormat;
    /**
     * @private
     */
    layout: ChartLayout;
    /**
     * @private
     */
    /**
    * @private
    */
    chartfontName: string;
    /**
     * @private
     */
    /**
    * @private
    */
    chartFontSize: number;
    /**
     * @private
     */
    constructor();
    /**
     * @private
     */
    clone(): ChartTitleArea;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartDataFormat {
    /**
     * @private
     */
    line: ChartFill;
    /**
     * @private
     */
    fill: ChartFill;
    /**
     * @private
     */
    constructor();
    /**
     * @private
     */
    clone(): ChartDataFormat;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartFill {
    /**
     * @private
     */
    private fillColor;
    /**
     * @private
     */
    private fillRGB;
    /**
     * @private
     */
    /**
    * @private
    */
    color: string;
    /**
     * @private
     */
    /**
    * @private
    */
    rgb: string;
    /**
     * @private
     */
    clone(): ChartFill;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartLayout {
    /**
     * @private
     */
    private layoutX;
    /**
     * @private
     */
    private layoutY;
    /**
     * @private
     */
    /**
    * @private
    */
    chartLayoutLeft: number;
    /**
     * @private
     */
    /**
    * @private
    */
    chartLayoutTop: number;
    /**
     * @private
     */
    clone(): ChartLayout;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartCategoryAxis {
    /**
     * @private
     */
    private title;
    /**
     * @private
     */
    private fontSize;
    /**
     * @private
     */
    private fontName;
    /**
     * @private
     */
    private categoryType;
    /**
     * @private
     */
    private numberFormat;
    /**
     * @private
     */
    chartTitleArea: ChartTitleArea;
    /**
     * @private
     */
    private hasMajorGridLines;
    /**
     * @private
     */
    private hasMinorGridLines;
    /**
     * @private
     */
    private majorTickMark;
    /**
     * @private
     */
    private minorTickMark;
    /**
     * @private
     */
    private tickLabelPostion;
    /**
     * @private
     */
    private majorUnit;
    /**
     * @private
     */
    private minimumValue;
    /**
     * @private
     */
    private maximumValue;
    /**
     * @private
     */
    /**
    * @private
    */
    majorTick: string;
    /**
     * @private
     */
    /**
    * @private
    */
    minorTick: string;
    /**
     * @private
     */
    /**
    * @private
    */
    tickPosition: string;
    /**
     * @private
     */
    /**
    * @private
    */
    minorGridLines: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    majorGridLines: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    interval: number;
    /**
     * @private
     */
    /**
    * @private
    */
    max: number;
    /**
     * @private
     */
    /**
    * @private
    */
    min: number;
    /**
     * @private
     */
    /**
    * @private
    */
    categoryAxisTitle: string;
    /**
     * @private
     */
    /**
    * @private
    */
    categoryAxisType: string;
    /**
     * @private
     */
    /**
    * @private
    */
    categoryNumberFormat: string;
    /**
     * @private
     */
    /**
    * @private
    */
    axisFontSize: number;
    /**
     * @private
     */
    /**
    * @private
    */
    axisFontName: string;
    constructor();
    /**
     * @private
     */
    clone(): ChartCategoryAxis;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ChartDataTable {
    /**
     * @private
     */
    private isSeriesKeys;
    /**
     * @private
     */
    private isHorzBorder;
    /**
     * @private
     */
    private isVertBorder;
    /**
     * @private
     */
    private isBorders;
    /**
     * @private
     */
    /**
    * @private
    */
    showSeriesKeys: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    hasHorzBorder: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    hasVertBorder: boolean;
    /**
     * @private
     */
    /**
    * @private
    */
    hasBorders: boolean;
    /**
     * @private
     */
    clone(): ChartDataTable;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class CommentCharacterElementBox extends ElementBox {
    commentType: number;
    commentId: string;
    private commentInternal;
    commentMark: HTMLElement;
    comment: CommentElementBox;
    getLength(): number;
    clone(): ElementBox;
    constructor(type: number);
    renderCommentMark(): void;
    selectComment(): void;
    removeCommentMark(): void;
    destroy(): void;
}
/**
 * @private
 */
export declare class CommentElementBox extends CommentCharacterElementBox {
    private commentStartIn;
    private commentEndIn;
    private createdDate;
    private authorIn;
    private initialIn;
    private done;
    private textIn;
    replyComments: CommentElementBox[];
    isReply: boolean;
    ownerComment: CommentElementBox;
    commentStart: CommentCharacterElementBox;
    commentEnd: CommentCharacterElementBox;
    author: string;
    initial: string;
    isResolved: boolean;
    readonly date: string;
    text: string;
    constructor(date: string);
    getLength(): number;
    clone(): ElementBox;
    destroy(): void;
}
/**
 * @private
 */
export declare class Page {
    /**
     * Specifies the Viewer
     * @private
     */
    documentHelper: DocumentHelper;
    /**
     * Specifies the Bonding Rectangle
     * @private
     */
    boundingRectangle: Rect;
    /**
     * @private
     */
    repeatHeaderRowTableWidget: boolean;
    /**
     * Specifies the bodyWidgets
     * @default []
     * @private
     */
    bodyWidgets: BodyWidget[];
    /**
     * @private
     */
    headerWidget: HeaderFooterWidget;
    /**
     * @private
     */
    footerWidget: HeaderFooterWidget;
    /**
     * @private
     */
    footnoteWidget: FootNoteWidget;
    /**
     * @private
     */
    endnoteWidget: FootNoteWidget;
    /**
     * @private
     */
    currentPageNum: number;
    /**
     *
     */
    allowNextPageRendering: boolean;
    /**
     * @private
     */
    readonly index: number;
    /**
     * @private
     */
    readonly previousPage: Page;
    /**
     * @private
     */
    readonly nextPage: Page;
    /**
     * @private
     */
    readonly sectionIndex: number;
    /**
     * Initialize the constructor of Page
     */
    constructor(documentHelper: DocumentHelper);
    readonly viewer: LayoutViewer;
    destroy(): void;
}
/**
 * @private
 */
export declare class WTableHolder {
    private tableColumns;
    /**
     * @private
     */
    tableWidth: number;
    readonly columns: WColumn[];
    /**
     * @private
     */
    resetColumns(): void;
    /**
     * @private
     */
    getPreviousSpannedCellWidth(previousColumnIndex: number, curColumnIndex: number): number;
    /**
     * @private
     */
    addColumns(currentColumnIndex: number, columnSpan: number, width: number, sizeInfo: ColumnSizeInfo, offset: number): void;
    /**
     * @private
     */
    getTotalWidth(type: number): number;
    /**
     * @private
     */
    isFitColumns(containerWidth: number, preferredTableWidth: number, isAutoWidth: boolean): boolean;
    /**
     * @private
     */
    autoFitColumn(containerWidth: number, preferredTableWidth: number, isAuto: boolean, isNestedTable: boolean): void;
    /**
     * @private
     */
    fitColumns(containerWidth: number, preferredTableWidth: number, isAutoWidth: boolean, indent?: number): void;
    /**
     * @private
     */
    getCellWidth(columnIndex: number, columnSpan: number, preferredTableWidth: number): number;
    /**
     * @private
     */
    validateColumnWidths(): void;
    /**
     * @private
     */
    clone(): WTableHolder;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class WColumn {
    /**
     * @private
     */
    preferredWidth: number;
    /**
     * @private
     */
    minWidth: number;
    /**
     * @private
     */
    maxWidth: number;
    /**
     * @private
     */
    endOffset: number;
    /**
     * @private
     */
    minimumWordWidth: number;
    /**
     * @private
     */
    maximumWordWidth: number;
    /**
     * @private
     */
    minimumWidth: number;
    /**
     * @private
     */
    clone(): WColumn;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ColumnSizeInfo {
    /**
     * @private
     */
    minimumWordWidth: number;
    /**
     * @private
     */
    maximumWordWidth: number;
    /**
     * @private
     */
    minimumWidth: number;
    /**
     * @private
     */
    hasMinimumWidth: boolean;
    /**
     * @private
     */
    hasMinimumWordWidth: boolean;
    /**
     * @private
     */
    hasMaximumWordWidth: boolean;
}
