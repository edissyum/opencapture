import { Dictionary } from '../../base/dictionary';
import { WList } from '../list/list';
import { WAbstractList } from '../list/abstract-list';
import { WListLevel } from '../list/list-level';
import { WLevelOverride } from '../list/level-override';
import { WSectionFormat, WCharacterFormat, WParagraphFormat, WStyles } from '../format/index';
import { Layout } from './layout';
import { Renderer } from './render';
import { Page, Rect, Widget, FieldElementBox, ParagraphWidget, HeaderFooterWidget, EditRangeStartElementBox, CommentElementBox, Padding, ShapeElementBox, ContentControl, Footnote, FootnoteElementBox, FootNoteWidget, ShapeBase } from './page';
import { DocumentEditor } from '../../document-editor';
import { BodyWidget, LineWidget, TableWidget, TableRowWidget, TableCellWidget, BlockWidget, HeaderFooters, BookmarkElementBox } from './page';
import { Point, PageInfo, CanvasInfo } from '../editor/editor-helper';
import { TextHelper, TextHeightInfo } from './text-helper';
import { Selection } from '../index';
import { TextPosition } from '../selection/selection-helper';
import { Zoom } from './zooming';
import { Dialog } from '@syncfusion/ej2-popups';
import { HeaderFooterType, PageFitType, ProtectionType, FootnoteRestartIndex, FootEndNoteNumberFormat, FootnoteType, CompatibilityMode } from '../../base/types';
import { RestrictEditing } from '../restrict-editing/restrict-editing-pane';
import { FormFieldPopUp } from '../dialogs/form-field-popup';
import { Revision } from '../track-changes/track-changes';
/**
 * @private
 */
