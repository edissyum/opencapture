import { IGrid, IAction, NotifyArgs } from '../base/interface';
/**
 *
 * The `Reorder` module is used for reordering columns.
 */
export declare class Reorder implements IAction {
    private element;
    private upArrow;
    private downArrow;
    private x;
    private timer;
    private destElement;
    private fromCol;
    private parent;
    /**
     * Constructor for the Grid reorder module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @hidden
     */
    constructor(parent?: IGrid);
    private chkDropPosition;
    private chkDropAllCols;
    private findColParent;
    private getColumnsModel;
    private headerDrop;
    private isActionPrevent;
    private moveColumns;
    private targetParentContainerIndex;
    private getHeaderCells;
    private getColParent;
    private reorderSingleColumn;
    private reorderMultipleColumns;
    private moveTargetColumn;
    private reorderSingleColumnByTarget;
    private reorderMultipleColumnByTarget;
    /**
     * Changes the position of the Grid columns by field names.
     *
     * @param  {string | string[]} fromFName - Defines the origin field names.
     * @param  {string} toFName - Defines the destination field name.
     * @returns {void}
     */
    reorderColumns(fromFName: string | string[], toFName: string): void;
    /**
     * Changes the position of the Grid columns by field index.
     *
     * @param  {number} fromIndex - Defines the origin field index.
     * @param  {number} toIndex - Defines the destination field index.
     * @returns {void}
     */
    reorderColumnByIndex(fromIndex: number, toIndex: number): void;
    /**
     * Changes the position of the Grid columns by field index.
     *
     * @param  {string | string[]} fieldName - Defines the field name.
     * @param  {number} toIndex - Defines the destination field index.
     * @returns {void}
     */
    reorderColumnByTargetIndex(fieldName: string | string[], toIndex: number): void;
    private enableAfterRender;
    private createReorderElement;
    /**
     * The function used to trigger onActionComplete
     *
     * @param {NotifyArgs} e - specified the NotifyArgs
     * @returns {void}
     * @hidden
     */
    onActionComplete(e: NotifyArgs): void;
    /**
     * To destroy the reorder
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    private keyPressHandler;
    private drag;
    private updateScrollPostion;
    private updateFrozenScrollPosition;
    private setScrollLeft;
    private stopTimer;
    private updateArrowPosition;
    private dragStart;
    private dragStop;
    private setDisplay;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} return the module name
     * @private
     */
    protected getModuleName(): string;
}
