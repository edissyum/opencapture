import { WParagraphFormat } from '../format/paragraph-format';
import { WSectionFormat } from '../format/section-format';
import { WCharacterFormat } from '../format/character-format';
import { WListFormat } from '../format/list-format';
import { WListLevel } from '../list/list-level';
import { EditorHistory } from '../index';
import { IWidget, FieldElementBox, TableWidget, BookmarkElementBox, EditRangeStartElementBox } from '../viewer/page';
import { DocumentEditor } from '../../document-editor';
import { Action } from '../../index';
import { TextPosition } from '../index';
import { ElementBox } from '../viewer/page';
import { WTableFormat, WRowFormat, WCellFormat } from '../format/index';
import { DocumentHelper } from '../viewer';
/**
 * @private
 */
export declare class BaseHistoryInfo {
    private ownerIn;
    documentHelper: DocumentHelper;
    private actionIn;
    private removedNodesIn;
    private modifiedPropertiesIn;
    private modifiedNodeLength;
    private selectionStartIn;
    private selectionEndIn;
    private insertPositionIn;
    private endPositionIn;
    private currentPropertyIndex;
    private ignoredWord;
    /**
     * @private
     */
    lastElementRevision: ElementBox;
    /**
     * @private
     */
    endRevisionLogicalIndex: string;
    readonly owner: DocumentEditor;
    readonly editorHistory: EditorHistory;
    action: Action;
    readonly modifiedProperties: Object[];
    readonly removedNodes: IWidget[];
    selectionStart: string;
    selectionEnd: string;
    insertPosition: string;
    endPosition: string;
    constructor(node: DocumentEditor);
    private readonly viewer;
    updateSelection(): void;
    setBookmarkInfo(bookmark: BookmarkElementBox): void;
    setFormFieldInfo(field: FieldElementBox, value: string | number | boolean): void;
    setEditRangeInfo(editStart: EditRangeStartElementBox): void;
    private revertFormTextFormat;
    private revertFormField;
    private revertBookmark;
    private revertComment;
    private revertEditRangeRegion;
    revert(): void;
    private highlightListText;
    private removeContent;
    updateEndRevisionInfo(): void;
    private retrieveEndPosition;
    /**
     * Method to retrieve exact spitted node which is marked as last available element.
     *
     * @param {ElementBox} elementBox - Specifies the element box
     * @returns {ElementBox} - Returns element box
     */
    private checkAdjacentNodeForMarkedRevision;
    private revertModifiedProperties;
    private redoAction;
    private revertModifiedNodes;
    private insertRemovedNodes;
    undoRevisionForElements(start: TextPosition, end: TextPosition, id: string): void;
    private revertResizing;
    private revertTableDialogProperties;
    addModifiedPropertiesForSection(format: WSectionFormat, property: string, value: Object): Object;
    addModifiedProperties(format: WCharacterFormat, property: string, value: Object): Object;
    addModifiedPropertiesForParagraphFormat(format: WParagraphFormat, property: string, value: Object): Object;
    addModifiedPropertiesForContinueNumbering(paragraphFormat: WParagraphFormat, value: Object): Object;
    addModifiedPropertiesForRestartNumbering(listFormat: WListFormat, value: Object): Object;
    addModifiedPropertiesForList(listLevel: WListLevel): Object;
    private revertProperties;
    addModifiedCellOptions(applyFormat: WCellFormat, format: WCellFormat, table: TableWidget): WCellFormat;
    private copyCellOptions;
    addModifiedTableOptions(format: WTableFormat): void;
    private copyTableOptions;
    private getProperty;
    private getCharacterPropertyValue;
    addModifiedTableProperties(format: WTableFormat, property: string, value: Object): Object;
    addModifiedRowProperties(rowFormat: WRowFormat, property: string, value: Object): Object;
    addModifiedCellProperties(cellFormat: WCellFormat, property: string, value: Object): Object;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
