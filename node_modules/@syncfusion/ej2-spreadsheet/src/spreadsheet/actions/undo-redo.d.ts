import { Spreadsheet } from '../../spreadsheet/index';
/**
 * UndoRedo module allows to perform undo redo functionalities.
 */
export declare class UndoRedo {
    private parent;
    private undoCollection;
    private redoCollection;
    private isUndo;
    private beforeActionData;
    private undoRedoStep;
    constructor(parent: Spreadsheet);
    private setActionData;
    private getBeforeActionData;
    private performUndoRedo;
    private updateUndoRedoCollection;
    private clearUndoRedoCollection;
    private updateUndoRedoIcons;
    private undoForClipboard;
    private undoForResize;
    private performOperation;
    private getCellDetails;
    private updateCellDetails;
    private checkRefreshNeeded;
    private addEventListener;
    private removeEventListener;
    /**
     * Destroy undo redo module.
     *
     * @returns {void} - Destroy undo redo module.
     */
    destroy(): void;
    /**
     * Get the undo redo module name.
     *
     * @returns {string} - Get the undo redo module name.
     */
    getModuleName(): string;
}