export declare class DocumentHelper {
    /**
     * @private
     */
    scrollbarWidth: number;
    /**
     * @private
     */
    isWebPrinting: boolean;
    /**
     * @private
     */
    isHeaderFooter: boolean;
    /**
     * @private
     */
    owner: DocumentEditor;
    /**
     * @private
     */
    pageContainer: HTMLElement;
    /**
     * @private
     */
    viewerContainer: HTMLElement;
    /**
     * @private
     */
    optionsPaneContainer: HTMLElement;
    /**
     * @private
     */
    reviewPaneContainer: HTMLElement;
    /**
     * @private
     */
    pages: Page[];
    /**
     * @private
     */
    currentPage: Page;
    private selectionStartPageIn;
    private selectionEndPageIn;
    /**
     * @private
     */
    iframe: HTMLIFrameElement;
    /**
     * @private
     */
    editableDiv: HTMLElement;
    /**
     * @private
     */
    isShowReviewPane: boolean;
    /**
     * @private
     */
    fieldStacks: FieldElementBox[];
    /**
     * @private
     */
    showRevision: boolean;
    /**
     * @private
     */
    splittedCellWidgets: TableCellWidget[];
    /**
     * @private
     */
    tableLefts: number[];
    /**
     * @private
     */
    tapCount: number;
    private timer;
    private isTimerStarted;
    /**
     * @private
     */
    isFirstLineFitInShiftWidgets: boolean;
    /**
     * @private
     */
    preZoomFactor: number;
    /**
     * @private
     */
    preDifference: number;
    /**
     * @private
     */
    fieldEndParagraph: ParagraphWidget;
    /**
     * @private
     */
    fieldToLayout: FieldElementBox;
    /**
     * @private
     */
    backgroundColor: string;
    /**
     * @private
     */
    layout: Layout;
    /**
     * @private
     */
    render: Renderer;
    private containerCanvasIn;
    private selectionCanvasIn;
    /**
     * @private
     */
    zoomModule: Zoom;
    /**
     * @private
     */
    isMouseDown: boolean;
    private isMouseEntered;
    private scrollMoveTimer;
    /**
     * @private
     */
    isSelectionChangedOnMouseMoved: boolean;
    /**
     * @private
     */
    isControlPressed: boolean;
    /**
     * @private
     */
    touchStart: HTMLElement;
    /**
     * @private
     */
    touchEnd: HTMLElement;
    /**
     * @private
     */
    isTouchInput: boolean;
    /**
     * @private
     */
    isTouchMoved: boolean;
    /**
     * @private
     */
    useTouchSelectionMark: boolean;
    /**
     * @private
     */
    touchDownOnSelectionMark: number;
    /**
     * @private
     */
    textHelper: TextHelper;
    /**
     * @private
     */
    isComposingIME: boolean;
    /**
     * @private
     */
    lastComposedText: string;
    /**
     * @private
     */
    isCompositionStart: boolean;
    /**
     * @private
     */
    isCompositionUpdated: boolean;
    /**
     * @private
     */
    isCompositionCanceled: boolean;
    /**
     * @private
     */
    isCompositionEnd: boolean;
    /**
     * @private
     */
    prefix: string;
    /**
     * @private
     */
    suffix: string;
    private dialogInternal;
    private dialogTarget1;
    private dialogTarget2;
    private dialogInternal2;
    private dialogInternal3;
    private dialogTarget3;
    /**
     * @private
     */
    fields: FieldElementBox[];
    /**
     * @private
     */
    blockToShift: BlockWidget;
    /**
     * @private
     */
    heightInfoCollection: TextHeightInfo;
    private animationTimer;
    /**
     * @private
     */
    isListTextSelected: boolean;
    /**
     * @private
     */
    selectionLineWidget: LineWidget;
    /**
     * @private
     */
    characterFormat: WCharacterFormat;
    /**
     * @private
     */
    paragraphFormat: WParagraphFormat;
    /**
     * @private
     */
    renderedLists: Dictionary<WAbstractList, Dictionary<number, number>>;
    /**
     * @private
     */
    renderedLevelOverrides: WLevelOverride[];
    /**
     * @private
     */
    headersFooters: HeaderFooters[];
    private fieldSeparator;
    /**
     * @private
     */
    defaultTabWidth: number;
    /**
     * @private
     */
    dontUseHtmlParagraphAutoSpacing: boolean;
    /**
     * @private
     */
    alignTablesRowByRow: boolean;
    /**
     * @private
     */
    compatibilityMode: CompatibilityMode;
    /**
     * @private
     */
    lists: WList[];
    /**
     * @private
     */
    comments: CommentElementBox[];
    /**
     * @private
     */
    authors: Dictionary<string, string>;
    /**
     * @private
     */
    revisionsInternal: Dictionary<string, Revision>;
    /**
     * @private
     */
    commentUserOptionId: number;
    /**
     * @private
     */
    abstractLists: WAbstractList[];
    /**
     * @private
     */
    styles: WStyles;
    /**
     * @private
     */
    listParagraphs: ParagraphWidget[];
    /**
     * @private
     */
    preDefinedStyles: Dictionary<string, string>;
    /**
     * @private
     */
    isRowOrCellResizing: boolean;
    /**
     * @private
     */
    bookmarks: Dictionary<string, BookmarkElementBox>;
    /**
     * @private
     */
    formFields: FieldElementBox[];
    /**
     * @private
     */
    editRanges: Dictionary<string, EditRangeStartElementBox[]>;
    private isMouseDownInFooterRegion;
    private pageFitTypeIn;
    /**
     * @private
     */
    fieldCollection: FieldElementBox[];
    /**
     * @private
     */
    isPageField: boolean;
    /**
     * @private
     */
    mouseDownOffset: Point;
    /**
     * @private
     */
    zoomX: number;
    /**
     * @private
     */
    zoomY: number;
    private zoomFactorInternal;
    /**
     * If movecaretposition is 1, Home key is pressed
     * If moveCaretPosition is 2, End key is pressed
     *
     * @private
     */
    moveCaretPosition: number;
    /**
     * @private
     */
    isTextInput: boolean;
    /**
     * @private
     */
    isScrollHandler: boolean;
    /**
     * @private
     */
    triggerElementsOnLoading: boolean;
    /**
     * @private
     */
    triggerSpellCheck: boolean;
    /**
     * @private
     */
    scrollTimer: number;
    resizeTimer: number;
    /**
     * @private
     * @default false
     */
    isScrollToSpellCheck: boolean;
    /**
     * preserve the format
     *
     * @private
     */
    restrictFormatting: boolean;
    /**
     * preserve the document protection type either readonly or no protection
     *
     * @private
     */
    protectionType: ProtectionType;
    /**
     * Preserve the password protection is enforced or not
     *
     * @private
     */
    isDocumentProtected: boolean;
    /**
     * preserve the hash value of password
     *
     * @private
     */
    hashValue: string;
    /**
     * @private
     */
    saltValue: string;
    /**
     * @private
     */
    userCollection: string[];
    /**
     * @private
     */
    restrictEditingPane: RestrictEditing;
    formFillPopup: FormFieldPopUp;
    /**
     * @private
     */
    cachedPages: number[];
    longTouchTimer: number;
    /**
     * @private
     */
    skipScrollToPosition: boolean;
    /**
     * @private
     */
    isIosDevice: boolean;
    /**
     * @private
     */
    isMobileDevice: boolean;
    /**
     * @private
     */
    visibleBoundsIn: Rect;
    /**
     * @private
     */
    currentSelectedCommentInternal: CommentElementBox;
    /**
     * @private
     */
    currentSelectedRevisionInternal: Revision;
    /**
     * @private
     */
    resizerTimer: number;
    /**
     * @private
     */
    isFormFilling: boolean;
    /**
     * @private
     */
    customXmlData: Dictionary<string, string>;
    /**
     * @private
     */
    contentControlCollection: ContentControl[];
    /**
     * @private
     */
    footnotes: Footnote;
    /**
     * @private
     */
    endnotes: Footnote;
    /**
     * @private
     */
    endnoteNumberFormat: FootEndNoteNumberFormat;
    /**
     * @private
     */
    footNoteNumberFormat: FootEndNoteNumberFormat;
    /**
     * @private
     */
    restartIndexForFootnotes: FootnoteRestartIndex;
    /**
     * @private
     */
    restartIndexForEndnotes: FootnoteRestartIndex;
    /**
     * @private
     */
    footnoteCollection: FootnoteElementBox[];
    /**
     * @private
     */
    endnoteCollection: FootnoteElementBox[];
    /**
     * @private
     */
    isFootnoteWidget: boolean;
    /**
     * Gets visible bounds.
     *
     * @private
     * @returns {Rect} - Returns visible bounds.
     */
    readonly visibleBounds: Rect;
    /**
     * @private
     */
    readonly viewer: LayoutViewer;
    /**
     * Gets container canvas.
     *
     * @private
     * @returns {HTMLCanvasElement} - Returns page canvas.
     */
    readonly containerCanvas: HTMLCanvasElement;
    /**
     * Gets selection canvas.
     *
     * @private
     * @returns {HTMLCanvasElement} - Returns selection canvas.
     */
    readonly selectionCanvas: HTMLCanvasElement;
    /**
     * Gets container context.
     *
     * @private
     * @returns {CanvasRenderingContext2D} - Returns page canvas context.
     */
    readonly containerContext: CanvasRenderingContext2D;
    /**
     * Gets selection context.
     *
     * @private
     * @returns {CanvasRenderingContext2D} - Returns selection canvas context.
     */
    readonly selectionContext: CanvasRenderingContext2D;
    /**
     * Gets the current rendering page.
     *
     * @returns {Page} - Returns current rendering page.
     */
    readonly currentRenderingPage: Page;
    /**
     * Gets or sets zoom factor.
     *
     * @private
     * @returns {number} - Returns zoom factor value.
     */
    zoomFactor: number;
    /**
     * Gets the selection.
     *
     * @private
     * @returns {Selection} - Returns selection module.
     */
    readonly selection: Selection;
    /**
     * Gets or sets selection start page.
     *
     * @private
     * @returns {Page} - Return selection start page.
     */
    selectionStartPage: Page;
    /**
     * Gets or sets selection end page.
     *
     * @private
     * @returns {Page} - Return selection end page.
     */
    selectionEndPage: Page;
    /**
     * Gets the initialized default dialog.
     *
     * @private
     * @returns {Dialog} - Returns dialog instance.
     */
    readonly dialog: Dialog;
    /**
     * Gets the initialized default dialog.
     *
     * @private
     * @returns {Dialog} - Returns dialog instance.
     */
    readonly dialog2: Dialog;
    /**
     * Gets the initialized default dialog.
     *
     * @private
     * @returns {Dialog} - Returns dialog instance.
     */
    readonly dialog3: Dialog;
    /**
     * @private
     * @returns {void}
     */
    currentSelectedComment: CommentElementBox;
    /**
     * @private
     * @returns {void}
     */
    currentSelectedRevision: Revision;
    /**
     * @private
     * @returns {void}
     */
    readonly isInlineFormFillProtectedMode: boolean;
    /**
     * @private
     * @returns {void}
     */
    readonly isFormFillProtectedMode: boolean;
    constructor(owner: DocumentEditor);
    private initalizeStyles;
    /**
     * @private
     * @returns {void}
     */
    clearDocumentItems(): void;
    /**
     * @private
     * @returns {void}
     */
    setDefaultDocumentFormat(): void;
    private setDefaultCharacterValue;
    private setDefaultParagraphValue;
    /**
     * @private
     * @param {number} id - Specfies abstract list id.
     * @returns {WAbstractList} - Returns abstract list.
     */
    getAbstractListById(id: number): WAbstractList;
    /**
     * @private
     * @param {number} id - Specfies list id.
     * @returns {WAbstractList} - Returns list.
     */
    getListById(id: number): WList;
    /**
     * @private
     * @param {WListLevel} listLevel - Specfies list level.
     * @returns {number} - Returns list level number.
     */
    static getListLevelNumber(listLevel: WListLevel): number;
    /**
     * Gets the bookmarks.
     *
     * @private
     * @param {boolean} includeHidden - Include hidden bookmark.
     * @returns {string[]} - Returns bookmars present in current document.
     */
    getBookmarks(includeHidden?: boolean): string[];
    selectComment(comment: CommentElementBox): void;
    showComments(show: boolean): void;
    showRevisions(show: boolean): void;
    /**
     * Initializes components.
     *
     * @private
     * @returns {void}
     */
    initializeComponents(): void;
    private measureScrollbarWidth;
    private createEditableDiv;
    private createEditableIFrame;
    private initIframeContent;
    /**
     * Wires events and methods.
     *
     * @returns {void}
     */
    private wireEvent;
    private wireInputEvents;
    private onIframeLoad;
    /**
     * @private
     * @param {TextEvent} event - Specifies text event.
     * @returns {void}
     */
    private onTextInput;
    /**
     * Fires when composition starts.
     *
     * @private
     * @returns {void}
     */
    private compositionStart;
    /**
     * Fires on every input during composition.
     *
     * @private
     * @returns {void}
     */
    private compositionUpdated;
    /**
     * Fires when user selects a character/word and finalizes the input.
     *
     * @private
     * @param {CompositionEvent} event - Specifies text compisition event.
     * @returns {void}
     */
    private compositionEnd;
    private getEditableDivTextContent;
    updateAuthorIdentity(): void;
    getAvatar(userInfo: HTMLElement, userName: HTMLElement, comment: CommentElementBox, revision: Revision): void;
    /**
     * @private
     * @param {string} author - Specifies author name.
     * @returns {string} - Return autor color.
     */
    getAuthorColor(author: string): string;
    generateRandomColor(): string;
    /**
     * @private
     * @returns {void}
     */
    positionEditableTarget(): void;
    private onImageResizer;
    /**
     * @private
     * @param {KeyboardEvent} event - Specifies keyboard event
     * @returns {void}
     */
    onKeyPressInternal: (event: KeyboardEvent) => void;
    /**
     * @private
     * @param {KeyboardEvent} event - Specifies keyboard event
     * @returns {void}
     */
    private onTextInputInternal;
    /**
     * Fired on paste.
     *
     * @private
     * @param {ClipboardEvent} event - Specifies clipboard event.
     * @returns {void}
     */
    onPaste: (event: ClipboardEvent) => void;
    private initDialog;
    private initDialog3;
    hideDialog(): void;
    private initDialog2;
    /**
     * Fires when editable div loses focus.
     *
     * @private
     * @returns {void}
     */
    onFocusOut: () => void;
    /**
     * Updates focus to editor area.
     *
     * @private
     * @returns {void}
     */
    updateFocus: () => void;
    /**
     * Clears the context.
     *
     * @private
     * @returns {void}
     */
    clearContent(): void;
    /**
     * Fired when the document gets changed.
     *
     * @private
     * @param {BodyWidget[]} sections - Specified document content.
     * @returns {void}
     */
    onDocumentChanged(sections: BodyWidget[]): void;
    /**
     * Fires on scrolling.
     *
     * @returns {void}
     */
    private scrollHandler;
    /**
     * Fires when the window gets resized.
     *
     * @private
     * @returns {void}
     */
    onWindowResize: () => void;
    /**
     * @private
     * @param {MouseEvent} event - Specified mouse event.
     * @returns {void}
     */
    onContextMenu: (event: MouseEvent) => void;
    /**
     * Initialize touch ellipse.
     *
     * @returns {void}
     */
    private initTouchEllipse;
    /**
     * Updates touch mark position.
     *
     * @private
     * @returns {void}
     */
    updateTouchMarkPosition(): void;
    /**
     * Called on mouse down.
     *
     * @private
     * @param {MouseEvent} event - Specifies mouse event.
     * @returns {void}
     */
    onMouseDownInternal: (event: MouseEvent) => void;
    /**
     * Called on mouse move.
     *
     * @private
     * @param {MouseEvent} event - Specified mouse event.
     * @returns {void}
     */
    onMouseMoveInternal: (event: MouseEvent) => void;
    /**
     * @private
     * @param {MouseEvent} event - Specifies mouse event
     * @returns {void}
     */
    onMouseLeaveInternal: (event: MouseEvent) => void;
    private scrollForwardOnSelection;
    private scrollBackwardOnSelection;
    /**
     * @private
     * @returns {void}
     */
    onMouseEnterInternal: () => void;
    /**
     * Fired on double tap.
     *
     * @private
     * @param {MouseEvent} event - Specifies mouse event.
     * @returns {void}
     */
    onDoubleTap: (event: MouseEvent) => void;
    /**
     * Called on mouse up.
     *
     * @private
     * @param {MouseEvent} event - Specifies mouse event.
     * @return {void}
     */
    onMouseUpInternal: (event: MouseEvent) => void;
    private isSelectionInListText;
    isInShapeBorder(floatElement: ShapeBase, cursorPoint: Point): boolean;
    /**
     * Check whether touch point is inside the rectangle or not.
     *
     * @private
     * @param {number} x - Specifies left position.
     * @param {number} y - Specifies top position.
     * @param {number} width - Specifies width.
     * @param {number} height - Specifies height
     * @param {Point} touchPoint - Specifies the point to check.
     * @returns {boolean} - Return true if points intersect.
     */
    isInsideRect(x: number, y: number, width: number, height: number, touchPoint: Point): boolean;
    getLeftValue(widget: LineWidget): number;
    /**
     * Checks whether left mouse button is pressed or not.
     *
     * @param {MouseEvent} event - Specifies mouse event.
     * @returns {boolean} - Returns true if left mouse button is clicked.
     */
    private isLeftButtonPressed;
    /**
     * Fired on touch start.
     *
     * @private
     * @param {TouchEvent} event - Specifies touch event.
     * @returns {void}
     */
    onTouchStartInternal: (event: Event) => void;
    /**
     * Fired on long touch
     *
     * @private
     * @param {TouchEvent} event - Specifies touch event.
     * @returns {void}
     */
    onLongTouch: (event: TouchEvent) => void;
    /**
     *
     * @private
     * @param {TouchEvent} event - Specifies touch event.
     * @returns {void}
     */
    onTouchMoveInternal: (event: TouchEvent) => void;
    /**
     * Fired on touch up.
     *
     * @private
     * @param {TouchEvent} event - Specifies touch event.
     * @returns {void}
     */
    onTouchUpInternal: (event: TouchEvent) => void;
    private updateSelectionOnTouch;
    /**
     * Gets touch offset value.
     *
     * @private
     * @param {TouchEvent} event - Specifies touch event
     * @returns {Point}  - Returns modified touch offset
     */
    getTouchOffsetValue(event: TouchEvent): Point;
    /**
     * Fired on pinch zoom in.
     *
     * @private
     * @param {TouchEvent} event - Specifies touch event
     * @returns {void}
     */
    onPinchInInternal(event: TouchEvent): void;
    private onPinchOutInternal;
    getPageWidth(page: Page): number;
    /**
     * Removes specified page.
     * @private
     * @param {Page} page - Specifies page to remove
     * @returns {void}
     */
    removePage(page: Page): void;
    /**
     * Updates viewer size on window resize.
     *
     * @private
     * @returns {void}
     */
    updateViewerSize(): void;
    private updateViewerSizeInternal;
    /**
     * Inserts page in specified index.
     *
     * @private
     * @param {number} index - Specifes index to insert page
     * @param {Page} page - Page to insert.
     * @returns {void}
     */
    insertPage(index: number, page: Page): void;
    updateTextPositionForSelection(cursorPoint: Point, tapCount: number): void;
    scrollToPosition(startPosition: TextPosition, endPosition: TextPosition, skipCursorUpdate?: boolean): void;
    getLineWidget(cursorPoint: Point): LineWidget;
    getLineWidgetInternal(cursorPoint: Point, isMouseDragged: boolean): LineWidget;
    private checkInlineShapeItems;
    /**
     * @private
     */
    checkPointIsInLine(widget: LineWidget, cursorPoint: Point): boolean;
    private isInFootnoteWidget;
    private checkFloatingItems;
    isBlockInHeader(block: Widget): boolean;
    clearSelectionHighlight(): void;
    /**
     * Fired on keyup event.
     *
     * @private
     * @param {KeyboardEvent} event - Specifies keyboard event.
     * @returns {void}
     */
    onKeyUpInternal: (event: KeyboardEvent) => void;
    /**
     * Fired on keydown.
     *
     * @private
     * @param {KeyboardEvent} event - Specifies keyboard event.
     * @returns {void}
     */
    onKeyDownInternal: (event: KeyboardEvent) => void;
    /**
     * @private
     * @returns {void}
     */
    removeEmptyPages(): void;
    /**
     * @private
     * @returns {void}
     */
    scrollToBottom(): void;
    getFieldResult(fieldBegin: FieldElementBox, page: Page): string;
    private getFieldText;
    /**
     * Destroys the internal objects maintained for control.
     *
     * @returns {void}
     */
    destroy(): void;
    /**
     * Un-Wires events and methods
     *
     * @returns {void}
     */
    private unWireEvent;
    updateCursor(event: MouseEvent): void;
}
/**
 * @private
 */
