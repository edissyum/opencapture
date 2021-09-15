import { DateRangePicker as EJ2DateRangePicker } from '@syncfusion/ej2-calendars';
import { Base } from './base-module';
/**
 * The `DateRangePicker` module is used configure the properties of Date range picker type editor.
 */
var DateRangePicker = /** @class */ (function () {
    function DateRangePicker(parent) {
        this.compObj = undefined;
        this.parent = parent;
        this.parent.dateRangeModule = this;
        this.base = new Base(this.parent, this);
    }
    DateRangePicker.prototype.render = function (e) {
        this.compObj = new EJ2DateRangePicker(this.parent.model);
        this.compObj.appendTo(e.target);
    };
    DateRangePicker.prototype.focus = function () {
        this.compObj.element.focus();
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the string
     */
    DateRangePicker.prototype.getModuleName = function () {
        return 'date-range-picker';
    };
    DateRangePicker.prototype.updateValue = function (e) {
        if (this.compObj && e.type === 'DateRange') {
            this.parent.setProperties({ value: this.compObj.value }, true);
            this.parent.extendModelValue(this.compObj.value);
        }
    };
    /**
     * Destroys the module.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    DateRangePicker.prototype.destroy = function () {
        this.base.destroy();
    };
    return DateRangePicker;
}());
export { DateRangePicker };
