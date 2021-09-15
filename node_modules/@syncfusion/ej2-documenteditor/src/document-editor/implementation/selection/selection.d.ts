import { DocumentEditor } from '../../document-editor';
import { IWidget, Widget, BodyWidget, TableRowWidget, TableWidget, LineWidget, ListTextElementBox, Page, ParagraphWidget, TableCellWidget, FieldElementBox, BlockWidget, HeaderFooterWidget, BlockContainer, ElementBox, EditRangeStartElementBox, CommentElementBox, ShapeElementBox, TextFrame, FootnoteElementBox } from '../viewer/page';
import { ElementInfo, CaretHeightInfo, IndexInfo, SizeInfo, FirstElementInfo, HyperlinkTextInfo, LineInfo, Point, ShapeInfo } from '../editor/editor-helper';
import { SelectionCharacterFormat, SelectionCellFormat, SelectionParagraphFormat, SelectionRowFormat, SelectionSectionFormat, SelectionTableFormat, SelectionImageFormat } from './selection-format';
import { WListLevel } from '../index';
import { Dictionary } from '../../base/dictionary';
import { HighlightColor, Strikethrough, Underline, TextAlignment, FormFieldType } from '../../base/index';
import { TextPositionInfo, PositionInfo, ParagraphInfo } from '../editor/editor-helper';
import { WCharacterFormat, WParagraphFormat } from '../index';
import { HtmlExport } from '../writer/html-export';
import { ContextType, TablePasteOptions } from '../../index';
import { TextPosition, SelectionWidgetInfo, ImageInfo } from './selection-helper';
import { MenuEventArgs } from '@syncfusion/ej2-splitbuttons';
import { Revision } from '../track-changes/track-changes';
/**
 * Selection
 */
