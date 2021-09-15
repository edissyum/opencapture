import { LineWidget, ElementBox, BodyWidget, ParagraphWidget, TextElementBox, BlockWidget } from '../viewer/page';
import { WCharacterFormat, WCellFormat, TextPosition, TextSearchResults } from '../index';
import { HighlightColor, TextFormFieldType, CheckBoxSizeType, RevisionType, CollaborativeEditingAction, CompatibilityMode } from '../../base/types';
import { Widget } from '../viewer/page';
import { Dictionary } from '../..';
import { WBorder } from '../format';
/**
 * @private
 */
export declare class HelperMethods {
    /**
     * @private
     */
    static wordBefore: string;
    /**
     * @private
     */
    static wordAfter: string;
    /**
     * @private
     */
    static wordSplitCharacters: string[];
    /**
     * Inserts text at specified index in string.
     *
     * @private
     * @param {string} spanText - Specifies the span text.
     * @param {number} index - Specifies the index
     * @param {string} text - Specifies the text
     * @returns {string} - Returns modified string
     */
    static insert(spanText: string, index: number, text: string): string;
    /**
     * Removes text from specified index in string.
     *
     * @private
     * @param {string} text - Specifies the text
     * @param {number} index - Specifies the index
     * @returns {string} - Returns modified string
     */
    static remove(text: string, index: number): string;
    static indexOfAny(text: string, wordSplitCharacter: string[]): any;
    static lastIndexOfAny(text: string, wordSplitCharacter: string[]): number;
    static addCssStyle(css: string): void;
    static getHighlightColorCode(highlightColor: HighlightColor): string;
    static isVeryDark(backColor: string): boolean;
    static getColor(color: string): string;
    static convertPointToPixel(point: number): number;
    static convertPixelToPoint(pixel: number): number;
    static isLinkedFieldCharacter(inline: ElementBox): boolean;
    /**
     * Removes white space in a string.
     *
     * @private
     * @param {string} text - Specifies text to trim.
     * @returns {string} - Returns modified text.
     */
    static removeSpace(text: string): string;
    /**
     * Trims white space at start of the string.
     *
     * @private
     * @param {string} text - Specifies text to trim.
     * @returns {string} - Returns modified text.
     */
    static trimStart(text: string): string;
    /**
     * Trims white space at end of the string.
     *
     * @private
     * @param {string} text - Specifies text to trim.
     * @returns {string} - Returns modified text.
     */
    static trimEnd(text: string): string;
    /**
     * Checks whether string ends with whitespace.
     *
     * @private
     * @param {string} text - Specifies the text.
     * @returns {boolean} - Returns true if text ends with specified text.
     */
    static endsWith(text: string): boolean;
    static addSpace(length: number): string;
    static writeCharacterFormat(characterFormat: any, isInline: boolean, format: WCharacterFormat): void;
    static toWriteInline(format: WCharacterFormat, propertyName: string): any;
    static round(value: number, decimalDigits: number): number;
    static reverseString(text: string): string;
    static formatClippedString(base64ImageString: string): ImageFormatInfo;
    private static startsWith;
    static formatText(format: string, value: string): string;
    static formatNumber(format: string, value: string): string;
    static formatDate(format: string, value: string): string;
    private static capitaliseFirst;
    private static lowerFirstChar;
    private static capitaliseFirstInternal;
    static getModifiedDate(date: string): string;
    static getCompatibilityModeValue(compatibilityMode: CompatibilityMode): string;
}
/**
 * @private
 */
export declare class Point {
    private xIn;
    private yIn;
    x: number;
    y: number;
    constructor(xPosition: number, yPosition: number);
    copy(point: Point): void;
    /**
     * Destroys the internal objects maintained.
     *
     * @returns {void}
     */
    destroy(): void;
}
/**
 * @private
 */
export declare class Base64 {
    private keyStr;
    encodeString(input: string): string;
    private unicodeEncode;
    decodeString(input: string): Uint8Array;
}
/**
 * TextSearchResultInfo
 */
export interface TextSearchResultInfo {
    startOffset: string;
    endOffset: string;
}
/**
 * Locked region selection info.
 */
export interface LockSelectionInfo {
    /**
     * Selection start of the locked region.
     */
    start: string;
    /**
     * Selection end of the locked region.
     */
    end: string;
    /**
     * Specifies collaborative editing room name.
     */
    roomName: string;
    /**
     * Specifies author of the locked region.
     */
    author: string;
    /**
     * Version of the collaborative editing session.
     */
    version: number;
    /**
     * @private
     */
    previousLockInfo?: LockSelectionInfo;
}
/**
 * Document Editor data
 */
export interface CollaborativeEditingEventArgs {
    /**
     * Specifies current action in collaborative session.
     */
    action: CollaborativeEditingAction;
    /**
     * Specifies selection info.
     */
    selectionInfo?: LockSelectionInfo;
    /**
     * Collaborative session version.
     */
    version?: number;
    /**
     * Specifies modified data in SFDT format.
     */
    data?: string;
    /**
     * Specifies author of the edit action.
     */
    author?: string;
    /**
     * Specifies collaborative editing room name.
     */
    roomName?: string;
}
/**
 * @private
 */
export interface SubWidthInfo {
    subWidth: number;
    spaceCount: number;
}
/**
 * @private
 */
export interface LineElementInfo {
    topMargin: number;
    bottomMargin: number;
    addSubWidth: boolean;
    whiteSpaceCount: number;
}
/**
 * @private
 */
export interface Color {
    r: number;
    g: number;
    b: number;
}
/**
 * @private
 */
