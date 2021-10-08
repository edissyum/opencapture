import { TreeGrid, ExcelExport as TreeGridExcel } from '@syncfusion/ej2-treegrid';
/**
 * Gantt Excel Export module
 *
 * @hidden
 */
var ExcelExport = /** @class */ (function () {
    /**
     * Constructor for Excel Export module
     *
     * @param {Gantt} gantt .
     */
    function ExcelExport(gantt) {
        this.parent = gantt;
        TreeGrid.Inject(TreeGridExcel);
        this.parent.treeGrid.allowExcelExport = this.parent.allowExcelExport;
        this.bindEvents();
    }
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} .
     * @private
     */
    ExcelExport.prototype.getModuleName = function () {
        return 'excelExport';
    };
    /**
     * To destroy excel export module.
     *
     * @returns {void} .
     * @private
     */
    ExcelExport.prototype.destroy = function () {
        // Destroy Method
    };
    /**
     * To bind excel exporting events.
     *
     * @returns {void} .
     * @private
     */
    ExcelExport.prototype.bindEvents = function () {
        var _this = this;
        this.parent.treeGrid.beforeExcelExport = function (args) {
            _this.parent.trigger('beforeExcelExport', args);
        };
        this.parent.treeGrid.excelQueryCellInfo = function (args) {
            _this.parent.trigger('excelQueryCellInfo', args);
        };
        this.parent.treeGrid.excelHeaderQueryCellInfo = function (args) {
            _this.parent.trigger('excelHeaderQueryCellInfo', args);
        };
        this.parent.treeGrid.excelExportComplete = function (args) {
            _this.parent.trigger('excelExportComplete', args);
        };
    };
    return ExcelExport;
}());
export { ExcelExport };
