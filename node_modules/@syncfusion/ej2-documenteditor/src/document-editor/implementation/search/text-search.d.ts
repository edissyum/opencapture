import { Dictionary } from '../../base/dictionary';
import { FindOption } from '../../base/types';
import { TextPosition } from '../selection/selection-helper';
import { LineWidget, ElementBox, TextElementBox } from '../viewer/page';
import { TextInLineInfo } from '../editor/editor-helper';
import { TextSearchResult } from './text-search-result';
import { TextSearchResults } from './text-search-results';
import { DocumentEditor } from '../../document-editor';
/**
 * @private
 */
export declare class TextSearch {
    private wordBefore;
    private wordAfter;
    private owner;
    private isHeader;
    private isFooter;
    private documentHelper;
    constructor(owner: DocumentEditor);
    find(pattern: string | RegExp, findOption?: FindOption): TextSearchResult;
    findNext(pattern: string | RegExp, findOption?: FindOption, hierarchicalPosition?: string): TextSearchResult;
    stringToRegex(textToFind: string, option: FindOption): RegExp;
    isPatternEmpty(pattern: RegExp): boolean;
    findAll(pattern: string | RegExp, findOption?: FindOption, hierarchicalPosition?: string): TextSearchResults;
    getElementInfo(inlineElement: ElementBox, indexInInline: number, includeNextLine?: boolean): TextInLineInfo;
    updateMatchedTextLocation(matches: RegExpExecArray[], results: TextSearchResults, textInfo: Dictionary<TextElementBox, number>, indexInInline: number, inlines: ElementBox, isFirstMatch: boolean, selectionEnd: TextPosition, startPosition?: number): void;
    private findDocument;
    private findInlineText;
    private findInline;
    getTextPosition(lineWidget: LineWidget, hierarchicalIndex: string): TextPosition;
}
/**
 * @private
 */
export declare class SearchWidgetInfo {
    private leftInternal;
    private widthInternal;
    left: number;
    width: number;
    constructor(left: number, width: number);
}