export declare abstract class LayoutViewer {
    owner: DocumentEditor;
    constructor(owner: DocumentEditor);
    readonly documentHelper: DocumentHelper;
    /**
     * @private
     */
    visiblePages: Page[];
    /**
     * @private
     */
    padding: Padding;
    /**
     * @private
     */
    clientActiveArea: Rect;
    /**
     * @private
     */
    clientArea: Rect;
    /**
     * @private
     */
    textWrap: boolean;
    /**
     * @private
     */
    preVisibleWidth: number;
    /**
     * @private
     */
    private pageFitTypeIn;
    /**
     * @private
     */
    containerTop: number;
    /**
     * @private
     */
    containerLeft: number;
    /**
     * Gets or sets page fit type.
     * @private
     */
    pageFitType: PageFitType;
    updateClientArea(sectionFormat: WSectionFormat, page: Page, isReLayout?: boolean): void;
    updateClientAreaTopOrLeft(tableWidget: TableWidget, beforeLayout: boolean): void;
    updateClientAreaForTable(tableWidget: TableWidget): void;
    updateClientAreaForRow(row: TableRowWidget, beforeLayout: boolean): void;
    updateClientAreaForCell(cell: TableCellWidget, beforeLayout: boolean): void;
    updateClientAreaForTextBoxShape(textBox: ShapeElementBox, beforeLayout: boolean): void;
    updateClientAreaByWidgetFootNote(widget: FootNoteWidget): void;
    /**
     * @private
     */
    updateClientAreaForTextWrap(area: Rect): void;
    updateClientAreaByWidget(widget: ParagraphWidget): void;
    updateClientAreaLocation(widget: Widget, area: Rect): void;
    updateClientAreaForBlock(block: BlockWidget, beforeLayout: boolean, tableCollection?: TableWidget[]): void;
    private tableAlignmentForBidi;
    cutFromLeft(x: number): void;
    cutFromTop(y: number): void;
    updateClientWidth(width: number): void;
    findFocusedPage(currentPoint: Point, updateCurrentPage: boolean): Point;
    getPageHeightAndWidth(height: number, width: number, viewerWidth: number, viewerHeight: number): PageInfo;
    renderVisiblePages(): void;
    handleZoom(): void;
    updateCanvasWidthAndHeight(viewerWidth: number, viewerHeight: number, containerHeight: number, containerWidth: number, width: number, height: number): CanvasInfo;
    updateScrollBarPosition(containerWidth: number, containerHeight: number, viewerWidth: number, viewerHeight: number, width: number, height: number): void;
    /**
     * @private
     */
    abstract readonly pageGap: number;
    /**
     * @private
     */
    abstract createNewPage(section: BodyWidget, index?: number): Page;
    /**
     * @private
     */
    abstract renderPage(page: Page, x: number, y: number, width: number, height: number): void;
    /**
     * @private
     */
    abstract updateScrollBars(): void;
    /**
     * private
     */
    abstract scrollToPage(pageIndex: number): void;
    /**
     * @private
     */
    abstract onPageFitTypeChanged(pageFitType: PageFitType): void;
    destroy(): void;
}
/**
 * @private
 */
