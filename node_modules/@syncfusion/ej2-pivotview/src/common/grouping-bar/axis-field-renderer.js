import { PivotButton } from '../actions/pivot-button';
import * as events from '../../common/base/constant';
import * as cls from '../../common/base/css-constant';
import { createElement, prepend } from '@syncfusion/ej2-base';
import { PivotUtil } from '../../base/util';
/**
 * Module to render Axis Fields
 */
/** @hidden */
var AxisFields = /** @class */ (function () {
    /** Constructor for render module
     * @param {PivotView} parent - Instance.
     */
    function AxisFields(parent) {
        this.parent = parent;
    }
    /**
     * Initialize the grouping bar pivot button rendering
     * @returns {void}
     * @private
     */
    AxisFields.prototype.render = function () {
        /* eslint-disable */
        var pivotButtonModule = ((!this.parent.pivotButtonModule || (this.parent.pivotButtonModule && this.parent.pivotButtonModule.isDestroyed)) ?
            new PivotButton(this.parent) : this.parent.pivotButtonModule);
        /* eslint-enable */
        this.createPivotButtons();
        var pivotButtons = [];
        for (var _i = 0, _a = this.parent.element.querySelectorAll('.' + cls.GROUP_ROW_CLASS); _i < _a.length; _i++) { /* eslint-disable-line */
            var element = _a[_i];
            if (!element.classList.contains(cls.GROUP_CHART_ROW)) {
                pivotButtons = pivotButtons.concat([].slice.call(element.querySelectorAll('.' + cls.PIVOT_BUTTON_WRAPPER_CLASS)));
            }
        }
        var vlen = pivotButtons.length;
        for (var j = 0; j < vlen; j++) {
            var indentWidth = 24;
            var indentDiv = createElement('span', {
                className: 'e-indent-div',
                styles: 'width:' + j * indentWidth + 'px'
            });
            prepend([indentDiv], pivotButtons[j]);
        }
    };
    AxisFields.prototype.createPivotButtons = function () {
        var fields = [this.parent.dataSourceSettings.rows, this.parent.dataSourceSettings.columns,
            this.parent.dataSourceSettings.values, this.parent.dataSourceSettings.filters];
        for (var _i = 0, _a = this.parent.element.querySelectorAll('.' + cls.GROUP_ALL_FIELDS_CLASS + ',.' + cls.GROUP_ROW_CLASS + ',.' + cls.GROUP_COLUMN_CLASS + ',.'
            + cls.GROUP_VALUE_CLASS + ',.' + cls.GROUP_FILTER_CLASS); _i < _a.length; _i++) { /* eslint-disable-line */
            var element = _a[_i];
            if ((this.parent.dataSourceSettings.values.length > 0 ? !element.classList.contains(cls.GROUP_CHART_VALUE) : true) ||
                (this.parent.dataSourceSettings.columns.length > 0 ? !element.classList.contains(cls.GROUP_CHART_COLUMN) : true)) {
                element.innerHTML = '';
            }
        }
        /* eslint-enable @typescript-eslint/no-explicit-any */
        var axis = ['rows', 'columns', 'values', 'filters'];
        if (this.parent.dataType === 'pivot' && this.parent.groupingBarSettings.showFieldsPanel) {
            axis.push('all-fields');
            fields.push([]);
            for (var _b = 0, _c = (this.parent.engineModule && this.parent.engineModule.fieldList ? Object.keys(this.parent.engineModule.fieldList) : []); _b < _c.length; _b++) {
                var key = _c[_b];
                if (this.parent.engineModule.fieldList[key] && !this.parent.engineModule.fieldList[key].isSelected) {
                    fields[fields.length - 1].push(PivotUtil.getFieldInfo(key, this.parent, true).fieldItem);
                }
            }
        }
        for (var i = 0, lnt = fields.length; i < lnt; i++) {
            if (fields[i]) {
                var args = {
                    field: fields[i],
                    axis: axis[i].toString()
                };
                this.parent.notify(events.pivotButtonUpdate, args);
            }
        }
    };
    return AxisFields;
}());
export { AxisFields };
