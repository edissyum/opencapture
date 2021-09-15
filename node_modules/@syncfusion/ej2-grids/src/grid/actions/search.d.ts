import { IGrid, IAction, NotifyArgs } from '../base/interface';
/**
 * The `Search` module is used to handle search action.
 */
export declare class Search implements IAction {
    private parent;
    private refreshSearch;
    private actionCompleteFunc;
    /**
     * Constructor for Grid search module.
     *
     * @param {IGrid} parent - specifies the IGrid
     * @hidden
     */
    constructor(parent?: IGrid);
    /**
     * Searches Grid records by given key.
     *
     * > You can customize the default search action by using [`searchSettings`](grid/#searchsettings/).
     *
     * @param  {string} searchString - Defines the key.
     * @returns {void}
     */
    search(searchString: string): void;
    /**
     * @returns {void}
     * @hidden
     */
    addEventListener(): void;
    /**
     * @returns {void}
     * @hidden
     */
    removeEventListener(): void;
    /**
     * To destroy the print
     *
     * @returns {void}
     * @hidden
     */
    destroy(): void;
    /**
     * @param {NotifyArgs} e - specfies the NotifyArgs
     * @returns {void}
     * @hidden
     */
    onPropertyChanged(e: NotifyArgs): void;
    /**
     * The function used to trigger onActionComplete
     *
     * @param {NotifyArgs} e - specifies the NotifyArgs
     * @returns {void}
     * @hidden
     */
    onSearchComplete(e: NotifyArgs): void;
    /**
     * The function used to store the requestType
     *
     * @param {NotifyArgs} e - specifies the NotifyArgs
     * @returns {void}
     * @hidden
     */
    onActionComplete(e: NotifyArgs): void;
    private cancelBeginEvent;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} returns the module name
     * @private
     */
    protected getModuleName(): string;
}
