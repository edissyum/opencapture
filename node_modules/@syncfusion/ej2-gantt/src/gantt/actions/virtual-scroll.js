import { TreeGrid, VirtualScroll as TreeGridVirtualScroll } from '@syncfusion/ej2-treegrid';
/**
 * Gantt Virtual Scroll module will handle Virtualization
 *
 * @hidden
 */
var VirtualScroll = /** @class */ (function () {
    function VirtualScroll(parent) {
        this.parent = parent;
        this.bindTreeGridProperties();
    }
    /**
     * Get module name
     *
     * @returns {void} .
     */
    VirtualScroll.prototype.getModuleName = function () {
        return 'virtualScroll';
    };
    /**
     * Bind virtual-scroll related properties from Gantt to TreeGrid
     *
     * @returns {void} .
     */
    VirtualScroll.prototype.bindTreeGridProperties = function () {
        this.parent.treeGrid.enableVirtualization = this.parent.enableVirtualization;
        TreeGrid.Inject(TreeGridVirtualScroll);
    };
    /**
     * @returns {number} .
     * @private
     */
    VirtualScroll.prototype.getTopPosition = function () {
        var virtualTable = this.parent.ganttChartModule.scrollElement.querySelector('.e-virtualtable');
        var translates = virtualTable.style.transform.split(',');
        var top;
        if (translates.length > 1) {
            top = translates[1].trim().split(')')[0];
        }
        else {
            var transformString = virtualTable.style.transform;
            top = transformString.substring(transformString.lastIndexOf("(") + 1, transformString.lastIndexOf(")"));
        }
        return parseFloat(top);
    };
    /**
     * To destroy the virtual scroll module.
     *
     * @returns {void} .
     * @private
     */
    VirtualScroll.prototype.destroy = function () {
        // destroy module
    };
    return VirtualScroll;
}());
export { VirtualScroll };
