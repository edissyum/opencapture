import { DocumentEditor } from '../../document-editor';
import { Widget, LineWidget, ElementBox, ImageElementBox, Page, ParagraphWidget, FieldElementBox } from '../index';
import { IndexInfo } from '../index';
import { Point } from '../index';
import { Selection } from './selection';
import { HyperlinkType } from '../../index';
import { ShapeBase } from '../viewer';
/**
 * @private
 */
export declare class TextPosition {
    /**
     * @private
     */
    currentWidget: LineWidget;
    /**
     * @private
     */
    offset: number;
    /**
     * @private
     */
    owner: DocumentEditor;
    /**
     * @private
     */
    location: Point;
    private documentHelper;
    /**
     * @private
     */
    isUpdateLocation: boolean;
    /**
     * @private
     */
    readonly paragraph: ParagraphWidget;
    /**
     * @private
     */
    readonly isAtParagraphStart: boolean;
    /**
     * @private
     */
    readonly isAtParagraphEnd: boolean;
    /**
     * @private
     */
    readonly isCurrentParaBidi: boolean;
    /**
     * @private
     */
    readonly selection: Selection;
    /**
     * Gets the hierarchical position of logical text position in the document
     *
     * @returns {string}
     */
    readonly hierarchicalPosition: string;
    constructor(owner: DocumentEditor);
    private readonly viewer;
    /**
     * Return clone of current text position
     *
     * @private
     */
    clone(): TextPosition;
    /**
     * @private
     */
    containsRtlText(widget: LineWidget): boolean;
    /**
     * Set text position for paragraph and inline
     *
     * @private
     */
    setPositionForSelection(line: LineWidget, element: ElementBox, index: number, physicalLocation: Point): void;
    /**
     * Set text position
     *
     * @private
     */
    setPositionFromLine(line: LineWidget, offset: number, location?: Point): void;
    /**
     * Set text position
     *
     * @private
     */
    setPosition(line: LineWidget, positionAtStart: boolean): void;
    /**
     * Set position for text position
     *
     * @private
     */
    setPositionInternal(textPosition: TextPosition): void;
    /**
     * Set position for current index
     *
     * @private
     */
    setPositionForCurrentIndex(hierarchicalIndex: string): void;
    /**
     * Get Page
     *
     */
    getPage(position: IndexInfo): Page;
    /**
     * @private
     */
    getParagraphWidget(position: IndexInfo): LineWidget;
    /**
     * @private
     */
    getLineWidget(widget: Widget, position: IndexInfo, page?: Page): LineWidget;
    /**
     * Update physical location of paragraph
     *
     * @private
     */
    updatePhysicalPosition(moveNextLine: boolean): void;
    /**
     * Return true if text position are in same paragraph and offset
     *
     * @private
     */
    isAtSamePosition(textPosition: TextPosition): boolean;
    /**
     * Return true if text position is in same paragraph index
     * @private
     */
    isInSameParagraphIndex(textPosition: TextPosition): boolean;
    /**
     * Return true if text position is in same paragraph
     *
     * @private
     */
    isInSameParagraph(textPosition: TextPosition): boolean;
    /**
     * Return true is current text position exist before given text position
     *
     * @private
     */
    isExistBefore(textPosition: TextPosition): boolean;
    /**
     * Return true is current text position exist after given text position
     *
     * @private
     */
    isExistAfter(textPosition: TextPosition): boolean;
    /**
     * Return hierarchical index of current text position
     *
     * @private
     */
    getHierarchicalIndexInternal(): string;
    /**
     * @private
     */
    getHierarchicalIndex(line: LineWidget, hierarchicalIndex: string): string;
    /**
     * @private
     */
    setPositionParagraph(line: LineWidget, offsetInLine: number): void;
    /**
     * @private
     */
    setPositionForLineWidget(lineWidget: LineWidget, offset: number): void;
    /**
     * move to next text position
     *
     * @private
     */
    moveNextPosition(isNavigate?: boolean): void;
    /**
     * Move text position to previous paragraph inside table
     *
     * @private
     */
    moveToPreviousParagraphInTable(selection: Selection): void;
    private updateOffsetToNextParagraph;
    private updateOffsetToPrevPosition;
    /**
     * Moves the text position to start of the next paragraph.
     */
    moveToNextParagraphStartInternal(): void;
    /**
     * Move to previous position
     *
     * @private
     */
    movePreviousPosition(): void;
    /**
     * Move to next position
     *
     * @private
     */
    moveNextPositionInternal(fieldBegin: FieldElementBox): void;
    /**
     * Move text position backward
     *
     * @private
     */
    moveBackward(): void;
    /**
     * Move text position forward
     *
     * @private
     */
    moveForward(): void;
    /**
     * Move to given inline
     *
     * @private
     */
    moveToInline(inline: ElementBox, index: number): void;
    /**
     * Return true is start element exist before end element
     *
     * @private
     */
    static isForwardSelection(start: string, end: string): boolean;
    /**
     * Move to previous position offset
     *
     * @param fieldEnd
     * @private
     */
    movePreviousPositionInternal(fieldEnd: FieldElementBox): void;
    /**
     * Moves the text position to start of the word.
     *
     * @param type
     * @private
     */
    moveToWordStartInternal(type: number): void;
    getNextWordOffset(inline: ElementBox, indexInInline: number, type: number, isInField: boolean, endSelection: boolean, endPosition: TextPosition, excludeSpace: boolean): void;
    getNextWordOffsetFieldBegin(fieldBegin: FieldElementBox, indexInInline: number, type: number, isInField: boolean, endSelection: boolean, endPosition: TextPosition, excludeSpace: boolean): void;
    getNextWordOffsetImage(image: ImageElementBox, indexInInline: number, type: number, isInField: boolean, endSelection: boolean, endPosition: TextPosition, excludeSpace: boolean): void;
    private getNextWordOffsetSpan;
    private getNextWordOffsetFieldSeparator;
    private getNextWordOffsetComment;
    private getNextWordOffsetFieldEnd;
    private getPreviousWordOffset;
    private getPreviousWordOffsetBookMark;
    private getPreviousWordOffsetFieldEnd;
    private getPreviousWordOffsetFieldSeparator;
    private getPreviousWordOffsetComment;
    private getPreviousWordOffsetFieldBegin;
    private getPreviousWordOffsetImage;
    private getPreviousWordOffsetSpan;
    private setPreviousWordOffset;
    /**
     * Validate if text position is in field forward
     *
     * @private
     */
    validateForwardFieldSelection(currentIndex: string, selectionEndIndex: string): void;
    /**
     * Validate if text position is in field backward
     *
     * @private
     */
    validateBackwardFieldSelection(currentIndex: string, selectionEndIndex: string): void;
    /**
     * @private
     */
    paragraphStartInternal(selection: Selection, moveToPreviousParagraph: boolean): void;
    /**
     * @private
     */
    calculateOffset(): void;
    /**
     * Moves the text position to start of the paragraph.
     *
     * @private
     */
    moveToParagraphStartInternal(selection: Selection, moveToPreviousParagraph: boolean): void;
    /**
     * Moves the text position to end of the paragraph.
     *
     * @private
     */
    moveToParagraphEndInternal(selection: Selection, moveToNextParagraph: boolean): void;
    /**
     * @private
     */
    moveUp(selection: Selection, left: number): void;
    /**
     * @private
     */
    moveDown(selection: Selection, left: number): void;
    /**
     * Moves the text position to start of the line.
     *
     * @private
     */
    moveToLineStartInternal(selection: Selection, moveToPreviousLine: boolean): void;
    /**
     * Check paragraph is inside table
     *
     * @private
     */
    moveToNextParagraphInTableCheck(): boolean;
    /**
     * Moves the text position to end of the word.
     *
     * @private
     */
    moveToWordEndInternal(type: number, excludeSpace: boolean): void;
    /**
     * move text position to next paragraph inside table
     *
     * @private
     */
    moveToNextParagraphInTable(): void;
    /**
     * Moves the text position to start of the previous paragraph.
     *
     */
    moveToPreviousParagraph(selection: Selection): void;
    /**
     * Move to previous line from current position
     *
     * @private
     */
    moveToPreviousLine(selection: Selection, left: number): void;
    /**
     * @param {Selection} selection Specifies the selection
     * @param {boolean} moveToNextLine Specifies the move to next line
     * @private
     */
    moveToLineEndInternal(selection: Selection, moveToNextLine: boolean): void;
    /**
     * Move to next line
     *
     * @param {number} left Specified the left
     * @private
     * @returns {void}
     */
    moveToNextLine(left: number): void;
    private moveUpInTable;
    private moveDownInTable;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class SelectionWidgetInfo {
    private leftIn;
    private widthIn;
    color: string;
    floatingItems: ShapeBase[];
    /**
     * @private
     */
    /**
    * @private
    */
    left: number;
    /**
     * @private
     */
    /**
    * @private
    */
    width: number;
    constructor(left: number, width: number);
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class Hyperlink {
    private linkInternal;
    private localRef;
    private typeInternal;
    private opensNewWindow;
    private isCrossRefField;
    /**
     * Gets navigation link.
     *
     * @returns string
     * @private
     */
    readonly navigationLink: string;
    /**
     * Gets the local reference if any.
     *
     * @returns string
     * @private
     */
    readonly localReference: string;
    /**
     * Gets hyper link type.
     *
     * @returns HyperLinkType
     * @private
     */
    readonly linkType: HyperlinkType;
    /**
     * @private
     */
    readonly isCrossRef: boolean;
    constructor(fieldBeginAdv: FieldElementBox, selection: Selection);
    private parseFieldValues;
    private parseFieldValue;
    private setLinkType;
    /**
     * @private
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class ImageInfo {
    /**
     * @private
     */
    width: number;
    /**
     * @private
     */
    height: number;
    /**
     * Constructor for image format class
     *
     * @param imageContainer - Specifies for image width and height values.
     */
    constructor(imageContainer: ImageElementBox);
    /**
     * Dispose the internal objects which are maintained.
     *
     * @private
     */
    destroy(): void;
}
