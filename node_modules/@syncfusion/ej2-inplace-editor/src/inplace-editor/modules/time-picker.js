import { TimePicker as EJ2TimePicker } from '@syncfusion/ej2-calendars';
import { Base } from './base-module';
/**
 * The `TimePicker` module is used configure the properties of Time picker type editor.
 */
var TimePicker = /** @class */ (function () {
    function TimePicker(parent) {
        this.compObj = undefined;
        this.parent = parent;
        this.parent.timeModule = this;
        this.base = new Base(this.parent, this);
    }
    TimePicker.prototype.render = function (e) {
        this.compObj = new EJ2TimePicker(this.parent.model);
        this.compObj.appendTo(e.target);
    };
    TimePicker.prototype.focus = function () {
        this.compObj.focusIn();
    };
    TimePicker.prototype.updateValue = function (e) {
        if (this.compObj && e.type === 'Time') {
            this.parent.setProperties({ value: this.compObj.value }, true);
            this.parent.extendModelValue(this.compObj.value);
        }
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the string
     */
    TimePicker.prototype.getModuleName = function () {
        return 'time-picker';
    };
    /**
     * Destroys the module.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    TimePicker.prototype.destroy = function () {
        this.base.destroy();
    };
    return TimePicker;
}());
export { TimePicker };