export interface CaretHeightInfo {
    height: number;
    topMargin: number;
    isItalic?: boolean;
}
/**
 * @private
 */
export interface SizeInfo {
    width: number;
    height: number;
    topMargin: number;
    bottomMargin: number;
}
/**
 * @private
 */
export interface FirstElementInfo {
    element: ElementBox;
    left: number;
}
/**
 * @private
 */
export interface IndexInfo {
    index: string;
}
/**
 * @private
 */
export interface ImagePointInfo {
    selectedElement: HTMLElement;
    resizePosition: string;
}
/**
 * @private
 */
export interface HyperlinkTextInfo {
    displayText: string;
    isNestedField: boolean;
    format: WCharacterFormat;
}
/**
 * @private
 */
export interface BodyWidgetInfo {
    bodyWidget: BodyWidget;
    index: number;
}
/**
 * @private
 */
export interface ParagraphInfo {
    paragraph: ParagraphWidget;
    offset: number;
}
/**
 * @private
 */
export interface ErrorInfo {
    errorFound: boolean;
    elements: any[];
}
/**
 * @private
 */
export interface SpaceCharacterInfo {
    width: number;
    wordLength: number;
    isBeginning: boolean;
}
/**
 * @private
 */
export interface SpecialCharacterInfo {
    beginningWidth: number;
    endWidth: number;
    wordLength: number;
}
/**
 * @private
 */
export interface ContextElementInfo {
    element: ElementBox;
    text: string;
}
/**
 * @private
 */
export interface WordSpellInfo {
    hasSpellError: boolean;
    isElementPresent: boolean;
}
/**
 * @private
 */
export interface TextInLineInfo {
    elementsWithOffset: Dictionary<TextElementBox, number>;
    fullText: string;
}
/**
 * @private
 */
export interface CellInfo {
    start: number;
    end: number;
}
/**
 * @private
 */
export interface FieldCodeInfo {
    isNested: boolean;
    isParsed: boolean;
}
/**
 * @private
 */
export interface LineInfo {
    line: LineWidget;
    offset: number;
}
/**
 * @private
 */
export interface ElementInfo {
    element: ElementBox;
    index: number;
}
/**
 * @private
 */
export interface RevisionMatchedInfo {
    element: ElementBox;
    isMatched: boolean;
}
/**
 * @private
 */
export interface RevisionInfo {
    type: RevisionType;
    color: string;
}
/**
 * @private
 */
export interface MatchResults {
    matches: RegExpExecArray[];
    elementInfo: Dictionary<TextElementBox, number>;
    textResults: TextSearchResults;
}
/**
 * @private
 */
export interface TextPositionInfo {
    element: ElementBox;
    index: number;
    caretPosition: Point;
    isImageSelected: boolean;
}
/**
 * @private
 */
export interface ShapeInfo {
    element: ElementBox;
    caretPosition: Point;
    isShapeSelected: boolean;
    isInShapeBorder: boolean;
}
/**
 * @private
 */
export interface PageInfo {
    height: number;
    width: number;
    viewerWidth: number;
    viewerHeight: number;
}
/**
 * @private
 */
export interface CanvasInfo {
    height: number;
    width: number;
    viewerWidth: number;
    viewerHeight: number;
    containerHeight: number;
    containerWidth: number;
}
/**
 * @private
 */
export interface CellCountInfo {
    count: number;
    cellFormats: WCellFormat[];
}
/**
 * @private
 */
export interface BlockInfo {
    node: Widget;
    position: IndexInfo;
}
/**
 * @private
 */
export interface WidthInfo {
    minimumWordWidth: number;
    maximumWordWidth: number;
}
/**
 * @private
 */
export interface RtlInfo {
    isRtl: boolean;
    id: number;
}
/**
 * @private
 */
export interface ImageFormatInfo {
    extension: string;
    formatClippedString: string;
}
/**
 * @private
 */
export interface PositionInfo {
    startPosition: TextPosition;
    endPosition: TextPosition;
}
/**
 * Text form field info
 */
export interface TextFormFieldInfo {
    /**
     * Specifies text form field type.
     */
    type: TextFormFieldType;
    /**
     * Text form field default value.
     */
    defaultValue: string;
    /**
     * Text form field format
     */
    format: string;
    /**
     * Maximum text length.
     */
    maxLength: number;
    /**
     * Enable or disable form field.
     */
    enabled: boolean;
    /**
     * Tooltip text.
     */
    helpText: string;
}
/**
 * CheckBox form field info
 */
export interface CheckBoxFormFieldInfo {
    /**
     * CheckBox form field size type.
     */
    sizeType: CheckBoxSizeType;
    /**
     * CheckBox form field size.
     */
    size: number;
    /**
     * CheckBox form field default value.
     */
    defaultValue: boolean;
    /**
     * Enable or disable form field.
     */
    enabled: boolean;
    /**
     * Tooltip text.
     */
    helpText: string;
}
/**
 * DropDown form field info
 */
export interface DropDownFormFieldInfo {
    /**
     * DropDown items
     */
    dropdownItems: string[];
    /**
     * Enable or disable form field.
     */
    enabled: boolean;
    /**
     * Tooltip text.
     */
    helpText: string;
}
/**
 * @private
 */
export interface BorderInfo {
    border: WBorder;
    width: number;
}
/**
 * @private
 */
export interface FootNoteWidgetsInfo {
    footNoteWidgets: BlockWidget[];
    toBodyWidget: BodyWidget;
    fromBodyWidget: BodyWidget;
}
/**
 * @private
 */
export declare class WrapPosition {
    x: number;
    width: number;
    readonly right: number;
    constructor(x: number, width: number);
}
