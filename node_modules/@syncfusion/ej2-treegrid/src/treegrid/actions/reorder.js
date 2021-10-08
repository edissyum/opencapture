import { getObject, Grid, Reorder as GridReorder } from '@syncfusion/ej2-grids';
/**
 * TreeGrid Reorder module
 *
 * @hidden
 */
var Reorder = /** @class */ (function () {
    /**
     * Constructor for Reorder module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    function Reorder(parent) {
        Grid.Inject(GridReorder);
        this.parent = parent;
        this.addEventListener();
    }
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns Reorder module name
     */
    Reorder.prototype.getModuleName = function () {
        return 'reorder';
    };
    /**
     * @hidden
     * @returns {void}
     */
    Reorder.prototype.addEventListener = function () {
        this.parent.on('getColumnIndex', this.getTreeColumn, this);
    };
    Reorder.prototype.removeEventListener = function () {
        if (this.parent.isDestroyed) {
            return;
        }
        this.parent.off('getColumnIndex', this.getTreeColumn);
    };
    /**
     * To destroy the Reorder
     *
     * @returns {void}
     * @hidden
     */
    Reorder.prototype.destroy = function () {
        this.removeEventListener();
    };
    Reorder.prototype.getTreeColumn = function () {
        var columnModel = 'columnModel';
        var treeColumn = this.parent[columnModel][this.parent.treeColumnIndex];
        var treeIndex;
        var updatedCols = this.parent.getColumns();
        for (var f = 0; f < updatedCols.length; f++) {
            var treeColumnfield = getObject('field', treeColumn);
            var parentColumnfield = getObject('field', updatedCols[f]);
            if (treeColumnfield === parentColumnfield) {
                treeIndex = f;
                break;
            }
        }
        this.parent.setProperties({ treeColumnIndex: treeIndex }, true);
    };
    return Reorder;
}());
export { Reorder };
