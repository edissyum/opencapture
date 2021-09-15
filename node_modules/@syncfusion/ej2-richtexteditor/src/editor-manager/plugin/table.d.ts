import { EditorManager } from './../base/editor-manager';
/**
 * Link internal component
 *
 * @hidden

 */
export declare class TableCommand {
    private parent;
    private activeCell;
    private curTable;
    /**
     * Constructor for creating the Formats plugin
     *
     * @param {EditorManager} parent - specifies the parent element
     * @hidden

     */
    constructor(parent: EditorManager);
    private addEventListener;
    private createTable;
    private calculateStyleValue;
    private removeEmptyNode;
    private insertAfter;
    private getSelectedCellMinMaxIndex;
    private insertRow;
    private insertColumn;
    private deleteColumn;
    private deleteRow;
    private removeTable;
    private tableHeader;
    private tableVerticalAlign;
    private cellMerge;
    private updateColSpanStyle;
    private updateRowSpanStyle;
    private updateCellAttribute;
    private mergeCellContent;
    private getSelectedMinMaxIndexes;
    private HorizontalSplit;
    private VerticalSplit;
    private getCorrespondingColumns;
    private FindIndex;
    private getCorrespondingIndex;
    private highlightCells;
    private tableMove;
}
