import * as cls from '../../common/base/css-constant';
import * as events from '../../common/base/constant';
import { PivotButton } from '../../common/actions/pivot-button';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * Module to render Axis Fields
 */
/** @hidden */
var AxisFieldRenderer = /** @class */ (function () {
    /* eslint-disable-next-line */
    /** Constructor for render module */
    function AxisFieldRenderer(parent) {
        this.parent = parent;
    }
    /**
     * Initialize the pivot button rendering
     * @returns {void}
     * @private
     */
    AxisFieldRenderer.prototype.render = function () {
        /* eslint-disable */
        var pivotButtonModule = ((!this.parent.pivotButtonModule || (this.parent.pivotButtonModule && this.parent.pivotButtonModule.isDestroyed)) ?
            new PivotButton(this.parent) : this.parent.pivotButtonModule);
        /* eslint-enable */
        this.createPivotButtons();
    };
    AxisFieldRenderer.prototype.createPivotButtons = function () {
        if (isNullOrUndefined(this.parent.dataSourceSettings.dataSource) && isNullOrUndefined(this.parent.dataSourceSettings.url)) {
            this.parent.setProperties({ dataSourceSettings: { columns: [], rows: [], values: [], filters: [] } }, true);
        }
        var rows = this.parent.dataSourceSettings.rows;
        var columns = this.parent.dataSourceSettings.columns;
        var values = this.parent.dataSourceSettings.values;
        var filters = this.parent.dataSourceSettings.filters;
        var fields = [rows, columns, values, filters];
        var parentElement = this.parent.dialogRenderer.parentElement;
        if (parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-filters')) {
            parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-filters').querySelector('.' + cls.AXIS_CONTENT_CLASS).innerHTML = '';
        }
        if (parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-rows')) {
            parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-rows').querySelector('.' + cls.AXIS_CONTENT_CLASS).innerHTML = '';
        }
        if (parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-columns')) {
            parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-columns').querySelector('.' + cls.AXIS_CONTENT_CLASS).innerHTML = '';
        }
        if (parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-values')) {
            parentElement.querySelector('.' + cls.FIELD_LIST_CLASS + '-values').querySelector('.' + cls.AXIS_CONTENT_CLASS).innerHTML = '';
        }
        var axis = ['rows', 'columns', 'values', 'filters'];
        for (var len = 0, lnt = fields.length; len < lnt; len++) {
            if (fields[len]) {
                var args = {
                    field: fields[len],
                    axis: axis[len].toString()
                };
                this.parent.notify(events.pivotButtonUpdate, args);
            }
        }
    };
    return AxisFieldRenderer;
}());
export { AxisFieldRenderer };
