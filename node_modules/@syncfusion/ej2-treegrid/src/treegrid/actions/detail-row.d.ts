import { TreeGrid } from '../base';
/**
 * TreeGrid Detail Row module
 *
 * @hidden
 */
export declare class DetailRow {
    private parent;
    constructor(parent: TreeGrid);
    /**
     * @hidden
     */
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns DetailRow module name
     */
    protected getModuleName(): string;
    addEventListener(): void;
    /**
     * @hidden
     * @returns {void}
     */
    removeEventListener(): void;
    private setIndentVisibility;
    private dataBoundArg;
    private childRowExpand;
    private rowExpandCollapse;
    private detaildataBound;
    private actioncomplete;
    /**
     * Destroys the DetailModule.
     *
     * @function destroy
     * @returns {void}
     */
    destroy(): void;
}
