import { TreeGrid, ColumnMenu as TreeGridColumnMenu } from '@syncfusion/ej2-treegrid';
/**
 * Configures columnMenu collection in Gantt.
 */
var ColumnMenu = /** @class */ (function () {
    function ColumnMenu(parent) {
        TreeGrid.Inject(TreeGridColumnMenu);
        this.parent = parent;
    }
    /**
     * @returns {HTMLAllCollection} .
     * To get column menu collection.
     */
    ColumnMenu.prototype.getColumnMenu = function () {
        return this.parent.treeGrid.columnMenuModule.getColumnMenu();
    };
    ColumnMenu.prototype.destroy = function () {
        // column menu destroy module
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} .
     * @private
     */
    ColumnMenu.prototype.getModuleName = function () {
        return 'columnMenu';
    };
    return ColumnMenu;
}());
export { ColumnMenu };
