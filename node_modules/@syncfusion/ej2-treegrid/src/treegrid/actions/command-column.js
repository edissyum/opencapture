import { Grid, CommandColumn as Command } from '@syncfusion/ej2-grids';
/**
 * Command Column Module for TreeGrid
 *
 * @hidden
 */
var CommandColumn = /** @class */ (function () {
    function CommandColumn(parent) {
        Grid.Inject(Command);
        this.parent = parent;
    }
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns CommandColumn module name
     */
    CommandColumn.prototype.getModuleName = function () {
        return 'commandColumn';
    };
    /**
     * Destroys the ContextMenu.
     *
     * @function destroy
     * @returns {void}
     */
    CommandColumn.prototype.destroy = function () {
        //this.removeEventListener();
    };
    return CommandColumn;
}());
export { CommandColumn };
