import { MarkdownParser } from './../base/markdown-parser';
import { IMarkdownSubCommands, IMDKeyboardEvent, MarkdownUndoRedoData } from './../base/interface';
import { IUndoCallBack } from '../../common/interface';
/**
 * `Undo` module is used to handle undo actions.
 */
export declare class UndoRedoCommands {
    steps: number;
    undoRedoStack: MarkdownUndoRedoData[];
    private parent;
    private selection;
    private currentAction;
    undoRedoSteps: number;
    undoRedoTimer: number;
    constructor(parent?: MarkdownParser, options?: {
        [key: string]: number;
    });
    protected addEventListener(): void;
    private onPropertyChanged;
    protected removeEventListener(): void;
    /**
     * Destroys the ToolBar.
     *
     * @function destroy
     * @returns {void}
     * @hidden

     */
    destroy(): void;
    /**
     * onAction method
     *
     * @param {IMarkdownSubCommands} e - specifies the sub commands
     * @returns {void}
     * @hidden

     */
    onAction(e: IMarkdownSubCommands): void;
    private keyDown;
    private keyUp;
    /**
     * MD collection stored string format.
     *
     * @param {KeyboardEvent} e - specifies the key board event
     * @function saveData
     * @returns {void}
     * @hidden

     */
    saveData(e?: KeyboardEvent | MouseEvent | IUndoCallBack): void;
    /**
     * Undo the editable text.
     *
     * @param {IMarkdownSubCommands} e - specifies the sub commands
     * @function undo
     * @returns {void}
     * @hidden

     */
    undo(e?: IMarkdownSubCommands | IMDKeyboardEvent): void;
    /**
     * Redo the editable text.
     *
     * @param {IMarkdownSubCommands} e - specifies the sub commands
     * @function redo
     * @returns {void}
     * @hidden

     */
    redo(e?: IMarkdownSubCommands | IMDKeyboardEvent): void;
    private restore;
    /**
     * getUndoStatus method
     *
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    getUndoStatus(): {
        [key: string]: boolean;
    };
}