export declare class Selection {
    /**
     * @private
     */
    owner: DocumentEditor;
    /**
     * @private
     */
    upDownSelectionLength: number;
    /**
     * @private
     */
    isSkipLayouting: boolean;
    /**
     * @private
     */
    isImageSelected: boolean;
    private documentHelper;
    private contextTypeInternal;
    /**
     * @private
     */
    caret: HTMLDivElement;
    /**
     * @private
     */
    isRetrieveFormatting: boolean;
    private characterFormatIn;
    private paragraphFormatIn;
    private sectionFormatIn;
    private tableFormatIn;
    private cellFormatIn;
    private rowFormatIn;
    private imageFormatInternal;
    /**
     * @private
     */
    skipFormatRetrieval: boolean;
    private startInternal;
    private endInternal;
    private htmlWriterIn;
    private toolTipElement;
    private toolTipObject;
    private toolTipField;
    private isMoveDownOrMoveUp;
    private pasteDropDwn;
    /**
     * @private
     */
    pasteElement: HTMLElement;
    /**
     * @private
     */
    currentPasteAction: TablePasteOptions;
    /**
     * @private
     */
    isViewPasteOptions: boolean;
    /**
     * @private
     */
    skipEditRangeRetrieval: boolean;
    /**
     * @private
     */
    editPosition: string;
    /**
     * @private
     */
    selectedWidgets: Dictionary<IWidget, object>;
    /**
     * @private
     */
    isHighlightEditRegionIn: boolean;
    /**
     * @private
     */
    private isHighlightFormFields;
    /**
     * @private
     */
    editRangeCollection: EditRangeStartElementBox[];
    /**
     * @private
     */
    isHightlightEditRegionInternal: boolean;
    /**
     * @private
     */
    isCurrentUser: boolean;
    /**
     * @private
     */
    isHighlightNext: boolean;
    /**
     * @private
     */
    hightLightNextParagraph: BlockWidget;
    /**
     * @private
     */
    isWebLayout: boolean;
    /**
     * @private
     */
    editRegionHighlighters: Dictionary<LineWidget, SelectionWidgetInfo[]>;
    /**
     * @private
     */
    formFieldHighlighters: Dictionary<LineWidget, SelectionWidgetInfo[]>;
    private isSelectList;
    /**
     * @private
     */
    previousSelectedFormField: FieldElementBox;
    /**
     * @private
     */
    isFormatUpdated: boolean;
    /**
     * @private
     * @returns {boolean} - Retuens true if highlighting editing region
     */
    /**
    * @private
    */
    isHighlightEditRegion: boolean;
    /**
     * @private
     */
    readonly htmlWriter: HtmlExport;
    /**
     * Gets the start text position of last range in the selection
     *
     * @private
     * @returns {TextPosition} - Returns selection start position.
     */
    /**
    * @private
    */
    start: TextPosition;
    /**
     * Gets the instance of selection character format.
     *
     * @default undefined
     * @aspType SelectionCharacterFormat
     * @returns {SelectionCharacterFormat} - Returns selection character format.
     */
    readonly characterFormat: SelectionCharacterFormat;
    /**
     * Gets the instance of selection paragraph format.
     *
     * @default undefined
     * @aspType SelectionParagraphFormat
     * @returns {SelectionParagraphFormat} - Returns selection paragraph format.
     */
    readonly paragraphFormat: SelectionParagraphFormat;
    /**
     * Gets the instance of selection section format.
     *
     * @default undefined
     * @aspType SelectionSectionFormat
     * @returns {SelectionSectionFormat} - Returns selection section format.
     */
    readonly sectionFormat: SelectionSectionFormat;
    /**
     * Gets the instance of selection table format.
     *
     * @default undefined
     * @aspType SelectionTableFormat
     * @returns {SelectionTableFormat} - Returns selection table format.
     */
    readonly tableFormat: SelectionTableFormat;
    /**
     * Gets the instance of selection cell format.
     *
     * @default undefined
     * @aspType SelectionCellFormat
     * @returns {SelectionCellFormat} - Returns selection cell format.
     */
    readonly cellFormat: SelectionCellFormat;
    /**
     * Gets the instance of selection row format.
     *
     * @default undefined
     * @aspType SelectionRowFormat
     * @returns {SelectionRowFormat} - Returns selection row format.
     */
    readonly rowFormat: SelectionRowFormat;
    /**
     * Gets the instance of selection image format.
     *
     * @default undefined
     * @aspType SelectionImageFormat
     * @returns {SelectionImageFormat} - Returns selection image format.
     */
    readonly imageFormat: SelectionImageFormat;
    /**
     * Gets the start text position of selection range.
     *
     * @private
     * @returns {TextPosition} - Returns selection end position.
     */
    /**
    * For internal use
    *
    * @private
    */
    end: TextPosition;
    /**
     * Gets the page number where the selection starts.
     *
     * @returns {number} - Returns the selection start page number.
     */
    readonly startPage: number;
    /**
     * Gets the page number where the selection ends.
     *
     * @returns {number} - Returns the selection end page number.
     */
    readonly endPage: number;
    /**
     * Determines whether the selection direction is forward or not.
     *
     * @default false
     * @private
     * @returns {boolean} - Returns isForward
     */
    readonly isForward: boolean;
    /**
     * Determines whether the selection is in footnote or not.
     *
     * @default false
     * @returns {boolean} - Returns true if selection is in footnote
     * @private
     */
    readonly isinFootnote: boolean;
    /**
     * Determines whether the selection is in endnote or not.
     *
     * @default false
     * @returns {boolean}
     * @private
     */
    readonly isinEndnote: boolean;
    /**
     * Determines whether the start and end positions are same or not.
     *
     * @default false
     * @returns {boolean}
     * @private
     */
    readonly isEmpty: boolean;
    /**
     * Returns start hierarchical index.
     */
    readonly startOffset: string;
    /**
     * Returns end hierarchical index.
     */
    readonly endOffset: string;
    /**
     * @private
     */
    readonly isInShape: boolean;
    /**
     * Gets the text within selection.
     *
     * @default ''
     * @aspType string
     * @returns {string}
     */
    readonly text: string;
    /**
     * Gets the context type of the selection.
     */
    readonly contextType: ContextType;
    /**
     * Gets bookmark name collection.
     */
    readonly bookmarks: string[];
    /**
    * Gets the selected content of the document as SFDT(Syncfusion Document Text) file format.
    *
    * @default undefined
    * @returns {string}
    */
    readonly sfdt: string;
    /**
     * Gets the bookmark name collection in current selection
     *
     * @param includeHidden - Decide whether to include hidden bookmark name in current selection or not.
     */
    getBookmarks(includeHidden?: boolean): string[];
    /**
     * @private
     */
    readonly isCleared: boolean;
    /**
     * Returns true if selection is in field
     */
    readonly isInField: boolean;
    /**
     * @param documentEditor
     * @private
     */
    constructor(documentEditor: DocumentEditor);
    private getSelBookmarks;
    private readonly viewer;
    private getModuleName;
    private checkLayout;
    /**
     * Moves the selection to the header of current page.
     *
     * @returns {void}
     */
    goToHeader(): void;
    /**
     * Moves the selection to the footer of current page.
     *
     * @returns {void}
     */
    goToFooter(): void;
    /**
     * Closes the header and footer region.
     *
     * @returns {void}
     */
    closeHeaderFooter(): void;
    /**
     * Moves the selection to the start of specified page number.
     *
     * @param pageNumber
     * @returns {void}
     */
    goToPage(pageNumber: number): void;
    /**
     * Selects the entire table if the context is within table.
     *
     * @returns {void}
     */
    selectTable(): void;
    /**
     * Selects the entire row if the context is within table.
     *
     * @returns {void}
     */
    selectRow(): void;
    /**
     * Selects the entire column if the context is within table.
     *
     * @returns {void}
     */
    selectColumn(): void;
    /**
     * Selects the entire cell if the context is within table.
     *
     * @returns {void}
     */
    selectCell(): void;
    /**
     * Selects content based on selection settings
     *
     * @returns {void}
     */
    select(selectionSettings: SelectionSettings): void;
    /**
     * Selects content based on start and end hierarchical index.
     *
     * @param start start hierarchical index.
     * @param end end hierarchical index.
     * @returns {void}
     */
    select(start: string, end: string): void;
    /**
     * Selects based on start and end hierarchical index.
     *
     * @param start
     * @param end
     * @returns {void}
     */
    selectByHierarchicalIndex(start: string, end: string): void;
    /**
     * Select the current field if selection is in field
     *
     * @param fieldStart
     * @returns {void}
     */
    selectField(fieldStart?: FieldElementBox): void;
    /**
     * @private
     * @param fieldStart
     * @returns {void}
     */
    selectFieldInternal(fieldStart: FieldElementBox): void;
    /**
     * @param shape
     * @private
     * @returns {void}
     */
    selectShape(shape: ShapeElementBox): void;
    /**
     * Toggles the bold property of selected contents.
     *
     * @private
     * @returns {void}
     */
    toggleBold(): void;
    /**
     * Toggles the italic property of selected contents.
     *
     * @private
     * @returns {void}
     */
    toggleItalic(): void;
    /**
     * Toggles the allCaps property of selected contents.
     *
     * @private
     * @returns {void}
     */
    toggleAllCaps(): void;
    /**
     * Toggles the underline property of selected contents.
     *
     * @param {Underline} underline Default value of ‘underline’ parameter is Single.
     * @private
     * @returns {void}
     */
    toggleUnderline(underline?: Underline): void;
    /**
     * Toggles the strike through property of selected contents.
     *
     * @param {Strikethrough} strikethrough Default value of strikethrough parameter is SingleStrike.
     * @private
     * @returns {void}
     */
    toggleStrikethrough(strikethrough?: Strikethrough): void;
    /**
     * Toggles the highlight color property of selected contents.
     *
     * @param {HighlightColor} highlightColor Default value of ‘underline’ parameter is Yellow.
     * @private
     * @returns {void}
     */
    toggleHighlightColor(highlightColor?: HighlightColor): void;
    /**
     * Toggles the subscript formatting of selected contents.
     *
     * @private
     * @returns {void}
     */
    toggleSubscript(): void;
    /**
     * Toggles the superscript formatting of selected contents.
     *
     * @private
     * @returns {void}
     */
    toggleSuperscript(): void;
    /**
     * Toggles the text alignment property of selected contents.
     *
     * @param {TextAlignment} textAlignment Default value of ‘textAlignment parameter is TextAlignment.Left.
     * @private
     * @returns {void}
     */
    toggleTextAlignment(textAlignment: TextAlignment): void;
    /**
     * Increases the left indent of selected paragraphs to a factor of 36 points.
     *
     * @private
     * @returns {void}
     */
    increaseIndent(): void;
    /**
     * Decreases the left indent of selected paragraphs to a factor of 36 points.
     *
     * @private
     * @returns {void}
     */
    decreaseIndent(): void;
    /**
     * Fires the `requestNavigate` event if current selection context is in hyperlink.
     *
     * @returns {void}
     */
    navigateHyperlink(): void;
    /**
     * Navigate Hyperlink
     *
     * @param fieldBegin
     * @private
     * @returns {void}
     */
    fireRequestNavigate(fieldBegin: FieldElementBox): void;
    /**
     * Copies the hyperlink URL if the context is within hyperlink.
     *
     * @returns {void}
     */
    copyHyperlink(): void;
    private isHideSelection;
    /**
     * @private
     * @returns {void}
     */
    highlightSelection(isSelectionChanged: boolean): void;
    private createHighlightBorder;
    private renderHighlight;
    private getWrapPosition;
    private splitSelectionHighlightPosition;
    private addEditRegionHighlight;
    private addFormFieldHighlight;
    private createHighlightBorderInsideTable;
    private clipSelection;
    /**
     * Add selection highlight
     *
     * @private
     * @returns {void}
     */
    addSelectionHighlight(canvasContext: CanvasRenderingContext2D, widget: LineWidget, top: number): void;
    private renderDashLine;
    /**
     * Add Selection highlight inside table
     *
     * @private
     * @returns {void}
     */
    addSelectionHighlightTable(canvasContext: CanvasRenderingContext2D, tableCellWidget: TableCellWidget): void;
    private removeSelectionHighlight;
    /**
     * Selects Current word
     *
     * @param excludeSpace
     * @returns {void}
     */
    selectCurrentWord(excludeSpace?: boolean): void;
    /**
     * Selects current paragraph
     *
     * @returns {void}
     */
    selectParagraph(): void;
    /**
     * Selects current line.
     *
     * @returns {void}
     */
    selectLine(): void;
    /**
     * Moves selection to start of the document.
     *
     * @returns {void}
     */
    moveToDocumentStart(): void;
    /**
     * Moves selection to end of the document.
     *
     * @returns {void}
     */
    moveToDocumentEnd(): void;
    /**
     * Moves selection to current paragraph start.
     *
     * @returns {void}
     */
    moveToParagraphStart(): void;
    /**
     * Moves selection to current paragraph end.
     *
     * @returns {void}
     */
    moveToParagraphEnd(): void;
    /**
     * Moves selection to next line.
     *
     * @returns {void}
     */
    moveToNextLine(): void;
    /**
     * Moves selection to previous line.
     *
     * @returns {void}
     */
    moveToPreviousLine(): void;
    /**
     * Moves selection to next character.
     *
     * @returns {void}
     */
    moveToNextCharacter(): void;
    /**
     * Moves selection to previous character.
     *
     * @returns {void}
     */
    moveToPreviousCharacter(): void;
    private selectCurrentWordRange;
    /**
     * Extends selection to paragraph start.
     *
     * @returns {void}
     */
    extendToParagraphStart(): void;
    /**
     * Extend selection to paragraph end.
     *
     * @returns {void}
     */
    extendToParagraphEnd(): void;
    /**
     * Move to next text position
     *
     * @private
     * @returns {void}
     */
    moveNextPosition(): void;
    /**
     * Move to next paragraph
     *
     * @private
     * @returns {void}
     */
    moveToNextParagraph(): void;
    /**
     * To navigate to next footnote from current selection
     *
     * @returns {void}
     */
    nextFootnote(): void;
    /**
     * To navigate to previous footnote from current selection
     *
     * @returns {void}
     */
    previousFootnote(): void;
    /**
     * To navigate to next Endnote from current selection
     *
     * @returns {void}
     */
    nextEndnote(): void;
    /**
     * To navigate to previous Endnote from current selection
     *
     * @returns {void}
     */
    previousEndnote(): void;
    /**
     * Move to previous text position
     *
     * @private
     * @returns {void}
     */
    movePreviousPosition(): void;
    /**
     * Move to previous paragraph
     *
     * @private
     * @returns {void}
     */
    moveToPreviousParagraph(): void;
    /**
     * Extends selection to previous line.
     *
     * @returns {void}
     */
    extendToPreviousLine(): void;
    /**
     * Extend selection to line end
     *
     * @returns {void}
     */
    extendToLineEnd(): void;
    /**
     * Extends selection to line start.
     *
     * @returns {void}
     */
    extendToLineStart(): void;
    /**
     * @private
     * @returns {void}
     */
    moveUp(): void;
    /**
     * @private
     * @returns {void}
     */
    moveDown(): void;
    private updateForwardSelection;
    private updateBackwardSelection;
    /**
     * @private
     * @returns {void}
     */
    getFirstBlockInFirstCell(table: TableWidget): BlockWidget;
    /**
     * @private
     * @returns {void}
     */
    getFirstCellInRegion(row: TableRowWidget, startCell: TableCellWidget, selectionLength: number, isMovePrevious: boolean): TableCellWidget;
    /**
     * @private
     * @returns {void}
     */
    getFirstParagraph(tableCell: TableCellWidget): ParagraphWidget;
    /**
     * Get last block in last cell
     *
     * @private
     * @returns {void}
     */
    getLastBlockInLastCell(table: TableWidget): BlockWidget;
    /**
     * Moves selection to start of the current line.
     *
     * @returns {void}
     */
    moveToLineStart(): void;
    /**
     * Moves selection to end of the current line.
     *
     * @returns {void}
     */
    moveToLineEnd(): void;
    /**
     * Get Page top
     *
     * @private
     * @returns {void}
     */
    getPageTop(page: Page): number;
    /**
     * Move text position to cursor point
     *
     * @private
     * @returns {void}
     */
    moveTextPosition(cursorPoint: Point, textPosition: TextPosition): void;
    /**
     * Get document start position
     *
     * @private
     * @returns {TextPosition}
     */
    getDocumentStart(): TextPosition;
    /**
     * Get document end position
     *
     * @private
     * @returns {TextPosition}
     */
    getDocumentEnd(): TextPosition;
    /**
     * @private
     * @returns {void}
     */
    handleControlEndKey(): void;
    /**
     * @private
     * @returns {void}
     */
    handleControlHomeKey(): void;
    /**
     * @private
     * @returns {void}
     */
    handleControlLeftKey(): void;
    /**
     * @private
     * @returns {void}
     */
    handleControlRightKey(): void;
    /**
     * Handles control down key.
     *
     * @private
     * @returns {void}
     */
    handleControlDownKey(): void;
    /**
     * Handles control up key.
     *
     * @private
     * @returns {void}
     */
    handleControlUpKey(): void;
    /**
     * @private
     * @returns {void}
     */
    handleShiftLeftKey(): void;
    /**
     * Handles shift up key.
     *
     * @private
     * @returns {void}
     */
    handleShiftUpKey(): void;
    /**
     * Handles shift right key.
     *
     * @private
     * @returns {void}
     */
    handleShiftRightKey(): void;
    /**
     * Handles shift down key.
     *
     * @private
     * @returns {void}
     */
    handleShiftDownKey(): void;
    /**
     * @private
     * @returns {void}
     */
    handleControlShiftLeftKey(): void;
    /**
     * Handles control shift up key.
     *
     * @private
     * @returns {void}
     */
    handleControlShiftUpKey(): void;
    /**
     * Handles control shift right key
     *
     * @private
     * @returns {void}
     */
    handleControlShiftRightKey(): void;
    /**
     * Handles control shift down key.
     *
     * @private
     * @returns {void}
     */
    handleControlShiftDownKey(): void;
    /**
     * Handles left key.
     *
     * @private
     * @returns {void}
     */
    handleLeftKey(): void;
    /**
     * Handles up key.
     *
     * @private
     * @returns {void}
     */
    handleUpKey(): void;
    /**
     * Handles right key.
     *
     * @private
     * @returns {void}
     */
    handleRightKey(): void;
    /**
     * Handles end key.
     *
     * @private
     * @returns {void}
     */
    handleEndKey(): void;
    /**
     * Handles home key.
     *
     * @private
     * @returns {void}
     */
    handleHomeKey(): void;
    /**
     * Handles down key.
     *
     * @private
     * @returns {void}
     */
    handleDownKey(): void;
    /**
     * Handles shift end key.
     *
     * @private
     * @returns {void}
     */
    handleShiftEndKey(): void;
    /**
     * Handles shift home key.
     *
     * @private
     * @returns {void}
     */
    handleShiftHomeKey(): void;
    /**
     * Handles control shift end key.
     *
     * @private
     * @returns {void}
     */
    handleControlShiftEndKey(): void;
    /**
     * Handles control shift home key.
     *
     * @private
     * @returns {void}
     */
    handleControlShiftHomeKey(): void;
    /**
     * @private
     * @returns {void}
     */
    handleSpaceBarKey(): void;
    /**
     * Handles tab key.
     *
     * @param isNavigateInCell
     * @param isShiftTab
     * @private
     * @returns {void}
     */
    handleTabKey(isNavigateInCell: boolean, isShiftTab: boolean): void;
    private getFormFieldInFormFillMode;
    private selectPrevNextFormField;
    /**
     * @private
     * @returns {void}
     */
    navigateToNextFormField(): void;
    /**
     * @private
     * @returns {void}
     */
    selectTextElementStartOfField(formField: FieldElementBox): void;
    private triggerFormFillEvent;
    private selectPreviousCell;
    private selectNextCell;
    /**
     * Select given table cell
     *
     * @private
     * @returns {void}
     */
    selectTableCellInternal(tableCell: TableCellWidget, clearMultiSelection: boolean): void;
    /**
     * Select while table
     *
     * @private
     * @returns {void}
     */
    private selectTableInternal;
    /**
     * Select single column
     *
     * @private
     * @returns {void}
     */
    selectColumnInternal(): void;
    /**
     * Select single row
     *
     * @private
     * @returns {void}
     */
    selectTableRow(): void;
    /**
     * Select single cell
     *
     * @private
     * @returns {void}
     */
    selectTableCell(): void;
    /**
     * Selects the entire document.
     *
     * @returns {void}
     */
    selectAll(): void;
    /**
     * Extends selection backward.
     *
     * @returns {void}
     */
    extendBackward(): void;
    /**
     * Extends selection forward.
     *
     * @returns {void}
     */
    extendForward(): void;
    /**
     * Extend selection to word start and end
     *
     * @private
     * @returns {void}
     */
    extendToWordStartEnd(): boolean;
    /**
     * Extends selection to word start.
     *
     * @returns {void}
     */
    extendToWordStart(): void;
    /**
     * Extends selection to word end.
     *
     * @returns {void}
     */
    extendToWordEnd(): void;
    /**
     * Extends selection to word start
     *
     * @private
     * @returns {void}
     */
    extendToWordStartInternal(isNavigation: boolean): void;
    /**
     * Extends selection to word end.
     *
     * @returns {void}
     */
    extendToWordEndInternal(isNavigation: boolean): void;
    /**
     * Extend selection to next line.
     *
     * @returns {void}
     */
    extendToNextLine(): void;
    private getTextPosition;
    /**
     * Get Selected text
     *
     * @private
     * @returns {void}
     */
    getText(includeObject: boolean): string;
    /**
     * Get selected text
     *
     * @private
     * @returns {string}
     */
    getTextInternal(start: TextPosition, end: TextPosition, includeObject: boolean): string;
    /**
     * @private
     * @param block
     * @param offset
     * @returns {string}
     */
    getHierarchicalIndex(block: Widget, offset: string): string;
    /**
     * @private
     * @returns {string}
     */
    getHierarchicalIndexByPosition(position: TextPosition): string;
    /**
     * @private
     * @returns {TextPosition}
     */
    getTextPosBasedOnLogicalIndex(hierarchicalIndex: string): TextPosition;
    /**
     * Get offset value to update in selection
     *
     * @private
     * @returns {LineInfo}
     */
    getLineInfoBasedOnParagraph(paragraph: ParagraphWidget, offset: number): LineInfo;
    /**
     * @private
     * @returns {ParagraphInfo}
     */
    getParagraph(position: IndexInfo): ParagraphInfo;
    /**
     * Gets body widget based on position.
     *
     * @private
     * @returns {BlockContainer}
     */
    getBodyWidget(position: IndexInfo): BlockContainer;
    private getFootNoteWidget;
    private getHeaderFooterWidget;
    /**
     * @private
     * @returns {BodyWidget}
     */
    getBodyWidgetInternal(sectionIndex: number, blockIndex: number): BodyWidget;
    private getParagraphInternal;
    /**
     * @private
     * @returns {Widget}
     */
    getBlockByIndex(container: Widget, blockIndex: number): Widget;
    /**
     * Get logical offset of paragraph.
     *
     * @private
     * @returns {ParagraphInfo}
     */
    getParagraphInfo(position: TextPosition): ParagraphInfo;
    /**
     * @private
     * @returns {ParagraphInfo}
     */
    getParagraphInfoInternal(line: LineWidget, lineOffset: number): ParagraphInfo;
    /**
     * @private
     * @returns {ListTextElementBox}
     */
    getListTextElementBox(paragarph: ParagraphWidget): ListTextElementBox;
    /**
     * @private
     * @returns {WListLevel}
     */
    getListLevel(paragraph: ParagraphWidget): WListLevel;
    private getTextInline;
    /**
     * Returns field code.
     *
     * @private
     * @param fieldBegin
     * @returns {string}
     */
    getFieldCode(fieldBegin: FieldElementBox): string;
    private getFieldCodeInternal;
    /**
     * @private
     * @returns {FieldElementBox}
     */
    getTocFieldInternal(): FieldElementBox;
    /**
     * Get next paragraph in bodyWidget
     *
     * @private
     * @returns {ParagraphWidget}
     */
    getNextParagraph(section: BodyWidget): ParagraphWidget;
    /**
     * @private
     * @returns {ParagraphWidget}
     */
    getPreviousParagraph(section: BodyWidget): ParagraphWidget;
    /**
     * Get first paragraph in cell
     *
     * @private
     * @returns {ParagraphWidget}
     */
    getFirstParagraphInCell(cell: TableCellWidget): ParagraphWidget;
    /**
     * Get first paragraph in first cell
     *
     * @private
     * @returns {TableWidget}
     */
    getFirstParagraphInFirstCell(table: TableWidget): ParagraphWidget;
    /**
     * Get last paragraph in last cell
     *
     * @private
     * @returns {ParagraphWidget}
     */
    getLastParagraphInLastCell(table: TableWidget): ParagraphWidget;
    /**
     * Get last paragraph in first row
     *
     * @private
     * @returns {ParagraphWidget}
     */
    getLastParagraphInFirstRow(table: TableWidget): ParagraphWidget;
    /**
     * Get Next start inline
     *
     * @private
     * @returns {ElementBox}
     */
    getNextStartInline(line: LineWidget, offset: number): ElementBox;
    /**
     * Get previous text inline
     *
     * @private
     * @returns {ElementBox}
     */
    getPreviousTextInline(inline: ElementBox): ElementBox;
    /**
     * Get next text inline
     *
     * @private
     * @returns {ElementBox}
     */
    getNextTextInline(inline: ElementBox): ElementBox;
    /**
     * Get container table
     *
     * @private
     * @returns {TableWidget}
     */
    getContainerTable(block: BlockWidget): TableWidget;
    /**
     * @private
     * @param element
     * @returns
     */
    isElementInSelection(element: ElementBox): boolean;
    /**
     * @private
     * @returns {boolean}
     */
    isExistBefore(start: BlockWidget, block: BlockWidget): boolean;
    /**
     * @private
     * @returns {boolean}
     */
    isExistAfter(start: BlockWidget, block: BlockWidget): boolean;
    /**
     * Return true if current inline in exist before inline
     *
     * @private
     * @returns {boolean}
     */
    isExistBeforeInline(currentInline: ElementBox, inline: ElementBox): boolean;
    /**
     * Return true id current inline is exist after inline
     *
     * @private
     * @returns {boolean}
     */
    isExistAfterInline(currentInline: ElementBox, inline: ElementBox, isRetrieve?: boolean): boolean;
    /**
     * Get next rendered block
     *
     * @private
     * @returns {BlockWidget}
     */
    getNextRenderedBlock(block: BlockWidget): BlockWidget;
    /**
     * Get next rendered block
     *
     * @private
     * @returns {BlockWidget}
     */
    getPreviousRenderedBlock(block: BlockWidget): BlockWidget;
    /**
     * Get Next paragraph in block
     *
     * @private
     * @returns {ParagraphWidget}
     */
    getNextParagraphBlock(block: BlockWidget): ParagraphWidget;
    /**
     * @private
     * @returns {ParagraphWidget}
     */
    getFirstBlockInNextHeaderFooter(block: BlockWidget): ParagraphWidget;
    /**
     * @private
     * @returns {ParagraphWidget}
     */
    getLastBlockInPreviousHeaderFooter(block: BlockWidget): ParagraphWidget;
    /**
     * Get previous paragraph in block
     *
     * @private
     * @returns {ParagraphWidget}
     */
    getPreviousParagraphBlock(block: BlockWidget): ParagraphWidget;
    /**
     * Get first paragraph in block
     *
     * @private
     * @returns {ParagraphWidget}
     */
    getFirstParagraphBlock(block: BlockWidget): ParagraphWidget;
    /**
     * Get last paragraph in block
     *
     * @private
     * @returns {ParagraphWidget}
     */
    getLastParagraphBlock(block: BlockWidget): ParagraphWidget;
    /**
     * Return true if paragraph has valid inline
     *
     * @private
     * @returns {ParagraphWidget}
     */
    hasValidInline(paragraph: ParagraphWidget, start: ElementBox, end: ElementBox): boolean;
    /**
     * Get paragraph length
     *
     * @private
     * @returns {number}
     */
    getParagraphLength(paragraph: ParagraphWidget, endLine?: LineWidget, elementInfo?: ElementInfo): number;
    /**
     * Get Line length
     *
     * @private
     * @returns {number}
     */
    getLineLength(line: LineWidget, elementInfo?: ElementInfo): number;
    /**
     * Get line information
     *
     * @private
     * @returns {LineInfo}
     */
    getLineInfo(paragraph: ParagraphWidget, offset: number): LineInfo;
    /**
     * @private
     * @returns {ElementInfo}
     */
    getElementInfo(line: LineWidget, offset: number): ElementInfo;
    /**
     * Get paragraph start offset
     *
     * @private
     * @returns {number}
     */
    getStartOffset(paragraph: ParagraphWidget): number;
    /**
     * @private
     */
    getStartLineOffset(line: LineWidget): number;
    /**
     * Get previous paragraph from selection
     *
     * @private
     */
    getPreviousSelectionCell(cell: TableCellWidget): ParagraphWidget;
    /**
     * Get previous paragraph selection in selection
     *
     * @private
     */
    getPreviousSelectionRow(row: TableRowWidget): ParagraphWidget;
    /**
     * @private
     */
    getNextSelectionBlock(block: BlockWidget): ParagraphWidget;
    /**
     * Get next paragraph from selected cell
     *
     * @private
     */
    getNextSelectionCell(cell: TableCellWidget): ParagraphWidget;
    /**
     * Get next paragraph in selection
     *
     * @private
     */
    getNextSelectionRow(row: TableRowWidget): ParagraphWidget;
    /**
     * Get next block with selection
     *
     * @private
     */
    getNextSelection(section: BodyWidget): ParagraphWidget;
    /**
     * @private
     */
    getNextParagraphSelection(row: TableRowWidget): ParagraphWidget;
    /**
     * @private
     */
    getPreviousSelectionBlock(block: BlockWidget): ParagraphWidget;
    /**
     * Get previous paragraph in selection
     *
     * @private
     */
    getPreviousSelection(section: BodyWidget): ParagraphWidget;
    /**
     * @private
     */
    getPreviousParagraphSelection(row: TableRowWidget): ParagraphWidget;
    /**
     * Get last cell in the selected region
     *
     * @private
     */
    getLastCellInRegion(row: TableRowWidget, startCell: TableCellWidget, selLength: number, isMovePrev: boolean): TableCellWidget;
    /**
     * Get Container table
     *
     * @private
     */
    getCellInTable(table: TableWidget, tableCell: TableCellWidget): TableCellWidget;
    /**
     * Get first paragraph in last row
     *
     * @private
     */
    getFirstParagraphInLastRow(table: TableWidget): ParagraphWidget;
    /**
     * Get previous valid offset
     *
     * @private
     */
    getPreviousValidOffset(paragraph: ParagraphWidget, offset: number): number;
    /**
     * Get next valid offset
     *
     * @private
     */
    getNextValidOffset(line: LineWidget, offset: number): number;
    /**
     * Get paragraph mark size info
     *
     * @private
     */
    getParagraphMarkSize(paragraph: ParagraphWidget, topMargin: number, bottomMargin: number): SizeInfo;
    /**
     * @private
     */
    getPhysicalPositionInternal(line: LineWidget, offset: number, moveNextLine: boolean): Point;
    /**
     * Highlight selected content
     *
     * @private
     */
    highlightSelectedContent(start: TextPosition, end: TextPosition): void;
    private showResizerForShape;
    /**
     * @private
     * @returns {void}
     */
    highlight(paragraph: ParagraphWidget, start: TextPosition, end: TextPosition): void;
    private highlightNextBlock;
    /**
     * Get start line widget
     * @private
     * @returns {ElementInfo}
     */
    getStartLineWidget(paragraph: ParagraphWidget, start: TextPosition, startElement: ElementBox, selectionStartIndex: number): ElementInfo;
    /**
     * Get end line widget
     * @private
     */
    getEndLineWidget(end: TextPosition, endElement: ElementBox, selectionEndIndex: number): ElementInfo;
    /**
     * Get line widget
     * @private
     */
    getLineWidgetInternal(line: LineWidget, offset: number, moveToNextLine: boolean): LineWidget;
    /**
     * Get last line widget
     * @private
     */
    getLineWidgetParagraph(offset: number, line: LineWidget): LineWidget;
    /**
     * Highlight selected cell
     * @private
     */
    highlightCells(table: TableWidget, startCell: TableCellWidget, endCell: TableCellWidget): void;
    /**
     * highlight selected table
     *
     * @private
     */
    highlightTable(table: TableWidget, start: TextPosition, end: TextPosition): void;
    /**
     * Get cell left
     *
     * @private
     */
    getCellLeft(row: TableRowWidget, cell: TableCellWidget): number;
    /**
     * Get next paragraph for row
     *
     * @private
     */
    getNextParagraphRow(row: BlockWidget): ParagraphWidget;
    /**
     * Get previous paragraph from row
     *
     * @private
     */
    getPreviousParagraphRow(row: TableRowWidget): ParagraphWidget;
    /**
     * Return true if row contain cell
     *
     * @private
     */
    containsRow(row: TableRowWidget, tableCell: TableCellWidget): boolean;
    /**
     * Highlight selected row
     *
     * @private
     */
    highlightRow(row: TableRowWidget, start: number, end: number): void;
    /**
     * @private
     */
    highlightInternal(row: TableRowWidget, start: TextPosition, end: TextPosition): void;
    /**
     * Get last paragraph in cell
     *
     * @private
     */
    getLastParagraph(cell: TableCellWidget): ParagraphWidget;
    /**
     * Return true is source cell contain cell
     *
     * @private
     */
    containsCell(sourceCell: TableCellWidget, cell: TableCellWidget): boolean;
    /**
     * Return true if cell is selected
     *
     * @private
     */
    isCellSelected(cell: TableCellWidget, startPosition: TextPosition, endPosition: TextPosition): boolean;
    /**
     * Return Container cell
     *
     * @private
     */
    getContainerCellOf(cell: TableCellWidget, tableCell: TableCellWidget): TableCellWidget;
    /**
     * Get Selected cell
     *
     * @private
     */
    getSelectedCell(cell: TableCellWidget, containerCell: TableCellWidget): TableCellWidget;
    /**
     * @private
     */
    getSelectedCells(): TableCellWidget[];
    /**
     * Get Next paragraph from cell
     *
     * @private
     */
    getNextParagraphCell(cell: TableCellWidget): ParagraphWidget;
    /**
     * Get previous paragraph from cell
     *
     * @private
     */
    getPreviousParagraphCell(cell: TableCellWidget): ParagraphWidget;
    /**
     * Get cell's container cell
     *
     * @private
     */
    getContainerCell(cell: TableCellWidget): TableCellWidget;
    /**
     * Highlight selected cell
     *
     * @private
     */
    highlightCell(cell: TableCellWidget, selection: Selection, start: TextPosition, end: TextPosition): void;
    /**
     * @private
     */
    highlightContainer(cell: TableCellWidget, start: TextPosition, end: TextPosition): void;
    /**
     * Get previous valid element
     *
     * @private
     */
    getPreviousValidElement(inline: ElementBox): ElementBox;
    /**
     * Get next valid element
     *
     * @private
     */
    getNextValidElement(inline: ElementBox): ElementBox;
    /**
     * Return next valid inline with index
     *
     * @private
     */
    validateTextPosition(inline: ElementBox, index: number): ElementInfo;
    /**
     * Get inline physical location
     *
     * @private
     */
    getPhysicalPositionInline(inline: ElementBox, index: number, moveNextLine: boolean): Point;
    /**
     * Get field character position
     *
     * @private
     */
    getFieldCharacterPosition(firstInline: ElementBox): Point;
    /**
     * @private
     */
    getNextValidElementForField(firstInline: ElementBox): ElementBox;
    /**
     * Get paragraph end position
     *
     * @private
     */
    getEndPosition(widget: ParagraphWidget): Point;
    /**
     * Get element box
     *
     * @private
     */
    getElementBox(currentInline: ElementBox, index: number, moveToNextLine: boolean): ElementInfo;
    /**
     * @private
     */
    getPreviousTextElement(inline: ElementBox): ElementBox;
    /**
     * Get next text inline
     *
     * @private
     */
    getNextTextElement(inline: ElementBox): ElementBox;
    /**
     * @private
     */
    getNextRenderedElementBox(inline: ElementBox, indexInInline: number): ElementBox;
    /**
     * @private
     */
    getElementBoxInternal(inline: ElementBox, index: number): ElementInfo;
    /**
     * Get Line widget
     *
     * @private
     */
    getLineWidget(inline: ElementBox, index: number): LineWidget;
    /**
     * @private
     */
    getLineWidgetInternalInline(inline: ElementBox, index: number, moveToNextLine: boolean): LineWidget;
    /**
     * Get next line widget
     *
     * @private
     */
    private getNextLineWidget;
    private getCaretHeight;
    private getFieldCharacterHeight;
    /**
     * Get rendered inline
     *
     * @private
     */
    getRenderedInline(inline: FieldElementBox, inlineIndex: number): ElementInfo;
    /**
     * Get rendered field
     *
     * @private
     */
    getRenderedField(fieldBegin: FieldElementBox): FieldElementBox;
    /**
     * Return true is inline is tha last inline
     *
     * @private
     */
    isLastRenderedInline(inline: ElementBox, index: number): boolean;
    /**
     * Get page
     *
     * @private
     */
    getPage(widget: Widget): Page;
    /**
     * Clear Selection highlight
     *
     * @private
     */
    clearSelectionHighlightInSelectedWidgets(): boolean;
    /**
     * Clear selection highlight
     *
     * @private
     */
    clearChildSelectionHighlight(widget: Widget): void;
    /**
     * Get line widget from paragraph widget
     *
     * @private
     */
    getLineWidgetBodyWidget(widget: Widget, point: Point): LineWidget;
    /**
     * Get line widget from paragraph widget
     *
     * @private
     */
    getLineWidgetParaWidget(widget: ParagraphWidget, point: Point): LineWidget;
    private highlightParagraph;
    /**
     * Get line widget form table widget
     *
     * @private
     */
    getLineWidgetTableWidget(widget: TableWidget, point: Point): LineWidget;
    /**
     * Get line widget fom row
     *
     * @private
     */
    getLineWidgetRowWidget(widget: TableRowWidget, point: Point): LineWidget;
    /**
     * @private
     */
    getFirstBlock(cell: TableCellWidget): BlockWidget;
    /**
     * Highlight selected cell widget
     *
     * @private
     */
    highlightCellWidget(widget: TableCellWidget): void;
    /**
     * Clear selection highlight
     *
     * @private
     */
    clearSelectionHighlight(widget: IWidget): void;
    /**
     * Get line widget from cell widget
     *
     * @private
     */
    getLineWidgetCellWidget(widget: TableCellWidget, point: Point): LineWidget;
    /**
     * update text position
     *
     * @private
     */
    updateTextPosition(widget: LineWidget, point: Point): void;
    /**
     * @private
     */
    updateTextPositionIn(widget: LineWidget, inline: ElementBox, index: number, caretPosition: Point, includeParagraphMark: boolean): TextPositionInfo;
    /**
     * @private
     */
    checkAllFloatingElements(widget: LineWidget, caretPosition: Point): ShapeInfo;
    /**
     * Get text length if the line widget
     *
     * @private
     */
    getTextLength(widget: LineWidget, element: ElementBox): number;
    /**
     * Get Line widget left
     *
     * @private
     */
    getLeft(widget: LineWidget): number;
    /**
     * Get line widget top
     *
     * @private
     */
    getTop(widget: LineWidget): number;
    /**
     * Get first element the widget
     *
     * @private
     */
    getFirstElement(widget: LineWidget, left: number): FirstElementInfo;
    /**
     * Return inline index
     *
     * @private
     */
    getIndexInInline(elementBox: ElementBox): number;
    /**
     * Return true if widget is first inline of paragraph
     *
     * @private
     */
    isParagraphFirstLine(widget: LineWidget): boolean;
    /**
     * @param widget
     * @private
     */
    isParagraphLastLine(widget: LineWidget): boolean;
    /**
     * Return line widget width
     *
     * @private
     */
    getWidth(widget: LineWidget, includeParagraphMark: boolean): number;
    /**
     * Return line widget left
     *
     * @private
     */
    getLeftInternal(widget: LineWidget, elementBox: ElementBox, index: number): number;
    /**
     * Return line widget start offset
     * @private
     */
    getLineStartLeft(widget: LineWidget): number;
    /**
     * Update text position
     * @private
     */
    updateTextPositionWidget(widget: LineWidget, point: Point, textPosition: TextPosition, includeParagraphMark: boolean): void;
    /**
     * Clear selection highlight
     * @private
     */
    clearSelectionHighlightLineWidget(widget: LineWidget): void;
    /**
     * Return first element from line widget
     * @private
     */
    getFirstElementInternal(widget: LineWidget): ElementBox;
    /**
     * Select content between given range
     * @private
     */
    selectRange(startPosition: TextPosition, endPosition: TextPosition): void;
    /**
     * Selects current paragraph
     * @private
     */
    selectParagraphInternal(paragraph: ParagraphWidget, positionAtStart: boolean): void;
    /**
     * @private
     */
    setPositionForBlock(block: BlockWidget, selectFirstBlock: boolean): TextPosition;
    /**
     * Select content in given text position
     * @private
     */
    selectContent(textPosition: TextPosition, clearMultiSelection: boolean): void;
    /**
     * Select paragraph
     * @private
     */
    selectInternal(lineWidget: LineWidget, element: ElementBox, index: number, physicalLocation: Point): void;
    /**
     * @private
     */
    selects(lineWidget: LineWidget, offset: number, skipSelectionChange: boolean): void;
    /**
     * Select content between start and end position
     * @private
     */
    selectPosition(startPosition: TextPosition, endPosition: TextPosition): void;
    /**
     * Notify selection change event
     * @private
     */
    fireSelectionChanged(isSelectionChanged: boolean): void;
    /**
     * Retrieve all current selection format
     * @private
     */
    retrieveCurrentFormatProperties(): void;
    /**
     * @private
     */
    retrieveImageFormat(start: TextPosition, end: TextPosition): void;
    /**
     * Returns the context type of previous character or element.
     * @param isElement - Decides whether to get previous context type from element or character. By default, character.
     */
    getPreviousContextType(isElement?: boolean): string;
    /**
     * Returns the context type of next character or element.
     * @param isElement - Decides whether to get next context type from element or character. By default, character.
     */
    getNextContextType(isElement?: boolean): string;
    private getContextElement;
    private setCurrentContextType;
    private addItemRevisions;
    /**
     * @private
     */
    hasRevisions(): boolean;
    private getCurrentRevision;
    private processLineRevisions;
    /**
     * @private
     * @param isFromAccept
     */
    handleAcceptReject(isFromAccept: boolean): void;
    private acceptReject;
    private getselectedRevisionElements;
    private getSelectedLineRevisions;
    private addRevisionsCollec;
    /**
     * Retrieve selection table format
     * @private
     */
    retrieveTableFormat(start: TextPosition, end: TextPosition): void;
    /**
     * Retrieve selection cell format
     * @private
     */
    retrieveCellFormat(start: TextPosition, end: TextPosition): void;
    /**
     * Retrieve selection row format
     * @private
     */
    retrieveRowFormat(start: TextPosition, end: TextPosition): void;
    /**
     * Get selected cell format
     * @private
     */
    getCellFormat(table: TableWidget, start: TextPosition, end: TextPosition): void;
    /**
     * Get selected row format
     * @private
     */
    getRowFormat(table: TableWidget, start: TextPosition, end: TextPosition): void;
    /**
     * Return table with given text position
     * @private
     */
    getTable(startPosition: TextPosition, endPosition: TextPosition): TableWidget;
    private getContainerWidget;
    /**
     * Retrieve selection section format
     * @private
     */
    retrieveSectionFormat(start: TextPosition, end: TextPosition): void;
    /**
     * Retrieve selection paragraph format
     * @private
     */
    retrieveParagraphFormat(start: TextPosition, end: TextPosition): void;
    /**
     * @private
     */
    getParagraphFormatForSelection(paragraph: ParagraphWidget, selection: Selection, start: TextPosition, end: TextPosition): void;
    /**
     * @private
     */
    getParagraphFormatInternalInParagraph(paragraph: ParagraphWidget, start: TextPosition, end: TextPosition): void;
    /**
     * @private
     */
    getParagraphFormatInternalInBlock(block: BlockWidget, start: TextPosition, end: TextPosition): void;
    /**
     * @private
     */
    getParagraphFormatInternalInTable(table: TableWidget, start: TextPosition, end: TextPosition): void;
    /**
     * Get paragraph format in cell
     * @private
     */
    getParagraphFormatInCell(cell: TableCellWidget): void;
    /**
     * @private
     */
    getParagraphFormatInBlock(block: BlockWidget): void;
    /**
     * @private
     */
    getParagraphFormatInTable(tableAdv: TableWidget): void;
    /**
     * @private
     */
    getParagraphFormatInParagraph(paragraph: ParagraphWidget): void;
    /**
     * Get paragraph format in cell
     * @private
     */
    getParagraphFormatInternalInCell(cellAdv: TableCellWidget, start: TextPosition, end: TextPosition): void;
    /**
     * @private
     */
    getParaFormatForCell(table: TableWidget, startCell: TableCellWidget, endCell: TableCellWidget): void;
    /**
     * Get paragraph format ins row
     * @private
     */
    getParagraphFormatInRow(tableRow: TableRowWidget, start: TextPosition, end: TextPosition): void;
    /**
     * Retrieve Selection character format
     * @private
     */
    retrieveCharacterFormat(start: TextPosition, end: TextPosition): void;
    /**
     * @private
     */
    getCharacterFormatForSelection(paragraph: ParagraphWidget, selection: Selection, startPosition: TextPosition, endPosition: TextPosition): void;
    /**
     * Get Character format
     * @private
     */
    getCharacterFormatForTableRow(tableRowAdv: TableRowWidget, start: TextPosition, end: TextPosition): void;
    /**
     * Get Character format in table
     * @private
     */
    getCharacterFormatInTableCell(tableCell: TableCellWidget, selection: Selection, start: TextPosition, end: TextPosition): void;
    /**
     * @private
     */
    getCharacterFormatInternalInTable(table: TableWidget, startCell: TableCellWidget, endCell: TableCellWidget, startPosition: TextPosition, endPosition: TextPosition): void;
    /**
     * Get character format with in selection
     * @private
     */
    getCharacterFormat(paragraph: ParagraphWidget, start: TextPosition, end: TextPosition): void;
    private setCharacterFormat;
    /**
     * @private
     */
    getCharacterFormatForBlock(block: BlockWidget, start: TextPosition, end: TextPosition): void;
    /**
     * @private
     */
    getCharacterFormatInTable(table: TableWidget, start: TextPosition, end: TextPosition): void;
    /**
     * Get character format in selection
     * @private
     */
    getCharacterFormatForSelectionCell(cell: TableCellWidget, start: TextPosition, end: TextPosition): void;
    /**
     * @private
     */
    getCharacterFormatInternal(paragraph: ParagraphWidget, selection: Selection): void;
    /**
     * Get next valid character format from inline
     * @private
     */
    getNextValidCharacterFormat(inline: ElementBox): WCharacterFormat;
    /**
     * Get next valid paragraph format from field
     * @private
     */
    getNextValidCharacterFormatOfField(fieldBegin: FieldElementBox): WCharacterFormat;
    /**
     * Return true if cursor point with in selection range
     * @private
     */
    checkCursorIsInSelection(widget: IWidget, point: Point): boolean;
    /**
     * Copy paragraph for to selection paragraph format
     * @private
     */
    copySelectionParagraphFormat(): WParagraphFormat;
    /**
     * Get hyperlink display text
     * @private
     */
    getHyperlinkDisplayText(paragraph: ParagraphWidget, fieldSeparator: FieldElementBox, fieldEnd: FieldElementBox, isNestedField: boolean, format: WCharacterFormat): HyperlinkTextInfo;
    /**
     * Navigates hyperlink on mouse Event.
     * @private
     */
    navigateHyperLinkOnEvent(cursorPoint: Point, isTouchInput: boolean): void;
    /**
     * @private
     */
    getLinkText(fieldBegin: FieldElementBox): string;
    /**
     * Set Hyperlink content to tool tip element
     * @private
     */
    setHyperlinkContentToToolTip(fieldBegin: FieldElementBox, widget: LineWidget, xPos: number, isFormField?: boolean): void;
    /**
     * Set Hyperlink content to tool tip element
     * @private
     */
    setFootnoteContentToToolTip(footnote: FootnoteElementBox, widget: LineWidget, xPos: number): void;
    /**
     * Set locked content info to tool tip element
     * @private
     */
    setLockInfoTooptip(widget: LineWidget, xPos: number, user: string): void;
    /**
     * @private
     */
    getTooltipPosition(widget: LineWidget, xPos: number, toolTipElement: HTMLElement, isFormField: boolean): Point;
    /**
     * @private
     */
    createPasteElement(top: string, left: string): void;
    /**
     * @private
     */
    pasteOptions: (event: MenuEventArgs) => void;
    /**
     * Show hyperlink tooltip
     * @private
     */
    showToolTip(x: number, y: number): void;
    /**
     * Hide tooltip object
     * @private
     */
    hideToolTip(): void;
    /**
     * Return hyperlink field
     * @private
     */
    getHyperLinkFieldInCurrentSelection(widget: LineWidget, cursorPosition: Point, isFormField?: boolean): FieldElementBox;
    /**
     * Return FootnoteElementBox
     * @private
     */
    getFootNoteElementInCurrentSelection(lineWidget: LineWidget, position: Point): FootnoteElementBox;
    /**
     * Return field if paragraph contain hyperlink field
     * @private
     */
    getHyperlinkField(isRetrieve?: boolean): FieldElementBox;
    /**
     * @private
     */
    getHyperLinkFields(paragraph: ParagraphWidget, checkedFields: FieldElementBox[], isRetrieve: boolean, checkFormField?: boolean): FieldElementBox;
    /**
     * @private
     */
    getHyperLinkFieldInternal(paragraph: Widget, inline: ElementBox, fields: FieldElementBox[], isRetrieve: boolean, checkFormField: boolean): FieldElementBox;
    /**
     * @private
     */
    getBlock(currentIndex: string): BlockWidget;
    /**
     * Return Block relative to position
     * @private
     */
    getBlockInternal(widget: Widget, position: string): BlockWidget;
    /**
     * Return true if inline is in field result
     * @private
     */
    inlineIsInFieldResult(fieldBegin: FieldElementBox, fieldEnd: ElementBox, fieldSeparator: FieldElementBox, inline: ElementBox, isRetrieve?: boolean): boolean;
    /**
     * Retrieve true if paragraph is in field result
     * @private
     */
    paragraphIsInFieldResult(fieldBegin: FieldElementBox, paragraph: ParagraphWidget): boolean;
    /**
     * Return true if image is In field
     * @private
     */
    isImageField(): boolean;
    /**
     * Return true if selection is in Form field
     * @private
     */
    isFormField(): boolean;
    /**
     * Return true if selection is in reference field
     * @private
     */
    isReferenceField(field?: FieldElementBox): boolean;
    /**
     * Return true if selection is in text form field
     * @private
     */
    isInlineFormFillMode(field?: FieldElementBox): boolean;
    /**
     * @private
     */
    getFormFieldType(formField?: FieldElementBox): FormFieldType;
    /**
     * Get selected form field type
     * @private
     */
    getCurrentFormField(checkFieldResult?: boolean): FieldElementBox;
    /**
     * @private
     */
    getCurrentTextFrame(): TextFrame;
    /**
     * @private
     */
    isTableSelected(): boolean;
    /**
     * Select List Text
     * @private
     */
    selectListText(): void;
    /**
     * Manually select the list text
     * @private
     */
    highlightListText(linewidget: LineWidget): void;
    /**
     * @private
     */
    updateImageSize(imageFormat: ImageInfo): void;
    /**
     * Gets selected table content
     * @private
     */
    private getSelectedCellsInTable;
    /**
     * Copies the selected content to clipboard.
     *
     * @returns {void}
     */
    copy(): void;
    /**
     * @private
     *
     * @returns {void}
     */
    copySelectedContent(isCut: boolean): void;
    /**
     * Write the selected content as SFDT.
     * @returns SFDT Object.
     */
    private writeSfdt;
    /**
     * @private
     */
    getHtmlContent(): string;
    private copyToClipboard;
    /**
     * Shows caret in current selection position.
     *
     * @private
     * @returns {void}
     */
    showCaret(): void;
    /**
     * To set the editable div caret position
     *
     * @private
     * @returns {void}
     */
    setEditableDivCaretPosition(index: number): void;
    /**
     * Hides caret.
     *
     * @private
     * @returns {void}
     */
    hideCaret: () => void;
    /**
     * Initializes caret.
     *
     * @private
     * @returns {void}
     */
    initCaret(): void;
    /**
     * Updates caret position.
     *
     * @private
     * @returns {void}
     */
    updateCaretPosition(): void;
    /**
     * @private
     * @returns {void}
     */
    showHidePasteOptions(top: string, left: string): void;
    /**
     * @private
     */
    getRect(position: TextPosition): Point;
    /**
     * Gets current selected page
     * @private
     */
    getSelectionPage(position: TextPosition): Page;
    /**
     * Updates caret size.
     * @private
     */
    updateCaretSize(textPosition: TextPosition, skipUpdate?: boolean): CaretHeightInfo;
    /**
     * Updates caret to page.
     * @private
     * @returns {void}
     */
    updateCaretToPage(startPosition: TextPosition, endPage: Page): void;
    /**
     * Gets caret bottom position.
     * @private
     */
    getCaretBottom(textPosition: TextPosition, isEmptySelection: boolean): number;
    /**
     * Checks for cursor visibility.
     *
     * @private
     * @returns {void}
     */
    checkForCursorVisibility(): void;
    /**
     * Keyboard shortcuts
     *
     * @private
     * @returns {void}
     */
    onKeyDownInternal(event: KeyboardEvent, ctrl: boolean, shift: boolean, alt: boolean): void;
    /**
     * @private
     */
    checkAndEnableHeaderFooter(point: Point, pagePoint: Point): boolean;
    /**
     * @private
     */
    isCursorInsidePageRect(point: Point, page: Page): boolean;
    /**
     * @private
     */
    isCursorInHeaderRegion(point: Point, page: Page): boolean;
    /**
     * @private
     */
    isCursorInFooterRegion(point: Point, page: Page): boolean;
    /**
     * @private
     */
    enableHeadersFootersRegion(widget: HeaderFooterWidget): boolean;
    /**
     * @private
     */
    shiftBlockOnHeaderFooterEnableDisable(): void;
    /**
     * @private
     */
    updateTextPositionForBlockContainer(widget: BlockContainer): void;
    /**
     * Disable Header footer
     * @private
     */
    disableHeaderFooter(): void;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
    /**
     * Navigates to the specified bookmark.
     * @param name
     * @param moveToStart
     * @private
     */
    navigateBookmark(name: string, moveToStart?: boolean): void;
    /**
     * Selects the specified bookmark.
     * @param name
     */
    selectBookmark(name: string): void;
    /**
     * Returns the toc field from the selection.
     * @private
     */
    getTocField(): FieldElementBox;
    /**
     * Returns true if the paragraph has toc style.
     */
    private isTocStyle;
    /**
     * Return true if selection is in TOC
     * @private
     */
    isTOC(): boolean;
    /**
     * @private
     */
    getElementsForward(lineWidget: LineWidget, startElement: ElementBox, endElement: ElementBox, bidi: boolean): ElementBox[];
    /**
     * @private
     */
    getElementsBackward(lineWidget: LineWidget, startElement: ElementBox, endElement: ElementBox, bidi: boolean): ElementBox[];
    /**
     * Navigate to previous comment in the document.
     *
     * @returns {void}
     */
    navigatePreviousComment(): void;
    /**
     * Navigate to next comment in the document.
     *
     * @returns {void}
     */
    navigateNextComment(): void;
    private commentNavigateInternal;
    /**
     * Navigate to previous revision in the document.
     *
     * @returns {void}
     */
    navigatePreviousRevision(): void;
    /**
     * Navigate to next revision in the document.
     *
     * @returns {void}
     */
    navigateNextRevision(): void;
    /**
     * Method to navigate revisions
     *
     * @private
     * @returns {void}
     */
    private revisionNavigateInternal;
    /**
     * @private
     * @returns {void}
     */
    selectComment(comment: CommentElementBox): void;
    /**
     * @private
     * @param revision
     * @returns {void}
     */
    selectRevision(revision: Revision): void;
    /**
     * @private
     * @returns {void}
     */
    updateEditRangeCollection(): void;
    /**
     * @private
     * @returns {void}
     */
    onHighlight(): void;
    /**
     * @private
     * @returns {void}
     */
    highlightEditRegion(): void;
    /**
     * @private
     * @returns {void}
     */
    highlightFormFields(): void;
    /**
     * @private
     * @returns {void}
     */
    unHighlightEditRegion(): void;
    /**
     * @private
     * @returns {void}
     */
    highlightEditRegionInternal(editRangeStart: EditRangeStartElementBox): void;
    /**
     * Shows all the editing region, where current user can edit.
     *
     * @returns {void}
     */
    showAllEditingRegion(): void;
    private highlightEditRegions;
    /**
     * Navigate to next editing region, where current user can edit.
     *
     * @returns {void}
     */
    navigateToNextEditingRegion(): void;
    /**
     * Highlight all the editing region, where current user can edit.
     *
     * @returns {void}
     */
    toggleEditingRegionHighlight(): void;
    /**
     * @private
     */
    getEditRangeStartElement(): EditRangeStartElementBox;
    /**
     * Returns true if selection is inside the edit region
     *
     * @returns {boolean}
     */
    isSelectionInEditRegion(): boolean;
    checkSelectionIsAtEditRegion(start?: TextPosition, end?: TextPosition): boolean;
    /**
     * @private
     */
    getPosition(element: ElementBox): PositionInfo;
    /**
     * @private
     */
    checkContentControlLocked(checkFormat?: boolean): boolean;
    /**
     * @private
     */
    getElementPosition(element: ElementBox, isEnd?: boolean): PositionInfo;
    /**
     * Update ref field.
     * @private
     */
    updateRefField(field?: FieldElementBox): void;
    /**
     *
     * @private
     * @returns {void}
     */
    footnoteReferenceElement(start: TextPosition, end: TextPosition, inline: ElementBox): void;
}
/**
 *  Specifies the settings for selection.
 */
export interface SelectionSettings {
    /**
     * Specifies selection left position
     */
    x: number;
    /**
     * Specifies selection top position
     */
    y: number;
    /**
     * Specifies whether to extend or update selection
     */
    extend?: boolean;
}