export declare class PageLayoutViewer extends LayoutViewer {
    private pageLeft;
    /**
     * @private
     */
    readonly pageGap: number;
    /**
     * Initialize the constructor of PageLayoutViewer
     */
    constructor(owner: DocumentEditor);
    readonly documentHelper: DocumentHelper;
    createNewPage(section: BodyWidget, index?: number): Page;
    updatePageBoundingRectangle(section: BodyWidget, page: Page, yPosition: number): void;
    onPageFitTypeChanged(pageFitType: PageFitType): void;
    getCurrentPageHeaderFooter(section: BodyWidget, isHeader: boolean): HeaderFooterWidget;
    getHeaderFooterType(section: BodyWidget, isHeader: boolean): HeaderFooterType;
    getCurrentHeaderFooter(type: HeaderFooterType, sectionIndex: number): HeaderFooterWidget;
    private createHeaderFooterWidget;
    getHeaderFooter(type: HeaderFooterType): number;
    updateHFClientArea(sectionFormat: WSectionFormat, isHeader: boolean): void;
    updateHeaderFooterClientAreaWithTop(sectionFormat: WSectionFormat, isHeader: boolean, page: Page): void;
    updateFootnoteClientArea(sectionFormat: WSectionFormat, footnote: FootNoteWidget, footNoteType?: FootnoteType, para?: ParagraphWidget): void;
    scrollToPage(pageIndex: number): void;
    updateScrollBars(): void;
    updateVisiblePages(): void;
    private addVisiblePage;
    renderPage(page: Page, x: number, y: number, width: number, height: number): void;
}
export declare class WebLayoutViewer extends LayoutViewer {
    constructor(owner: DocumentEditor);
    readonly documentHelper: DocumentHelper;
    /**
     * @private
     */
    visiblePages: Page[];
    /**
     * @private
     */
    readonly pageGap: number;
    /**
     * Creates new page.
     * @private
     */
    createNewPage(section: BodyWidget, index?: number): Page;
    onPageFitTypeChanged(pageFitType: PageFitType): void;
    scrollToPage(pageIndex: number): void;
    getContentHeight(): number;
    /**
     * @private
     */
    getContentWidth(): number;
    updateScrollBars(): void;
    updateVisiblePages(): void;
    addVisiblePage(page: Page, x: number, y: number): void;
    /**
     * @private
     */
    renderPage(page: Page, x: number, y: number, width: number, height: number): void;
}
