import * as events from '../base/constant';
import { Grid, getObject, Print as GridPrint } from '@syncfusion/ej2-grids';
import { addClass } from '@syncfusion/ej2-base';
/**
 * TreeGrid Print module
 *
 * @hidden
 */
var Print = /** @class */ (function () {
    /**
     * Constructor for Print module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    function Print(parent) {
        this.parent = parent;
        Grid.Inject(GridPrint);
        this.addEventListener();
    }
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns Print module name
     */
    Print.prototype.getModuleName = function () {
        return 'print';
    };
    /**
     * @hidden
     * @returns {void}
     */
    Print.prototype.addEventListener = function () {
        this.parent.grid.on(events.printGridInit, this.printTreeGrid, this);
    };
    Print.prototype.removeEventListener = function () {
        this.parent.grid.off(events.printGridInit, this.printTreeGrid);
    };
    Print.prototype.printTreeGrid = function (printGrid) {
        var grid = getObject('printgrid', printGrid);
        var gridElement = getObject('element', printGrid);
        grid.addEventListener(events.queryCellInfo, this.parent.grid.queryCellInfo);
        grid.addEventListener(events.rowDataBound, this.parent.grid.rowDataBound);
        grid.addEventListener(events.beforeDataBound, this.parent.grid.beforeDataBound);
        addClass([gridElement], 'e-treegrid');
    };
    Print.prototype.print = function () {
        this.parent.grid.print();
    };
    /**
     * To destroy the Print
     *
     * @returns {void}
     * @hidden
     */
    Print.prototype.destroy = function () {
        this.removeEventListener();
    };
    return Print;
}());
export { Print };
