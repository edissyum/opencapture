import { Grid, ColumnChooser as GridColumnChooser } from '@syncfusion/ej2-grids';
/**
 * TreeGrid ColumnChooser module
 *
 * @hidden
 */
var ColumnChooser = /** @class */ (function () {
    /**
     * Constructor for render module
     *
     * @param {TreeGrid} parent - Tree Grid instance.
     */
    function ColumnChooser(parent) {
        Grid.Inject(GridColumnChooser);
        this.parent = parent;
    }
    /**
     * Column chooser can be displayed on screen by given position(X and Y axis).
     *
     * @param  {number} X - Defines the X axis.
     * @param  {number} Y - Defines the Y axis.
     * @returns {void}
     */
    ColumnChooser.prototype.openColumnChooser = function (X, Y) {
        return this.parent.grid.columnChooserModule.openColumnChooser(X, Y);
    };
    /**
     * Destroys the openColumnChooser.
     *
     * @function destroy
     * @returns {void}
     */
    ColumnChooser.prototype.destroy = function () {
        //this.parent.grid.ColumnChooserModule.destroy();
    };
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns ColumnChooser module name
     */
    ColumnChooser.prototype.getModuleName = function () {
        return 'ColumnChooser';
    };
    return ColumnChooser;
}());
export { ColumnChooser };
