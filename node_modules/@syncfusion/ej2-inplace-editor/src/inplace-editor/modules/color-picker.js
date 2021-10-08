import { ColorPicker as EJ2ColorPicker } from '@syncfusion/ej2-inputs';
import { Base } from './base-module';
/**
 * The `ColorPicker` module is used configure the properties of Color picker type editor.
 */
var ColorPicker = /** @class */ (function () {
    function ColorPicker(parent) {
        this.compObj = undefined;
        this.parent = parent;
        this.parent.colorModule = this;
        this.base = new Base(this.parent, this);
    }
    ColorPicker.prototype.render = function (e) {
        this.compObj = new EJ2ColorPicker(this.parent.model);
        this.compObj.appendTo(e.target);
    };
    ColorPicker.prototype.focus = function () {
        this.compObj.element.focus();
    };
    ColorPicker.prototype.updateValue = function (e) {
        if (this.compObj && e.type === 'Color') {
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
    ColorPicker.prototype.destroy = function () {
        this.base.destroy();
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - retunrs the string
     */
    ColorPicker.prototype.getModuleName = function () {
        return 'color-picker';
    };
    return ColorPicker;
}());
export { ColorPicker };
