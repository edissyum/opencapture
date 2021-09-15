import { TreeGrid, Reorder as TreeGridReorder } from '@syncfusion/ej2-treegrid';
/**
 * To handle column reorder action from TreeGrid
 */
var Reorder = /** @class */ (function () {
    function Reorder(gantt) {
        this.parent = gantt;
        TreeGrid.Inject(TreeGridReorder);
        this.parent.treeGrid.allowReordering = this.parent.allowReordering;
        this.bindEvents();
    }
    /**
     * Get module name
     *
     * @returns {string} .
     */
    Reorder.prototype.getModuleName = function () {
        return 'reorder';
    };
    /**
     * To bind reorder events.
     *
     * @returns {void} .
     * @private
     */
    Reorder.prototype.bindEvents = function () {
        var _this = this;
        this.parent.treeGrid.columnDragStart = function (args) {
            _this.parent.trigger('columnDragStart', args);
        };
        this.parent.treeGrid.columnDrag = function (args) {
            _this.parent.trigger('columnDrag', args);
        };
        this.parent.treeGrid.columnDrop = function (args) {
            _this.parent.trigger('columnDrop', args);
        };
    };
    /**
     * To destroy the column-reorder.
     *
     * @returns {void} .
     * @private
     */
    Reorder.prototype.destroy = function () {
        // Destroy Method
    };
    return Reorder;
}());
export { Reorder };
