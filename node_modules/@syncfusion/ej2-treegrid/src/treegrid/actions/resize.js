import { Grid, Resize as GridResize } from '@syncfusion/ej2-grids';
/**
 * TreeGrid Resize module
 *
 * @hidden
 */
var Resize = /** @class */ (function () {
    /**
     * Constructor for Resize module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    function Resize(parent) {
        Grid.Inject(GridResize);
        this.parent = parent;
    }
    /**
     * Resize by field names.
     *
     * @param  {string|string[]} fName - Defines the field name.
     * @returns {void}
     */
    Resize.prototype.autoFitColumns = function (fName) {
        this.parent.grid.autoFitColumns(fName);
    };
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns Resize module name
     */
    Resize.prototype.getModuleName = function () {
        return 'resize';
    };
    /**
     * Destroys the Resize.
     *
     * @function destroy
     * @returns {void}
     */
    Resize.prototype.destroy = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.grid.resizeModule.destroy();
    };
    return Resize;
}());
export { Resize };
