import { TreeGrid } from '../base/treegrid';
/**
 * TreeGrid ColumnChooser module
 *
 * @hidden
 */
export declare class ColumnChooser {
    private parent;
    /**
     * Constructor for render module
     *
     * @param {TreeGrid} parent - Tree Grid instance.
     */
    constructor(parent?: TreeGrid);
    /**
     * Column chooser can be displayed on screen by given position(X and Y axis).
     *
     * @param  {number} X - Defines the X axis.
     * @param  {number} Y - Defines the Y axis.
     * @returns {void}
     */
    openColumnChooser(X?: number, Y?: number): void;
    /**
     * Destroys the openColumnChooser.
     *
     * @function destroy
     * @returns {void}
     */
    destroy(): void;
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns ColumnChooser module name
     */
    private getModuleName;
}
