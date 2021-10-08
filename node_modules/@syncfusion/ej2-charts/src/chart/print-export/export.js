import { ExportUtils } from '../../common/utils/export';
import { beforeExport } from '../../common/model/constants';
/**
 * `ExportModule` module is used to print and export the rendered chart.
 */
var Export = /** @class */ (function () {
    /**
     * Constructor for export module.
     *
     * @private
     */
    function Export(chart) {
        this.chart = chart;
    }
    /**
     * Handles the export method for chart control.
     */
    Export.prototype.export = function (type, fileName, orientation, controls, width, height, isVertical, header, footer) {
        var exportChart = new ExportUtils(this.chart);
        controls = controls ? controls : [this.chart];
        var argsData = {
            cancel: false, name: beforeExport, width: width, height: height
        };
        this.chart.trigger(beforeExport, argsData);
        if (!argsData.cancel) {
            exportChart.export(type, fileName, orientation, controls, width = argsData.width, height = argsData.height, isVertical, header, footer);
        }
    };
    /**
     * To get data url for charts.
     */
    Export.prototype.getDataUrl = function (chart) {
        var exportUtil = new ExportUtils(chart);
        return exportUtil.getDataUrl(chart);
    };
    /**
     * Get module name.
     */
    Export.prototype.getModuleName = function () {
        // Returns the module name
        return 'Export';
    };
    /**
     * To destroy the chart.
     *
     * @returns {void}
     * @private
     */
    Export.prototype.destroy = function () {
        // Destroy method performed here
    };
    return Export;
}());
export { Export };
